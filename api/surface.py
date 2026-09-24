"""Display surfaces only; never infer dry land by filling a missing classification."""
import ee

RGB = ['B4', 'B3', 'B2']
RENDERING = 'observed-dry-surface-v3'
SURFACE_INFO = {
    'drySource': 'selected-observation-rgb',
    'dryResolutionMeters': 10,
    'classificationResolutionMeters': '10–20',
    'waterAppearance': 'synthetic',
    'unknown': 'masked-or-missing-observation',
}


def surfaces(image, water, material, geometry):
    # Negation preserves water's mask. Never unmask water to zero before Not().
    # RGB comes from the SAME selected scene/day as the classifier, not a prior
    # wet-to-dry test or an unconstrained historical dry mosaic.
    land = image.select(RGB).updateMask(water.Not()).clip(geometry)
    reconstruction = ee.ImageCollection([land.toFloat(), material.toFloat()]).mosaic().clip(geometry)
    # Unknown must cover holes too, rather than inheriting the first scene footprint.
    unknown = water.mask().unmask(0, False).Not().selfMask().clip(geometry)
    return reconstruction, land, unknown
