
/* PATCH: payload-safe + ensure drugs is defined */

let drugs = []; // ensure global

function parsePayload() {
  const params = new URLSearchParams(window.location.search);
  const items = params.get('items');
  if (!items) return [];
  try {
    return items.split(';').map(s=>{
      const [name, qty] = s.split('|');
      return { name: decodeURIComponent(name||''), qty: Number(qty||1) };
    }).filter(x=>x.name);
  } catch(e){
    console.warn('payload parse failed', e);
    return [];
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  if (typeof window.ALL_DRUGS !== 'undefined' && Array.isArray(window.ALL_DRUGS)) {
    drugs = window.ALL_DRUGS.slice();
  } else {
    drugs = drugs || [];
  }

  const payloadItems = parsePayload();
  if (payloadItems.length) {
    payloadItems.forEach(p=>{
      const found = drugs.find(d=>d.name === p.name);
      if (found) {
        addSticker(found.name, p.qty || 1);
      }
    });
  }
});

/* dummy hooks expected by existing UI */
function addSticker(name, qty){
  if (typeof window._addSticker === 'function') {
    window._addSticker(name, qty);
  }
}
