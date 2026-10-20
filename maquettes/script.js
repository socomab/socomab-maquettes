/* SOCOMAB · page d'accueil (maquette) — JavaScript natif, sans dépendance. */
(() => {
  'use strict';
  const d = document;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('js');

  /* ---------- En-tête collant ---------- */
  const hd = $('.hd');
  const mbar = $('.mbar');
  const hero = $('.hero');
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('is-stuck', y > 40);
    if (mbar && hero) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Méga-menus (survol + clic + clavier) ---------- */
  const items = $$('.has-mega, .has-drop');
  const closeAll = (except) => items.forEach((it) => {
    if (it === except) return;
    it.classList.remove('is-open');
    $('.nav__btn', it).setAttribute('aria-expanded', 'false');
  });
  const canHover = matchMedia('(hover: hover)').matches;
  items.forEach((it) => {
    const btn = $('.nav__btn', it);
    let t;
    const open = () => { clearTimeout(t); closeAll(it); it.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };
    const close = () => { it.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => (it.classList.contains('is-open') ? close() : open()));
    if (canHover) {
      it.addEventListener('mouseenter', open);
      it.addEventListener('mouseleave', () => { t = setTimeout(close, 140); });
    }
    it.addEventListener('focusout', (e) => { if (!it.contains(e.relatedTarget)) close(); });
    $$('.mega a, .drop a', it).forEach((a) => a.addEventListener('click', close));
  });
  d.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = items.find((i) => i.classList.contains('is-open'));
    if (open) { closeAll(); $('.nav__btn', open).focus(); }
    if (!drawer.hidden) closeDrawer();
  });
  d.addEventListener('click', (e) => { if (!e.target.closest('.has-mega, .has-drop')) closeAll(); });

  /* ---------- Tiroir mobile ---------- */
  const drawer = $('#drawer');
  const burger = $('.burger');
  const openDrawer = () => {
    drawer.hidden = false; burger.setAttribute('aria-expanded', 'true');
    d.body.style.overflow = 'hidden'; $('.drawer__close', drawer).focus();
  };
  const closeDrawer = () => {
    drawer.hidden = true; burger.setAttribute('aria-expanded', 'false');
    d.body.style.overflow = ''; burger.focus();
  };
  burger.addEventListener('click', openDrawer);
  $('.drawer__close', drawer).addEventListener('click', closeDrawer);
  drawer.addEventListener('click', (e) => { if (e.target === drawer || e.target.closest('a')) closeDrawer(); });
  drawer.addEventListener('keydown', (e) => { // piège du focus
    if (e.key !== 'Tab') return;
    const f = $$('a,button,summary', drawer).filter((el) => el.offsetParent);
    if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && d.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  });

  /* ---------- Univers (onglets ARIA) ---------- */
  const univ = $('[data-univ]');
  if (univ) {
    const tabs = $$('[role="tab"]', univ);
    const ink = $('.univ__ink', univ);
    const moveInk = (tab) => { ink.style.width = tab.offsetWidth + 'px'; ink.style.transform = `translateX(${tab.offsetLeft - 6}px)`; };
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
      });
      moveInk(tab); if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          select(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length], true);
        }
      });
    });
    moveInk(tabs[0]);
    addEventListener('resize', () => moveInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
    d.fonts?.ready.then(() => moveInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
  }

  /* ---------- Métiers (changement d'image + texte) ---------- */
  $$('[data-metiers]').forEach((box) => {
    const btns = $$('.metier', box);
    const show = (m) => {
      btns.forEach((b) => { const on = b.dataset.m === m; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
      $$('.stage__item', box).forEach((s) => s.classList.toggle('is-on', s.dataset.m === m));
    };
    btns.forEach((b) => {
      b.addEventListener('click', () => show(b.dataset.m));
      if (canHover) b.addEventListener('mouseenter', () => show(b.dataset.m));
    });
  });


  /* ---------- Héros : photos et avis qui tournent ensemble ---------- */
  const heroBox = $('[data-hero]');
  if (heroBox) {
    const slides = $$('.hero__slide', heroBox);
    const quotes = $$('.hq', heroBox);
    const dots = $$('.hero__dots button', heroBox);
    let cur = 0; let tm;
    const go = (i) => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('is-on', j === cur));
      quotes.forEach((q, j) => q.classList.toggle('is-on', j === cur % quotes.length));
      dots.forEach((b, j) => b.setAttribute('aria-selected', j === cur));
      const nxt = slides[(cur + 1) % slides.length];
      if (nxt.loading === 'lazy') nxt.loading = 'eager';
    };
    const play = () => { if (!reduce) { clearInterval(tm); tm = setInterval(() => go(cur + 1), 3500); } };
    dots.forEach((b, j) => b.addEventListener('click', () => { go(j); play(); }));
    // héros pleine largeur (V2) : les photos tournent même sous la souris, comme sur le site actuel
    if (!heroBox.hasAttribute('data-hero-full')) {
      heroBox.addEventListener('mouseenter', () => clearInterval(tm));
      heroBox.addEventListener('mouseleave', play);
    }
    play();
  }

  /* ---------- Onglets génériques (familles de produits) ---------- */
  $$('[data-seg]').forEach((seg) => {
    const tabs = $$('[role="tab"]', seg);
    const pick = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        $('#' + x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', (e) => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); pick(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
  });

  /* ---------- Commerces : univers à gauche, métiers à droite ---------- */
  const cbar = $('[data-commerces]');
  if (cbar) {
    const box = cbar.closest('.wrap');
    const items = $$('.stage__item', box);
    const showM = (m) => {
      $$('.metier', cbar).forEach((b) => { const on = b.dataset.m === m; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
      items.forEach((it) => it.classList.toggle('is-on', it.dataset.m === m));
    };
    $$('.univ', cbar).forEach((u) => u.addEventListener('click', () => {
      $$('.univ', cbar).forEach((x) => x.setAttribute('aria-pressed', x === u));
      $$('.metiers', cbar).forEach((g) => { g.hidden = g.dataset.u !== u.dataset.u; });
      showM($('.metiers[data-u="' + u.dataset.u + '"] .metier', cbar).dataset.m);
    }));
    $$('.metier', cbar).forEach((b) => b.addEventListener('click', () => { showM(b.dataset.m); stopAuto(); }));
    /* v14-v15 : défilement automatique (2,5 s) ; s'arrête dès qu'on choisit un métier */
    let timer = null;
    const delai = parseInt(cbar.dataset.auto || '0', 10);
    const reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const suivant = () => {
      const btns = $$('.metier', cbar);
      const i = btns.findIndex((b) => b.classList.contains('is-on'));
      showM(btns[(i + 1) % btns.length].dataset.m);
      restart();
    };
    const restart = () => {
      clearTimeout(timer);
      cbar.classList.remove('is-playing'); void cbar.offsetWidth; cbar.classList.add('is-playing');
      timer = setTimeout(suivant, delai);
    };
    const pause = () => { clearTimeout(timer); cbar.classList.remove('is-playing'); };
    function stopAuto() { pause(); cbar.dataset.auto = '0'; }
    if (delai > 0 && !reduit) {
      cbar.style.setProperty('--auto', delai + 'ms');
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((es) => es.forEach((e) => {
          if (cbar.dataset.auto === '0') return;
          if (e.isIntersecting) restart(); else pause();
        }), { threshold: 0.35 }).observe(box);
      } else restart();
    }
  }


  /* ---------- Recherche : suggestions produits et catégories, avec miniature ----------
     Reproduit le fonctionnement de la recherche du site (propositions avec image),
     limité aux produits et aux pages catégories. Index : assets/search-index.js. */
  const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const euro = (p) => p.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  $$('form.search').forEach((form) => {
    const input = $('input[type="search"]', form);
    const list = $('.sugg', form);
    if (!input || !list) return;
    let idx = -1;
    let page = 0;               // page de produits affichée (6 par page)
    const PAR_PAGE = 6;
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); idx = -1; };
    const render = () => {
      const q = norm(input.value.trim());
      const data = window.SOCOMAB_INDEX || [];
      if (q.length < 2 || !data.length) { close(); return; }
      const toks = q.split(/\s+/);
      const hits = data.filter((x) => { const n = norm(x.n); return toks.every((t) => n.includes(t)); });
      const cats = hits.filter((x) => x.t === 'c').sort((a, b) => (b.k || 0) - (a.k || 0)).slice(0, 3);
      const allProds = hits.filter((x) => x.t === 'p');
      const pages = Math.max(1, Math.ceil(allProds.length / PAR_PAGE));
      page = Math.min(page, pages - 1);
      const prods = allProds.slice(page * PAR_PAGE, page * PAR_PAGE + PAR_PAGE);
      const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const row = (x) => `<a class="sugg__item" role="option" href="${x.u}"><img src="${x.i}" alt="" width="44" height="44" loading="lazy"><span><b>${esc(x.n)}</b><small>${x.t === 'c' ? (x.k ? x.k + ' produits' : 'Catégorie') : (x.p ? euro(x.p) : 'Prix sur devis')}</small></span></a>`;
      let out = '';
      if (cats.length) out += '<p class="sugg__ttl">Catégories</p>' + cats.map(row).join('');
      if (prods.length) out += `<p class="sugg__ttl">Produits <span>${allProds.length}</span></p>` + prods.map(row).join('');
      if (!out) out = '<p class="sugg__none">Aucun produit trouvé</p>';
      else if (pages > 1) {
        const de = page * PAR_PAGE + 1, a = Math.min(allProds.length, de + PAR_PAGE - 1);
        out += `<div class="sugg__pager"><button type="button" class="sugg__arw" data-p="-1" aria-label="Produits précédents"${page === 0 ? ' disabled' : ''}>‹</button>`
          + `<span>${de}–${a} sur ${allProds.length}</span>`
          + `<button type="button" class="sugg__arw" data-p="1" aria-label="Produits suivants"${page === pages - 1 ? ' disabled' : ''}>›</button></div>`;
      }
      list.innerHTML = out; list.hidden = false; input.setAttribute('aria-expanded', 'true'); idx = -1;
    };
    // flèches de pagination : on reste dans la liste, le champ garde le focus
    list.addEventListener('mousedown', (e) => { if (e.target.closest('.sugg__arw')) e.preventDefault(); });
    list.addEventListener('click', (e) => {
      const b = e.target.closest('.sugg__arw');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();      // le bouton est remplacé au rendu : ne pas fermer la liste
      if (b.disabled) return;
      page += Number(b.dataset.p);
      render();
    });
    input.addEventListener('input', () => { page = 0; });
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', (e) => {
      const opts = $$('.sugg__item', list);
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'PageDown' || e.key === 'PageUp') { const b = $(`.sugg__arw[data-p="${e.key === 'PageDown' ? 1 : -1}"]`, list); if (b && !b.disabled) { e.preventDefault(); b.click(); } return; }
      if (!opts.length || !['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;
      if (e.key === 'Enter') { if (idx >= 0) { e.preventDefault(); opts[idx].click(); } return; }
      e.preventDefault();
      idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
      opts.forEach((o, j) => o.classList.toggle('is-active', j === idx));
      opts[idx].scrollIntoView({ block: 'nearest' });
    });
    d.addEventListener('click', (e) => { if (!form.contains(e.target)) close(); });
  });


  /* ---------- Avis : photo du client si elle est fournie (assets/avis/…), sinon pictogramme ---------- */
  const photosDispo = window.SOCOMAB_PHOTOS || [];
  $$('.av[data-photo]').filter((av) => photosDispo.some((f) => av.dataset.photo.endsWith('/' + f))).forEach((av) => {
    const img = new Image();
    img.onload = () => { av.innerHTML = ''; img.alt = ''; av.appendChild(img); av.classList.add('has-photo'); };
    img.src = av.dataset.photo;
  });

  /* ---------- Configurateur : vues, étapes, finitions ---------- */
  const app = $('[data-app]');
  if (app) {
    const views = $$('.app__view', app);
    const tabs = $$('.app__tabs [role="tab"]', app);
    const steps = $$('[data-cfg-steps] button');
    const sws = $$('.sw', app);
    const video = $('video', app);
    let finish = '1';           // 1 = rouge, 2 = blanc
    let current = 'video';   // la vidéo se joue en premier (retour Günther 13/10)
    let timer;

    const setView = (v, user) => {
      if (v === '1') v = finish;  // la vue 3D suit la finition choisie
      const morph = (current === '0' && (v === '1' || v === '2'));
      current = v;
      views.forEach((el) => el.classList.toggle('is-on', el.dataset.v === v));
      if (morph && !reduce) { app.classList.remove('is-morph'); void app.offsetWidth; app.classList.add('is-morph'); }
      const tabKey = (v === '2') ? '1' : v;
      tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.view === tabKey));
      const stepIdx = { '0': 0, '1': 1, '2': 2, '3': 3 }[v];
      steps.forEach((s, i) => s.setAttribute('aria-pressed', i === stepIdx));
      if (video) { if (v === 'video') video.play().catch(() => {}); else video.pause(); }
      if (user) stopAuto();
    };
    const setFinish = (f, user) => {
      finish = f;
      sws.forEach((s) => s.setAttribute('aria-checked', s.dataset.sw === f));
      if (current === '1' || current === '2' || current === '0' || current === '3') setView(f === '2' ? '2' : '1', user);
    };

    tabs.forEach((t) => t.addEventListener('click', () => setView(t.dataset.view, true)));
    steps.forEach((s, i) => s.addEventListener('click', () => {
      if (i === 2) { setFinish(finish === '1' ? '2' : '1', true); steps.forEach((x, j) => x.setAttribute('aria-pressed', j === 2)); }
      else setView(String(i), true);
    }));
    sws.forEach((s) => {
      s.addEventListener('click', () => setFinish(s.dataset.sw, true));
      s.addEventListener('keydown', (e) => {
        if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          e.preventDefault(); const n = s.dataset.sw === '1' ? '2' : '1';
          setFinish(n, true); $(`.sw[data-sw="${n}"]`, app).focus();
        }
      });
    });

    // démonstration automatique 2D → 3D → finition → magasin, une fois visible
    const seq = [() => setView('0'), () => setView('1'), () => setFinish('2'), () => setView('3'), () => setFinish('1')];
    let k = 0;
    const startAuto = () => { if (reduce || timer) return; timer = setInterval(() => { k = (k + 1) % seq.length; seq[k](); }, 2800); };
    const stopAuto = () => { clearInterval(timer); timer = null; app.dataset.manual = '1'; };
    new IntersectionObserver((es) => es.forEach((e) => {
      // vidéo par défaut : elle démarre quand le bloc est visible, plus de démonstration automatique
      if (e.isIntersecting) { if (current === 'video' && video) video.play().catch(() => {}); }
      else { clearInterval(timer); timer = null; if (video) video.pause(); }
    }), { threshold: 0.4 }).observe(app);
  }

  /* ---------- Réalisations : filtres ---------- */
  const chips = $$('.filters .chip');
  const cards = $$('.rcard');
  chips.forEach((c) => c.addEventListener('click', () => {
    const f = c.dataset.f;
    chips.forEach((x) => { const on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
    cards.forEach((card) => {
      const show = f === 'all' || card.dataset.cat === f;
      card.classList.toggle('is-out', !show);
    });
  }));

  /* ---------- Carrousel d'avis ---------- */
  $$('[data-carousel]').forEach((car) => {
    const track = $('.carousel__track', car);
    const slides = $$('.review', track);
    const dots = $('.carousel__dots', car);
    const [prev, next] = $$('.cbtn', car);
    slides.forEach(() => dots.appendChild(d.createElement('i')));
    const step = () => slides[1].offsetLeft - slides[0].offsetLeft;
    const update = () => {
      const i = Math.round(track.scrollLeft / step());
      $$('i', dots).forEach((dot, j) => dot.classList.toggle('is-on', j === i));
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    [prev, next].forEach((b) => b.addEventListener('click', () => track.scrollBy({ left: step() * +b.dataset.dir, behavior: reduce ? 'auto' : 'smooth' })));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    addEventListener('resize', update);
    update();
  });

  /* ---------- Personnalisation : finitions ---------- */
  const fins = $$('.fin');
  const finImgs = $$('.fin__img');
  const finCap = $('[data-fin-cap]');
  const pickFin = (n, focus) => {
    fins.forEach((f) => f.setAttribute('aria-checked', f.dataset.fin === n));
    finImgs.forEach((img) => { const on = img.dataset.fin === n; img.classList.toggle('is-on', on); if (on && finCap) finCap.textContent = img.dataset.cap; });
    if (focus) $(`.fin[data-fin="${n}"]`).focus();
  };
  fins.forEach((f, i) => {
    f.addEventListener('click', () => pickFin(f.dataset.fin));
    f.addEventListener('keydown', (e) => {
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
        pickFin(fins[(i + dir + fins.length) % fins.length].dataset.fin, true);
      }
    });
  });

  /* ---------- CTA final : choix du besoin ---------- */
  const opts = $$('.choice__opt');
  const cta = $('[data-choice-cta]');
  const txt = $('[data-choice-txt]');
  opts.forEach((o, i) => {
    const pick = (focus) => {
      opts.forEach((x) => x.setAttribute('aria-checked', x === o));
      cta.href = o.dataset.href; $('span', cta).textContent = o.dataset.label; txt.textContent = o.dataset.txt;
      if (focus) o.focus();
    };
    o.addEventListener('click', () => pick());
    o.addEventListener('keydown', (e) => {
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); opts[(i + 1) % opts.length].click(); opts[(i + 1) % opts.length].focus(); }
    });
  });


  /* ---------- Bande de logos : boucle continue ---------- */
  const track = $('.logos__track, .ens-piste');
  if (track && !reduce) {
    [...track.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); (c.tagName === 'IMG' ? c : $('img', c)).alt = ''; track.appendChild(c); });
  }

  /* ---------- Guide : onglets verticaux ---------- */
  const guide = $('[data-guide]');
  if (guide) {
    const gtabs = $$('[role="tab"]', guide);
    const pick = (t, focus) => {
      gtabs.forEach((x) => {
        const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        $('#' + x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
    };
    gtabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', (e) => {
        const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); pick(gtabs[(i + k + gtabs.length) % gtabs.length], true); }
      });
    });
  }

  /* ---------- Sommaire du guide : section active ---------- */
  const tocLinks = $$('.guide__toc a');
  if (tocLinks.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) tocLinks.forEach((a) => a.classList.toggle('is-on', a.hash === '#' + e.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    $$('.gitem').forEach((g) => io.observe(g));
  }

  /* ---------- FAQ : une seule question ouverte à la fois ---------- */
  const faqs = $$('[data-faq] details');
  faqs.forEach((det) => det.addEventListener('toggle', () => { if (det.open) faqs.forEach((o) => { if (o !== det) o.open = false; }); }));

  /* ---------- Apparitions et compteurs ---------- */
  const reveal = $$('.head, .h2c, .pj__card, .pcard, .s3, .rcard, .review, .faq__list, .app, .stage, .final__box, .bandeau .v');
  reveal.forEach((el) => el.classList.add('rv'));
  const fmt = (n, dec) => n.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const count = (el) => {
    const end = parseFloat(el.dataset.count); const dec = +(el.dataset.dec || 0);
    if (reduce) { el.textContent = fmt(end, dec); return; }
    const t0 = performance.now(); const dur = 1200;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e, dec); if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    if (e.target.dataset.count) count(e.target);
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  [...reveal, ...$$('[data-count]'), ...$$('.dist')].forEach((el) => io.observe(el));

  /* ---------- Données structurées FAQ générées depuis le contenu visible ---------- */
  const ld = $('#faq-ld');
  if (ld && !ld.textContent.trim()) {
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question', name: $('summary', f).textContent.trim(),
        acceptedAnswer: { '@type': 'Answer', text: $('div', f).textContent.trim() },
      })),
    });
  }
})();

/* ---------- Panier latéral (comme le « Side Cart » de socomab.com) ---------- */
(() => {
  // deux boutons panier : barre marine (ordinateur) et ligne 1 (mobile)
  const btns = [...document.querySelectorAll('.hd__cart')];
  const cart = document.getElementById('panier');
  if (!btns.length || !cart) return;
  let btn = btns[0];
  const open = (e) => {
    btn = e.currentTarget;
    cart.hidden = false; btn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => cart.classList.add('is-open'));
    cart.querySelector('.cart__close').focus();
  };
  const close = () => {
    cart.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
    setTimeout(() => { cart.hidden = true; }, 300); btn.focus();
  };
  btns.forEach((b) => b.addEventListener('click', open));
  cart.querySelectorAll('[data-cart-close]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); close(); }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cart.hidden) close(); });
})();
