/* Data pemain bersama — dibaca/ditulis oleh SEMUA halaman lewat objek ini.
   Penyimpanan: localStorage["ularTanggaBlok:player:v1"] (hanya di browser ini, tanpa sinkronisasi server).
   Butuh: item-catalog.js dimuat lebih dulu. */
(function (g) {
  'use strict';
  var C = g.ItemCatalog;
  var KEY = 'ularTanggaBlok:player:v1';
  var SCHEMA = 1;
  var START_COINS = 1000; /* saldo awal SEKALI saat data dibuat; tidak ada koin gratis berulang */

  var memState = null;     /* cadangan di memori jika localStorage tidak bisa dipakai */
  var persistent = probe();
  var listeners = [];

  function probe() {
    try { var k = KEY + ':probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; }
    catch (e) { return false; }
  }
  function rawGet() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function rawSet(s) { try { localStorage.setItem(KEY, s); return true; } catch (e) { return false; } }
  function legacyGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function legacySet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- Pembuatan data awal ---------- */
  function freshState() {
    var now = Date.now(), seq = 0, inv = {};
    C.starters().forEach(function (it) { inv[it.id] = { qty: 1, acquiredAt: now, seq: seq++ }; });
    var st = { schema: SCHEMA, createdAt: now, coins: START_COINS, nextSeq: seq,
               inventory: inv, equipped: clone(C.defaultEquipped) };
    migrateLegacy(st);
    return st;
  }

  /* Migrasi aman: pilihan dadu/tema lama (ut-dadu, ut-tema2) dulu gratis — pertahankan sebagai milik pemain. */
  function migrateLegacy(st) {
    [['dice', 'ut-dadu'], ['theme', 'ut-tema2']].forEach(function (p) {
      var it = C.byGameKey(p[0], legacyGet(p[1]) || '');
      if (!it) return;
      if (!st.inventory[it.id]) st.inventory[it.id] = { qty: 1, acquiredAt: st.createdAt, seq: st.nextSeq++ };
      st.equipped[p[0]] = it.id;
    });
  }

  /* ---------- Validasi & normalisasi (tidak membuang data yang tak dikenal) ---------- */
  function sanitize(o) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    var now = Date.now();
    var st = {
      schema: SCHEMA,
      createdAt: isFinite(o.createdAt) ? +o.createdAt : now,
      coins: (isFinite(o.coins) && o.coins >= 0) ? Math.floor(o.coins) : 0,
      nextSeq: 0, inventory: {}, equipped: {}
    };
    var inv = (o.inventory && typeof o.inventory === 'object' && !Array.isArray(o.inventory)) ? o.inventory : {};
    var maxSeq = -1;
    Object.keys(inv).forEach(function (id) {
      var e = inv[id]; if (!e || typeof e !== 'object') return;
      var it = C.byId(id);
      var qty = Math.floor(+e.qty); if (!(qty >= 1)) qty = 1;
      if (it && !it.stackable) qty = 1;
      var seq = Math.floor(+e.seq); if (!(seq >= 0)) seq = maxSeq + 1;
      if (seq > maxSeq) maxSeq = seq;
      st.inventory[id] = { qty: qty, acquiredAt: isFinite(e.acquiredAt) ? +e.acquiredAt : st.createdAt, seq: seq };
    });
    st.nextSeq = Math.max(maxSeq + 1, Math.floor(+o.nextSeq) || 0);
    C.starters().forEach(function (it) { /* item awal tidak pernah hilang */
      if (!st.inventory[it.id]) st.inventory[it.id] = { qty: 1, acquiredAt: st.createdAt, seq: st.nextSeq++ };
    });
    var eq = (o.equipped && typeof o.equipped === 'object') ? o.equipped : {};
    ['skin', 'dice', 'theme'].forEach(function (slot) {
      var it = C.byId(eq[slot]);
      st.equipped[slot] = (it && it.slot === slot && st.inventory[it.id]) ? it.id : C.defaultEquipped[slot];
    });
    return st;
  }

  function write(st) {
    if (!persistent) { memState = clone(st); return true; }
    if (!rawSet(JSON.stringify(st))) return false;
    memState = null;
    return true;
  }

  function mirrorLegacy(st) { /* kompatibilitas: gameplay.html lama membaca kunci ini */
    var d = C.byId(st.equipped.dice), t = C.byId(st.equipped.theme);
    if (d) legacySet('ut-dadu', d.gameKey);
    if (t) legacySet('ut-tema2', t.gameKey);
  }

  /* ---------- Baca ---------- */
  function load() {
    if (!persistent) {
      if (!memState) { memState = freshState(); }
      return clone(memState);
    }
    var raw = rawGet();
    if (raw === null) {
      var st0 = freshState();
      if (!write(st0)) { persistent = false; memState = clone(st0); }
      return st0;
    }
    var parsed = null;
    try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
    var st = sanitize(parsed);
    if (!st) { /* rusak: cadangkan dulu, lalu mulai bersih — tidak menghapus apa pun */
      try { localStorage.setItem(KEY + ':corrupt:' + Date.now(), raw); } catch (e) {}
      st = freshState(); write(st);
    }
    return st;
  }

  function notify(reason) {
    listeners.slice().forEach(function (fn) { try { fn(reason); } catch (e) {} });
  }

  /* ---------- API publik ---------- */
  var API = {
    key: KEY,
    startCoins: START_COINS,
    get persistent() { return persistent; },
    snapshot: function () { return load(); },
    coins: function () { return load().coins; },
    owns: function (id) { return !!load().inventory[id]; },
    qty: function (id) { var e = load().inventory[id]; return e ? e.qty : 0; },
    equippedId: function (slot) { return load().equipped[slot] || null; },
    isEquipped: function (id) { var it = C.byId(id); return !!it && load().equipped[it.slot] === id; },

    /* Daftar item yang dimiliki: [{item, qty, acquiredAt, seq, equipped}] — hanya id yang ada di katalog */
    ownedItems: function () {
      var st = load();
      return Object.keys(st.inventory).map(function (id) {
        var it = C.byId(id); if (!it) return null;
        var e = st.inventory[id];
        return { item: it, qty: e.qty, acquiredAt: e.acquiredAt, seq: e.seq, equipped: st.equipped[it.slot] === id };
      }).filter(Boolean);
    },
    ownedCount: function () { return API.ownedItems().length; },

    /* Pakai item yang dimiliki. Return {ok, reason?} */
    equip: function (id) {
      var it = C.byId(id);
      if (!it) return { ok: false, reason: 'tidak-dikenal' };
      var st = load();
      if (!st.inventory[id]) return { ok: false, reason: 'belum-dimiliki' };
      st.equipped[it.slot] = id;
      if (!write(st)) return { ok: false, reason: 'gagal-simpan' };
      mirrorLegacy(st); notify('equip');
      return { ok: true, item: it };
    },

    /* Pembelian atomik: semua validasi dulu, baru ubah saldo + inventory dalam SATU penulisan. */
    purchase: function (id) {
      var it = C.byId(id);
      if (!it || it.starter || !(it.price > 0)) return { ok: false, reason: 'tidak-tersedia' };
      var st = load();
      if (st.inventory[id] && !it.stackable) return { ok: false, reason: 'sudah-dimiliki', item: it };
      if (st.coins < it.price) return { ok: false, reason: 'saldo-kurang', item: it, kurang: it.price - st.coins };
      var before = st.coins;
      st.coins = before - it.price;
      var cur = st.inventory[id];
      st.inventory[id] = cur ? { qty: cur.qty + 1, acquiredAt: cur.acquiredAt, seq: cur.seq }
                             : { qty: 1, acquiredAt: Date.now(), seq: st.nextSeq++ };
      if (!write(st)) return { ok: false, reason: 'gagal-simpan', item: it };
      notify('purchase');
      return { ok: true, item: it, coins: st.coins, spent: it.price };
    },

    /* Langganan perubahan (halaman ini + tab/halaman lain). Mengembalikan fungsi berhenti. */
    subscribe: function (fn) {
      listeners.push(fn);
      return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
    }
  };

  g.addEventListener('storage', function (e) {
    if (e.key === KEY || e.key === null) notify('storage');
  });
  g.addEventListener('pageshow', function (e) { if (e.persisted) notify('pageshow'); }); /* bfcache saat tombol kembali */

  g.PlayerData = API;
  load(); /* pastikan data awal/migrasi dibuat sekali, tanpa me-reset data yang sudah ada */
})(window);
