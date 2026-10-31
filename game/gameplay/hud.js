/* Ular Tangga Blok — gameplay/hud.js (Stage 4.0.9: Gameplay HUD + event feedback)
   Skrip klasik (tanpa import/export/type=module). Dimuat dari gameplay.html SEBELUM blok skrip gameplay.
   Hanya PRESENTASI: tidak mengubah state, dadu, gerak, aturan, power, atau perhitungan naga.
   gameplay.html tetap source of truth; HUD mengikuti event yang sudah ada (bukan sebaliknya).
   Pemisahan: UT.Hud (game/hud/) = komponen UI umum; UT.GameplayHUD (file ini) = feedback khusus gameplay.
   Tidak membuat render loop, audio, atau listener dokumen. Semua timer dibersihkan oleh reset().
   API:
     UT.GameplayHUD.init({getGameId:fn, isPaused:fn})   — sekali; dipakai untuk membuang feedback basi
     UT.GameplayHUD.reset()                             — game baru/diulang: bersihkan timer + sembunyikan
     UT.GameplayHUD.showTurn(player, {extra})           — "Giliran X" / "Giliran Computer" / "Giliran tambahan!"
     UT.GameplayHUD.showEvent(kind, text, {ttl, gid})   — LEVEL 1: banner kecil non-blocking (role=status)
     UT.GameplayHUD.showPower(key, name, who, {text})   — LEVEL 1: "Pedang digunakan!" dst.
     UT.GameplayHUD.showCombat(att, def, text, {hp,maxHp,ttl,gid}) — strip combat + bar HP naga (opsional)
     UT.GameplayHUD.showResult(title, text, {ttl, gid}) — LEVEL 2: panel penting non-blocking (role=status)
     UT.GameplayHUD.updatePlayer(player)                — sinkronkan bar HP naga bila sedang tampil
   Prioritas banner (Stage 4.1.6, hanya presentasi, state ada di HUD ini):
     NORMAL    = kind 'turn' / 'extra' (showTurn)         — tidak boleh menimpa banner IMPORTANT yang masih aktif;
                                                            ditunda 1 slot (yang terbaru) lalu tampil saat IMPORTANT selesai
     IMPORTANT = semua kind lain (ladder, snake, mob, power, shield, dragon, chest, bounce, info)
                                                          — boleh menimpa NORMAL maupun IMPORTANT sebelumnya (event baru)
   Semua teks lewat textContent (tanpa HTML string). Elemen informasi tidak diberi role=button/tabindex. */
