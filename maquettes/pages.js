/* Pages de contenu : filtres + « voir plus » des réalisations, visionneuse photos, sommaire d'article, champs fichier. */
(function () {
  // Réalisations : filtres par métier et chargement progressif
  var grid = document.querySelector('[data-rl-grid]');
  if (grid) {
    var step = +grid.dataset.step || 16, shown = step, filter = 'all';
    var cards = [].slice.call(grid.children), more = document.querySelector('[data-rl-more]'), count = document.querySelector('[data-rl-count]');
    var render = function () {
      var match = cards.filter(function (c) { return filter === 'all' || c.dataset.cat === filter; });
      cards.forEach(function (c) { c.classList.add('is-hidden'); });
      match.slice(0, shown).forEach(function (c) { c.classList.remove('is-hidden'); });
      if (count) count.textContent = match.length;
      if (more) { more.parentElement.hidden = match.length <= shown; more.textContent = 'Voir plus de réalisations (' + (match.length - shown) + ')'; }
    };
    document.querySelectorAll('.rl__filters .chip').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.rl__filters .chip').forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('is-on'); b.setAttribute('aria-pressed', 'true'); filter = b.dataset.f; shown = step; render();
      });
    });
    if (more) more.addEventListener('click', function () { shown += step; render(); });
    render();
  }
  // Visionneuse
  var box = document.querySelector('[data-lb-box]');
  if (box) {
    var btns = [].slice.call(document.querySelectorAll('[data-lb]')), cur = 0, im = box.querySelector('[data-lb-img]'), cap = box.querySelector('[data-lb-cap]'), last;
    var show = function (i) { cur = (i + btns.length) % btns.length; im.src = btns[cur].dataset.lb; im.alt = btns[cur].dataset.cap; cap.textContent = btns[cur].dataset.cap + ' · ' + (cur + 1) + '/' + btns.length; };
    var close = function () { box.hidden = true; document.body.style.overflow = ''; if (last) last.focus(); };
    btns.forEach(function (b, i) { b.addEventListener('click', function () { last = b; show(i); box.hidden = false; document.body.style.overflow = 'hidden'; box.querySelector('[data-lb-close]').focus(); }); });
    box.querySelector('[data-lb-close]').addEventListener('click', close);
    box.querySelector('[data-lb-prev]').addEventListener('click', function () { show(cur - 1); });
    box.querySelector('[data-lb-next]').addEventListener('click', function () { show(cur + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) { if (box.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  }
  // Sommaire d'article : rubrique en cours surlignée
  var toc = [].slice.call(document.querySelectorAll('.post__toc ol a'));
  if (toc.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) toc.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-20% 0px -70% 0px' });
    toc.forEach(function (a) { var t = document.querySelector(a.getAttribute('href')); if (t) io.observe(t); });
  }
  // Champs fichier : nom du fichier choisi
  document.querySelectorAll('.fm__up input[type=file]').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var lab = inp.closest('.fm__up'), t = lab.querySelector('[data-up-txt]');
      if (!t.dataset.def) t.dataset.def = t.textContent;
      var n = inp.files.length; lab.classList.toggle('is-set', n > 0);
      t.textContent = n === 0 ? t.dataset.def : n === 1 ? inp.files[0].name : n + ' fichiers sélectionnés';
    });
  });
})();
/* Article : formulaire de devis en 3 étapes et carrousel de la sélection de produits */
(function () {
  var f = document.querySelector('[data-eq]');
  if (f) {
    var steps = [].slice.call(f.querySelectorAll('[data-eq-step]')), dots = [].slice.call(f.querySelectorAll('[data-eq-dot]')), cur = 0;
    var err = function (st, msg) { var e = st.querySelector('.eq__err'); if (!e) { e = document.createElement('p'); e.className = 'eq__err'; e.setAttribute('role', 'alert'); st.querySelector('.eq__nav').before(e); } e.textContent = msg; e.hidden = !msg; };
    var go = function (i) {
      cur = i; steps.forEach(function (s, k) { s.hidden = k !== i; });
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); d.classList.toggle('is-done', k < i); });
      var first = steps[i].querySelector('input'); if (first) first.focus({ preventScroll: true });
    };
    var valid = function (i) {
      var st = steps[i];
      if (i === 0 && !st.querySelector('input:checked')) { err(st, 'Choisissez votre métier pour continuer.'); return false; }
      if (i === 1 && !st.querySelector('input[type=checkbox]:checked')) { err(st, 'Choisissez au moins un équipement.'); return false; }
      if (i === 2) { var bad = [].slice.call(st.querySelectorAll('input[required]')).filter(function (x) { return !x.value.trim() || !x.checkValidity(); }); if (bad.length) { err(st, 'Merci de compléter les champs obligatoires.'); bad[0].focus(); return false; } }
      err(st, ''); return true;
    };
    f.addEventListener('change', function (e) { var st = e.target.closest('[data-eq-step]'), m = st && st.querySelector('.eq__err'); if (m) m.hidden = true; });
    f.querySelectorAll('[data-eq-next]').forEach(function (b) { b.addEventListener('click', function () { if (valid(cur)) go(cur + 1); }); });
    f.querySelectorAll('[data-eq-prev]').forEach(function (b) { b.addEventListener('click', function () { go(cur - 1); }); });
    f.querySelectorAll('input[name=metier]').forEach(function (r) { r.addEventListener('change', function () { if (valid(0)) setTimeout(function () { go(1); }, 180); }); });
    f.addEventListener('submit', function (e) { e.preventDefault(); if (!valid(2)) return; steps[2].innerHTML = '<div class="eq__done"><b>Merci, votre demande est envoyée.</b>Maquette : aucun envoi réel. Sur le site, un conseiller vous rappelle dans la journée.</div>'; dots.forEach(function (d) { d.classList.remove('is-on'); d.classList.add('is-done'); }); });
  }
  var t = document.querySelector('[data-sel]');
  if (t) {
    var by = function (d) { var c = t.querySelector('.pc'); t.scrollBy({ left: d * (c ? c.getBoundingClientRect().width + 16 : 300), behavior: 'smooth' }); };
    document.querySelector('[data-sel-prev]').addEventListener('click', function () { by(-1); });
    document.querySelector('[data-sel-next]').addEventListener('click', function () { by(1); });
  }
})();
