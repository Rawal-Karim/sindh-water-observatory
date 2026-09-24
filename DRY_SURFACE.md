# Observed dry-land reconstruction

When a selected observation says dry, v3 draws that observation's Sentinel-2 RGB even if the older basemap shows water. It no longer requires a preceding wet observation. Land colour and the classifier come from the same single day or latest clear pixel within the selected window. It does not infer the date or water content of the basemap.

The land is observed colour at 10 m, with a 10–20 m classification boundary. It is not invented high-resolution terrain. Adjacent dry pixels use the same colour stretch, retaining fields and river-bank geometry at the available resolution. Higher-resolution basemap detail is replaced across observed dry land; the reference layer remains available for comparison. Existing mapped structure exclusions still expose the basemap. This display protection does not establish that structures are dry or safe.

Clouds, missing observations and failed Cloud Score+ matches never become dry. Province processing now uses SCL 4/5/6 plus the same conservative Cloud Score+ threshold as single-day processing. Dates can vary within the province window; historical mode never substitutes another day. Radar dry fill additionally requires a clear, agreeing optical observation within its selected window; missing/conflicting optical colour is marked unresolved.

## Manifest and viewer

`schemaVersion` remains 1. `rendering: observed-dry-surface-v3` requires `water`, `reconstruction`, `dry`, `waterAppearance` and `unknown` tile URLs. `reconstruction` contains the RGB composite for consumers of the existing field. The web viewer uses the separate dry and water appearance layers so dry fill is opaque while the existing opacity slider controls water. Unknown pixels have a fixed grey overlay, including over mapped structures; structure erasure never turns unknown into apparently observed dry land. Every supplied tile URL is validated as HTTPS Earth Engine.

Older manifests still load and display an explicit limitation in reconstruction mode. They must be regenerated; changing the viewer cannot recover missing observation pixels from an old water-only manifest. No checked-in snapshot or live tile manifest has been relabelled as v3.

## Source and rollout

This branch starts at remote commit `9f3cc66283515a36cb723c5ca424492a7ad7ff83`. `earth-engine-app.js` was first synchronized with the published app's public modules source on 2026-09-23 in a separate commit. That preserves the published water rule, historical return link, cloud-score projection fix and export flow that were newer than the repository copy. The reconciled script was subsequently saved and published as Earth Engine script commit 7a6e8b3. Unpublished local reference files were not copied or modified.

Deployment completed on 2026-09-24. PR #1 was merged (64c315f) and the GitHub Pages viewer serves v3. Cloud Run revision sindh-water-api-00005-qay receives 100% of service traffic. The snapshot job uses the same tested image; execution sindh-water-snapshot-4m8vl completed successfully. The public Earth Engine app was updated from the saved repository script and its public modules include v3.

The fresh production snapshot was generated at 2026-09-24T02:50:39Z for 31 August–23 September, with 99.4045% valid coverage. The live single-day API returned v3 with 100% coverage for the tested Kotri area on 2020-01-04. Staged tile endpoints returned HTTP 200, real observation tiles were visually inspected, and the public viewer was checked in reconstructed-surface mode at Kotri Barrage. Existing service settings and the water texture asset were retained.

The stricter province mask can reduce coverage; the existing 80% publication guard deliberately keeps the preceding snapshot when that happens. Validate coverage before promoting a generated result.

## Verification

- `python -m unittest discover -s tests -v`: masked-raster regressions for observed dry, water, clouds, missing pixels, unavailable RGB and outside-area pixels; actual Earth Engine SDK construction of single-day and complete province graphs without credentials.
- `node --test tests/viewer.test.cjs`: opacity, layer cleanup, both map adapters, legacy compatibility, incomplete manifests and unsafe optional tile URL rejection.
- `node --check app.js`, `node --check explorer.js`, `node --check earth-engine-app.js`.
- `python tests/make_visual_fixture.py` then serve the repository and open `/tests/visual-fixture.html`: full viewer with conspicuously labelled simulated tiles for opacity and layout checks. Generated fixture HTML is ignored by git.
- `/structure-mask-check.html`: the existing eight real browser canvas structure-mask checks.

These checks do not independently establish satellite classification accuracy or validate GeoTIFF downloads. The separate GeoTIFF failure is not claimed fixed.