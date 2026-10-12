/* Sociální sítě: náhledy šablon ze sdílené knihovny (#tpl-lib), filtr, bezpečné zóny, ořezy. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const lib = $('#tpl-lib')?.content;
  if (!lib) return;

  /* náhled = nativní plátno zmenšené na šířku slotu (contain) nebo vyplňující slot (cover) */
  const fit = slot => {
    const tp = slot.firstElementChild; if (!tp) return;
    const w = +tp.dataset.w, h = +tp.dataset.h;
    const W = slot.clientWidth, H = slot.clientHeight;
    if (!W || !H) return;
    const cover = slot.dataset.fit === 'cover';
    const k = cover ? Math.max(W / w, H / h) : Math.min(W / w, H / h);
    const x = (W - w * k) / 2, y = (H - h * k) / 2;
    tp.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
  };
  const ro = new ResizeObserver(es => es.forEach(e => fit(e.target)));
  $$('[data-slot]').forEach(slot => {
    const src = lib.querySelector(`[data-tpl="${slot.dataset.slot}"]`);
    if (!src) return;
    const tp = src.cloneNode(true);
    slot.classList.add('tpv');
    if (slot.dataset.fit !== 'cover') slot.style.setProperty('--ar', `${tp.dataset.w}/${tp.dataset.h}`);
    slot.setAttribute('role', 'img');
    slot.setAttribute('aria-label', `Šablona: ${tp.dataset.name}`);
    slot.append(tp);
    ro.observe(slot);
  });
  (document.fonts?.ready || Promise.resolve()).then(() => $$('.tpv').forEach(fit));

  /* filtr šablon */
  $$('.tpls__ui [data-f]').forEach(b => b.addEventListener('click', () => {
    $$('.tpls__ui [data-f]').forEach(x => x.setAttribute('aria-pressed', x === b));
    const f = b.dataset.f;
    $$('.tg .tc').forEach(c => c.classList.toggle('is-off', f !== 'all' && c.dataset.k !== f));
    requestAnimationFrame(() => { $$('.tg .tpv').forEach(fit); window.ScrollTrigger?.refresh(); });
  }));

  /* bezpečné zóny */
  $('[data-safe-toggle]')?.addEventListener('change', e => $('.tg').classList.toggle('show-safe', e.target.checked));

  /* Instagram: celý příspěvek vs. výřez v mřížce */
  const crop = $('.crop__stage');
  $$('[data-crop]').forEach(b => b.addEventListener('click', () => {
    $$('[data-crop]').forEach(x => x.setAttribute('aria-pressed', x === b));
    crop.dataset.mode = b.dataset.crop;
  }));

  /* Facebook: počítač vs. mobil */
  const fb = $('.fbc__stage');
  $$('[data-fb]').forEach(b => b.addEventListener('click', () => {
    $$('[data-fb]').forEach(x => x.setAttribute('aria-pressed', x === b));
    fb.dataset.mode = b.dataset.fb;
  }));
})();
