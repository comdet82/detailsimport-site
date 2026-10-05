
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
const piste = document.querySelector('.piste');

// Manifeste : découpe en mots
const man = document.querySelector('[data-mots]');
man.innerHTML = man.textContent.split(' ').map(w=>`<span class="m">${w}</span>`).join(' ');
const mots = [...man.querySelectorAll('.m')];

const hero = document.querySelector('.hero'), chaine = document.querySelector('.chaine'), pin = chaine.querySelector('.pin'), barre = chaine.querySelector('.barre');
const pleine = document.querySelector('.pleine img');
const petit = () => innerWidth <= 700;
function dimension(){ chaine.style.height = petit() ? 'auto' : (innerHeight + Math.max(0, piste.scrollWidth - innerWidth) + 'px'); }
function tick(){
  const y = scrollY, h = innerHeight;
  if (!petit()) {
    const p = Math.min(1, Math.max(0, y / (hero.offsetHeight - h)));
    hero.style.setProperty('--i', reduit ? 1 : (1 - p).toFixed(3));
    const top = chaine.offsetTop, dist = chaine.offsetHeight - h;
    const q = Math.min(1, Math.max(0, (y - top) / Math.max(1, dist)));
    piste.style.transform = `translateX(${-q * Math.max(0, piste.scrollWidth - innerWidth)}px)`;
    barre.style.setProperty('--p', q.toFixed(3));
  }
  const r = man.getBoundingClientRect();
  const k = Math.min(1, Math.max(0, (h * .85 - r.top) / (r.height + h * .35)));
  const n = reduit ? mots.length : Math.round(k * mots.length);
  mots.forEach((m,i)=>m.classList.toggle('on', i < n));
  if (pleine) { const rr = pleine.parentElement.getBoundingClientRect(); pleine.style.setProperty('--y', ((rr.top + rr.height/2 - h/2) * -.08).toFixed(1)); }
}
const nav=document.querySelector('.nav');
function menu(){ const fin = petit() ? hero.offsetHeight - 80 : hero.offsetHeight - innerHeight * .9; nav.classList.toggle('dense', scrollY > fin); }
addEventListener('scroll', menu, {passive:true});
dimension(); tick(); menu();
addEventListener('scroll', tick, {passive:true});
addEventListener('resize', ()=>{ dimension(); tick(); });

const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('vu'); io.unobserve(e.target); } }), {threshold:.15});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
const trace = document.getElementById('trace');
new IntersectionObserver((es,o)=>es.forEach(e=>{ if(e.isIntersecting){ trace.style.strokeDashoffset = 0; o.disconnect(); } }), {threshold:.4}).observe(trace);

// Menu mobile
const burger = document.querySelector('.burger');
burger?.addEventListener('click', () => { const o = nav.classList.toggle('ouvert'); burger.setAttribute('aria-expanded', o); });
nav.querySelectorAll('ul a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('ouvert'); burger?.setAttribute('aria-expanded', false); }));

// Message de retour du formulaire (?envoi=ok ou ?envoi=erreur)
const params = new URLSearchParams(location.search);
const box = document.querySelector('[data-retour]');
if (box && params.get('envoi')) {
  const ok = params.get('envoi') === 'ok';
  box.hidden = false;
  box.className = 'alerte ' + (ok ? 'ok' : 'ko');
  box.textContent = ok ? box.dataset.ok : box.dataset.ko;
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
document.querySelectorAll('[data-annee]').forEach(el => el.textContent = new Date().getFullYear());
