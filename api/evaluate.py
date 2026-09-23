"""One-off check of candidate water rules on the 24-day snapshot (Cloud Run job sindh-water-eval).

For each rule and test area it reports: water found on ESA WorldCover built-up land (false positives),
share of WorldCover permanent water still detected (real water kept), and share of points along the
department's drawn canals/distributaries/minors/drains with water within 15 m (narrow-channel recall).
"""
import json
import os

import ee
import google.auth

credentials, _ = google.auth.default(scopes=['https://www.googleapis.com/auth/earthengine',
                                             'https://www.googleapis.com/auth/cloud-platform'])
ee.Initialize(credentials, project=os.environ.get('EE_PROJECT', 'ee-rawal-karim23'))
with open(os.path.join(os.path.dirname(__file__), 'eval_canals.json')) as f:
    DATA = json.load(f)
START, END = os.environ.get('EVAL_START', '2026-08-30'), os.environ.get('EVAL_END', '2026-09-23')


def prep(img):
    scl = img.select('SCL')
    valid = scl.eq(4).Or(scl.eq(5)).Or(scl.eq(6)).Or(scl.eq(7))
    g, n, s = img.select('B3'), img.select('B8'), img.select('B11')
    mndwi = g.subtract(s).divide(g.add(s)).rename('mndwi')
    ndwi = g.subtract(n).divide(g.add(n)).rename('ndwi')
    t = ee.Image.constant(img.date().millis()).rename('time').toDouble()
    return img.select(['B3', 'B8', 'B11']).addBands([mndwi, ndwi, t]).updateMask(valid)


latest = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED').filterDate(START, END)
          .filterBounds(ee.Geometry.Rectangle([67.6, 25.1, 68.6, 26.6])).map(prep).qualityMosaic('time'))
m, nd, b8, b11 = latest.select('mndwi'), latest.select('ndwi'), latest.select('B8'), latest.select('B11')
RULES = {
    'R0 MNDWI>0 (current)': m.gt(0),
    'R1 +SWIR<0.15': m.gt(0).And(b11.lt(1500)),
    'R3 R1 OR NDWI10m>0&NIR<0.15&SWIR<0.15': m.gt(0).And(b11.lt(1500)).Or(nd.gt(0).And(b8.lt(1500)).And(b11.lt(1500))),
    'R3b R1 OR NDWI10m>0.05&NIR<0.15&SWIR<0.15': m.gt(0).And(b11.lt(1500)).Or(nd.gt(0.05).And(b8.lt(1500)).And(b11.lt(1500))),
}
wc = ee.ImageCollection('ESA/WorldCover/v200').first()
built, perm = wc.eq(50), wc.eq(80)
area = ee.Image.pixelArea().divide(1e6)

report = {}
for box_name, box in DATA['boxes'].items():
    geom = ee.Geometry.Rectangle(box)
    pts = [p for p in DATA['points'] if p[3] == box_name]
    fc = ee.FeatureCollection([ee.Feature(ee.Geometry.Point(p[:2]).buffer(15), {'t': p[2]}) for p in pts])
    for name, rule in RULES.items():
        w = rule.unmask(0).rename('w')
        sums = (area.updateMask(w.And(built)).rename('builtFP').addBands(area.updateMask(w.And(perm)).rename('permHit'))
                .addBands(area.updateMask(perm).rename('perm')).addBands(area.updateMask(w).rename('water'))
                .reduceRegion(ee.Reducer.sum(), geom, 10, maxPixels=1e9, tileScale=8))
        hits = w.reduceRegions(fc, ee.Reducer.max(), 10, tileScale=8)
        by_type = ee.Dictionary(ee.List(['CANAL', 'BRANCH', 'DISTRY', 'MINOR', 'DRAIN']).iterate(
            lambda t, acc: ee.Dictionary(acc).set(t, ee.Algorithms.If(hits.filter(ee.Filter.eq('t', t)).size().gt(0), hits.filter(ee.Filter.eq('t', t)).aggregate_mean('max'), -1)), ee.Dictionary({})))
        r = ee.Dictionary({'sums': sums, 'canals': by_type}).getInfo()
        s = r['sums']
        report.setdefault(box_name, {})[name] = {
            'waterKm2': round(s['water'], 2), 'builtFalseKm2': round(s['builtFP'], 3),
            'permWaterKept%': round(100 * s['permHit'] / s['perm'], 1) if s['perm'] else None,
            'canalRecall%': {k: round(100 * v, 1) for k, v in r['canals'].items() if v is not None and v >= 0},
        }
        print(box_name, name, json.dumps(report[box_name][name]), flush=True)
print('REPORT ' + json.dumps(report))
