import { put } from '@vercel/blob';
import { createBlobBucket } from '../platform/blob-storage.js';
import { sniffMedia } from '../platform/media.js';
const origin=new URL(process.env.SITES_ORIGIN||'https://frostfuel-studio.dearbrioche16.chatgpt.site').origin;
const password=process.env.SITES_ADMIN_PASSWORD,privateToken=process.env.BLOB_READ_WRITE_TOKEN,mediaToken=process.env.MEDIA_BLOB_READ_WRITE_TOKEN;
if(!password||!privateToken||!mediaToken)throw Error('Set SITES_ADMIN_PASSWORD, BLOB_READ_WRITE_TOKEN and MEDIA_BLOB_READ_WRITE_TOKEN in your local environment. Do not commit these values.');
const bucket=createBlobBucket(privateToken),existing=await bucket.list();if(existing.objects.length&&!process.argv.includes('--resume'))throw Error('Target storage is not empty. Use a new private store. Use --resume only to continue your own interrupted migration before accepting new target data.');
const login=await fetch(origin+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});if(!login.ok)throw Error('Could not sign into the source Site.');const cookie=login.headers.get('set-cookie')?.split(';')[0];if(!cookie)throw Error('Source session unavailable.');
async function read(path){const r=await fetch(origin+'/api/'+path,{headers:{Cookie:cookie}});if(!r.ok)throw Error('Could not read source '+path+': '+r.status);return r.json()}
const [clients,bookings,projects,samples,settings,palette]=await Promise.all(['clients','bookings','projects','samples','settings','palette'].map(read));
if(projects.length>=1000||bookings.length>=1000)throw Error('The source may exceed its API page limit. Arrange a paginated source export before migrating. No records have been copied.');
const migrated=new Map();let mediaCount=0;
async function media(value){if(!value)return value;const url=new URL(value,origin);if(url.origin!==origin||!/^\/(sample-media|media)\/[a-f0-9-]+$/.test(url.pathname))return value;if(migrated.has(url.href))return migrated.get(url.href);const r=await fetch(url,{redirect:'error'});if(!r.ok)throw Error('Unable to copy a source media file.');if(Number(r.headers.get('content-length'))>20*1024*1024)throw Error('A source media file is larger than 20 MB.');const bytes=await r.arrayBuffer();if(bytes.byteLength>20*1024*1024)throw Error('A source media file is larger than 20 MB.');const type=sniffMedia(new Uint8Array(bytes)),ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'}[type];if(!ext)throw Error('A source file has an unsupported format.');const b=await put('uploads/'+crypto.randomUUID()+'.'+ext,bytes,{token:mediaToken,access:'public',contentType:type,addRandomSuffix:false});migrated.set(url.href,b.url);mediaCount++;return b.url}
for(const c of clients)await bucket.put('clients/'+c.id,JSON.stringify(c));
for(const b of bookings)await bucket.put('bookings/'+b.id,JSON.stringify(b));
for(const p of projects){const copy={...p,image:await media(p.image),link:await media(p.link)};await bucket.put('projects/'+p.id,JSON.stringify(copy))}
const realSamples=samples.filter(s=>!s.demo);for(const s of realSamples){const copy={...s,url:await media(s.url),poster:await media(s.poster)};await bucket.put('samples/'+s.id,JSON.stringify(copy))}
if(realSamples.length||samples.length===0)await bucket.put('site/samples-customized','true');await bucket.put('site/settings',JSON.stringify(settings));await bucket.put('site/palette',JSON.stringify(palette));
console.log(JSON.stringify({copied:{clients:clients.length,enquiries:bookings.length,projects:projects.length,samples:realSamples.length,mediaFiles:mediaCount},sourcePreserved:true}));
