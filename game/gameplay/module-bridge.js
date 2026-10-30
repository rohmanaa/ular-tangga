/* Ular Tangga Blok — gameplay/module-bridge.js (Stage 4.1.2: Gameplay module bridge)
   Skrip klasik (tanpa import/export/type=module). Dimuat dari gameplay.html SETELAH app.js
   dan SEBELUM gameplay/hud.js serta blok skrip gameplay inline.
   HANYA namespace: tidak ada logic, data, atau state gameplay di sini.
   gameplay.html tetap source of truth; extraction dilakukan di sub-step berikutnya.
   Idempotent: aman dimuat lebih dari sekali, tidak menimpa object yang sudah ada
   (termasuk UT.GameplayHUD dan modul yang sudah terdaftar).
   Namespace (boleh kosong):
     UT.Gameplay.Config / Rules / Themes / Audio / Dice / FX /
     UT.Gameplay.Geometry / Pawn / Camera / Dragon / Core
   API minimal:
     UT.Gameplay.registerModule(name, api) — isi namespace yang masih kosong dengan api; false bila
                                              nama tidak dikenal/api bukan object/namespace sudah terisi
     UT.Gameplay.hasModule(name)           — true bila namespace sudah terisi (bukan sekadar ada)
   Tidak mengekspos players, scene, renderer, camera, dan tidak membuat UT.Gameplay.State. */
(function (win) {
  'use strict';
  var UT = win.UT = win.UT || {};
  var G = UT.Gameplay = UT.Gameplay || {};

  var NAMES = ['Config', 'Rules', 'Themes', 'Audio', 'Dice', 'FX',
               'Geometry', 'Pawn', 'Camera', 'Dragon', 'Core'];
  for (var i = 0; i < NAMES.length; i++) {
    G[NAMES[i]] = G[NAMES[i]] || {};
  }

  function isModuleName(name) {
    return typeof name === 'string' && NAMES.indexOf(name) !== -1;
  }
  function isFilled(obj) {
    return !!obj && Object.keys(obj).length > 0;
  }

  if (typeof G.registerModule !== 'function') {
    G.registerModule = function (name, api) {
      if (!isModuleName(name) || !api || typeof api !== 'object') return false;
      var slot = G[name];
      if (isFilled(slot)) return false;
      for (var k in api) {
        if (Object.prototype.hasOwnProperty.call(api, k)) slot[k] = api[k];
      }
      return true;
    };
  }

  if (typeof G.hasModule !== 'function') {
    G.hasModule = function (name) {
      return isModuleName(name) && isFilled(G[name]);
    };
  }
})(window);
