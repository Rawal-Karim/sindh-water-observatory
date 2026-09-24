"""Generate a local-only full UI fixture from the current index, without a stale copy."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text(encoding='utf-8')
html = html.replace('<head>', '<head><base href="../">')
html = html.replace('<script src="app.js', '<script src="tests/visual-fixture.js"></script><script src="app.js')
html = html.replace('<body>', '<body><div style="position:fixed;top:0;left:35%;z-index:99999;background:#ffe58a;padding:5px;font:12px sans-serif">DISPLAY TEST · SIMULATED PIXELS · NOT SATELLITE DATA</div>')
(root / 'tests' / 'visual-fixture.html').write_text(html, encoding='utf-8', newline='\n')
