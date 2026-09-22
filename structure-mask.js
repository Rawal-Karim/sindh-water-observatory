/* Display-only exclusions. OSM footprints do not establish current flood safety. */
'use strict';
const StructureMask = (() => {
  let features = [];
  function project(lon, lat, z) {
    const n = 256 * 2 ** z;
    const sine = Math.sin(lat * Math.PI / 180);
    return [(lon + 180) / 360 * n, (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * n];
  }
  function setData(data) {
    if (data.type !== 'FeatureCollection') throw Error('Invalid structure geometry');
    features = data.features.filter(f => ['LineString', 'Polygon'].includes(f.geometry?.type)).map(f => {
      const b=f.bbox;
      return {...f, topLeft:project(b[0],b[3],0),bottomRight:project(b[2],b[1],0),
        widthAtZero:(f.properties.width_m||10)/(156543.03392804097*Math.cos((b[1]+b[3])/2*Math.PI/180))};
    });
  }
  function erase(canvas, coords) {
    const ctx = canvas.getContext('2d');
    const ox = coords.x * 256, oy = coords.y * 256, scale = 2**coords.z;
    ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000'; ctx.strokeStyle = '#000'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const f of features) {
      const polygon = f.geometry.type === 'Polygon';
      const rings = polygon ? f.geometry.coordinates : [f.geometry.coordinates];
      const a = f.topLeft.map(v=>v*scale), c = f.bottomRight.map(v=>v*scale);
      const width = f.widthAtZero * scale;
      const margin = polygon ? 1 : width / 2 + 1;
      if (c[0] < ox-margin || a[0] > ox+256+margin || c[1] < oy-margin || a[1] > oy+256+margin) continue;
      ctx.beginPath();
      for (const ring of rings) {
        ring.forEach((p,i) => {const q=project(p[0],p[1],coords.z); if(i)ctx.lineTo(q[0]-ox,q[1]-oy);else ctx.moveTo(q[0]-ox,q[1]-oy);});
        if (polygon) ctx.closePath();
      }
      if (polygon) ctx.fill('evenodd');
      else {ctx.lineWidth=width;ctx.stroke();}
    }
    ctx.restore();
  }
  function tile(url, coords, ownerDocument, done) {
    const canvas = ownerDocument.createElement('canvas');canvas.width=256;canvas.height=256;
    const img = new Image(); let retries = 0;
    img.onload=()=>{canvas.getContext('2d').drawImage(img,0,0,256,256);erase(canvas,coords);done?.(null,canvas);};
    img.onerror=()=>{if(retries<2){retries++;setTimeout(()=>{img.src=url.replace('{x}',coords.x).replace('{y}',coords.y).replace('{z}',coords.z);},500*retries);return;}done?.(new Error('Analysis tile unavailable'),canvas);};
    img.src=url.replace('{x}',coords.x).replace('{y}',coords.y).replace('{z}',coords.z);
    return canvas;
  }
  return {setData,erase,tile,project};
})();
