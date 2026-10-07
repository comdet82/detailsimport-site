// Détails Import : scripts communs à toutes les pages
(() => {
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
const petit = () => innerWidth <= 700;
const nav = document.querySelector('.nav');

// ----- Menu : burger (mobile) et sous-menus -----
const burger = document.querySelector('.burger');
burger?.addEventListener('click', () => {
  const o = nav.classList.toggle('ouvert');
  burger.setAttribute('aria-expanded', o);
});
document.querySelectorAll('.nav .sous > button').forEach((b) => {
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    const li = b.parentElement, o = !li.classList.contains('ouvert');
    document.querySelectorAll('.nav .sous.ouvert').forEach((x) => { x.classList.remove('ouvert'); x.querySelector('button').setAttribute('aria-expanded', false); });
    li.classList.toggle('ouvert', o);
    b.setAttribute('aria-expanded', o);
  });
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav')) document.querySelectorAll('.nav .sous.ouvert').forEach((x) => { x.classList.remove('ouvert'); x.querySelector('button').setAttribute('aria-expanded', false); });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { document.querySelectorAll('.nav .sous.ouvert').forEach((x) => x.classList.remove('ouvert')); nav?.classList.remove('ouvert'); }
});
nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('ouvert'); burger?.setAttribute('aria-expanded', false); }));

// ----- Langue : menu déroulant et mémorisation du choix -----
const sel = document.querySelector('.lang-sel');
const selBtn = sel?.querySelector('button');
selBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const o = sel.classList.toggle('ouvert');
  selBtn.setAttribute('aria-expanded', o);
});
document.addEventListener('click', (e) => {
  if (sel && !e.target.closest('.lang-sel')) { sel.classList.remove('ouvert'); selBtn.setAttribute('aria-expanded', false); }
});
document.querySelectorAll('a.lang-opt[hreflang]').forEach((a) => a.addEventListener('click', () => {
  try { localStorage.setItem('di-lang', a.getAttribute('hreflang')); } catch (e) {}
}));

// ----- Bandeau Fi Europe : masqué après le salon, le menu se cale dessous -----
let fi = document.querySelector('.fi-bar');
if (fi && Date.now() > new Date(fi.dataset.fin + 'T00:00:00+01:00').getTime()) { fi.remove(); fi = null; }
function caleNav() {
  if (!nav) return;
  const base = 16;
  nav.style.top = fi ? Math.max(base, fi.offsetHeight + 10 - scrollY) + 'px' : '';
}

// ----- Accueil : cadre du hero, manifeste, chaîne horizontale -----
const hero = document.querySelector('.hero');
const chaine = document.querySelector('.chaine');
const piste = chaine?.querySelector('.piste');
const barre = chaine?.querySelector('.barre');
const man = document.querySelector('[data-mots]');
let mots = [];
if (man) {
  man.innerHTML = man.textContent.split(' ').map((w) => `<span class="m">${w}</span>`).join(' ');
  mots = [...man.querySelectorAll('.m')];
}
const pleine = document.querySelector('.pleine img');

// Chaîne : carrousel libre (flèches, glisser, balayage), sans bloquer le défilement de la page
if (piste) {
  const pas = () => { const e = piste.querySelector('.etape:not(.ph)'); return e ? e.getBoundingClientRect().width + 14 : 300; };
  const g = chaine.querySelector('.fl-g'), d = chaine.querySelector('.fl-d');
  const maj = () => {
    const max = piste.scrollWidth - piste.clientWidth;
    const q = max > 0 ? piste.scrollLeft / max : 0;
    barre?.style.setProperty('--p', q.toFixed(3));
    if (g) g.disabled = piste.scrollLeft < 4;
    if (d) d.disabled = piste.scrollLeft > max - 4;
  };
  g?.addEventListener('click', () => piste.scrollBy({ left: -pas() * 2, behavior: reduit ? 'auto' : 'smooth' }));
  d?.addEventListener('click', () => piste.scrollBy({ left: pas() * 2, behavior: reduit ? 'auto' : 'smooth' }));
  piste.addEventListener('scroll', maj, { passive: true });
  addEventListener('resize', maj);
  let x0 = 0, s0 = 0, glisse = false;
  piste.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    glisse = true; x0 = e.clientX; s0 = piste.scrollLeft; piste.classList.add('drag'); piste.setPointerCapture(e.pointerId);
  });
  piste.addEventListener('pointermove', (e) => { if (glisse) piste.scrollLeft = s0 - (e.clientX - x0); });
  const fin = () => { if (!glisse) return; glisse = false; piste.classList.remove('drag'); };
  piste.addEventListener('pointerup', fin); piste.addEventListener('pointercancel', fin);
  piste.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { piste.scrollBy({ left: pas(), behavior: 'smooth' }); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { piste.scrollBy({ left: -pas(), behavior: 'smooth' }); e.preventDefault(); }
  });
  maj();
}
function tick() {
  const y = scrollY, h = innerHeight;
  if (hero && !petit()) {
    const p = Math.min(1, Math.max(0, y / Math.max(1, hero.offsetHeight - h)));
    hero.style.setProperty('--i', reduit ? 1 : (1 - p).toFixed(3));
  }
  if (man) {
    const r = man.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (h * 0.85 - r.top) / (r.height + h * 0.35)));
    const n = reduit ? mots.length : Math.round(k * mots.length);
    mots.forEach((m, i) => m.classList.toggle('on', i < n));
  }
  if (pleine) {
    const rr = pleine.parentElement.getBoundingClientRect();
    pleine.style.setProperty('--y', ((rr.top + rr.height / 2 - h / 2) * -0.08).toFixed(1));
  }
  if (nav && hero) {
    const fin = petit() ? hero.offsetHeight - 80 : hero.offsetHeight - h * 0.9;
    nav.classList.toggle('dense', y > fin);
  }
  caleNav();
}
tick();
addEventListener('scroll', tick, { passive: true });
addEventListener('resize', tick);
addEventListener('load', tick);

// ----- Apparitions -----
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll('.rv').forEach((el) => io.observe(el));
const trace = document.getElementById('trace');
if (trace) new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { trace.style.strokeDashoffset = 0; o.disconnect(); } }), { threshold: 0.4 }).observe(trace);

// ----- Anti-spam : temps passé sur la page avant l'envoi -----
const t0 = Date.now();
document.querySelectorAll('form[action="/mail/devis.php"]').forEach((f) => f.addEventListener('submit', () => {
  const dt = f.querySelector('input[name="dt"]');
  if (dt) dt.value = Date.now() - t0;
}));

// ----- Retour du formulaire (?envoi=ok ou ?envoi=erreur) -----
const params = new URLSearchParams(location.search);
const box = document.querySelector('[data-retour]');
if (box && params.get('envoi')) {
  const ok = params.get('envoi') === 'ok';
  box.hidden = false;
  box.className = 'alerte ' + (ok ? 'ok' : 'ko');
  box.textContent = ok ? box.dataset.ok : box.dataset.ko;
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
document.querySelectorAll('[data-annee]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
