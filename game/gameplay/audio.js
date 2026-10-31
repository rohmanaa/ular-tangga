/* Gameplay Audio (Stage 4.1.11) — HANYA presentation suara: AudioContext lazy, beep/noise sintetis, dan objek SFX (file di assets/sfx + fallback beep).
   Isi blok di bawah dipindahkan APA ADANYA dari gameplay.html (frekuensi, gain, durasi, path file, urutan fallback tidak diubah).
   Gameplay tetap yang menentukan KAPAN suara dimainkan; state mute/musik/persistence tetap di gameplay.html (modul hanya diberi setMuted).
   Tanpa timer gameplay; semua kegagalan audio ditelan di dalam helper (try/catch) sehingga game tidak berhenti.
   Classic script. Namespace: UT.GameplayAudio.
   API:  ensure()        — buat/resume AudioContext (dipanggil setelah interaksi user, seperti sebelumnya)
         play(name)      — mainkan SFX bernama (mis. 'pop','roll','chest'); nama tak dikenal diabaikan
         setMuted(bool)  — samakan status mute (dari tombol suara di gameplay)
         sfx             — objek SFX yang sama (sfx.pop() dst) untuk call site existing */
(function (win) {
  'use strict';
  var UT = win.UT = win.UT || {};
  if (UT.GameplayAudio) return;

  let actx=null,muted=false;
  function ensureAudio(){
    try{
      if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
      if(actx&&actx.state==='suspended') actx.resume();
    }catch(e){}
  }
  function beep(f,d,type,vol,when,to){
    if(muted||!actx) return;
    try{
      const t=actx.currentTime+(when||0),o=actx.createOscillator(),g=actx.createGain();
      o.type=type||'square'; o.frequency.setValueAtTime(f,t);
      if(to) o.frequency.exponentialRampToValueAtTime(to,t+d);
      g.gain.setValueAtTime(vol||0.05,t); g.gain.exponentialRampToValueAtTime(0.0001,t+d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+d+0.03);
    }catch(e){}
  }
  function noise(d,vol,when,freq){
    if(muted||!actx) return;
    try{
      const n=Math.floor(actx.sampleRate*d),buf=actx.createBuffer(1,n,actx.sampleRate),ch=buf.getChannelData(0);
      for(let i=0;i<n;i++) ch[i]=(Math.random()*2-1)*(1-i/n);
      const src=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();
      src.buffer=buf; f.type='highpass'; f.frequency.value=freq||3000; g.gain.value=vol||0.08;
      src.connect(f); f.connect(g); g.connect(actx.destination); src.start(actx.currentTime+(when||0));
    }catch(e){}
  }
  /* Warm-up: file SFX dimuat lebih awal (tanpa diputar, tanpa butuh gesture) agar pemutaran pertama tidak menunggu fetch/decode. */
  var SFX_FILES=['jump.mp3','Strong_attack5.ogg.mp3','Teleport2.ogg','Creeper_fuse.ogg','skelton_shoot.ogg','Ender_dragon_hurt4.ogg','Ender_dragon_death.ogg','Ender_dragon_idle3.ogg','100.mp3','ularmakan.mp3','Chest_open.ogg','Chest_close2.ogg','rewardpower.mp3','naiktangga.mp3'],warm=[];
  function preload(){ if(warm.length) return; SFX_FILES.forEach(function(f){ try{ var a=new Audio(); a.preload='auto'; a.src='assets/sfx/'+f; warm.push(a); }catch(e){} }); }
  const sfx={
    hop(){ try{ const a=new Audio('assets/sfx/jump.mp3'); a.volume=0.5; a.play().catch(()=>beep(480+Math.random()*120,0.08,'square',0.04)); }catch(e){ beep(480+Math.random()*120,0.08,'square',0.04); } },
    hit(){ try{ const a=new Audio('assets/sfx/Strong_attack5.ogg.mp3'); a.volume=0.7; a.play().catch(()=>beep(330,0.2,'triangle',0.07,0,140)); }catch(e){ beep(330,0.2,'triangle',0.07,0,140); } },
    enderman(){ try{ const a=new Audio('assets/sfx/Teleport2.ogg'); a.volume=0.7; a.play().catch(()=>beep(700,0.2,'square',0.05,0,1000)); }catch(e){ beep(700,0.2,'square',0.05,0,1000); } },
    creeper(){ try{ const a=new Audio('assets/sfx/Creeper_fuse.ogg'); a.volume=0.7; a.play().catch(()=>beep(200,0.12,'square',0.09,0,60)); }catch(e){ beep(200,0.12,'square',0.09,0,60); } },
    skeltonSh(){ try{ const a=new Audio('assets/sfx/skelton_shoot.ogg'); a.volume=0.7; a.play().catch(()=>beep(400,0.1,'square',0.05)); }catch(e){ beep(400,0.1,'square',0.05); } },
    dragonHurt(){ try{ const a=new Audio('assets/sfx/Ender_dragon_hurt4.ogg'); a.volume=0.8; a.play().catch(()=>beep(523,0.2,'square',0.05)); }catch(e){ beep(523,0.2,'square',0.05); } },
    dragonDeath(){ try{ const a=new Audio('assets/sfx/Ender_dragon_death.ogg'); a.volume=0.9; a.play().catch(()=>beep(1047,0.4,'square',0.08)); }catch(e){ beep(1047,0.4,'square',0.08); } },
    dragonIdle(){ try{ const a=new Audio('assets/sfx/Ender_dragon_idle3.ogg'); a.volume=0.5; a.play().catch(()=>{}); }catch(e){} },
    hundred(){ try{ const a=new Audio('assets/sfx/100.mp3'); a.volume=0.7; a.play().catch(()=>beep(523,0.2,'square',0.05)); }catch(e){ beep(523,0.2,'square',0.05); } },
    caplokular(){ try{ const a=new Audio('assets/sfx/ularmakan.mp3'); a.volume=0.8; a.play().catch(()=>beep(200,0.12,'square',0.09,0,60)); }catch(e){ beep(200,0.12,'square',0.09,0,60); } },
    chest(){ try{ const a=new Audio('assets/sfx/Chest_open.ogg'); a.volume=0.7; a.play().catch(()=>beep(300,0.12,'triangle',0.08,0,900)); }catch(e){ beep(300,0.12,'triangle',0.08,0,900); } },
    chestClose(){ try{ const a=new Audio('assets/sfx/Chest_close2.ogg'); a.volume=0.6; a.play().catch(()=>beep(200,0.1,'square',0.05)); }catch(e){ beep(200,0.1,'square',0.05); } },
    rewardpower(){ try{ const a=new Audio('assets/sfx/rewardpower.mp3'); a.volume=0.6; a.play().catch(()=>beep(523,0.12,'square',0.05,0,784)); }catch(e){ beep(523,0.12,'square',0.05,0,784); } },
    naiktangga(){ try{ const a=new Audio('assets/sfx/naiktangga.mp3'); a.volume=0.7; a.play().catch(()=>[392,494,587,784].forEach((f,i)=>beep(f,0.14,'square',0.05,i*0.11))); }catch(e){ [392,494,587,784].forEach((f,i)=>beep(f,0.14,'square',0.05,i*0.11)); } },
    roll(){ for(let i=0;i<7;i++) beep(180+Math.random()*320,0.05,'square',0.035,i*0.13); },
    ladder(){ [392,494,587,784].forEach((f,i)=>beep(f,0.14,'square',0.05,i*0.11)); },
    hiss(){ noise(0.55,0.09,0,4500); },
    chomp(){ beep(200,0.12,'square',0.09,0,60); beep(90,0.25,'sawtooth',0.08,0.02); noise(0.12,0.07,0,1500); },
    gulp(){ beep(220,0.18,'sine',0.1,0,90); beep(200,0.18,'sine',0.1,0.24,80); },
    pop(){ beep(300,0.12,'triangle',0.08,0,900); },
    bounce(){ beep(330,0.2,'triangle',0.07,0,140); },
    win(){ [523,659,784,1047,784,1047].forEach((f,i)=>beep(f,0.2,'square',0.05,i*0.14)); }
  };

  try{ preload(); }catch(e){}
  UT.GameplayAudio = {
    ensure: ensureAudio,
    preload: preload,
    play: function (name) { try { if (typeof sfx[name] === 'function') sfx[name](); } catch (e) {} },
    setMuted: function (v) { muted = !!v; },
    sfx: sfx
  };
})(window);
