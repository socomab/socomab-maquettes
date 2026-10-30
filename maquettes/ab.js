/* Maquettes Socomab — test A / B terminé (30/10/2026) : version A retenue
   (bloc « Parlons de votre besoin » non pleine largeur). L'interrupteur est retiré. */
(function () {
  document.documentElement.classList.remove('ab-b');
  try { localStorage.removeItem('socomab-maquette-ab'); } catch (e) { /* rien */ }
})();
