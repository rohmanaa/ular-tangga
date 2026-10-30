/* Ular Tangga Blok — beranda: dadu gimik & trailer */
(function(){
  /* ---------- dadu (gimik) ---------- */
  var dice=document.getElementById('dice'),btn=document.getElementById('rollBtn'),
      num=document.getElementById('diceNum'),msg=document.getElementById('diceMsg');
  var face={1:[0,0],6:[0,180],2:[0,-90],5:[0,90],3:[-90,0],4:[90,0]};
  var words={1:'Pelan tapi pasti, maju 1 petak.',2:'Maju 2 petak.',3:'Maju 3 petak.',4:'Lumayan, maju 4 petak!',5:'Mantap, maju 5 petak!',6:'Dadu 6! Giliran bonus!'};
  var cx=0,cy=0,rolling=false,ctx=null;
  function next(cur,t){return Math.ceil(cur/360)*360+720+((t%360)+360)%360}
  function sfx(){
    try{
      ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
      if(ctx.state==='suspended')ctx.resume();
      for(var i=0;i<5;i++)(function(i){setTimeout(function(){
        var o=ctx.createOscillator(),g=ctx.createGain();
        o.type='triangle';o.frequency.value=150+Math.random()*200;
        g.gain.setValueAtTime(.08,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.06);
        o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.06);
      },i*90)})(i);
    }catch(e){}
  }
  function roll(){
    if(rolling)return;rolling=true;btn.disabled=true;sfx();
    var n=1+Math.floor(Math.random()*6),t=face[n];
    cx=next(cx,t[0]);cy=next(cy,t[1]);
    dice.style.transform='rotateX('+cx+'deg) rotateY('+cy+'deg)';
    num.textContent='…';msg.textContent='Dadu menggelinding…';
    setTimeout(function(){num.textContent=n;msg.textContent=words[n];btn.disabled=false;btn.textContent='Kocok Lagi';rolling=false},1450);
  }
  if(btn&&dice){btn.addEventListener('click',roll);dice.parentNode.parentNode.addEventListener('click',roll);}

  /* ---------- trailer ---------- */
  // Isi dengan link embed YouTube (https://www.youtube.com/embed/ID) atau file video (.mp4).
  // Kalau kosong, tampil placeholder "segera hadir".
  var TRAILER_URL='';
  var dlg=document.getElementById('trailer'),scr=document.getElementById('trScreen');
  var placeholder='<div class="tr-soon"><svg width="84" height="88" viewBox="-28 -4 56 56" aria-hidden="true"><polygon points="0,0 24,12 0,24 -24,12" fill="#c6ff5a"/><polygon points="-24,12 0,24 0,48 -24,36" fill="#58b02d"/><polygon points="0,24 24,12 24,36 0,48" fill="#2d7a21"/><path d="M-6 20l12 6-12 6z" fill="#0b1a2e"/></svg><h3>Trailer segera hadir</h3><p>Dunia voxel 3D, lempar dadu, tangga kayu, dan ular jahil beraksi.</p></div>';
  function open(){
    if(!TRAILER_URL)scr.innerHTML=placeholder;
    else if(/\.(mp4|webm)(\?|$)/i.test(TRAILER_URL))scr.innerHTML='<video src="'+TRAILER_URL+'" controls autoplay playsinline></video>';
    else scr.innerHTML='<iframe src="'+TRAILER_URL+(TRAILER_URL.indexOf('?')>-1?'&':'?')+'autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="Trailer"></iframe>';
    dlg.showModal();
  }
  var tb=document.getElementById('trailerBtn');if(tb)tb.addEventListener('click',open);
  document.getElementById('trailerClose').addEventListener('click',function(){dlg.close()});
  dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
  dlg.addEventListener('close',function(){scr.innerHTML=''});
})();
