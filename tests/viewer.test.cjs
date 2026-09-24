const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const tile=k=>({url:`https://earthengine.googleapis.com/v1/${k}/tiles/{z}/{x}/{y}`});
function manifest(){return{schemaVersion:1,region:'Sindh',method:'Sentinel-2 MNDWI',rendering:'observed-dry-surface-v3',windowStart:'2026-09-01',windowEnd:'2026-09-22',latestScene:'2026-09-21',generatedAt:'2026-09-23',waterKm2:1,coveragePercent:90,layers:Object.fromEntries(['water','reconstruction','dry','waterAppearance','unknown'].map(k=>[k,tile(k)]))};}
function setup(googleReady=false){
 const nodes={surfaceNote:{},opacity:{value:85},legendWater:{}},layers=[],googleLayers=[],removed=[];
 class Layer{constructor(options){this.options=options;this.protected=true;}addTo(){layers.push(this);return this;}on(){return this;}setOpacity(v){this.options.opacity=v;}}
 const c={URL,Set,Number,Date,Error,analysis:manifest(),mode:'reconstruction',overlay:null,googleOverlay:null,googleReady,
  $:id=>nodes[id],notice:()=>{},ProtectedTiles:Layer,L:{tileLayer:(url,opts)=>Object.assign(new Layer({...opts,url}),{protected:false})},
  map:{removeLayer:l=>removed.push(l)},google:{maps:{Size:class{}}},googleMap:{overlayMapTypes:{clear:()=>googleLayers.splice(0),push:l=>googleLayers.push(l)}},
  StructureMask:{tile:()=>({style:{}})}};
 vm.createContext(c);
 vm.runInContext(source.slice(source.indexOf('let surfaceLayers='),source.indexOf('function tileURL')),c);
 vm.runInContext(source.slice(source.indexOf('function validateAnalysis'),source.indexOf('function loadAnalysis')),c);
 return{c,nodes,layers,googleLayers,removed};
}
test('dry stays opaque while water fades; unknown is above both and is not structure-erased',()=>{
 const {c,layers,removed,nodes}=setup();c.renderLayer();
 assert.equal(layers.length,3);assert.match(layers[0].options.url,/\/dry\//);assert.equal(layers[0].options.opacity,1);
 assert.equal(layers[1].options.opacity,.85);assert.equal(layers[2].protected,false);assert.equal(layers[2].options.zIndex,4);
 c.overlay.setOpacity(0);assert.equal(layers[0].options.opacity,1);assert.equal(layers[2].options.opacity,.7);
 c.mode='reference';c.renderLayer();assert.equal(removed.length,3);assert.equal(nodes.surfaceNote.hidden,true);
});
test('Google adapter has the same opaque dry and unknown behavior; mode switch clears it',()=>{
 const {c,googleLayers}=setup(true);c.renderLayer();assert.deepEqual(googleLayers.map(l=>l.opacity),[1,.85,.7]);
 c.googleOverlay.setOpacity(0);assert.deepEqual(googleLayers.map(l=>l.opacity),[1,0,.7]);
 c.mode='water';c.renderLayer();assert.deepEqual(googleLayers.map(l=>l.opacity),[.85,.7]);
 c.mode='reference';c.renderLayer();assert.equal(googleLayers.length,0);
});
test('older results still render with an explicit limitation',()=>{
 const {c,layers,nodes}=setup();c.analysis.rendering='satellite-preserving-overlays-v2';delete c.analysis.layers.unknown;c.renderLayer();
 assert.equal(layers.length,1);assert.match(layers[0].options.url,/\/reconstruction\//);assert.match(nodes.surfaceNote.textContent,/older result/);
});
test('reject incomplete v3 and non-EE optional layers before swapping analysis',()=>{
 const {c}=setup();assert.doesNotThrow(()=>c.validateAnalysis(manifest()));
 const d=manifest();delete d.layers.dry;assert.throws(()=>c.validateAnalysis(d),/Missing dry/);
 for(const key of ['dry','unknown','photo']){const d=manifest();d.layers[key]={url:'https://attacker.example/{z}/{x}/{y}'};assert.throws(()=>c.validateAnalysis(d),/Only HTTPS Earth Engine/);}
});
