"""Portable PBF reader for the public OSM-binary schema; no native extensions.
Extract mapped structures only. Two passes retain coordinates for selected ways.
"""
import json, struct, zlib, itertools, re
from pathlib import Path

def varint(b, p):
    n = shift = 0
    while True:
        v = b[p]; p += 1; n |= (v & 127) << shift
        if v < 128: return n, p
        shift += 7

def fields(b):
    p = 0
    while p < len(b):
        tag, p = varint(b, p); typ = tag & 7
        if typ == 0: v, p = varint(b, p)
        elif typ == 2:
            size, p = varint(b, p); v = b[p:p+size]; p += size
        elif typ in (1, 5):
            size = 8 if typ == 1 else 4; v = b[p:p+size]; p += size
        else: raise ValueError('Unsupported wire type')
        yield tag >> 3, v

def packed(b, signed=False):
    p = 0
    while p < len(b):
        v, p = varint(b, p)
        yield (v >> 1) ^ -(v & 1) if signed else v

def blocks(path):
    with open(path, 'rb') as f:
        while head := f.read(4):
            n = struct.unpack('>I', head)[0]
            h = dict(fields(f.read(n))); blob = dict(fields(f.read(h[3])))
            if h[1] != b'OSMData': continue
            raw = blob[1] if 1 in blob else zlib.decompress(blob[3])
            values = list(fields(raw)); groups = [v for k,v in values if k == 2]
            meta = dict(values)
            yield meta, groups

import argparse
parser = argparse.ArgumentParser()
parser.add_argument('pbf', help='Path to a Geofabrik Pakistan .osm.pbf extract')
args = parser.parse_args()
base = Path(__file__).resolve().parent
path = args.pbf
ways = []; needed = set()
for meta, groups in blocks(path):
    strings = [v.decode('utf-8') for k,v in fields(meta[1])]
    for group in groups:
        for typ, raw in fields(group):
            if typ != 3: continue
            w = dict(fields(raw)); tags = dict(zip((strings[i] for i in packed(w.get(2,b''))), (strings[i] for i in packed(w.get(3,b'')))))
            if not (tags.get('waterway') in ('dam','weir') or tags.get('man_made') in ('bridge','pier','groyne','breakwater','dyke','quay') or tags.get('barrier') in ('retaining_wall','wall') or tags.get('bridge', 'no') not in ('no','false','0')): continue
            if tags.get('construction') or tags.get('demolished') == 'yes': continue
            refs = list(itertools.accumulate(packed(w.get(8,b''),True)))
            ways.append((w[1], tags, refs)); needed.update(refs)
print('Selected',len(ways),'ways;',len(needed),'nodes needed',flush=True)
nodes = {}
for meta, groups in blocks(path):
    gran = meta.get(17,100); lat0 = meta.get(19,0); lon0 = meta.get(20,0)
    for group in groups:
        for typ, raw in fields(group):
            if typ == 2:
                d=dict(fields(raw)); ids=itertools.accumulate(packed(d.get(1,b''),True))
                lat=itertools.accumulate(packed(d.get(8,b''),True));lon=itertools.accumulate(packed(d.get(9,b''),True))
                for i,y,x in zip(ids,lat,lon):
                    if i in needed: nodes[i]=[round((lon0+gran*x)*1e-9,7),round((lat0+gran*y)*1e-9,7)]
            elif typ == 1:
                d=dict(fields(raw)); i=(d[1]>>1)^-(d[1]&1)
                if i in needed: nodes[i]=[(lon0+gran*((d[9]>>1)^-(d[9]&1)))*1e-9,(lat0+gran*((d[8]>>1)^-(d[8]&1)))*1e-9]

ring=json.loads((base / 'sindh.geojson').read_text())['features'][0]['geometry']['coordinates'][0]
def inside(p):
    x,y=p; odd=False
    for a,b in zip(ring,ring[1:]):
        if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]: odd=not odd
    return odd

features=[]
for ident,t,refs in ways:
    if any(i not in nodes for i in refs): continue
    c=[nodes[i] for i in refs]
    if len(c)<2 or not any(inside(p) for p in c):continue
    polygon=c[0]==c[-1] and len(c)>=4 and (t.get('waterway') in ('dam','weir') or t.get('man_made') in ('bridge','pier','groyne','breakwater','dyke','quay') or t.get('area')=='yes') and t.get('area')!='no' and t.get('barrier') not in ('wall','retaining_wall') and t.get('man_made')!='dyke'
    width=3 if t.get('barrier') in ('retaining_wall','wall') else 8 if t.get('man_made') in ('pier','groyne','breakwater','dyke','quay') else 6 if 'railway' in t else 4 if t.get('highway') in ('footway','path','cycleway','steps') else 12
    width_source='estimated'
    if re.fullmatch(r'\d+(\.\d+)?( m)?',t.get('width','')):
        width=max(1,min(100,float(t['width'].split()[0])));width_source='osm width'
    elif re.fullmatch(r'\d+',t.get('lanes','')):width=max(4,min(40,int(t['lanes'])*3.5+2))
    features.append({'type':'Feature','id':'way/'+str(ident),'bbox':[min(p[0] for p in c),min(p[1] for p in c),max(p[0] for p in c),max(p[1] for p in c)],'properties':{'osm_id':ident,'name':t.get('name',''),'kind':t.get('waterway',t.get('man_made',t.get('barrier','bridge'))),'width_m':width,'width_source':'polygon' if polygon else width_source},'geometry':{'type':'Polygon' if polygon else 'LineString','coordinates':[c] if polygon else c}})
result={'type':'FeatureCollection','source':'OpenStreetMap contributors / Geofabrik Pakistan 2026-09-21','license':'ODbL-1.0','features':features}
(base / 'structures.geojson').write_text(json.dumps(result,separators=(',',':')),encoding='utf-8')
print(json.dumps({'count':len(features),'barrages':[(f['id'],f['properties']['name'],f['bbox']) for f in features if 'barrage' in f['properties']['name'].lower()]}),flush=True)
