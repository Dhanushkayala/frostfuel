import worker from '../dist/server/index.js';
import { createBlobBucket } from '../platform/blob-storage.js';
import { mediaRoutes } from '../platform/media.js';
export default {async fetch(request){const u=new URL(request.url);if(u.searchParams.has('__path')){u.pathname='/'+u.searchParams.get('__path');u.searchParams.delete('__path');request=new Request(u,request)}
  try{if(u.pathname==='/api/runtime')return Response.json({platform:'vercel'},{headers:{'Cache-Control':'no-store'}});const special=await mediaRoutes(request,process.env);if(special)return special;let BUCKET;if(process.env.BLOB_READ_WRITE_TOKEN)BUCKET=createBlobBucket(process.env.BLOB_READ_WRITE_TOKEN);return worker.fetch(request,{BUCKET,ADMIN_PASSWORD:process.env.ADMIN_PASSWORD})}catch{return Response.json({error:'Unable to complete this request. Check the deployment storage settings.'},{status:503,headers:{'Cache-Control':'no-store'}})}}};