(function (win, doc) {
  'use strict';
  var UT = win.UT = win.UT || {};
  if (UT.GameplayHUD) return;

  var STYLE_ID = 'ut-ghud-css';
  var ICON = { turn: '🎲', extra: '✨', ladder: '🪜', snake: '🐍', mob: '👾', chest: '🎁', power: '⚡', three6: '🎲',
               bounce: '↩️', shield: '🛡️', dragon: '🐉', info: 'ℹ️' };
  var POWER_SHORT = { sword: ['🗡️', 'Pedang +3'], feather: ['🪶', 'Bulu — Giliran Tambahan'], tnt: ['🧨', 'TNT — Pemimpin −6'],
                      apple: ['🗿', 'Totem Undying — Kebal'], potion: ['🧪', 'Ramuan — Dadu 4–6'], grass: ['🟩', 'Blok Rumput — Tukar Posisi'] };
  var POWER_VERB = { sword: 'digunakan', feather: 'aktif', tnt: 'digunakan', apple: 'aktif', potion: 'aktif', grass: 'digunakan' };
  var cfg = { getGameId: null, isPaused: null };
  var root = null, banner = null, bIcon = null, bText = null, panel = null, pTitle = null, pText = null,
      combat = null, cWho = null, cText = null, cBar = null, cFill = null, cHp = null;
  var tBanner = 0, tPanel = 0, tCombat = 0;
  var NORMAL = { turn: 1, extra: 1 };
  var bPrio = '', pend = null; /* prioritas banner yang tampil ('normal'|'important'|'') + 1 slot feedback NORMAL tertunda */
  var combatOwner = null;

  function injectStyle() {
    if (doc.getElementById(STYLE_ID)) return;
    var s = doc.createElement('style'); s.id = STYLE_ID;
    s.textContent =
      '.ut-ghud{position:fixed;left:50%;top:calc(58px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:14;' +
      'width:min(92vw,420px);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}' +
      '.ut-ghud [hidden]{display:none!important}' +
      '.ut-ghud-b,.ut-ghud-c{box-sizing:border-box;max-width:100%;display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:16px;' +
      'color:#fff;font-family:var(--font-display,"Baloo 2","Nunito",sans-serif);font-weight:800;font-size:14px;line-height:1.25;text-align:left;' +
      'background:linear-gradient(#3b9cf8,#2a86ee);box-shadow:0 4px 0 rgba(0,0,0,.45),inset 0 0 0 3px #ffe36a,0 6px 14px rgba(0,0,0,.25);' +
      'overflow-wrap:anywhere;animation:utghin .22s ease-out}' +
      '.ut-ghud-b i{font-style:normal;font-size:20px;line-height:1;flex:none}' +
      '.ut-ghud-b[data-k=snake],.ut-ghud-c{background:linear-gradient(#ef5a5a,#c93636)}' +
      '.ut-ghud-b[data-k=ladder]{background:linear-gradient(#4cc46a,#2f9f4d)}' +
      '.ut-ghud-b[data-k=mob]{background:linear-gradient(#a06be0,#7b45c4)}' +
      '.ut-ghud-b[data-k=three6],.ut-ghud-b[data-k=bounce]{background:linear-gradient(#ffb23f,#ee8a14)}' +
      '.ut-ghud-b[data-k=turn],.ut-ghud-b[data-k=extra]{font-size:13px;padding:6px 12px}' +
      '.ut-ghud-c{flex-direction:column;align-items:stretch;gap:4px;width:100%}' +
      '.ut-ghud-c p{margin:0}.ut-ghud-cw{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#ffe9e9}' +
      '.ut-ghud-bar{height:12px;border-radius:6px;background:rgba(0,0,0,.4);overflow:hidden;box-shadow:inset 0 0 0 2px rgba(0,0,0,.35)}' +
      '.ut-ghud-bar b{display:block;height:100%;width:100%;background:linear-gradient(#c9a2ff,#8f5fe0);transition:width .35s ease}' +
      '.ut-ghud-hp{font-size:12px;color:#f3e8ff}' +
      '.ut-ghud-p{box-sizing:border-box;width:100%;text-align:center;padding:14px 18px 16px;border-radius:22px;color:#fff;' +
      'background:linear-gradient(#3b9cf8,#2a86ee);box-shadow:0 7px 0 rgba(0,0,0,.5),inset 0 0 0 4px #ffe36a,0 0 24px rgba(255,210,77,.55);animation:utghpop .3s ease-out}' +
      '.ut-ghud-p h4{margin:0;font-family:var(--font-display,"Baloo 2",sans-serif);font-size:20px;color:#ffe36a;text-transform:uppercase;overflow-wrap:anywhere}' +
      '.ut-ghud-p p{margin:4px 0 0;font-size:13px;font-weight:700;overflow-wrap:anywhere}' +
      '@keyframes utghin{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}' +
      '@keyframes utghpop{0%{opacity:0;transform:scale(.85)}60%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}' +
      '@media(max-width:699px){.ut-ghud{top:calc(54px + env(safe-area-inset-top,0px))}.ut-ghud-b,.ut-ghud-c{font-size:13px;padding:7px 12px}}' +
      '@media(prefers-reduced-motion:reduce){.ut-ghud-b,.ut-ghud-c,.ut-ghud-p{animation:none}.ut-ghud-bar b{transition:none}}';
    (doc.head || doc.documentElement).appendChild(s);
  }

  function el(tag, cls, parent) {
    var e = doc.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e;
  }

  function build() {
    if (root) return true;
    if (!doc.body) return false;
    injectStyle();
    root = el('div', 'ut-ghud', doc.body);
    root.id = 'utGameplayHud';
    /* Level 1: banner non-blocking */
    banner = el('div', 'ut-ghud-b', root); banner.hidden = true;
    banner.setAttribute('role', 'status'); banner.setAttribute('aria-live', 'polite');
    bIcon = el('i', '', banner); bIcon.setAttribute('aria-hidden', 'true');
    bText = el('span', '', banner);
    /* Combat strip */
    combat = el('div', 'ut-ghud-c', root); combat.hidden = true;
    combat.setAttribute('role', 'status'); combat.setAttribute('aria-live', 'polite');
    cWho = el('p', 'ut-ghud-cw', combat); cText = el('p', '', combat);
    cBar = el('div', 'ut-ghud-bar', combat); cBar.hidden = true; cFill = el('b', '', cBar);
    cHp = el('p', 'ut-ghud-hp', combat); cHp.hidden = true;
    /* Level 2: panel penting (otomatis hilang, tidak memblokir input => role=status, bukan dialog) */
    panel = el('div', 'ut-ghud-p', root); panel.hidden = true;
    panel.setAttribute('role', 'status'); panel.setAttribute('aria-live', 'assertive');
    pTitle = el('h4', '', panel); pText = el('p', '', panel);
    return true;
  }

  function stale(o) {
    if (!o || o.gid === undefined || typeof cfg.getGameId !== 'function') return false;
    try { return cfg.getGameId() !== o.gid; } catch (e) { return false; }
  }
  function ttlOf(o, d) { var t = o && +o.ttl; return t > 0 ? t : d; }

  function hideBanner() { clearTimeout(tBanner); tBanner = 0; bPrio = ''; if (banner) banner.hidden = true; }
  /* Banner habis waktu: sembunyikan, lalu tampilkan feedback NORMAL yang tertunda (bila ada). */
  function expireBanner() {
    hideBanner();
    if (pend) { var q = pend; pend = null; H.showEvent(q.kind, q.text, q.o); }
  }
  function hidePanel() { clearTimeout(tPanel); tPanel = 0; if (panel) panel.hidden = true; }
  function hideCombat() { clearTimeout(tCombat); tCombat = 0; combatOwner = null; if (combat) combat.hidden = true; }

  function retrigger(node) { node.hidden = true; void node.offsetWidth; node.hidden = false; }

  var H = {
    init: function (o) {
      o = o || {};
      if (typeof o.getGameId === 'function') cfg.getGameId = o.getGameId;
      if (typeof o.isPaused === 'function') cfg.isPaused = o.isPaused;
      build();
      return H;
    },
    reset: function () {
      pend = null; hideBanner(); hidePanel(); hideCombat();
      return H;
    },
    showEvent: function (kind, text, o) {
      if (!text || stale(o) || !build()) return H;
      var k = ICON[kind] ? kind : 'info', normal = !!NORMAL[k];
      if (normal && bPrio === 'important' && !banner.hidden) { pend = { kind: kind, text: text, o: o }; return H; } /* tunda, jangan timpa IMPORTANT */
      bPrio = normal ? 'normal' : 'important';
      banner.setAttribute('data-k', k);
      bIcon.textContent = (o && o.icon) || ICON[k]; bText.textContent = String(text);
      clearTimeout(tBanner); retrigger(banner);
      tBanner = setTimeout(expireBanner, ttlOf(o, 2000));
      return H;
    },
    showTurn: function (p, o) {
      if (!p) return H;
      if (o && o.extra) return H.showEvent('extra', 'Giliran tambahan!', { ttl: 1600 });
      return H.showEvent('turn', p.cpu ? 'Giliran Computer' : 'Giliran ' + p.name, { ttl: 1200 });
    },
    showPower: function (key, name, who, o) {
      if (o && o.text) return H.showEvent('power', String(o.text), { ttl: 1800, icon: (POWER_SHORT[key] || [])[0] }); /* pesan kustom (mis. Power ditolak) */
      /* Feedback ringkas "<ikon> Nama — efek". Bukan modal; modal hadiah khusus Chest (#puCard di gameplay.html). */
      var s = POWER_SHORT[key], who_ = who ? ' (' + who + ')' : '';
      if (s) return H.showEvent('power', s[1] + who_, { ttl: 1800, icon: s[0] });
      var v = POWER_VERB[key] || 'digunakan';
      return H.showEvent('power', (name || key) + ' ' + v + '!' + who_, { ttl: 1800 });
    },
    showCombat: function (att, def, text, o) {
      if (stale(o) || !build()) return H;
      cWho.textContent = (att || '') + (def ? ' → ' + def : '');
      cText.textContent = text ? String(text) : '';
      var hp = o && typeof o.hp === 'number' ? Math.max(0, Math.min(100, o.hp)) : null, mx = (o && o.maxHp) || 100;
      if (hp === null) { cBar.hidden = true; cHp.hidden = true; }
      else {
        cFill.style.width = Math.max(0, Math.min(100, hp / mx * 100)) + '%';
        cHp.textContent = 'Ender Dragon: ' + hp + '/' + mx; cBar.hidden = false; cHp.hidden = false;
      }
      combatOwner = o && o.owner ? o.owner : null;
      clearTimeout(tCombat); retrigger(combat);
      tCombat = setTimeout(hideCombat, ttlOf(o, 2200));
      return H;
    },
    showResult: function (title, text, o) {
      if (!title || stale(o) || !build()) return H;
      pTitle.textContent = String(title); pText.textContent = text ? String(text) : ''; pText.hidden = !text;
      clearTimeout(tPanel); retrigger(panel);
      tPanel = setTimeout(hidePanel, ttlOf(o, 2400));
      return H;
    },
    updatePlayer: function (p) {
      /* Hanya menyegarkan bar HP naga bila combat strip sedang tampil untuk pemain ini. */
      if (!p || !combat || combat.hidden || typeof p.dhp !== 'number') return H;
      if (combatOwner !== null && combatOwner !== p.name) return H;
      cFill.style.width = Math.max(0, Math.min(100, p.dhp)) + '%'; cHp.textContent = 'Ender Dragon: ' + p.dhp + '/100';
      return H;
    }
  };

  UT.GameplayHUD = H;
})(window, document);
