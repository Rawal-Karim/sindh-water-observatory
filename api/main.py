"""Sindh Water Observatory — Earth Engine web service.

GET /analyze?box=W,S,E,N&date=YYYY-MM-DD[&minclear=99][&threshold=0]

Runs the published Earth Engine app's single clear-day analysis (analyzeClearDay in
earth-engine-app.js) for one area and one day, and answers with the same manifest the
app's "Show result on Sindh map" link carries, plus a true-colour `photo` layer.
Runs as the sindh-water-api service account; no user credentials are involved.
"""
import datetime as dt
import json
import os
import threading
import time
from collections import OrderedDict, defaultdict, deque

import ee
import google.auth
from flask import Flask, jsonify, request

PROJECT = os.environ.get('EE_PROJECT', 'ee-rawal-karim23')
ALLOWED_ORIGINS = {'https://rawal-karim.github.io', 'http://localhost:8765'}
RGB = ['B4', 'B3', 'B2']
VIS_RGB = {'bands': RGB, 'min': 0, 'max': 3000, 'gamma': 1.3}
WATER_TEXTURE_ASSET = 'projects/ee-rawal-karim23/assets/sindh_synthetic_water_texture_20260922'
MAX_KM2 = 400
CACHE_SECONDS = 3600          # map tile ids stay valid for hours; results are cheap to reuse
RATE_WINDOW, RATE_MAX = 600, 30  # per client IP: 30 analyses per 10 minutes

credentials, _ = google.auth.default(scopes=['https://www.googleapis.com/auth/earthengine',
                                             'https://www.googleapis.com/auth/cloud-platform'])
ee.Initialize(credentials, project=PROJECT)
with open(os.path.join(os.path.dirname(__file__), 'sindh_region.json')) as f:
    REGION = ee.Geometry(json.load(f))  # geoBoundaries PAK ADM1, same polygon as the EE app

app = Flask(__name__)
_cache, _cache_lock = OrderedDict(), threading.Lock()
_hits, _hits_lock = defaultdict(deque), threading.Lock()


class BadRequest(ValueError):
    pass


def box_km2(b):
    import math
    return 6371 ** 2 * abs((b[2] - b[0]) * math.pi / 180 *
                           (math.sin(b[3] * math.pi / 180) - math.sin(b[1] * math.pi / 180)))


def parse(args):
    try:
        box = [float(v) for v in args.get('box', '').split(',')]
    except ValueError:
        raise BadRequest('box must be four numbers: west,south,east,north')
    if len(box) != 4 or box[0] >= box[2] or box[1] >= box[3] or box[0] < 66.5 or box[2] > 71.3 \
            or box[1] < 23.6 or box[3] > 28.7:
        raise BadRequest('Select a rectangle within the Sindh map bounds.')
    km2 = box_km2(box)
    if km2 < 0.001 or km2 > MAX_KM2:
        raise BadRequest(f'Area must be between 0.001 and {MAX_KM2} km².')
    day = args.get('date', '')
    try:
        d = dt.date.fromisoformat(day)
    except ValueError:
        raise BadRequest('date must be YYYY-MM-DD')
    # Pakistan is UTC+5, so the viewer's "today" can be a day ahead of UTC.
    if d < dt.date(2020, 1, 1) or d > dt.datetime.utcnow().date() + dt.timedelta(days=1):
        raise BadRequest('Choose a date from 2020-01-01 to today.')
    try:
        min_clear = float(args.get('minclear', 99))
        threshold = float(args.get('threshold', 0))
    except ValueError:
        raise BadRequest('minclear and threshold must be numbers')
    if not 50 <= min_clear <= 100 or not -0.2 <= threshold <= 0.6:
        raise BadRequest('minclear must be 50–100 and threshold −0.2–0.6.')
    return [round(v, 6) for v in box], d.isoformat(), min_clear, threshold


def strict_s2(img):
    """strictS2 from the EE app: SCL 4/5/6 and every 10 m Cloud Score+ subpixel ≥ 0.65."""
    scl = img.select('SCL')
    # Cloud Score+ lags new scenes; give the missing band a projection so it just fails pixels.
    score = (img.select('cs_cdf').setDefaultProjection(img.select('B3').projection())
             .gte(0.65).unmask(0).reduceResolution(reducer=ee.Reducer.min(), maxPixels=16)
             .reproject(crs='EPSG:32642', scale=20))
    clear = scl.eq(4).Or(scl.eq(5)).Or(scl.eq(6)).And(score)
    total = img.select('B3').add(img.select('B11'))
    index = img.select('B3').subtract(img.select('B11')).divide(total).rename('mndwi').updateMask(total.gt(0))
    ndwi = img.normalizedDifference(['B3', 'B8']).rename('ndwi')
    return (img.select(RGB + ['B8', 'B11']).addBands([index, ndwi]).updateMask(clear)
            .copyProperties(img, ['system:time_start']))


