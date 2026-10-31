/* Ular Tangga Blok — gameplay/ready.js (Stage 4.1.15: Ready Screen pra-game)
   Skrip klasik. Dimuat SETELAH gameplay/afk.js. Hanya presentasi + state `p.ready`; tidak memuat logic gameplay.
     UT.GameplayReady.show(players, opts) -> Promise
        players: array objek pemain existing ({name,key,css,cpu,...}); modul menulis p.ready / p.autoReady.
        opts.face(p) -> url wajah (faceURL existing) ; opts.sfx(name) opsional ; opts.seconds (default 10)
        Promise selesai saat SEMUA pemain READY (manual atau auto setelah 10 dtk), urutan diacak (p.turnOrder 1..n),
        dan layar ditutup; resolve(array pemain berurutan sesuai giliran). opts.rng(): pengganti Math.random untuk uji.
     UT.GameplayReady.cancel() — tutup + bersihkan semua timer (restart/unload). */
(function (win, doc) {
  'use strict';
  var UT = win.UT = win.UT || {};
  if (UT.GameplayReady && UT.GameplayReady.show) return;
  var A = function () { return UT.GameplayAFK; };
  var root = null, run = null;

  var CSS = '#readyScreen{position:fixed;inset:0;z-index:40;display:flex;overflow:auto;background:rgba(27,42,59,.78);' +
    'padding:calc(12px + env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px))}' +
    '#readyScreen .rd-box{margin:auto;width:min(560px,100%);background:#2a211b;border:4px solid #0f0b08;border-radius:8px;padding:14px 12px 16px;text-align:center;color:#fff;' +
    'box-shadow:inset 0 0 0 3px #6b5440;font-family:var(--font-display,inherit)}' +
    '#readyScreen h2{margin:0 0 4px;font-size:18px;letter-spacing:.06em;text-transform:uppercase;color:#FFC21A}' +
    '#readyScreen .rd-sub{margin:0 0 10px;font-size:11px;opacity:.85}' +
    '#readyScreen .rd-time{display:inline-block;min-width:54px;margin:0 0 12px;padding:6px 12px;font-size:22px;font-weight:700;background:#0f0b08;border:3px solid #6b5440;border-radius:6px;color:#fff}' +
    '#readyScreen .rd-time.low{color:#ff6b6b}' +
    '#readyScreen .rd-grid{display:grid;gap:8px;grid-template-columns:repeat(var(--cols,2),minmax(0,1fr))}' +
    '#readyScreen .rd-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 6px 10px;background:#3a2f27;border:3px solid #0f0b08;border-radius:6px;min-width:0}' +
    '#readyScreen .rd-ord{width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#FFC21A;background:#1b1612;border:3px dashed #6b5440;border-radius:4px}' +
    '#readyScreen .rd-ord.set{border-style:solid;border-color:#FFC21A}' +
    '#readyScreen .rd-st{font-size:11px;font-weight:700;letter-spacing:.05em;color:#ff8a8a}' +
    '#readyScreen .rd-card.ok .rd-st{color:#7ddc5a}' +
    '#readyScreen .rd-av{width:64px;height:64px;image-rendering:pixelated;border:3px solid var(--pc,#6b5440);border-radius:4px;background:#1b1612}' +
    '#readyScreen .rd-nm{max-width:100%;font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '#readyScreen .rd-btn{width:100%;min-height:44px;font-size:13px}' +
    '#readyScreen .rd-card.ok .rd-btn{background:#7ddc5a;color:#16300d}' +
    '@media (min-width:560px){#readyScreen .rd-grid.n4{--cols:4}}';

  function injectCSS() {
    if (doc.getElementById('readyCSS')) return;
    var s = doc.createElement('style'); s.id = 'readyCSS'; s.textContent = CSS; doc.head.appendChild(s);
  }
  function el(tag, cls, txt) { var e = doc.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function cancel() {
    if (run) { try { if (A()) run.ids.forEach(A().clear); } catch (e) {} if (run.anim) clearInterval(run.anim); var r = run; run = null; r.cancelled = true; }
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
  }

  function show(players, opts) {
    opts = opts || {};
    cancel(); injectCSS();
    var secs = opts.seconds || 10, n = players.length, ids = [], cards = [];
    var ctx = run = { ids: ids, cancelled: false };
    return new Promise(function (resolve) {
      players.forEach(function (p) { p.ready = false; p.autoReady = false; });
      root = el('section'); root.id = 'readyScreen'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Siap bermain');
      var box = el('div', 'rd-box'); root.appendChild(box);
      var title = el('h2', '', 'Siap main?'); box.appendChild(title);
      var sub = el('p', 'rd-sub', 'Tekan READY. Otomatis siap dalam ' + secs + ' detik.'); box.appendChild(sub);
      var time = el('div', 'rd-time', String(secs)); box.appendChild(time);
      var grid = el('div', 'rd-grid' + (n === 4 ? ' n4' : '')); grid.style.setProperty('--cols', n >= 3 ? (n === 3 ? 3 : 2) : 2); box.appendChild(grid);

      players.forEach(function (p, i) {
        var c = el('div', 'rd-card'); c.style.setProperty('--pc', p.css || '#6b5440');
        var ord = el('div', 'rd-ord', ''); var st = el('div', 'rd-st', 'NOT READY');
        var av = el('img', 'rd-av'); av.alt = ''; try { av.src = opts.face ? opts.face(p) : ''; } catch (e) {}
        var nm = el('div', 'rd-nm', p.name);
        var b = el('button', 'btn rd-btn', 'READY'); b.type = 'button';
        c.appendChild(ord); c.appendChild(st); c.appendChild(av); c.appendChild(nm); c.appendChild(b); grid.appendChild(c);
        cards.push({ p: p, c: c, st: st, b: b, ord: ord });
        b.addEventListener('click', function () { setReady(i, false); });
      });

      function setReady(i, auto) {
        if (ctx.cancelled) return; var k = cards[i]; if (!k || k.p.ready) return;
        k.p.ready = true; k.p.autoReady = !!auto; k.c.classList.add('ok'); k.st.textContent = 'READY'; k.b.disabled = true; k.b.textContent = auto ? 'AUTO' : 'SIAP';
        if (!auto && opts.sfx) { try { opts.sfx('pop'); } catch (e) {} }
        check();
      }
      var finished = false;
      function check() {
        if (finished || !players.every(function (p) { return p.ready; })) return;
        finished = true; A().clear('ready'); A().clear('ready-go');
        A().start('ready-go', 600, function () { if (ctx.cancelled) return; shuffle(); }); /* jeda singkat: semua READY terlihat dulu */
        ids.push('ready-go');
      }
      /* 4.1.15.5: animasi SHUFFLING singkat -> urutan final acak (Fisher-Yates). Hasil: p.turnOrder (1..n), dikembalikan sebagai array urut giliran. */
      function shuffle() {
        title.textContent = 'Shuffling...'; sub.textContent = 'Mengacak urutan giliran'; time.style.display = 'none';
        var perm = players.map(function (p, i) { return i + 1; });
        function scramble() {
          for (var j = perm.length - 1; j > 0; j--) { var r = Math.floor(Math.random() * (j + 1)), t = perm[j]; perm[j] = perm[r]; perm[r] = t; }
          cards.forEach(function (k, i) { k.ord.textContent = String(perm[i]); k.ord.classList.add('set'); k.c.style.order = String(perm[i]); });
        }
        scramble(); ctx.anim = setInterval(scramble, 120);
        A().start('ready-shuffle', 1500, function () {
          if (ctx.cancelled) return; clearInterval(ctx.anim); ctx.anim = null;
          var rng = opts.rng || Math.random, idx = players.map(function (p, i) { return i; });
          for (var j = idx.length - 1; j > 0; j--) { var r = Math.floor(rng() * (j + 1)), t = idx[j]; idx[j] = idx[r]; idx[r] = t; }
          var ordered = idx.map(function (pi, n) { var p = players[pi]; p.turnOrder = n + 1; return p; }); /* idx[n] = pemain yang main ke-(n+1) */
          cards.forEach(function (k) { k.ord.textContent = String(k.p.turnOrder); k.ord.classList.add('set'); k.c.style.order = String(k.p.turnOrder); });
          title.textContent = 'Urutan giliran'; sub.textContent = ordered.map(function (p, n) { return (n + 1) + '. ' + p.name; }).join('  ');
          A().start('ready-done', 1500, function () { if (ctx.cancelled) return; cancel(); resolve(ordered); });
        });
        ids.push('ready-shuffle'); ids.push('ready-done');
      }

      doc.body.appendChild(root);
      ids.push('ready');
      A().start('ready', secs * 1000, function () { cards.forEach(function (k, i) { setReady(i, true); }); }, function (s) {
        time.textContent = String(s); time.classList.toggle('low', s <= 3);
      });
      /* Computer tidak pernah jadi blocker: siap sendiri sesaat setelah layar tampil, lewat manajer timer yang sama. */
      players.forEach(function (p, i) {
        if (!p.cpu) return; var id = 'ready-cpu-' + i; ids.push(id);
        A().start(id, 500 + i * 250, function () { setReady(i, true); });
      });
      var first = cards.filter(function (k) { return !k.p.cpu; })[0]; if (first) { try { first.b.focus(); } catch (e) {} }
    });
  }
  UT.GameplayReady = { show: show, cancel: cancel };
})(window, document);
