import { get, put, list, del } from '@vercel/blob';
// Client records and settings always use the PRIVATE store. Never use the media token here.
export function createBlobBucket(token, sdk={get,put,list,del}) {
  if(!token) throw Error('Connect a private Blob store and set BLOB_READ_WRITE_TOKEN.');
  const prefix='frostfuel/records/';
  function key(k){if(typeof k!=='string'||!k||k.includes('..')||k.startsWith('/'))throw Error('Invalid storage key');return prefix+k}
  return {
    async get(k){const result=await sdk.get(key(k),{token,access:'private',useCache:false});if(!result)return null;if(result.statusCode!==200||!result.stream)throw Error('Unable to read private record');const bytes=await new Response(result.stream).arrayBuffer();return{text:async()=>new TextDecoder().decode(bytes),arrayBuffer:async()=>bytes.slice(0),body:bytes,httpMetadata:{contentType:result.blob.contentType}}},
    async put(k,value,options={}){await sdk.put(key(k),value,{token,access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:options.httpMetadata?.contentType||'application/json',cacheControlMaxAge:60})},
    async delete(k){await sdk.del(key(k),{token})},
    async list({prefix:p='',cursor}={}){const r=await sdk.list({prefix:key(p||'_').replace(/_$/,''),cursor,limit:1000,token});return{objects:r.blobs.map(b=>({key:b.pathname.slice(prefix.length)})),truncated:r.hasMore,cursor:r.cursor}}
  };
}
