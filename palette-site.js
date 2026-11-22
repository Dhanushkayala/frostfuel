let paletteDraftPreview=false;
async function syncPalette(){if(paletteDraftPreview)return;try{const p=await api('palette');if(!paletteDraftPreview)applyPalette(p)}catch{}}
window.addEventListener('message',e=>{if(window===window.parent||e.source!==window.parent||e.origin!==location.origin||e.data?.type!=='frostfuel-palette-preview')return;const p=cleanPalette(e.data.palette);if(p){paletteDraftPreview=true;applyPalette(p)}});
syncPalette();setInterval(()=>{if(!document.hidden)syncPalette()},30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncPalette()});
