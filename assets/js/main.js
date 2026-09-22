// Arrivée sur une page : toujours en haut (sauf ancre #)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const toTop = () => { if (!location.hash) window.scrollTo(0, 0); };
toTop();
addEventListener('load', () => setTimeout(toTop, 0));
addEventListener('pageshow', toTop);

// Menu mobile
const burger = document.querySelector('.burger');
const menu = document.querySelector('.nav ul');
if (burger) burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});

// Apparition des blocs au scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

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

// Étapes de la chaîne en cascade
document.querySelectorAll('.etapes').forEach((el) => io.observe(el));

// Compteurs animés (44 t, 12 / 12, 3 ans)
const cio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, txt = el.textContent, nums = txt.match(/\d+/g);
    if (!nums || /^E/.test(txt)) return;
    const t0 = performance.now(), d = 1400;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / d), ease = 1 - Math.pow(1 - k, 3);
      let i = 0;
      el.textContent = txt.replace(/\d+/g, (n) => Math.round(nums[i++] * ease));
      if (k < 1) requestAnimationFrame(step); else el.textContent = txt;
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.chiffres strong').forEach((el) => cio.observe(el));

// Arbres du héros qui suivent légèrement la souris
const art = document.querySelector('.hero-art');
const hero = document.querySelector('.hero');
if (art && hero && matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('mousemove', (e) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    art.style.transform = `translate(${x * -18}px, ${y * -8}px)`;
  });
  hero.addEventListener('mouseleave', () => (art.style.transform = ''));
}

// Année du pied de page
document.querySelectorAll('[data-annee]').forEach((el) => (el.textContent = new Date().getFullYear()));
