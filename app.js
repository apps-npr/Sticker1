const drugListEl = document.querySelector('#drugList');
const searchEl = document.querySelector('#search');
const lotEl = document.querySelector('#lot');
const expEl = document.querySelector('#exp');
const qtyEl = document.querySelector('#qty');
const sizeEl = document.querySelector('#size');
const addBtn = document.querySelector('#addSel');
const clearBtn = document.querySelector('#clearSel');
const printBtn = document.querySelector('#printBtn');
const printSelectedBtn = document.querySelector('#printSelectedBtn');
const closeBtn = document.querySelector('#closeBtn');
const printArea = document.querySelector('#printArea');

let DRUGS = [];

async function loadDrugs() {
  const res = await fetch('drugs.json');
  const data = await res.json();
  DRUGS = data;
  renderList(DRUGS);
}
function renderList(list) {
  drugListEl.innerHTML = '';
  list.forEach((name, idx) => {
    const row = document.createElement('div');
    row.className = 'drug-item';
    row.innerHTML = `
      <input type="checkbox" id="d${idx}" data-name="${name}">
      <label for="d${idx}" style="flex:1">${name}</label>
    `;
    drugListEl.appendChild(row);
  });
}

function toThaiDate(exp) {
  if (!exp) return '';
  const d = new Date(exp);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

searchEl.addEventListener('input', () => {
  const term = searchEl.value.toLowerCase().trim();
  const filtered = DRUGS.filter(n => n.toLowerCase().includes(term));
  renderList(filtered);
});

addBtn.addEventListener('click', () => {
  const selected = [...drugListEl.querySelectorAll('input[type="checkbox"]:checked')];
  if (selected.length === 0) {
    alert('กรุณาเลือกยาอย่างน้อย 1 รายการ');
    return;
  }
  const lot = lotEl.value.trim();
  const expDisplay = toThaiDate(expEl.value);
  const qty = Math.max(1, parseInt(qtyEl.value || '1', 10));
  const size = sizeEl.value; // small/large

  selected.forEach(chk => {
    const drugName = chk.getAttribute('data-name');
    for (let i=0; i<qty; i++) {
      addSticker({ drugName, lot, exp: expDisplay, size });
    }
    chk.checked = false;
  });
  printArea.scrollIntoView({behavior:'smooth'});
});

function addSticker({ drugName, lot, exp, size }) {
  const div = document.createElement('div');
  div.className = 'sticker ' + (size === 'large' ? 'size-large' : '');
  div.innerHTML = `
    <input class="selectbox" type="checkbox" aria-label="เลือกดวงนี้เพื่อพิมพ์">
    <div class="toolbar no-print">
      <button class="ghost" onclick="this.closest('.sticker').remove()">ลบ</button>
      <button class="accent" onclick="printOnlySticker(this.closest('.sticker'))">พิมพ์ดวงนี้</button>
    </div>
    <div class="drug">${escapeHtml(drugName)}</div>
    <div class="row">Lot: ${escapeHtml(lot || '')}</div>
    <div class="row">Exp: ${escapeHtml(exp || '')}</div>
  `;
  printArea.appendChild(div);
}

clearBtn.addEventListener('click', () => {
  printArea.innerHTML = '';
});

printBtn.addEventListener('click', () => {
  window.print();
});

printSelectedBtn.addEventListener('click', () => {
  const chosen = [...printArea.querySelectorAll('.sticker .selectbox:checked')]
    .map(cb => cb.closest('.sticker'));
  if (chosen.length === 0) {
    alert('ติ๊กเลือกสติกเกอร์ก่อน');
    return;
  }
  printStickersInNewWindow(chosen);
});

closeBtn.addEventListener('click', () => {
  window.close();
});

function escapeHtml(str) {
  return (str || '').toString()
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

function printOnlySticker(stickerEl){
  printStickersInNewWindow([stickerEl]);
}

function printStickersInNewWindow(stickers){
  const win = window.open('', '_blank');
  const cssHref = 'styles.css';
  win.document.write(`<!doctype html>
<html><head>
<meta charset="utf-8">
<title>Print Stickers</title>
<link rel="stylesheet" href="${cssHref}">
<style>
@page { margin: 0; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body class="print-root">
<div class="print-grid" id="area"></div>
<script>window.onload = () => { window.print(); }</script>
</body></html>`);
  const area = win.document.getElementById('area');
  stickers.forEach(s => {
    const clone = s.cloneNode(true);
    clone.querySelectorAll('.toolbar,.selectbox').forEach(el=>el.remove());
    area.appendChild(clone);
  });
  setTimeout(()=>{ try{ win.focus(); }catch(e){} }, 50);
}

loadDrugs();