/* Formulaire « Décrivez votre projet » : script repris tel quel de socomab.com/demande-de-devis/ (seul l'envoi est neutralisé pour la maquette). */
(function(){
  var root=document.getElementById('eqf'); if(!root) return;
  var form=document.getElementById('eqf-form'), steps=document.getElementById('eqf-steps'), cur=1;
  var u=form.querySelector('.eqf-url'); if(u){ u.value=location.href; }
  function show(n){
    root.querySelectorAll('.panel').forEach(function(p){ p.classList.toggle('on', +p.dataset.p === n); });
    steps.querySelectorAll('.step').forEach(function(s){ var i=+s.dataset.s; s.classList.toggle('on', i===n); s.classList.toggle('done', i<n); });
    steps.querySelectorAll('.bar').forEach(function(b){ b.classList.toggle('fill', +b.dataset.b < n); });
    cur=n;
  }
  function secoue(el){ if(el && el.animate){ el.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:240}); } }
  function valide(n){
    if(n===1 && !form.querySelector('input[name="metier"]:checked')){ secoue(document.getElementById('eqf-opts-metier')); return false; }
    return true;
  }
  root.querySelectorAll('[data-go]').forEach(function(b){
    b.addEventListener('click',function(){
      var n=+b.dataset.go; if(n>cur && !valide(cur)) return;
      show(n); root.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
  form.querySelectorAll('input[name="metier"]').forEach(function(r){
    r.addEventListener('change',function(){ setTimeout(function(){ show(2); },220); });
  });
  form.addEventListener('submit',function(e){
    e.preventDefault(); var ok=true;
    ['eqf-ese','eqf-tel','eqf-mail','eqf-cp'].forEach(function(id){
      var c=document.getElementById(id), v=c.value.trim();
      var vide=!v || (id==='eqf-cp' && !(/^[0-9A-Za-z -]{4,10}$/.test(v) && /\d/.test(v)));
      c.classList.toggle('err',vide); if(vide) ok=false;
    });
    if(!ok){ secoue(form.querySelector('.panel.on .champs')); return; }
    var b=form.querySelector('button[type="submit"]'); if(b){ b.disabled=true; b.textContent='Envoi…'; }
    // MAQUETTE : pas d'envoi réel (sur le site : form.submit() → /confirmation-merci/)
    if(b){ b.textContent='Maquette : demande non envoyée'; }
  });
})();