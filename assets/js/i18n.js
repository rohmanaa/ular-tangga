/* Ular Tangga Blok — pergantian bahasa (data di assets/lang/*.js) */
(function(){
  var KEY='utb-lang',DEF='id';
  function saved(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function save(l){try{localStorage.setItem(KEY,l)}catch(e){}}
  function apply(l){
    var d=(window.LANG||{})[l];if(!d)return;
    document.documentElement.lang=l;
    [].forEach.call(document.querySelectorAll('[data-i18n]'),function(el){var v=d[el.getAttribute('data-i18n')];if(v!=null)el.textContent=v});
    [].forEach.call(document.querySelectorAll('[data-i18n-html]'),function(el){var v=d[el.getAttribute('data-i18n-html')];if(v!=null)el.innerHTML=v});
    [].forEach.call(document.querySelectorAll('[data-i18n-aria]'),function(el){var v=d[el.getAttribute('data-i18n-aria')];if(v!=null)el.setAttribute('aria-label',v)});
    if(d['meta.title'])document.title=d['meta.title'];
    var md=document.querySelector('meta[name="description"]');if(md&&d['meta.desc'])md.setAttribute('content',d['meta.desc']);
    [].forEach.call(document.querySelectorAll('.lang button'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-lang')===l?'true':'false')});
  }
  function pick(){
    var q=(location.search.match(/[?&]lang=(\w+)/)||[])[1];
    var l=q||saved()||DEF;
    return (window.LANG&&window.LANG[l])?l:DEF;
  }
  [].forEach.call(document.querySelectorAll('.lang button'),function(b){
    b.addEventListener('click',function(){var l=b.getAttribute('data-lang');save(l);apply(l)});
  });
  apply(pick());
})();
