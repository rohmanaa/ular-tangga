/* Ular Tangga Blok — gameplay/afk.js (Stage 4.1.15: timer AFK / auto-action)
   Skrip klasik (tanpa import/export). Dimuat SEBELUM gameplay/ready.js dan blok skrip gameplay inline.
   HANYA manajer timer: satu timer aktif per id (start dengan id yang sama menggantikan yang lama),
   tidak ada state gameplay, tidak menyentuh DOM. Aman bila dimuat berkali-kali.
     UT.GameplayAFK.start(id, ms, onTimeout, onTick) -> id   (onTick(detikSisa) tiap detik berubah)
     UT.GameplayAFK.clear(id) / clearAll() / has(id) / remaining(id) (detik) */
(function (win) {
  'use strict';
  var UT = win.UT = win.UT || {};
  if (UT.GameplayAFK && UT.GameplayAFK.start) return;
  var T = {}; /* id -> {h, end, last, cb, tick} */

  function clear(id) { var t = T[id]; if (!t) return false; clearInterval(t.h); delete T[id]; return true; }
  function clearAll() { Object.keys(T).forEach(clear); }
  function start(id, ms, onTimeout, onTick) {
    clear(id);
    var t = T[id] = { end: Date.now() + ms, last: -1, cb: onTimeout, tick: onTick };
    function step() {
      if (T[id] !== t) return;
      var left = Math.max(0, t.end - Date.now()), s = Math.ceil(left / 1000);
      if (s !== t.last) { t.last = s; if (t.tick) { try { t.tick(s); } catch (e) { console.error(e); } } }
      if (left <= 0) { clear(id); try { if (t.cb) t.cb(); } catch (e) { console.error(e); } }
    }
    t.h = setInterval(step, 200); step();
    return id;
  }
  function remaining(id) { var t = T[id]; return t ? Math.max(0, Math.ceil((t.end - Date.now()) / 1000)) : 0; }
  try { win.addEventListener('pagehide', clearAll); } catch (e) {}
  UT.GameplayAFK = { start: start, clear: clear, clearAll: clearAll, has: function (id) { return !!T[id]; }, remaining: remaining };
})(window);
