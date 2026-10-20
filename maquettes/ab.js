/* Maquettes Socomab — interrupteur A / B (v14, 20/10/2026).
   B = CTA final « Parlons de votre besoin » pleine largeur sans fond bleu ciel (v16 : seul test restant). Le choix suit d'une page à l'autre (?v=a / ?v=b dans l'URL pour forcer une version). */
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
  }
  appliquer(v);

  document.addEventListener('DOMContentLoaded', function () {
    var box = document.createElement('div');
    box.className = 'abx';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Version de la maquette');
    box.innerHTML = '<span>Version</span><button type="button" data-v="a">A</button><button type="button" data-v="b">B</button>' +
      '<small>B : bloc « Parlons de votre besoin » pleine largeur</small>';
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
    document.body.appendChild(box);
  });
})();
