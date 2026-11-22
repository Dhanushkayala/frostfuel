import { upload } from '@vercel/blob/client';
// Keep existing dashboard forms, but send media directly to Blob instead of through a Function.
const originalFetch=window.fetch.bind(window);
let useDirectUploads=false;try{const r=await originalFetch('/api/runtime');if(r.ok)useDirectUploads=(await r.json()).platform==='vercel'}catch{}
window.fetch=async function(resource,options={}){const url=new URL(typeof resource==='string'?resource:resource.url,location.href);const file=options.body;if(!useDirectUploads||url.origin!==location.origin||options.method!=='POST'||!['/api/upload','/api/sample-upload'].includes(url.pathname)||!(file instanceof Blob))return originalFetch(resource,options);
  try{if(file.size>20*1024*1024)throw Error('Maximum file size is 20 MB');const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'}[file.type];if(!ext||url.pathname==='/api/upload'&&file.type.startsWith('video/'))throw Error('Choose a supported picture or video file');
    const blob=await upload('uploads/'+crypto.randomUUID()+'.'+ext,file,{access:'public',handleUploadUrl:'/api/blob-upload',contentType:file.type,multipart:file.size>5*1024*1024});
    return originalFetch('/api/blob-finalize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:blob.url})});
  }catch(e){return Response.json({error:e.message||'Upload failed. Please try again.'},{status:400})}};
