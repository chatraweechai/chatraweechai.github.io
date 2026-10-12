'use strict';
const $ = s => document.querySelector(s);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const el = (t, props = {}, ...kids) => {
  const e = Object.assign(document.createElement(t), props);
  kids.forEach(k => e.append(k));
  return e;
};
const safeUrl = u => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : null; } catch { return null; } };

let series = [];
let current = store.get('current', null);

async function load() {
  let base = [];
  try { base = (await (await fetch('library.json')).json()).series || []; } catch {}
  series = base.concat(store.get('mine', []));
  renderLibrary();
  if (!current || !series.find(s => s.id === current)) current = series[0]?.id;
  renderPlayer();
}

function renderPlayer() {
  const box = $('#player'); box.replaceChildren();
  const s = series.find(x => x.id === current);
  if (!s) { box.append(el('p', { className: 'pad note', textContent: 'ยังไม่มีซีรีส์ ไปที่แท็บ “คลัง” เพื่อเพิ่ม' })); return; }
  const prog = store.get('prog', {});
  const io = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target.querySelector('video');
    if (e.isIntersecting) { v.play().catch(() => {}); prog[s.id] = Number(e.target.dataset.i); store.set('prog', prog); }
    else v.pause();
  }), { threshold: 0.7 });
  s.episodes.forEach((ep, i) => {
    const src = safeUrl(ep.src); if (!src) return;
    const v = el('video', { src, controls: true, playsInline: true, preload: i < 2 ? 'auto' : 'none' });
    v.addEventListener('ended', () => v.closest('.ep').nextElementSibling?.scrollIntoView({ behavior: 'smooth' }));
    const d = el('div', { className: 'ep' }, v, el('div', { className: 't', textContent: `${s.title} · ${ep.title || 'ตอน ' + (i + 1)}` }));
    d.dataset.i = i; box.append(d); io.observe(d);
  });
  const start = box.children[prog[s.id] || 0]; if (start) start.scrollIntoView();
}

function renderLibrary() {
  const box = $('#library'); box.replaceChildren(el('h2', { textContent: 'คลังซีรีส์' }));
  series.forEach(s => box.append(el('div', { className: 'card' },
    el('div', { textContent: s.title }, el('small', { textContent: `${s.episodes.length} ตอน` })),
    el('button', { className: 'btn', textContent: 'ดู', onclick: () => { current = s.id; store.set('current', current); renderPlayer(); show('player'); } }))));
  box.append(el('h2', { textContent: 'เพิ่มซีรีส์ของคุณ' }),
    el('p', { className: 'note', textContent: 'ใส่ลิงก์วิดีโอ (.mp4/.m3u8) ของคอนเทนต์ที่คุณมีสิทธิ์ใช้งาน หนึ่งลิงก์ต่อหนึ่งบรรทัด' }));
  const t = el('input', { placeholder: 'ชื่อเรื่อง' });
  const u = el('textarea', { rows: 4, placeholder: 'https://.../ep1.mp4\nhttps://.../ep2.mp4', style: 'width:100%;padding:10px;border-radius:8px;border:1px solid #333;background:#0f0f15;color:#fff;margin-bottom:8px' });
  box.append(t, u, el('button', { className: 'btn', textContent: 'บันทึก', onclick: () => {
    const eps = u.value.split('\n').map(safeUrl).filter(Boolean).map((src, i) => ({ title: 'ตอน ' + (i + 1), src }));
    if (!t.value.trim() || !eps.length) return alert('ใส่ชื่อและลิงก์ http(s) อย่างน้อย 1 ลิงก์');
    const mine = store.get('mine', []); mine.push({ id: 'u' + Date.now(), title: t.value.trim().slice(0, 80), episodes: eps });
    store.set('mine', mine); load(); show('library');
  } }));
}

function show(v) {
  document.querySelectorAll('.view').forEach(x => x.classList.toggle('on', x.id === v));
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  if (v !== 'player') document.querySelectorAll('video').forEach(x => x.pause());
}
document.querySelectorAll('nav button').forEach(b => b.onclick = () => show(b.dataset.v));
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
load();
