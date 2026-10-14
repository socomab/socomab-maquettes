/* Page catégorie (maquette) : filtres, feuille de filtres mobile, « afficher plus », guide. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const grid = $('[data-grid]');
  if (!grid) return;
  const cards = $$('.pc', grid);
  const cfg = $('.pc-cfg', grid);
  // 15 modèles + la tuile configurateur = 4 rangées de 4 (7 + la tuile sur mobile)
  const PAGE = window.matchMedia('(max-width: 760px)').matches ? 7 : 15;
  let expanded = false;
  const state = {};           // groupe -> valeur (« groupe=Option »)

  /* ---------- application des filtres ---------- */
  const apply = () => {
    const wanted = Object.values(state).filter(Boolean);
    const match = cards.filter((c) => wanted.every((w) => c.dataset.tags.split(' ').includes(w)));
    cards.forEach((c) => { c.hidden = !match.includes(c); c.classList.remove('is-more'); });
    const limit = expanded ? Infinity : PAGE;
    match.forEach((c, i) => c.classList.toggle('is-more', i >= limit));
    // la tuile configurateur se place après le 7e modèle visible (fin de 2e rangée)
    if (cfg) {
      const anchor = match.filter((c) => !c.classList.contains('is-more'))[6];
      if (anchor) anchor.after(cfg); else grid.append(cfg);
      cfg.hidden = match.length === 0;
    }
    $$('[data-count]').forEach((n) => { n.textContent = match.length; });
    $('[data-empty]').hidden = match.length > 0;
    const more = $('[data-more]');
    const rest = match.length - PAGE;
    more.parentElement.hidden = expanded || rest <= 0;
    more.textContent = `Afficher les ${rest} autres modèles`;
    // pastilles et compteurs
    const nact = wanted.length;
    $$('[data-reset]').forEach((b) => { if (b.classList.contains('fbar__reset')) b.hidden = !nact; });
    const badge = $('[data-nact]'); badge.hidden = !nact; badge.textContent = nact;
    $$('.fpill').forEach((p) => {
      const v = state[p.dataset.g];
      p.classList.toggle('is-set', !!v);
      $('.fpill__val', p).textContent = v ? labelOf(v) : '';
    });
    const act = $('[data-active]');
    act.innerHTML = '';
    Object.entries(state).filter(([, v]) => v).forEach(([g, v]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = labelOf(v); b.setAttribute('aria-label', `Retirer le filtre ${labelOf(v)}`);
      b.addEventListener('click', () => set(g, ''));
      act.append(b);
    });
    // compteurs dynamiques : chaque option affiche le nombre de modèles qu'elle donnerait
    // en tenant compte des autres filtres déjà choisis ; à 0, elle est grisée et non cliquable
    $$('.fpill__pop input[value], .fsheet__opts input[value]').forEach((r) => {
      if (!r.value) return;
      const g = r.value.split('=')[0];
      const others = Object.entries(state).filter(([k, v]) => k !== g && v).map(([, v]) => v);
      const n = cards.filter((c) => { const t = c.dataset.tags.split(' '); return t.includes(r.value) && others.every((w) => t.includes(w)); }).length;
      const lab = r.closest('label');
      const em = $('em', lab); if (em) em.textContent = n;
      const off = n === 0 && state[g] !== r.value;
      r.disabled = off; lab.classList.toggle('is-off', off);
    });
    // synchronise les deux interfaces (pastilles ordinateur / feuille mobile)
    $$('input[type="radio"]').forEach((r) => {
      const g = r.name.replace(/^m-/, '');
      if (g in LABELS || $(`.fpill[data-g="${g}"]`)) r.checked = (state[g] || '') === r.value;
    });
  };
  const LABELS = {};
  const labelOf = (v) => { const o = v.split('=')[1].replace(/_/g, ' '); return o.charAt(0).toUpperCase() + o.slice(1); };
  const set = (g, v) => { state[g] = v; apply(); };

  /* ---------- pastilles (ordinateur) ---------- */
  const closePops = (except) => $$('.fpill').forEach((p) => {
    if (p === except) return;
    $('.fpill__pop', p).hidden = true; $('.fpill__btn', p).setAttribute('aria-expanded', 'false');
  });
  $$('.fpill').forEach((p) => {
    const btn = $('.fpill__btn', p); const pop = $('.fpill__pop', p);
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); closePops(p);
      pop.hidden = !pop.hidden; btn.setAttribute('aria-expanded', String(!pop.hidden));
    });
    $$('input', pop).forEach((r) => r.addEventListener('change', () => {
      set(p.dataset.g, r.value); pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus();
    }));
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.fpill')) closePops(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePops(); });

  /* ---------- feuille de filtres (mobile) ---------- */
  const sheet = $('[data-sheet]');
  const openSheet = () => { sheet.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => sheet.classList.add('is-open')); };
  const closeSheet = () => { sheet.classList.remove('is-open'); document.body.style.overflow = ''; setTimeout(() => { sheet.hidden = true; }, 300); };
  $('[data-sheet-open]').addEventListener('click', openSheet);
  $$('[data-sheet-close]', sheet).forEach((b) => b.addEventListener('click', closeSheet));
  $$('.fsheet__opts input', sheet).forEach((r) => r.addEventListener('change', () => set(r.closest('.fsheet__opts').dataset.g, r.value)));

  /* ---------- réinitialiser / afficher plus ---------- */
  $$('[data-reset]').forEach((b) => b.addEventListener('click', () => { Object.keys(state).forEach((k) => { state[k] = ''; }); apply(); }));
  $('[data-more]').addEventListener('click', () => { expanded = true; apply(); });

  apply();

  /* ---------- réalisations : vignettes ---------- */
  $$('[data-gal]').forEach((g) => {
    const main = $('.rf__main', g);
    $$('.rf__thumbs button', g).forEach((b) => b.addEventListener('click', () => {
      main.src = $('img', b).src;
      $$('.rf__thumbs button', g).forEach((x) => x.classList.toggle('is-on', x === b));
    }));
  });

  /* ---------- formulaire (maquette : pas d'envoi) ---------- */
  const form = $('.devis__form');
  if (form) form.addEventListener('submit', (e) => { e.preventDefault(); $('[data-ok]', form).hidden = false; });
})();
