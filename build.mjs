import fs from 'node:fs';
import zlib from 'node:zlib';
import { build as bundle } from 'esbuild';
const compiledUpload=await bundle({entryPoints:['platform/upload-client.js'],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022',minify:true});
const uploadJS=compiledUpload.outputFiles[0].text;
fs.mkdirSync('public',{recursive:true});fs.writeFileSync('public/studio-upload.js',uploadJS);
fs.mkdirSync('dist/server',{recursive:true});
const logo='data:image/png;base64,'+fs.readFileSync('brand/frostfuel-logo.png').toString('base64');
let html=fs.readFileSync('index.html','utf8').replaceAll('__FROSTFUEL_LOGO__',logo).replace('</style>','[hidden]{display:none!important}@media(min-width:851px){h1{font-size:clamp(46px,4.6vw,64px)}}@media(max-width:420px){h1{font-size:38px;letter-spacing:-.06em}.preview-caption{font-size:11px;gap:15px}}</style>');
let dashboard=fs.readFileSync('dashboard.html','utf8').replaceAll('__FROSTFUEL_LOGO__',logo);
const sampleCSS=fs.readFileSync('samples/shared.css','utf8');
html=html.replace('</style>',sampleCSS+'</style>').replace('<a href="#work">Work</a>','<a href="#work">Work</a><a href="#samples">Samples</a>').replace('<section class="work-section"',fs.readFileSync('samples/section.html','utf8')+'<section class="work-section"').replace('</body>',()=>'<script>'+fs.readFileSync('samples/gallery.js','utf8')+'</script></body>');
dashboard=dashboard.replace('</style>',sampleCSS+'</style>').replace('<button class="nav" data-view="portfolio">','<button class="nav" data-view="samples">Samples</button><button class="nav" data-view="portfolio">').replace('<section id="view-portfolio"',fs.readFileSync('samples/admin-section.html','utf8')+'<section id="view-portfolio"').replace('<div id="toast"',fs.readFileSync('samples/admin-modal.html','utf8')+'<div id="toast"').replace('</body>',()=>'<script>'+fs.readFileSync('samples/admin.js','utf8')+'</script></body>');
dashboard=dashboard.replace('</head>','<script type="module" src="/studio-upload.js"></script></head>');
const paletteCore=fs.readFileSync('palette-core.js','utf8');
html=html.replace('</style>',()=>fs.readFileSync('palette-site.css','utf8')+'</style>').replace('</body>',()=>'<script>'+paletteCore+String.fromCharCode(10)+fs.readFileSync('palette-site.js','utf8')+'</script></body>');
dashboard=dashboard.replace('</style>',()=>fs.readFileSync('palette-admin.css','utf8')+'</style>').replace('<section id="view-website" class="view hidden">',()=>'<section id="view-website" class="view hidden">'+fs.readFileSync('palette-admin.html','utf8')).replace('</body>',()=>'<script>'+paletteCore+String.fromCharCode(10)+fs.readFileSync('palette-admin.js','utf8')+'</script></body>');
const buildInfo={commit:process.env.COMMIT_REF||process.env.VERCEL_GIT_COMMIT_SHA||'local',builtAt:new Date().toISOString(),entry:'index.html',features:['clients','samples','video-uploads','palette-editor']};
html=html.replace('</head>','<meta name="frostfuel-build" content="'+buildInfo.commit+'"></head>');
fs.writeFileSync('public/index.html',html);fs.writeFileSync('public/build-info.json',JSON.stringify(buildInfo));
fs.rmSync('public/vercel-upload.js',{force:true});
function crc32(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function chunk(type,data){const t=Buffer.from(type),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(data.length);c.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([n,t,data,c])}
function icon(size){const raw=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++){for(let x=0;x<size;x++){const px=x/size,py=y/size;const f=(left)=>px>=left&&px<left+.23&&py>=.25&&py<.75&&((px<left+.065)||(py<.32)||(py>=.45&&py<.52&&px<left+.20));const cyan=f(.22)||f(.55),i=y*(size*4+1)+1+x*4;raw[i]=cyan?112:7;raw[i+1]=cyan?217:16;raw[i+2]=cyan?241:21;raw[i+3]=255}}const h=Buffer.alloc(13);h.writeUInt32BE(size,0);h.writeUInt32BE(size,4);h[8]=8;h[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]).toString('base64')}
const assets={};for(const [file,type] of [['website-demo.jpg','image/jpeg'],['poster-demo.svg','image/svg+xml'],['motion-demo.mp4','video/mp4']])assets['/demo-media/'+file]={type,data:fs.readFileSync('samples/'+file).toString('base64')};
const constants={HTML:html,DASHBOARD:dashboard,SERVICE_WORKER:fs.readFileSync('sw.js','utf8'),ICON192:icon(192),ICON512:icon(512),SAMPLE_ASSETS:assets,VERCEL_UPLOAD_JS:uploadJS};
let api=fs.readFileSync('worker/api.js','utf8').replace("if(p==='/api/login'", "if(p==='/studio-upload.js')return new Response(VERCEL_UPLOAD_JS,{headers:{'Content-Type':'text/javascript','Cache-Control':'no-cache'}});\nif(p==='/api/login'").replace("if(p==='/api/login'","const studioResponse=await studioRoutes(req,env,admin);if(studioResponse)return studioResponse;\nif(p==='/api/login'");
const studio=fs.readFileSync('worker/studio.js','utf8').replace('async function studioRoutes(req,env,admin){','async function studioRoutes(req,env,admin){const paletteResponse=await paletteRoutes(req,env,admin);if(paletteResponse)return paletteResponse;const sampleResponse=await sampleRoutes(req,env,admin);if(sampleResponse)return sampleResponse;');
fs.writeFileSync('dist/server/index.js',Object.entries(constants).map(([k,v])=>'const '+k+'='+JSON.stringify(v)+';').join('\n')+'\n'+paletteCore+'\n'+fs.readFileSync('worker/palette.js','utf8')+'\n'+fs.readFileSync('worker/samples.js','utf8')+'\n'+studio+'\n'+api);
console.log('Built Frostfuel Worker');
