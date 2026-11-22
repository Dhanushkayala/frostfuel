// Network-only private data. Never cache bookings, clients, sessions or dashboard HTML.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>new Response('<!doctype html><meta name="viewport" content="width=device-width"><title>Frostfuel offline</title><style>body{background:#071015;color:#eaf7ff;font:18px system-ui;padding:10vw}a{color:#70d9f1}</style><h1>You’re offline.</h1><p>Connect to the internet to access Frostfuel Studio and sync your changes.</p><a href="/admin">Try again</a>',{headers:{'Content-Type':'text/html;charset=utf-8'}})));}});
