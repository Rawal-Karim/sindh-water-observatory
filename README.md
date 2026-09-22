# Sindh Water Observatory

Two components:

- `index.html`, `app.js`, and supporting files: static map workspace. Serve over HTTP. Esri satellite reference until a user supplies their own restricted Maps JavaScript API browser key. Load Earth Engine analysis JSON to display water and reconstruction tiles.
- `earth-engine-app.js`: complete standalone Earth Engine Code Editor application, with embedded geoBoundaries Sindh boundary. Runs in the user's registered Cloud project and provides Google satellite / synthetic surface swipe comparison.

The original public Kotri Bund app source was extracted from its referenced `javascript/kotri-bund-risk-monitor-modules.json` endpoint on 2026-09-22. Its MNDWI > 0, VV < -17 dB and 24-day window defaults are reused. The original source is separately delivered to the user; credentials from the app page are not reused or included.

## Run

Open https://code.earthengine.google.com/, select the registered project, paste `earth-engine-app.js` into a new script, click Run, then Analyze. The Earth Engine application runs independently from the static viewer. No existing app is overwritten.

For the web workspace, serve the repository root with `python -m http.server 8765`, then visit http://localhost:8765. The setup page explains analysis JSON transfer.

## Scientific limits

Sentinel-2 uses latest-valid pixel mosaics, SCL classes 4/5/6/7, MNDWI green/SWIR, with an adjustable threshold. SCL masking does not guarantee perfect cloud removal. Sentinel-1 uses ascending IW VV, incidence-angle and backscatter validity masks, 30 m median filtering in linear power, slope < 5 degrees, and an adjustable VV threshold. It is not a trained classifier or validated flood product. SAR false positives and negatives need local assessment.

No-data remains distinct from dry land. Dates vary spatially. Area and coverage estimates are calculated at 100 m for interactive performance, not exact 20 m polygon areas. Boundary is geoBoundaries gbOpen PAK ADM1, public domain.

The revised reconstruction keeps the satellite basemap visible on unchanged land at all zooms. Only detected water and recently dried patches receive overlays. Recently dried means the latest valid optical pixel before the selected window was wet and the selected current classifier says dry; it does not compare with Google imagery, whose pixel dates are unavailable. Dry patches use newest historical dry Sentinel-2 pixels, while water uses AI material modulated by optical brightness and clipped to detected water. The native app has separate water opacity and dry-fill visibility controls. Full satellite-level detail in reconstructed patches is not achieved: it requires licensed high-resolution source imagery, particularly dry-season coverage. Sentinel water boundaries remain resolution-limited. The generated material is reused across analyses; observation masks are recalculated. It does not edit Google imagery or recover unseen terrain. Historical dry fill can be old; the result is an experimental composite, not a verified current photograph. An unconstrained AI scene edit was rejected because it widened rivers. The deployed method uses AI only for surface appearance.

## Security and connections

No app backend, analytics, or persistent key storage. Browser map key is sent only to Google. Imported analysis is validated locally; only HTTPS earthengine.googleapis.com tile URLs are accepted. These temporary tiles can expire or require access, so the Earth Engine app is the primary processing experience. For unattended refreshing, a separately authenticated processing backend is required; none is provisioned here.

## Validation

JavaScript syntax checks; browser navigation and connection dialog behavior; WebMCP navigation and layer actions including invalid-input rejection. Both methods were run in the authenticated Earth Engine project and in the published app. For the 2026-08-30 through 2026-09-22 window, optical: latest scene 2026-09-21, 7,877.6 km² water, 99.8% valid coverage; ascending radar: latest scene 2026-09-20, 8,981 km² water, 57.8% valid coverage. These outputs are not accuracy validation. Standalone web-viewer Google Maps key connection was not tested; the published Earth Engine app uses its own Google satellite map.

Published app: https://ee-rawal-karim23.projects.earthengine.app/view/sindh-water-observatory

AI material asset: projects/ee-rawal-karim23/assets/sindh_synthetic_water_texture_20260922. Reader access is granted to the new app only. To reuse in another account, upload the provided GeoTIFF and change WATER_TEXTURE_ASSET.


Overlay update: exported JSON includes rendering=satellite-preserving-overlays-v2. Exported reconstruction PNGs/tiles contain transparent land, water material and dry patches only, not Google imagery. The standalone viewer accepts older manifests but labels them as legacy composites.

