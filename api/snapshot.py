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
from surface import surfaces, RENDERING, SURFACE_INFO

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
    """Cloud-screened SCL 4/5/6, spectral indices and acquisition time."""
    scl = img.select('SCL')
    score = (img.select('cs_cdf').setDefaultProjection(img.select('B3').projection())
             .gte(0.65).unmask(0).reduceResolution(reducer=ee.Reducer.min(), maxPixels=16)
             .reproject(crs='EPSG:32642', scale=20))
    valid = scl.eq(4).Or(scl.eq(5)).Or(scl.eq(6)).And(score)
    green, swir = img.select('B3'), img.select('B11')
    total = green.add(swir)
    index = green.subtract(swir).divide(total).rename('mndwi').updateMask(total.gt(0))
    ndwi = img.normalizedDifference(['B3', 'B8']).rename('ndwi')
    time = ee.Image.constant(img.date().millis()).rename('time').toDouble()
    return (img.select(['B4', 'B3', 'B2', 'B8', 'B11']).addBands([index, ndwi]).addBands(time)
            .updateMask(valid).copyProperties(img, ['system:time_start']))


RULE_BANDS = ['mndwi', 'ndwi', 'B8', 'B11']


def water_rule(img):
    """Same rule as the EE app and the single-day service: MNDWI > 0 with SWIR < 0.15, or 10 m NDWI > 0
    with NIR < 0.15 and SWIR < 0.15 (drops bright-roof false water; finds channels narrower than 20 m)."""
    dark_swir = img.select('B11').lt(1500)
    return (img.select('mndwi').gt(THRESHOLD).And(dark_swir)
            .Or(img.select('ndwi').gt(0).And(img.select('B8').lt(1500)).And(dark_swir)))


def build(raw):
    end = ee.Date(raw).advance(1, 'day')
    start = end.advance(-DAYS, 'day')
    all_optical = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED').filterBounds(REGION)
                   .filterDate(end.advance(-365, 'day'), end)
                   .linkCollection(ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED'), ['cs_cdf'])
                   .map(prepare_s2))
    optical = all_optical.filterDate(start, end)
    latest = optical.select(RGB + RULE_BANDS + ['time']).qualityMosaic('time').clip(REGION)
    water = water_rule(latest).rename('water').clip(REGION)
    valid = water.mask().rename('valid')
    historical_rgb = all_optical.qualityMosaic('time').select(RGB)
    texture = historical_rgb.select('B3').divide(1800).clamp(0.6, 1.3).unmask(1)
    material = ee.Image(WATER_TEXTURE_ASSET).select([0, 1, 2], RGB).resample('bilinear')
    modeled_water = material.divide(255).pow(1.3).multiply(3000).multiply(texture).updateMask(water)
    reconstruction, land, unknown = surfaces(latest, water, modeled_water, REGION)
    area = ee.Image.pixelArea().divide(1e6)
    totals = (area.updateMask(water).rename('waterKm2').addBands(area.updateMask(valid).rename('validKm2'))
              .addBands(area.rename('totalKm2'))
              .reduceRegion(reducer=ee.Reducer.sum(), geometry=REGION, scale=100, maxPixels=1e8, tileScale=4))
    stats = (ee.Dictionary(totals)
             .set('latestScene', ee.Date(optical.aggregate_max('system:time_start')).format('YYYY-MM-dd'))
             .set('windowStart', start.format('YYYY-MM-dd')).set('scenes', optical.size()))
    return stats, water, reconstruction, land, modeled_water, unknown


def main():
    raw = os.environ.get('WINDOW_END') or (dt.datetime.now(dt.timezone.utc).date() - dt.timedelta(days=1)).isoformat()
    stats, water, reconstruction, land, modeled_water, unknown = build(raw)
    values = stats.getInfo()
    if not values.get('scenes'):
        sys.exit(f'No Sentinel-2 scenes in the {DAYS} days to {raw}; keeping the previous snapshot.')
    coverage = 100 * (values.get('validKm2') or 0) / values['totalKm2']
    if coverage < MIN_COVERAGE:
        sys.exit(f'Only {coverage:.1f}% of Sindh observed; keeping the previous snapshot.')
    result = {
        'schemaVersion': 1, 'rendering': RENDERING, 'surface': SURFACE_INFO, 'region': 'Sindh',
        'method': 'Sentinel-2 MNDWI', 'source': 'daily-snapshot',
        'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z'),
        'windowStart': values['windowStart'], 'windowEnd': raw, 'windowDays': DAYS,
        'latestScene': values['latestScene'], 'scenes': values['scenes'],
        'waterKm2': values.get('waterKm2') or 0, 'coveragePercent': min(100, coverage),
        'statisticsScale': 100, 'thresholds': {'mndwi': THRESHOLD, 'vv': -17},
        'cloudScreen': {'scl': [4, 5, 6], 'cs_cdf': 0.65, 'scale': 20},
        'waterRule': 'mndwi>0&swir<0.15 | ndwi>0&nir<0.15&swir<0.15',
        'layers': {
            'water': {'url': water.selfMask().getMapId({'palette': ['2fb9ed']})['tile_fetcher'].url_format},
            'reconstruction': {'url': reconstruction.getMapId(VIS_RGB)['tile_fetcher'].url_format},
            'dry': {'url': land.getMapId(VIS_RGB)['tile_fetcher'].url_format},
            'waterAppearance': {'url': modeled_water.getMapId(VIS_RGB)['tile_fetcher'].url_format},
            'unknown': {'url': unknown.getMapId({'palette': ['747a81']})['tile_fetcher'].url_format},
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
