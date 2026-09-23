// Local display regression fixture only. All coloured pixels below are simulated.
// Load through tests/visual-fixture.html, never from the production index.
const realFetch=window.fetch;
const fixture={schemaVersion:1,region:'Sindh',method:'Sentinel-2 MNDWI',rendering:'observed-dry-surface-v3',windowStart:'2026-09-01',windowEnd:'2026-09-22',latestScene:'2026-09-21',generatedAt:'2026-09-23',waterKm2:1,coveragePercent:75,layers:{}};
for(const k of ['water','reconstruction','dry','waterAppearance','unknown'])fixture.layers[k]={url:`https://earthengine.googleapis.com/v1/fixture-${k}/tiles/{z}/{x}/{y}`};
window.fetch=(url,...args)=>String(url).includes('snapshot.json')?Promise.resolve({ok:true,json:async()=>fixture}):realFetch(url,...args);
function paintFixture(url,coords,doc,done){
 const c=doc.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
 if(url.includes('fixture-dry')){x.fillStyle='#b7ac7a';x.fillRect(0,0,128,256);for(let y=0;y<256;y+=32){x.fillStyle=y%64?'#82926a':'#c2b586';x.fillRect(4,y+4,120,26);}}
 else if(url.includes('fixture-waterAppearance')){x.fillStyle='#727b46';x.fillRect(128,0,64,256);}
 else if(url.includes('fixture-water')){x.fillStyle='#2fb9ed';x.fillRect(128,0,64,256);}
 else if(url.includes('fixture-unknown')){x.fillStyle='#747a81';x.fillRect(192,0,64,256);}
 else{x.fillStyle='#245e82';x.fillRect(0,0,256,256);x.fillStyle='#c7cac5';x.fillRect(0,120,256,16);}
 if(!url.includes('unknown'))StructureMask.erase(c,coords);
 setTimeout(()=>done?.(null,c),0);return c;
}
StructureMask.tile=paintFixture;
const originalTiles=L.tileLayer,FixtureTiles=L.GridLayer.extend({createTile(coords,done){return paintFixture(this.options.url,coords,document,done);}});
L.tileLayer=(url,options)=>url.includes('fixture-')||url.includes('World_Imagery')?new FixtureTiles({...options,url}):originalTiles(url,options);
