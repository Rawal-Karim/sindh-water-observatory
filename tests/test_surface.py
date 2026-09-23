"""Offline raster regressions plus real Earth Engine graph construction (no credentials)."""
import ast
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'api'))
import surface


class Raster:
    def __init__(self, values, mask=None):
        self.values = np.atleast_2d(values)
        self.valid = np.ones_like(self.values, dtype=bool) if mask is None else np.broadcast_to(mask, self.values.shape).copy()
    def select(self, _): return self
    def updateMask(self, other): return Raster(self.values, self.valid & other.valid & other.values.astype(bool))
    def Not(self): return Raster(~self.values.astype(bool), self.valid)
    def mask(self): return Raster(self.valid.astype(int))
    def unmask(self, value, sameFootprint): return Raster(np.where(self.valid, self.values, value))
    def selfMask(self): return self.updateMask(self)
    def clip(self, geometry): return Raster(self.values, self.valid & geometry)
    def toFloat(self): return self


class Collection:
    def __init__(self, images): self.images = images
    def mosaic(self):
        shape = self.images[0].values.shape
        values, valid = np.zeros(shape), np.zeros(shape, dtype=bool)
        for image in self.images:
            values = np.where(image.valid, image.values, values)
            valid |= image.valid
        return Raster(values, valid)


class Pixels(unittest.TestCase):
    def test_dry_water_cloud_missing_and_outside(self):
        # Previously wet is deliberately NOT an input: any observed dry location is filled.
        rgb = Raster([[700, 800, 900, 1000, 1100], [800, 900, 1000, 1100, 1200], [900, 1000, 1100, 1200, 1300]])
        water = Raster([0, 1, 0, 0, 0], [True, True, False, False, True])
        geometry = [True, True, True, True, False]
        material = Raster([[200]*5]*3).updateMask(water)
        with patch.object(surface.ee, 'ImageCollection', Collection):
            composite, dry, unknown = surface.surfaces(rgb, water, material, geometry)
        np.testing.assert_array_equal(dry.valid[0], [True, False, False, False, False])
        np.testing.assert_array_equal(unknown.valid[0], [False, False, True, True, False])
        np.testing.assert_array_equal(composite.valid[0], [True, True, False, False, False])
        np.testing.assert_array_equal(composite.values[:, 0], rgb.values[:, 0])
        np.testing.assert_array_equal(composite.values[:, 1], [200, 200, 200])

    def test_missing_rgb_does_not_invent_terrain(self):
        with patch.object(surface.ee, 'ImageCollection', Collection):
            composite, land, _ = surface.surfaces(Raster([[1],[2],[3]], False), Raster([0]), Raster([[0],[0],[0]], False), [True])
        self.assertFalse(land.valid.any())
        self.assertFalse(composite.valid.any())


from ee.apitestcase import ApiTestCase
import ee


def functions_from(path, names, namespace):
    parsed = ast.parse(path.read_text(encoding='utf-8'))
    selected = [node for node in parsed.body if isinstance(node, ast.FunctionDef) and node.name in names]
    exec(compile(ast.Module(body=selected, type_ignores=[]), str(path), 'exec'), namespace)


class EarthEngineGraphs(ApiTestCase):
    def test_complete_snapshot_graph(self):
        ns = {'ee': ee, 'RGB': surface.RGB, 'THRESHOLD': 0, 'DAYS': 24,
              'RULE_BANDS': ['mndwi','ndwi','B8','B11'], 'WATER_TEXTURE_ASSET': 'test-water',
              'REGION': ee.Geometry.Rectangle([68.3,25.4,68.31,25.41]), 'surfaces': surface.surfaces}
        functions_from(ROOT / 'api/snapshot.py', ['prepare_s2','water_rule','build'], ns)
        stats, water, composite, land, material, unknown = ns['build']('2026-09-22')
        for output in [stats,water,composite,land,material,unknown]:
            graph = output.serialize()
            self.assertIn('ImageCollection.qualityMosaic', graph)
        self.assertIn('cs_cdf', land.serialize())
        self.assertNotIn('receded', land.serialize())

    def test_snapshot_graph_and_clear_day_graph_build(self):
        for module, prep, rule in [('snapshot.py', 'prepare_s2', 'water_rule'), ('main.py', 'strict_s2', 'water_rule')]:
            ns = {'ee': ee, 'RGB': surface.RGB, 'THRESHOLD': 0}
            functions_from(ROOT / 'api' / module, [prep, rule], ns)
            img = ee.Image.constant([800, 700, 600, 1200, 1300, 4, .9]).rename(['B4','B3','B2','B8','B11','SCL','cs_cdf']).set('system:time_start', 0)
            prepared = ee.Image(ns[prep](img))
            water = ns[rule](prepared, 0) if module == 'main.py' else ns[rule](prepared)
            geom = ee.Geometry.Rectangle([68.3,25.4,68.31,25.41])
            material = prepared.select(surface.RGB).updateMask(water)
            images = surface.surfaces(prepared, water, material, geom)
            for output in images:
                graph = output.serialize()
                self.assertIn('Image.clip', graph)
                self.assertIn('Image.updateMask', graph)
            self.assertIn('Image.reduceResolution', prepared.serialize())
            self.assertIn('cs_cdf', prepared.serialize())


if __name__ == '__main__': unittest.main()