Validation of overlay update: native Google satellite swipe inspected at Hyderabad zoom 17; unchanged roads/buildings remain visible. The sampled Hyderabad overlay tile was 98.36% transparent (remaining pixels are water/dry patches). The sampled Manchar tile rendered water material. Published optical processing completed with 99.8% valid coverage. Dry-fill switch toggled successfully; published browser console reported no errors in the final check. Full high-resolution reconstruction of changed pixels remains unfulfilled pending suitable source imagery.

## Structure visibility in the web viewer

The web viewer cuts mapped structure footprints out of both detected-water and reconstructed-surface display tiles. It reveals the existing satellite reference beneath bridges, barrages, dams, weirs, piers, groynes, breakwaters, dykes, quays and walls. Google imagery is not downloaded, extracted or edited. Masking happens on the Sentinel overlay canvas and supports Leaflet and the optional Google Maps renderer.

This is a display correction, not a claim that the structures are currently dry, intact or safe. Water totals still use raw satellite classification. Closed dam/bridge polygons use mapped footprints; lines use OSM width or lane counts when available, otherwise estimated widths (12 m road/default, 6 m rail, 4 m foot/cycle, 8 m marine/river-training structure, 3 m wall). Closed wall/dyke loops remain lines so their enclosed areas are not incorrectly erased. Coverage follows OSM completeness and alignment. The native Earth Engine app does not yet apply this browser-side mask.

Source: OpenStreetMap contributors, Geofabrik Pakistan extract, data through 2026-09-21. Derived structures.geojson is distributed under ODbL 1.0. https://www.openstreetmap.org/copyright and https://download.geofabrik.de/asia/pakistan.html .

Dataset: 15,304 mapped features. Kotri, Sukkur and Guddu barrages are included. Independent OSM API geometry matched the decoded Sukkur footprint exactly.

Validation: eight browser canvas checks cover bridge centers, adjacent water, tile seams, footprint polygons, holes, distant structures and empty masks.

## GitHub Pages

Publish the `main` branch and `/ (root)` folder under Settings > Pages. No build step is required. The bundled analysis is a dated snapshot; GitHub Pages does not run Earth Engine or refresh satellite analysis. To refresh all visitors, export new analysis from the published Earth Engine app and replace `analysis.json`. Individual visitors can load their own export using Data.


## Historical days, search, and GIS export

Open **Dates & GIS export**, draw a rectangle (two corners, at most 400 km²), choose a date from 2020 onward, then open **Find clear days & export**. The area and requested month are passed to the Earth Engine app. Scan the month and select a verified clear acquisition day. Missing and cloud-obscured days are omitted; no nearby date is silently substituted as the requested date.

Screening requires SCL land/vegetation/water classes 4/5/6 and Cloud Score+ `cs_cdf >= 0.65`. Every sampled cell of the selected region must have valid MNDWI at 20 m in EPSG:32642. The minimum Cloud Score+ mask is aggregated from 10 m to 20 m. Overlapping scenes from the same UTC day can fill one another; different days are never combined in historical mode. Automated masks can still make mistakes. The bundled province-wide snapshot remains a separately labelled multi-day mosaic.

The Earth Engine app directly generates a three-band float32 GeoTIFF at 20 m in UTM 42N (EPSG:32642): water (1 water, 0 dry), MNDWI, and observation day (UTC days since 1970-01-01). Set -9999 as NoData in your GIS. GeoJSON water polygons carry observation date, threshold, method and scale; they use WGS84 and can be converted to Shapefile through QGIS Save Features As or ArcGIS Export Features. These are raw classification exports; neither AI material nor browser-side structure exclusions alter the scientific data. Large/complex requests may need a smaller rectangle.

To compare historical dates in the GitHub viewer, prepare analysis JSON in Earth Engine, save the text to a .json file, and load it using Data. Loaded dates appear as switch buttons for this browser session; tile URLs expire. The calendar requests processing and does not relabel or change an existing layer. GitHub Pages has no authenticated processing backend; automatic historical tile retrieval is not implemented.

Location search uses the public OpenStreetMap Nominatim service only on form submission (no autocomplete), caches repeat queries for the session, and filters results against the Sindh boundary. Search queries are sent to Nominatim; availability and place coverage depend on that service. Attribution: https://www.openstreetmap.org/copyright .

Validation: January 2020 was scanned over a 1.12 km² Kotri area, yielding 2020-01-04 as fully screened clear. Actual public download requests returned a 56×51 three-band float32 GeoTIFF in EPSG:32642 and nine dated water polygons. Search for Thatta and two-corner rectangle selection were tested in-browser.
