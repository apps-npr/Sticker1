
let ALL_DRUGS = [];
let stickers = [];

function qs(id){ return document.getElementById(id); }

function parseItemsParam(){
  const p = new URLSearchParams(location.search);
  const raw = p.get('items');
  if(!raw) return [];
  return raw.split(';').map(x=>{
    const [name, qty] = x.split('|');
    return {
      name: decodeURIComponent(name||'').trim(),
      qty: Number(qty||1)
    };
  }).filter(x=>x.name);
}

function loadData(){
  return fetch('data.json')
    .then(r=>r.json())
    .then(j=>{
      ALL_DRUGS = j.components || [];
      renderDrugList();
    });
}

function renderDrugList(){
  const box = qs('drugList');
  if(!box) return;
  box.innerHTML = '';
  ALL_DRUGS.forEach(d=>{
    const div = document.createElement('div');
    div.className = 'drug-item';
    div.textContent = d.name + ' ('+d.unit+')';
    div.onclick = ()=> addSticker(d.name,1);
    box.appendChild(div);
  });
}

function addSticker(name, qty){
  const d = ALL_DRUGS.find(x=>x.name===name);
  if(!d) return;
  const s = {
    name: d.name,
    unit: d.unit,
    location: d.location||'-',
    lot: '',
    exp: '',
    qty: qty||1
  };
  stickers.push(s);
  renderStickers();
}

function renderStickers(){
  const area = qs('stickerArea');
  if(!area) return;
  area.innerHTML = '';
  stickers.forEach(s=>{
    const div = document.createElement('div');
    div.className = 'sticker';
    div.innerHTML = `
      <div class="loc">${s.location}</div>
      <div class="name">${s.name}</div>
      <div class="meta">Lot: ${s.lot||''}</div>
      <div class="meta">Exp: ${s.exp||''}</div>
      <div class="meta">จำนวน ${s.qty} ${s.unit}</div>
    `;
    area.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadData();
  const items = parseItemsParam();
  items.forEach(it=> addSticker(it.name, it.qty));
});
