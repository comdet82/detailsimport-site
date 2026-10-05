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

// ----- Langue : mémorise le choix FR / EN fait par le visiteur -----
document.querySelectorAll('a.lang[hreflang]').forEach((a) => a.addEventListener('click', () => {
  try { localStorage.setItem('di-lang', a.getAttribute('hreflang')); } catch (e) {}
}));

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

function dimension() {
  if (chaine && piste) chaine.style.height = petit() ? 'auto' : (innerHeight + Math.max(0, piste.scrollWidth - innerWidth) + 'px');
}
function tick() {
  const y = scrollY, h = innerHeight;
  if (hero && !petit()) {
    const p = Math.min(1, Math.max(0, y / Math.max(1, hero.offsetHeight - h)));
    hero.style.setProperty('--i', reduit ? 1 : (1 - p).toFixed(3));
  }
  if (chaine && piste && !petit()) {
    const top = chaine.offsetTop, dist = chaine.offsetHeight - h;
    const q = Math.min(1, Math.max(0, (y - top) / Math.max(1, dist)));
    piste.style.transform = `translateX(${-q * Math.max(0, piste.scrollWidth - innerWidth)}px)`;
    barre?.style.setProperty('--p', q.toFixed(3));
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
}
dimension(); tick();
addEventListener('scroll', tick, { passive: true });
addEventListener('resize', () => { dimension(); tick(); });
addEventListener('load', () => { dimension(); tick(); });

// ----- Apparitions -----
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll('.rv').forEach((el) => io.observe(el));
const trace = document.getElementById('trace');
if (trace) new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { trace.style.strokeDashoffset = 0; o.disconnect(); } }), { threshold: 0.4 }).observe(trace);

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
