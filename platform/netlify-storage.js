import { getStore } from '@netlify/blobs';
export function createNetlifyBucket(store=getStore({name:'frostfuel-data',consistency:'strong'})){
  function key(k){if(typeof k!=='string'||!k||k.includes('..')||k.startsWith('/'))throw Error('Invalid storage key');return k}
  return {
    async get(k){const result=await store.getWithMetadata(key(k),{type:'arrayBuffer',consistency:'strong'});if(!result)return null;const bytes=result.data;return{text:async()=>new TextDecoder().decode(bytes),arrayBuffer:async()=>bytes.slice(0),body:bytes,httpMetadata:{contentType:result.metadata?.contentType||'application/json'}}},
    async put(k,data,options={}){await store.set(key(k),data,{metadata:{contentType:options.httpMetadata?.contentType||'application/json'}})},
    async delete(k){await store.delete(key(k))},
    async list({prefix=''}={}){const r=await store.list({prefix});return{objects:r.blobs.map(b=>({key:b.key})),truncated:false}}
  };
}
