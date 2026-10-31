/* Gameplay Feedback — presentasi visual (Stage 4.1.14): indikator pemain aktif (marker di atas pawn) dan kartu hadiah Chest / kartu serangan.
   Dipindahkan APA ADANYA dari gameplay.html (DOM id #puCard/#pcWho/#pcName/#pcDesc/#pcEmoji, kelas 'pop', jeda 75ms/900ms/1500ms/1600ms, suara, urutan).
   BERBEDA dari UT.Gameplay.Feedback (module-bridge.js = adapter routing HUD: short/event/reward). Modul ini tidak memanggil HUD/Feedback dan tidak mengubah state gameplay;
   showPUCard tetap didaftarkan gameplay sebagai presenter Feedback.reward. Kapan feedback ditampilkan (urutan aksi) tetap ditentukan gameplay.html.
   Dependensi diberikan lewat init({sfx, sleep, reduce}); data Power dibaca dari UT.Gameplay.Config.PUN (sumber yang sama dengan gameplay).
   Classic script. Namespace: UT.GameplayFeedback.
   API: init(deps) · setCurrentMarker(players, cur) · hideMarker(player) · updateTurnMarkers(players, now, dt) · showPUCard(p, k) · showAttackCard(attacker, defender, weapon, desc) */
(function (win, doc) {
  'use strict';
  var UT = win.UT = win.UT || {};
  if (UT.GameplayFeedback) return;

  var SILENT = (typeof Proxy === 'function') ? new Proxy({}, { get: function () { return function () {}; } }) : { rewardpower: function () {}, pop: function () {} };
  var sfx = SILENT, sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); }, reduce = false;
  function $(id) { return doc.getElementById(id); }
  function getPUN() { var G = UT.Gameplay; return (G && G.Config && G.Config.PUN) || {}; }

  function init(o) {
    o = o || {};
    if (o.sfx) sfx = o.sfx;
    if (typeof o.sleep === 'function') sleep = o.sleep;
    reduce = !!o.reduce;
    return true;
  }

  /* ---- Indikator pemain aktif (marker oktahedron di atas pawn) ---- */
  function setCurrentMarker(players, cur) { players.forEach(function (q, i) { q.pawn.userData.marker.visible = (i === cur); }); }
  function hideMarker(p) { p.pawn.userData.marker.visible = false; }
  function updateTurnMarkers(players, now, dt) {
    players.forEach(p=>{
      const mk=p.pawn.userData.marker;
      if(mk.visible){ mk.position.y=1.22+Math.sin(now*0.004)*0.08; mk.rotation.y+=dt*2; }
    });
  }

  /* ---- Kartu hadiah Chest & kartu serangan (salinan persis) ---- */
  async function showPUCard(p,k){
     const PUN=getPUN();
     const c=$('puCard'),em=$('pcEmoji'),keys=Object.keys(PUN);
     $('pcWho').textContent=p.name+' membuka peti'; $('pcName').textContent='...'; $('pcDesc').textContent='';
     c.classList.remove('pop'); c.hidden=false;
     if(!reduce) for(let i=0;i<9;i++){ em.textContent=PUN[keys[i%keys.length]][0]; await sleep(75); }
     sfx.rewardpower();
     em.textContent=PUN[k][0]; $('pcName').textContent=PUN[k][1]; $('pcDesc').textContent=PUN[k][2]; c.classList.add('pop'); sfx.pop();
     await sleep(reduce?900:1500); c.hidden=true;
  }
  function showAttackCard(attacker,defender,weapon,desc){
     const PUN=getPUN();
     const c=$('puCard'),em=$('pcEmoji');
     $('pcWho').textContent=attacker+' → '+defender;
     $('pcName').textContent=PUN[weapon]?PUN[weapon][1]:weapon;
     $('pcDesc').textContent=desc;
     em.textContent=PUN[weapon]?PUN[weapon][0]:'⚔️';
     c.classList.remove('pop'); c.hidden=false; c.classList.add('pop'); sfx.pop();
     setTimeout(()=>c.hidden=true,1600);
  }

  UT.GameplayFeedback = { init: init, setCurrentMarker: setCurrentMarker, hideMarker: hideMarker, updateTurnMarkers: updateTurnMarkers, showPUCard: showPUCard, showAttackCard: showAttackCard };
})(window, document);
