/* Gabarits secondaires : listes filtrables, galerie et variations de la fiche produit */
(function(){
  // ---- listes : recherche, filtre par produit, « Afficher plus »
  var list=document.querySelector('[data-list]');
  if(list){
    var items=[].slice.call(list.children),step=+list.dataset.step||24,shown=step,f='',q='';
    var more=document.querySelector('[data-more]'),count=document.querySelector('[data-gxcount]'),inp=document.getElementById('gx-q');
    function norm(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()}
    function draw(){
      var m=items.filter(function(li){return (!f||li.dataset.f===f)&&(!q||norm(li.dataset.q||li.textContent).indexOf(q)>-1)});
      items.forEach(function(li){li.hidden=true});
      m.forEach(function(li,i){li.hidden=i>=shown});
      if(more)more.parentNode.hidden=m.length<=shown;
      if(count)count.textContent=m.length+(m.length>1?' pages':' page');
    }
    if(more)more.addEventListener('click',function(){shown+=step;draw()});
    if(inp)inp.addEventListener('input',function(){q=norm(inp.value.trim());shown=step;draw()});
    [].forEach.call(document.querySelectorAll('.gx-chips button'),function(b,_,all){
      b.addEventListener('click',function(){[].forEach.call(document.querySelectorAll('.gx-chips button'),function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');f=b.dataset.f;shown=step;draw()});
    });
    draw();
  }
  // ---- fiche produit : galerie
  var main=document.querySelector('[data-main] img');
  [].forEach.call(document.querySelectorAll('.pp__thumbs button'),function(b){
    b.addEventListener('click',function(){main.src=b.dataset.src;[].forEach.call(document.querySelectorAll('.pp__thumbs button'),function(x){x.setAttribute('aria-current','false')});b.setAttribute('aria-current','true')});
  });
  // ---- fiche produit : choix de la longueur → prix
  var opts=document.querySelector('[data-opts]');
  if(opts){
    var pv=document.querySelector('[data-pv]'),ttc=document.querySelector('[data-ttc]'),add=document.querySelector('[data-add]'),reset=document.querySelector('[data-reset]');
    var p0=pv.textContent,t0=ttc.textContent;
    function fr(n){return n.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
    [].forEach.call(opts.children,function(b){b.addEventListener('click',function(){
      [].forEach.call(opts.children,function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');
      var p=+b.dataset.p;pv.textContent=fr(p);ttc.textContent='Soit '+fr(p*1.2)+' TTC';add.disabled=false;reset.hidden=false;
    })});
    reset.addEventListener('click',function(){[].forEach.call(opts.children,function(x){x.setAttribute('aria-pressed','false')});pv.textContent=p0;ttc.textContent=t0;add.disabled=true;reset.hidden=true});
    [].forEach.call(document.querySelectorAll('[data-q]'),function(b){b.addEventListener('click',function(){var i=document.querySelector('[data-qty]');i.value=Math.max(1,(+i.value||1)+(+b.dataset.q))})});
  }
})();
/* Plan du site : « Voir les N autres » / « Réduire », bouton toujours sous la liste */
[].forEach.call(document.querySelectorAll('[data-sm]'),function(b){
  b.addEventListener('click',function(){
    var open=b.getAttribute('aria-expanded')!=='true';
    [].forEach.call(b.previousElementSibling.querySelectorAll('[data-x]'),function(li){li.hidden=!open});
    b.setAttribute('aria-expanded',open);b.textContent=open?'Réduire':'Voir les '+b.dataset.n+' autres';
  });
});
