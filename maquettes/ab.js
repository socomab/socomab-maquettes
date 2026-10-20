/* Maquettes Socomab — interrupteur A / B (v14, 20/10/2026).
   B = CTA final pleine largeur sans fond bleu ciel · arrondis plus carrés · « Exclusivité Socomab · gratuit »
   plus visible. Le choix suit d'une page à l'autre (?v=a / ?v=b dans l'URL pour forcer une version). */
(function () {
  var KEY = 'socomab-maquette-ab';
  var v = 'a';
  try {
    var q = new URLSearchParams(location.search).get('v');
    if (q === 'a' || q === 'b') { v = q; localStorage.setItem(KEY, v); }
    else { v = localStorage.getItem(KEY) || 'a'; }
  } catch (e) { /* stockage indisponible : version A */ }

  function appliquer(ver) {
    v = ver;
    document.documentElement.classList.toggle('ab-b', ver === 'b');
    var liens = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < liens.length; i++) {
      var h = liens[i].getAttribute('href') || '';
      var m = h.match(/^(styles|pages|categorie)(\.b)?\.css(\?.*)?$/);
      if (!m) continue;
      var nh = m[1] + (ver === 'b' ? '.b' : '') + '.css' + (m[3] || '');
      if (nh !== h) liens[i].setAttribute('href', nh);
    }
  }
  appliquer(v);

  /* v15 : propositions de fond pour les héros des pages (?fond=1…5, 0 = actuel) */
  var KEYF = 'socomab-maquette-fond', fond = '0';
  try {
    var qf = new URLSearchParams(location.search).get('fond');
    if (qf !== null && /^[0-5]$/.test(qf)) { fond = qf; localStorage.setItem(KEYF, fond); }
    else { fond = localStorage.getItem(KEYF) || '0'; }
  } catch (e) { /* rien */ }
  var poserFond = function (f) { fond = f; if (f === '0') document.documentElement.removeAttribute('data-fond'); else document.documentElement.setAttribute('data-fond', f); };
  poserFond(fond);

  document.addEventListener('DOMContentLoaded', function () {
    var box = document.createElement('div');
    box.className = 'abx';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Version de la maquette');
    box.innerHTML = '<span>Version</span><button type="button" data-v="a">A</button><button type="button" data-v="b">B</button>' +
      '<small>B : bloc devis pleine largeur · arrondis plus carrés · 3D plus visible</small>';
    var maj = function () {
      box.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v); });
    };
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      appliquer(b.dataset.v);
      try { localStorage.setItem(KEY, v); } catch (err) { /* rien */ }
      maj();
    });
    maj();
    if (document.querySelector('.pg-band') && !document.querySelector('.fonds-lbl')) {
      var sel = document.createElement('label');
      sel.className = 'abx__fond';
      sel.innerHTML = 'Fond <select aria-label="Fond du héros"><option value="0">actuel</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select>';
      var s = sel.querySelector('select');
      s.value = fond;
      s.addEventListener('change', function () { poserFond(s.value); try { localStorage.setItem(KEYF, fond); } catch (err) { /* rien */ } });
      box.appendChild(sel);
    }
    document.body.appendChild(box);
  });
})();
