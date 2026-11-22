const paymentDefaults={enabled:true,upiId:'kayaladhanush8@pingpay',payeeName:'Frostfuel',instructions:'Pay only the amount agreed with Frostfuel for your project.'};
const paymentIdOK=id=>/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id||'');
async function paymentSettings(env){const o=await env.BUCKET.get('site/payments');return o?{...paymentDefaults,...JSON.parse(await o.text())}:paymentDefaults;}
async function paymentRoutes(req,env,admin){
 const p=new URL(req.url).pathname;
 if(p!=='/api/payment-settings'&&p!=='/api/payments'&&!p.startsWith('/api/payments/'))return null;
 if(!env.BUCKET)return json({error:'Storage is not configured'},503);
 if(p==='/api/payment-settings'){
  if(req.method==='GET')return json(await paymentSettings(env));
  if(!admin)return json({error:'Studio sign-in required'},401);
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  const b=await req.json();
  if(typeof b.enabled!=='boolean'||!/^[-\w.]{2,128}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/.test(b.upiId||'')||typeof b.payeeName!=='string'||!b.payeeName.trim()||b.payeeName.length>100||typeof b.instructions!=='string'||b.instructions.length>500)return json({error:'Enter a valid UPI ID, recipient name and instructions under 500 characters.'},400);
  await env.BUCKET.put('site/payments',JSON.stringify({enabled:b.enabled,upiId:b.upiId.trim(),payeeName:b.payeeName.trim(),instructions:b.instructions.trim()}));return json({ok:true});
 }
 if(p==='/api/payments'){
  if(req.method==='GET'){if(!admin)return json({error:'Studio sign-in required'},401);return json((await listRecords(env.BUCKET,'payments/')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));}
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  const s=await paymentSettings(env);if(!s.enabled)return json({error:'Online payments are currently paused. Contact Frostfuel before paying.'},503);
  const b=await req.json();if(b.website)return json({error:'Unable to create this payment request.'},400);
  const a=String(b.amount??'');const paise=Math.round(Number(a)*100);
  if(!/^\d{1,7}(\.\d{1,2})?$/.test(a)||!Number.isSafeInteger(paise)||paise<100||paise>100000000||typeof b.name!=='string'||!b.name.trim()||b.name.length>120||!/^\S+@\S+\.\S+$/.test(b.email||'')||b.email.length>254||typeof b.project!=='string'||!b.project.trim()||b.project.length>200)return json({error:'Enter your name, email, project and agreed amount between ₹1 and ₹10,00,000 (maximum two decimal places).'},400);
  const records=await env.BUCKET.list({prefix:'payments/'});if(records.objects.length>=1000)return json({error:'Please contact Frostfuel to arrange your payment.'},429);
  // Apply a small per-address creation limit without storing raw IP addresses.
  const ip=req.headers.get('cf-connecting-ip')||req.headers.get('x-nf-client-connection-ip');
  if(ip){const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+'|'+new Date().toISOString().slice(0,13))))).map(x=>x.toString(16).padStart(2,'0')).join('');const key='payment-limits/'+hash;const old=await env.BUCKET.get(key);const n=old?Number(await old.text()):0;if(n>=10)return json({error:'Too many payment requests. Please try again in an hour.'},429);await env.BUCKET.put(key,String(n+1));}
  const id=crypto.randomUUID(),now=new Date().toISOString();const d={id,name:b.name.trim(),email:b.email,project:b.project.trim(),paise,status:'Awaiting payment',reference:'',upiId:s.upiId,payeeName:s.payeeName,createdAt:now,updatedAt:now};
  await env.BUCKET.put('payments/'+id,JSON.stringify(d));return json({id},201);
 }
 const parts=p.split('/'),id=parts[3],action=parts[4];if(!paymentIdOK(id)||parts.length>5)return json({error:'Payment request not found'},404);
 if(action==='review'&&!admin)return json({error:'Studio sign-in required'},401);
 const o=await env.BUCKET.get('payments/'+id);if(!o)return json({error:'Payment request not found'},404);const d=JSON.parse(await o.text());
 if(req.method==='GET'&&!action){const s=await paymentSettings(env);const payable=s.enabled&&['Awaiting payment','Rejected'].includes(d.status);return json({id:d.id,project:d.project,paise:d.paise,status:d.status,payeeName:d.payeeName,upiId:payable?d.upiId:'',payable,instructions:s.instructions});}
 if(req.method==='POST'&&action==='reference'){
  if(!['Awaiting payment','Rejected'].includes(d.status))return json({error:'This request has already been submitted or closed. Refresh to see its status.'},409);
  if(!(await paymentSettings(env)).enabled)return json({error:'Payments are paused. Contact Frostfuel to confirm your payment.'},503);
  const b=await req.json(),reference=String(b.reference||'').trim();if(!/^\d{12}$/.test(reference))return json({error:'Enter the 12-digit UPI transaction reference (UTR/RRN) from your payment app.'},400);
  const all=await listRecords(env.BUCKET,'payments/');if(all.some(x=>x.id!==id&&x.reference===reference))return json({error:'This reference has already been submitted. Contact Frostfuel if you need help.'},409);
  d.reference=reference;d.status='Under review';d.submittedAt=new Date().toISOString();d.updatedAt=d.submittedAt;await env.BUCKET.put('payments/'+id,JSON.stringify(d));return json({ok:true,status:d.status});
 }
 if(req.method==='POST'&&action==='review'){
  const b=await req.json();if(!['Paid','Rejected','Cancelled'].includes(b.status)||d.status==='Paid'||d.status==='Cancelled'||(b.status!=='Cancelled'&&d.status!=='Under review'))return json({error:'Only submitted references can be confirmed or rejected. Closed payments cannot be changed.'},409);
  if(b.status==='Paid'&&b.confirmed!==true)return json({error:'Confirm receipt in your bank or UPI app first.'},400);
  d.status=b.status;d.updatedAt=new Date().toISOString();d.reviewedAt=d.updatedAt;await env.BUCKET.put('payments/'+id,JSON.stringify(d));return json({ok:true});
 }
 return json({error:'Method not allowed'},405);
}
