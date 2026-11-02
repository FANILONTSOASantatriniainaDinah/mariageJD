/* =========================================================
   Site de mariage — interactions
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header au scroll + bouton retour en haut ---------- */
  const header = document.getElementById('header');
  const toTop = document.getElementById('to-top');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    toTop.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  }));

  /* ---------- Lien actif selon la section visible ---------- */
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Compte à rebours ---------- */
  const cd = document.getElementById('countdown');
  const target = new Date(cd.dataset.date).getTime();
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    document.getElementById('cd-days').textContent = pad(Math.floor(diff / 864e5), 2);
    document.getElementById('cd-hours').textContent = pad(Math.floor(diff / 36e5) % 24);
    document.getElementById('cd-min').textContent = pad(Math.floor(diff / 6e4) % 60);
    document.getElementById('cd-sec').textContent = pad(Math.floor(diff / 1e3) % 60);
  };
  tick();
  setInterval(tick, 1000);

  /* ---------- Apparition au scroll ---------- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ---------- Témoignages : lire la suite ---------- */
  document.querySelectorAll('.read-more').forEach(btn => {
    const more = btn.previousElementSibling;
    btn.addEventListener('click', () => {
      more.hidden = !more.hidden;
      btn.textContent = more.hidden ? 'Lire la suite' : 'Réduire';
      btn.setAttribute('aria-expanded', String(!more.hidden));
    });
  });

  /* ---------- Galerie / lightbox ---------- */
  const items = [...document.querySelectorAll('.gallery__item')];
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  let idx = 0;
  const show = i => { idx = (i + items.length) % items.length; lbImg.src = items[idx].href; };
  const open = i => { show(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); };
  const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); };
  items.forEach((it, i) => it.addEventListener('click', e => { e.preventDefault(); open(i); }));
  lb.querySelector('.lightbox__close').addEventListener('click', close);
  lb.querySelector('.lightbox__prev').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lightbox__next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* ---------- Copier (Wero / Revolut) ---------- */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = document.querySelector(btn.dataset.copy).textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = Object.assign(document.createElement('textarea'), { value: text });
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      btn.textContent = 'Copié ✓';
      btn.classList.add('done');
      setTimeout(() => { btn.textContent = 'Copier'; btn.classList.remove('done'); }, 2000);
    });
  });

  /* ---------- Formulaire RSVP ----------
     Pour l'instant : validation + message de confirmation côté navigateur.
     Pour recevoir les réponses, on branchera un service (Formspree, Google Sheets, back-end Laravel…). */
  const form = document.getElementById('rsvp-form');
  const msg = document.getElementById('form-msg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const valid = f.value.trim() !== '' && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.classList.toggle('invalid', !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      msg.textContent = 'Merci de renseigner votre nom et un e-mail valide.';
      msg.className = 'form-msg err';
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    console.log('RSVP :', data);
    msg.textContent = data.presence === 'oui'
      ? `Merci ${data.nom.split(' ')[0]} ! Nous avons hâte de vous voir 💕`
      : `Merci ${data.nom.split(' ')[0]}, vous nous manquerez !`;
    msg.className = 'form-msg ok';
    form.reset();
  });
});
