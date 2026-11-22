import worker from '../../dist/server/index.js';
import { createNetlifyBucket } from '../../platform/netlify-storage.js';
import { netlifyUploadRoutes } from '../../platform/netlify-uploads.js';
const envValue=k=>globalThis.Netlify?.env?.get(k)||process.env[k];
export function createNetlifyHandler(bucketFactory=createNetlifyBucket){return async request=>{const url=new URL(request.url),password=envValue('ADMIN_PASSWORD');
  if(url.pathname==='/api/runtime')return Response.json({platform:'netlify',adminConfigured:!!password,commit:envValue('COMMIT_REF')||'local'},{headers:{'Cache-Control':'no-store'}});
  if(url.pathname==='/api/login'&&!password)return Response.json({error:'Set ADMIN_PASSWORD in Netlify environment variables with Functions scope, then redeploy.'},{status:503,headers:{'Cache-Control':'no-store'}});
  try{const env={BUCKET:bucketFactory(),ADMIN_PASSWORD:password};const upload=await netlifyUploadRoutes(request,env);if(upload)return upload;return worker.fetch(request,env)}catch{return Response.json({error:'Storage is unavailable. Enable Netlify Blobs for this site and redeploy.'},{status:503,headers:{'Cache-Control':'no-store'}})}}}
export default createNetlifyHandler();
export const config={path:'/*',preferStatic:true};
