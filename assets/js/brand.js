/* Brightbox - manuál značky. GSAP + ScrollTrigger (lokálně), nativní scroll.
   ?static = vše vykreslené bez animací (screenshoty, export). Reduced motion = statický obsah. */
(() => {
  const root = document.documentElement;
  const isStatic = new URLSearchParams(location.search).has('static');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const animate = !isStatic && !reduce && G && ST;
  if (animate) { root.classList.add('js'); G.registerPlugin(ST); }
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const EASE = 'expo.out';

  /* ---------- navigace: stav, průběh, aktuální kapitola ---------- */
  const nav = $('#nav');
  const page = document.body.dataset.page || document.querySelector('meta[name="bb-page"]')?.content;
  $$('.nav__pages a').forEach(a => { if (a.dataset.page === page) a.setAttribute('aria-current', 'page'); });
  const bar = $('.nav__progress i');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('is-scrolled', y > 24);
    nav.classList.toggle('is-hidden', y > innerHeight && y > lastY + 4 && !document.body.classList.contains('index-open'));
    if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
    if (bar) bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));

  const chapters = $$('[data-chapter]');
  const nowEl = $('.nav__now-in');
  let current = '';
  const setNow = name => {
    if (!nowEl || name === current) return;
    current = name;
    nowEl.classList.add('is-out');
    setTimeout(() => { nowEl.textContent = name; nowEl.classList.remove('is-out'); }, 220);
  };
  const chIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setNow(e.target.dataset.chapter); }),
    { rootMargin: '-45% 0px -54% 0px' });
  chapters.forEach(c => chIO.observe(c));
  if (chapters[0]) setNow(chapters[0].dataset.chapter);

  /* ---------- světla kapitol: pozadí stránky se plynule mění ---------- */
  const BG = { mist: '#F4F1FA', lilac: '#ECE6FA', blush: '#FCEAF3', lit: '#FFF3F9', dawn: '#F7EEFB' };
  const bgIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && BG[e.target.dataset.bg]) document.body.style.backgroundColor = BG[e.target.dataset.bg];
  }), { rootMargin: '-50% 0px -50% 0px' });
  $$('[data-bg]').forEach(s => bgIO.observe(s));

  /* ---------- obsah (index) ---------- */
  const idx = $('#index'), idxBtn = $('.nav__index');
  if (idx) {
    const list = $('.index__list', idx);
    const hereLinks = chapters.filter(c => c.id).map(c => `<li><a href="#${c.id}">${c.dataset.chapter}<span>${c.dataset.chapterNote || ''}</span></a></li>`);
    list.innerHTML = hereLinks.join('');
    const other = page === 'social'
      ? '<a href="index.html">Manuál značky <i class="ph ph-arrow-right"></i></a>'
      : '<a href="socialni-site.html">Sociální sítě <i class="ph ph-arrow-right"></i></a>';
    $('.index__other', idx).innerHTML = other;
    const open = on => {
      idxBtn.setAttribute('aria-expanded', on);
      document.body.classList.toggle('index-open', on);
      const bg = [...document.querySelectorAll('main, footer, .skip')];
      if (on) { idx.hidden = false; bg.forEach(e => { e.inert = true; }); requestAnimationFrame(() => idx.classList.add('is-open')); $('a', list)?.focus({ preventScroll: true }); document.body.style.overflow = 'hidden'; }
      else { idx.classList.remove('is-open'); bg.forEach(e => { e.inert = false; }); document.body.style.overflow = ''; setTimeout(() => { idx.hidden = true; }, 400); idxBtn.focus({ preventScroll: true }); }
    };
    idxBtn.addEventListener('click', () => open(idx.hidden));
    $('.index__close', idx).addEventListener('click', () => open(false));
    idx.addEventListener('click', e => { if (e.target.closest('a')) open(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !idx.hidden) open(false); });
  }

  /* ---------- kopírování hodnot ---------- */
  let toast;
  const say = msg => {
    if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.append(toast); }
    toast.textContent = msg; toast.classList.add('on');
    clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('on'), 1600);
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    navigator.clipboard?.writeText(b.dataset.copy).then(() => say(`Zkopírováno: ${b.dataset.copy}`), () => say(b.dataset.copy));
  });

  /* ---------- tón hlasu ---------- */
  const toneList = $('.tone__list');
  $$('.tone__seg button').forEach(b => b.addEventListener('click', () => {
    $$('.tone__seg button').forEach(x => x.setAttribute('aria-pressed', x === b));
    toneList.dataset.toneState = b.dataset.tone;
    $$('.t-ne', toneList).forEach(x => x.setAttribute('aria-hidden', b.dataset.tone !== 'ne'));
    $$('.t-ano', toneList).forEach(x => x.setAttribute('aria-hidden', b.dataset.tone === 'ne'));
  }));

  /* ---------- logo na pozadí ---------- */
  const stage = $('.play__stage');
  if (stage) {
    const NAME = { mlha: 'na Mlze', bila: 'na bílé', noc: 'na Noci', soumrak: 'na Soumraku', prechod: 'na přechodu', foto: 'na fotografii' };
    const KIND = { logo: 'logo', group: 'logo skupiny', mark: 'značka' };
    const file = (v, b) => `${{ logo: 'bb-logo', group: 'bb-group', mark: 'bb-mark' }[v]}-${b === 'mlha' || b === 'bila' ? 'color' : 'white'}`;
    const label = (v, b) => {
      const white = !(b === 'mlha' || b === 'bila');
      if (v === 'mark') return `${white ? 'Bílá' : 'Barevná'} značka ${NAME[b]}`;
      return `${white ? 'Bílé' : 'Barevné'} ${KIND[v]} ${NAME[b]}`;
    };
    const logo = $('.play__logo', stage), name = $('.play__name', stage), dl = $('.play__dl', stage);
    let v = 'logo', b = 'mlha';
    const sync = () => {
      const f = `assets/logos/kit/${file(v, b)}.svg`;
      stage.dataset.v = v; stage.dataset.b = b;
      logo.style.opacity = 0;
      setTimeout(() => { logo.src = f; logo.style.opacity = 1; }, 160);
      name.textContent = label(v, b); dl.href = f;
    };
    $$('.play__ui [data-v]').forEach(x => x.addEventListener('click', () => { v = x.dataset.v; $$('.play__ui [data-v]').forEach(y => y.setAttribute('aria-pressed', y === x)); sync(); }));
    $$('.play__ui [data-b]').forEach(x => x.addEventListener('click', () => { b = x.dataset.b; $$('.play__ui [data-b]').forEach(y => y.setAttribute('aria-pressed', y === x)); sync(); }));
  }

  /* ---------- ukázka písma ---------- */
  const sample = $('.spec__sample');
  $$('.spec__ctl input').forEach(i => i.addEventListener('input', () => {
    if (i.dataset.axis === 'wght') { sample.style.setProperty('--wght', i.value); $('.spec__wv').textContent = i.value; }
    else { sample.style.setProperty('--size', i.value); const o = $('.spec__sv'); if (o) o.textContent = i.value; }
  }));

  /* ---------- konstrukce značky: vrstvy z oficiálních cest ---------- */
  const cart = $('.cart');
  const markSrc = $('.hero__mark .mk') || $('.mk');
  if (cart && markSrc) {
    const NS = 'http://www.w3.org/2000/svg';
    const groups = ['right', 'top', 'left'].map(k => $$(`.mk-${k} path`, markSrc));
    const add = (g, d, extra = {}) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); Object.entries(extra).forEach(([k, v]) => p.setAttribute(k, v)); g.append(p); return p; };
    const faces = $('.cart__faces', cart), sph = $('.cart__sphere', cart), light = $('.cart__light', cart);
    const ol = document.createElementNS(NS, 'g'); ol.setAttribute('class', 'cart__ol'); cart.append(ol);
    groups.forEach(([s, f, l]) => {
      add(faces, f.getAttribute('d')); add(sph, s.getAttribute('d')); add(light, l.getAttribute('d'));
      add(ol, f.getAttribute('d'), { pathLength: 1, 'data-k': 'face' }); add(ol, s.getAttribute('d'), { pathLength: 1, 'data-k': 'sph' });
    });
    $$('.cart__guides path, .cart__guides ellipse', cart).forEach(p => p.setAttribute('pathLength', 1));
  }

  /* ---------- bez animací: konec ---------- */
  if (!animate) { $$('.cstep').forEach((s, i) => s.classList.toggle('is-on', i === 0)); return; }

  /* ---------- dělení textu ---------- */
  const splitLines = el => {
    if (!el.dataset.src) el.dataset.src = el.innerHTML;
    el.innerHTML = el.dataset.src;
    // slova dělit jen na běžných mezerách (nbsp drží vazby pohromadě)
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/([ \t\n]+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(t => {
            if (!t) return;
            if (/^[ \t\n]+$/.test(t)) frag.append(document.createTextNode(' '));
            else { const w = document.createElement('span'); w.className = 'w'; w.textContent = t; frag.append(w); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    };
    walk(el);
    const words = $$('.w', el);
    const lines = [];
    let top = null;
    words.forEach(w => { const t = Math.round(w.offsetTop); if (t !== top) { lines.push([]); top = t; } lines[lines.length - 1].push(w); });
    el.innerHTML = lines.map(l => `<span class="ln"><span>${l.map(w => w.outerHTML).join(' ')}</span></span>`).join('');
    return $$('.ln>span', el);
  };

  const lineEls = $$('[data-lines]');
  const runLines = () => lineEls.forEach(el => {
    const inner = splitLines(el);
    G.set(inner, { yPercent: 108 });
    ST.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => G.to(inner, { yPercent: 0, duration: 1.15, ease: EASE, stagger: .09 }) });
  });

  $$('[data-reveal]').forEach(el => ST.create({ trigger: el, start: 'top 90%', once: true,
    onEnter: () => G.to(el, { opacity: 1, y: 0, duration: 1.1, ease: EASE }) }));

  /* manifest: slova se rozsvěcují podle čtení */
  $$('[data-words]').forEach(el => {
    const parts = el.textContent.trim().split(/[ \t\n]+/);
    el.innerHTML = parts.map(w => `<span class="w">${w}</span>`).join(' ');
    const ws = $$('.w', el);
    ST.create({ trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: true,
      onUpdate: s => { const n = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < n)); } });
  });

  /* počítadla */
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, suf = el.textContent.replace(/[\d\s]/g, '');
    const o = { v: 0 };
    ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => G.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v) + suf; } }) });
  });

  /* osobnost: rozsvítí se čtený řádek */
  $$('.row').forEach(r => ST.create({ trigger: r, start: 'top 62%', end: 'bottom 38%', toggleClass: 'on' }));

  /* ---------- úvod: značka se složí ---------- */
  const assemble = (svg, opts = {}) => {
    const t = $('.mk-top', svg), r = $('.mk-right', svg), l = $('.mk-left', svg);
    const d = opts.d ?? 9;
    const tl = G.timeline({ paused: !!opts.paused });
    tl.fromTo(t, { x: 0, y: -d, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: EASE }, 0)
      .fromTo(r, { x: d * .87, y: d * .5, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.3, ease: EASE }, .12)
      .fromTo(l, { x: -d * .87, y: d * .5, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.3, ease: EASE }, .24);
    return tl;
  };
  const heroMark = $('.hero__mark .mk');
  const hero = $('.hero');
  const go = () => {
    runLines();
    if (heroMark) {
      assemble(heroMark);
      G.from('.hero__light i', { opacity: 0, scale: .7, duration: 2.2, ease: 'power2.out', stagger: .15 });
      G.from('.hero__foot, .hero__label', { opacity: 0, y: 20, duration: 1.1, ease: EASE, delay: .5 });
      G.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .4 } })
        .to('.hero__mark', { yPercent: -18, scale: 1.12, ease: 'none' }, 0)
        .to('.hero__in', { y: -80, opacity: .1, ease: 'none' }, 0)
        .to('.hero__light', { scale: 1.25, opacity: .65, ease: 'none' }, 0);
    }

    /* esence: světlo se rozsvítí */
    if ($('.essence')) G.fromTo('.essence__light', { scale: .45, opacity: .3 }, { scale: 1, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.essence', start: 'top bottom', end: 'center center', scrub: .5 } });

    /* konstrukce: připnutá scéna, čtyři kroky */
    const cs = $('.construct');
    if (cs && matchMedia('(min-width: 901px)').matches) {
      const steps = $$('.cstep', cs);
      const olF = $$('.cart__ol [data-k=face]', cs), olS = $$('.cart__ol [data-k=sph]', cs);
      G.set([...olF, ...olS], { strokeDasharray: 1, strokeDashoffset: 1 });
      G.set($$('.cart__guides > *', cs), { opacity: 0 });
      G.set(['.cart__faces', '.cart__sphere', '.cart__light'], { opacity: 0 });
      const tl = G.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
        trigger: cs, start: 'top top', end: '+=260%', pin: '.construct__pin', scrub: .5,
        onUpdate: s => { const k = Math.min(3, Math.floor(s.progress * 4.0001)); steps.forEach((st, i) => st.classList.toggle('is-on', i === k)); } } });
      tl.to('.cart__hex', { opacity: 1, duration: .3 }, 0)
        .to('.cart__axis', { opacity: 1, duration: .3 }, .1)
        .to(olF, { strokeDashoffset: 0, duration: .9, stagger: .1 }, .15)
        .to('.cart__circle', { opacity: 1, duration: .3 }, 1.05)
        .to(olS, { strokeDashoffset: 0, duration: .8, stagger: .08 }, 1.15)
        .to('.cart__sphere', { opacity: 1, duration: .5 }, 2.0)
        .to('.cart__light', { opacity: 1, duration: .5 }, 2.2)
        .to(['.cart__hex', '.cart__axis', '.cart__circle'], { opacity: .25, duration: .4 }, 2.3)
        .to('.cart__faces', { opacity: 1, duration: .6 }, 3.0)
        .to('.cart__ol', { opacity: 0, duration: .5 }, 3.2)
        .to(['.cart__hex', '.cart__axis', '.cart__circle'], { opacity: 0, duration: .4 }, 3.3)
        .to({}, { duration: .4 }, 3.6);
    }

    /* aplikace: vodorovná jízda */
    const pan = $('[data-hpan]');
    if (pan && matchMedia('(min-width: 901px)').matches) {
      const track = $('.hpan__track', pan);
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      G.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.apps', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .4, invalidateOnRefresh: true } });
    }

    /* pohybové ukázky */
    const moMark = $('.mo--mark .mk');
    let moTl;
    if (moMark) {
      moTl = assemble(moMark, { paused: true, d: 8 });
      ST.create({ trigger: moMark, start: 'top 85%', once: true, onEnter: () => moTl.play(0) });
    }
    const moText = $$('.mo__lines>span>span');
    const playText = () => G.fromTo(moText, { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: EASE, stagger: .12 });
    if (moText.length) { G.set(moText, { yPercent: 110 }); ST.create({ trigger: '.mo--text', start: 'top 85%', once: true, onEnter: playText }); }
    $$('.mo__play').forEach(b => b.addEventListener('click', () => (b.dataset.play === 'mark' ? moTl?.play(0) : playText())));

    ST.refresh();
    // kotva z adresy (např. #ke-stazeni) až po vložení pin spacerů, jinak skočí vedle
    const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  };
  (document.fonts?.ready || Promise.resolve()).then(go);

  /* po změně šířky znovu rozdělit řádky */
  let rw = innerWidth;
  addEventListener('resize', () => {
    if (Math.abs(innerWidth - rw) < 40) return;
    rw = innerWidth;
    clearTimeout(window.__bbRs);
    window.__bbRs = setTimeout(() => { lineEls.forEach(el => { const i = splitLines(el); G.set(i, { yPercent: 0 }); }); ST.refresh(); }, 250);
  });
})();
