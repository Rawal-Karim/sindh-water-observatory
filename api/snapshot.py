"""Daily province-wide water snapshot for the Sindh Water Observatory web map.

Runs as the Cloud Run job `sindh-water-snapshot` (Cloud Scheduler, every morning). It is the
published Earth Engine app's analyze() for 'Entire Sindh' with its defaults — Sentinel-2 MNDWI > 0,
24-day look-back ending yesterday (UTC; today's pass over Sindh, ~06 UTC, is not in yet at 06:00 PKT), latest valid pixel per location — and writes the web map's
analysis manifest, with fresh tile URLs, to gs://$SNAPSHOT_BUCKET/snapshot.json.
A dated copy goes to snapshots/YYYY-MM-DD.json. A run that finds no scenes or poor coverage
exits non-zero and leaves yesterday's snapshot in place.
"""
import datetime as dt
import json
import os
import sys

import ee
import google.auth
from google.cloud import storage

PROJECT = os.environ.get('EE_PROJECT', 'ee-rawal-karim23')
BUCKET = os.environ.get('SNAPSHOT_BUCKET', 'ee-rawal-karim23-sindh-water')
DAYS = int(os.environ.get('WINDOW_DAYS', 24))
MIN_COVERAGE = 80  # percent of Sindh with a valid observation; below this keep yesterday's map
RGB = ['B4', 'B3', 'B2']
VIS_RGB = {'bands': RGB, 'min': 0, 'max': 3000, 'gamma': 1.3}
WATER_TEXTURE_ASSET = 'projects/ee-rawal-karim23/assets/sindh_synthetic_water_texture_20260922'
THRESHOLD = 0

credentials, _ = google.auth.default(scopes=['https://www.googleapis.com/auth/earthengine',
                                             'https://www.googleapis.com/auth/cloud-platform'])
ee.Initialize(credentials, project=PROJECT)
with open(os.path.join(os.path.dirname(__file__), 'sindh_region.json')) as f:
    REGION = ee.Geometry(json.load(f))


def prepare_s2(img):
    """prepareS2 from the EE app: SCL 4/5/6/7, MNDWI, acquisition time."""
    scl = img.select('SCL')
    valid = scl.eq(4).Or(scl.eq(5)).Or(scl.eq(6)).Or(scl.eq(7))
    green, swir = img.select('B3'), img.select('B11')
    total = green.add(swir)
    index = green.subtract(swir).divide(total).rename('mndwi').updateMask(total.gt(0))
    time = ee.Image.constant(img.date().millis()).rename('time').toDouble()
    return (img.select(['B4', 'B3', 'B2', 'B11']).addBands(index).addBands(time)
            .updateMask(valid).copyProperties(img, ['system:time_start']))


def build(raw):
    end = ee.Date(raw).advance(1, 'day')
    start = end.advance(-DAYS, 'day')
    all_optical = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED').filterBounds(REGION)
                   .filterDate(end.advance(-365, 'day'), end).map(prepare_s2))
    optical = all_optical.filterDate(start, end)
    latest = optical.select(['mndwi', 'time']).qualityMosaic('time').clip(REGION)
    water = latest.select('mndwi').gt(THRESHOLD).rename('water').clip(REGION)
    valid = water.mask().rename('valid')
    dry = all_optical.map(lambda img: img.updateMask(img.select('mndwi').lte(THRESHOLD))).qualityMosaic('time').select(RGB)
    historical_rgb = all_optical.qualityMosaic('time').select(RGB)
    texture = historical_rgb.select('B3').divide(1800).clamp(0.6, 1.3).unmask(1)
    material = ee.Image(WATER_TEXTURE_ASSET).select([0, 1, 2], RGB).resample('bilinear')
    modeled_water = material.divide(255).pow(1.3).multiply(3000).multiply(texture).updateMask(water)
    prior_collection = all_optical.filterDate(end.advance(-365, 'day'), start)
    empty_prior = ee.Image.constant([0, 0]).rename(['mndwi', 'time']).toDouble().updateMask(ee.Image(0))
    prior = (ee.ImageCollection([empty_prior])
             .merge(prior_collection.select(['mndwi', 'time']).map(lambda img: img.toDouble()))
             .qualityMosaic('time'))
    receded = prior.select('mndwi').gt(THRESHOLD).And(water.Not()).rename('receded')
    land = dry.updateMask(receded)
    reconstruction = (ee.ImageCollection([land.toFloat(), modeled_water.toFloat()]).mosaic()
                      .clip(REGION).updateMask(valid))
    area = ee.Image.pixelArea().divide(1e6)
    totals = (area.updateMask(water).rename('waterKm2').addBands(area.updateMask(valid).rename('validKm2'))
              .addBands(area.rename('totalKm2'))
              .reduceRegion(reducer=ee.Reducer.sum(), geometry=REGION, scale=100, maxPixels=1e8, tileScale=4))
    stats = (ee.Dictionary(totals)
             .set('latestScene', ee.Date(optical.aggregate_max('system:time_start')).format('YYYY-MM-dd'))
             .set('windowStart', start.format('YYYY-MM-dd')).set('scenes', optical.size()))
    return stats, water, reconstruction


def main():
    raw = os.environ.get('WINDOW_END') or (dt.datetime.now(dt.timezone.utc).date() - dt.timedelta(days=1)).isoformat()
    stats, water, reconstruction = build(raw)
    values = stats.getInfo()
    if not values.get('scenes'):
        sys.exit(f'No Sentinel-2 scenes in the {DAYS} days to {raw}; keeping the previous snapshot.')
    coverage = 100 * (values.get('validKm2') or 0) / values['totalKm2']
    if coverage < MIN_COVERAGE:
        sys.exit(f'Only {coverage:.1f}% of Sindh observed; keeping the previous snapshot.')
    result = {
        'schemaVersion': 1, 'rendering': 'satellite-preserving-overlays-v2', 'region': 'Sindh',
        'method': 'Sentinel-2 MNDWI', 'source': 'daily-snapshot',
        'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z'),
        'windowStart': values['windowStart'], 'windowEnd': raw, 'windowDays': DAYS,
        'latestScene': values['latestScene'], 'scenes': values['scenes'],
        'waterKm2': values.get('waterKm2') or 0, 'coveragePercent': min(100, coverage),
        'statisticsScale': 100, 'thresholds': {'mndwi': THRESHOLD, 'vv': -17},
        'layers': {
            'water': {'url': water.selfMask().getMapId({'palette': ['2fb9ed']})['tile_fetcher'].url_format},
            'reconstruction': {'url': reconstruction.getMapId(VIS_RGB)['tile_fetcher'].url_format},
        },
    }
    body = json.dumps(result, separators=(',', ':'))
    bucket = storage.Client(project=PROJECT, credentials=credentials).bucket(BUCKET)
    dated = bucket.blob(f'snapshots/{raw}.json')
    dated.cache_control = 'public, max-age=86400'
    dated.upload_from_string(body, content_type='application/json')
    latest = bucket.blob('snapshot.json')
    latest.cache_control = 'public, max-age=300'
    latest.upload_from_string(body, content_type='application/json')
    print(json.dumps({k: result[k] for k in ('windowStart', 'windowEnd', 'latestScene', 'scenes', 'waterKm2', 'coveragePercent')}))


if __name__ == '__main__':
    main()