def water_rule(img, threshold):
    """Water, as in the EE app and the daily snapshot (2026-09 rule):
    MNDWI > threshold with dark SWIR (bright roofs pass MNDWI but not SWIR < 0.15), or — for channels
    narrower than a 20 m SWIR pixel — 10 m NDWI (green/NIR) > 0 with NIR < 0.15 and the same SWIR limit.
    Tested on Hyderabad/Kotri and Sehwan: built-up false water −95 %, drains found 22→55 % / 35→74 %."""
    dark_swir = img.select('B11').lt(1500)
    return (img.select('mndwi').gt(threshold).And(dark_swir)
            .Or(img.select('ndwi').gt(0).And(img.select('B8').lt(1500)).And(dark_swir)))


def tile_url(image, vis):
    # Image.getMapId applies the palette/stretch; raw ee.data.getMapId ignored it (grey 0/1 tiles).
    return image.getMapId(vis)['tile_fetcher'].url_format


def analyze(box, day, min_clear, threshold):
    geom = ee.Geometry.Rectangle(box, None, False).intersection(REGION, ee.ErrorMargin(1))
    start = ee.Date(day)
    collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED').filterBounds(geom)
                  .filterDate(start, start.advance(1, 'day'))
                  .linkCollection(ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED'), ['cs_cdf'])
                  .map(strict_s2))
    image = collection.mosaic().clip(geom)
    index = image.select('mndwi')
    water = water_rule(image, threshold).rename('water')
    area = ee.Image.pixelArea().divide(1e6)
    sums = (area.updateMask(water).rename('water')
            .addBands(area.updateMask(index.mask()).rename('valid'))
            .addBands(area.rename('total'))
            .reduceRegion(reducer=ee.Reducer.sum(), geometry=geom, crs='EPSG:32642', scale=10,
                          maxPixels=5e7, tileScale=4))  # 10 m for the NDWI branch: 3 bands × ≤ 4 M px for 400 km²
    info = ee.Dictionary({'scenes': collection.size(), 'sums': sums}).getInfo()
    if not info['scenes']:
        return None
    s = info['sums']
    total = s.get('total') or 0
    clear_pct = 100 * (s.get('valid') or 0) / total if total else 0
    material = (ee.Image(WATER_TEXTURE_ASSET).select([0, 1, 2], RGB).resample('bilinear')
                .divide(255).pow(1.3).multiply(3000).updateMask(water).clip(geom))
    return {
        'schemaVersion': 1, 'rendering': 'satellite-preserving-overlays-v2', 'region': 'Sindh',
        'method': 'Sentinel-2 MNDWI', 'observationMode': 'single-clear-day', 'source': 'earth-engine-service',
        'area': box, 'generatedAt': dt.datetime.utcnow().isoformat(timespec='seconds') + 'Z',
        'windowStart': day, 'windowEnd': day, 'latestScene': day,
        'waterKm2': s.get('water') or 0, 'coveragePercent': round(min(100, clear_pct), 2),
        'meetsMinClear': clear_pct >= min_clear, 'statisticsScale': 10, 'waterRule': 'mndwi>t&swir<0.15 | ndwi>0&nir<0.15&swir<0.15',
        'thresholds': {'mndwi': threshold, 'vv': -17},
        'cloudScreen': {'scl': [4, 5, 6], 'cs_cdf': 0.65, 'requiredCoverage': min_clear, 'scale': 20},
        'layers': {
            'water': {'url': tile_url(water.selfMask(), {'palette': ['2fb9ed']})},
            'reconstruction': {'url': tile_url(material, VIS_RGB)},
            'photo': {'url': tile_url(image, VIS_RGB)},
        },
    }


def rate_limited(ip):
    now = time.time()
    with _hits_lock:
        q = _hits[ip]
        while q and q[0] < now - RATE_WINDOW:
            q.popleft()
        if len(q) >= RATE_MAX:
            return True
        q.append(now)
    return False


@app.after_request
def cors(resp):
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        resp.headers['Access-Control-Allow-Origin'] = origin
        resp.headers['Vary'] = 'Origin'
    return resp


@app.get('/analyze')
def analyze_endpoint():
    try:
        box, day, min_clear, threshold = parse(request.args)
    except BadRequest as e:
        return jsonify(error=str(e)), 400
    key = (tuple(box), day, min_clear, threshold)
    with _cache_lock:
        hit = _cache.get(key)
        if hit and hit[0] > time.time() - CACHE_SECONDS:
            _cache.move_to_end(key)
            return jsonify(hit[1])
    ip = (request.headers.get('X-Forwarded-For') or request.remote_addr or '').split(',')[0].strip()
    if rate_limited(ip):
        return jsonify(error='Too many analyses from this connection. Try again in a few minutes.'), 429
    try:
        result = analyze(box, day, min_clear, threshold)
    except ee.EEException as e:
        return jsonify(error='Earth Engine could not analyse this day: ' + str(e)[:300]), 502
    if result is None:
        return jsonify(error=f'No Sentinel-2 pass over this area on {day}.'), 404
    with _cache_lock:
        _cache[key] = (time.time(), result)
        while len(_cache) > 300:
            _cache.popitem(last=False)
    return jsonify(result)


@app.get('/')
def health():
    return jsonify(service='sindh-water-api', ok=True)
