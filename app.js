
// PATCH: payload robust matching (fix payload not added)

let ALL_DRUGS = [];
let stickers = [];

function norm(s){
  return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
}

function parseItemsParam(){
  const p = new URLSearchParams(location.search);
  const raw = p.get('items');
  if(!raw) return [];
  return raw.split(';').map(x=>{
    const [name, qty] = x.split('|');
    return {
      name: decodeURIComponent(name||''),
      qty: Number(qty||1)
    };
  }).filter(x=>x.name);
}

async function loadData(){
  const r = await fetch('data.json');
  const j = await r.json();
  ALL_DRUGS = j.components || [];
}

function addStickerFromPayload(name, qty){
  const d = ALL_DRUGS.find(x => norm(x.name) === norm(name));
  if(!d) return;
  if(typeof window._addSticker === 'function'){
    window._addSticker(d.name, qty || 1);
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadData();
  const items = parseItemsParam();
  items.forEach(it=> addStickerFromPayload(it.name, it.qty));
});
