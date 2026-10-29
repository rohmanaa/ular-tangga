/* Jembatan data pemain -> gameplay.html. Dimuat SEBELUM skrip game; tidak mengubah logika game.
   Tugas: pastikan konfigurasi awal (URL/sessionStorage "ut-config") hanya memakai skin, tema, dan
   dadu yang DIMILIKI pemain, dan isi default dari item yang sedang dipakai bila game dibuka langsung.
   gameplay.html membaca konfigurasi lewat readLobbyConfig(); di sini hanya URL/ut-config yang dinormalisasi. */
(function () {
  'use strict';
  var PD = window.PlayerData, IC = window.ItemCatalog;
  if (!PD || !IC) return;

  var MODES = ['cpu', '2', '3', '4'];
  function eqKey(slot) { var it = IC.byId(PD.equippedId(slot)); return it ? it.gameKey : null; }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  try {
    var q = new URLSearchParams(location.search), ss = null;
    try { ss = JSON.parse(sessionStorage.getItem('ut-config') || 'null'); } catch (e) { ss = null; }
    if (!ss || typeof ss !== 'object') ss = null;

    var mode = q.get('mode'); if (MODES.indexOf(mode) < 0) mode = ss && MODES.indexOf(ss.mode) > -1 ? ss.mode : 'cpu';
    var rawSkins = q.get('skins') !== null ? q.get('skins') : (ss && Array.isArray(ss.skins) ? ss.skins.join(',') : '');
    var skins = uniq(String(rawSkins).split(',').map(function (s) { return s.trim(); })
      .filter(function (k) { return k && PD.owns('skin.' + k); }));
    var need = mode === 'cpu' ? 1 : +mode;
    var ownedSkins = PD.ownedItems().filter(function (o) { return o.item.kind === 'skin'; })
      .sort(function (a, b) { return a.seq - b.seq; }).map(function (o) { return o.item.gameKey; });
    if (!skins.length && eqKey('skin')) skins.push(eqKey('skin'));       /* Pemain 1 = skin aktif */
    /* Mode CPU: skin CPU (indeks 1) boleh bebas, jadi pertahankan apa yang dikirim lobi */
    if (mode === 'cpu') {
      var cpuSkin = String(rawSkins).split(',').map(function (s) { return s.trim(); })[1];
      if (cpuSkin && cpuSkin !== skins[0] && ['steve','alex','creeper','ender','zombie','skeleton'].indexOf(cpuSkin) > -1) skins = [skins[0], cpuSkin];
    } else {
      ownedSkins.forEach(function (k) { if (skins.length < need && skins.indexOf(k) < 0) skins.push(k); });
      skins = skins.slice(0, need);
    }

    var theme = q.get('theme') || (ss && ss.theme) || '';
    if (!PD.owns('theme.' + theme)) theme = eqKey('theme') || 'minecraft';
    var dice = q.get('dice') || (ss && ss.dice) || '';
    if (!PD.owns('dice.' + dice)) dice = eqKey('dice') || 'klasik';
    var night = q.get('night'); if (night !== '0' && night !== '1') night = ss && (ss.night === '0' || ss.night === '1') ? ss.night : null;

    var out = { mode: mode, skins: skins, theme: theme, dice: dice };
    if (night !== null) out.night = night;
    var np = new URLSearchParams({ mode: mode, skins: skins.join(','), theme: theme, dice: dice });
    if (night !== null) np.set('night', night);
    history.replaceState(null, '', location.pathname + '?' + np.toString());
    try { sessionStorage.setItem('ut-config', JSON.stringify(out)); } catch (e) {}
    window.__utConfig = out; /* untuk pengujian/diagnostik */
  } catch (e) { /* jangan pernah menghalangi game */ }
})();
