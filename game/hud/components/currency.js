/* Ular Tangga Blok — hud/components/currency.js (Stage 4.0.5: komponen Currency reusable)
   Skrip klasik (tanpa import/export/type=module). Urutan muat: app.js -> hud/ui-core.js -> hud/components/currency.js.
   Mendaftar ke registry UT.Hud (dibuat di ui-core.js); TIDAK membuat sistem UI kedua.
   Pakai:  var el = UT.Hud.create('currency', { type:'coin', value:8450, size:'lg' });
           parent.appendChild(el);
   Opsi: type (gem|coin; lainnya -> gem), value (angka / string angka), size (sm|md|lg; lainnya -> md),
         className, ariaLabel.
   Hasil: <span class="ut-currency ut-currency-<type> ut-currency-<size>">
            <span class="ut-currency-icon"><svg/></span><span class="ut-currency-value">…</span></span>
   Komponen hanya MENAMPILKAN value yang diberikan (apa adanya, tanpa format ribuan; pemanggil yang memformat).
   Tidak membaca/menulis PlayerData maupun localStorage. Bukan elemen interaktif: tanpa tabindex, tanpa role.
   Semua isi dibuat lewat DOM/SVG API + textContent; tidak ada HTML string.
   Stylesheet hud/components/currency.css dimuat otomatis (di samping currency.js) bila belum ada;
   halaman juga boleh memasang <link> sendiri dengan id="ut-currency-css". */
(function (win, doc) {
  'use strict';

  var UT = win.UT;
  /* Dependensi wajib: gagal jelas & aman, tanpa membuat fallback registry. */
  if (!UT || !UT.Hud || typeof UT.Hud.register !== 'function') {
    if (win.console && win.console.error) {
      win.console.error('[UT.Hud] currency.js: UT.Hud belum tersedia. Muat hud/ui-core.js sebelum hud/components/currency.js.');
    }
    return;
  }
  /* Idempotent: registrasi pertama dipertahankan. */
  if (UT.Hud.has('currency')) return;

  var TYPES = ['gem', 'coin'];
  var SIZES = ['sm', 'md', 'lg'];
  var CSS_ID = 'ut-currency-css';
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function pick(value, list, fallback) {
    return list.indexOf(value) !== -1 ? value : fallback;
  }

  /* Muat currency.css (satu kali) dari folder yang sama dengan currency.js. */
  function ensureStyles(script) {
    if (doc.getElementById(CSS_ID)) return;
    var src = script && script.src;
    if (!src) return;
    var href = src.replace(/currency\.js(\?.*)?$/, 'currency.css');
    if (href === src) return;
    var link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.id = CSS_ID;
    link.href = href;
    (doc.head || doc.documentElement).appendChild(link);
  }
  ensureStyles(doc.currentScript);

  /* Helper SVG (DOM API). */
  function svgEl(name, attrs) {
    var n = doc.createElementNS(SVG_NS, name);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
    }
    return n;
  }

  /* Ikon dibuat dari DOM API; bentuk & warna sama dengan ikon gem/coin yang sudah dipakai halaman (hasil audit). */
  function buildIcon(type) {
    var svg = svgEl('svg', { viewBox: '0 0 24 24', focusable: 'false', 'aria-hidden': 'true' });
    if (type === 'coin') {
      svg.appendChild(svgEl('circle', { cx: '12', cy: '12', r: '10', fill: '#ffc83a', stroke: '#c98a0c', 'stroke-width': '1.5' }));
      svg.appendChild(svgEl('circle', { cx: '12', cy: '12', r: '7.5', fill: 'none', stroke: '#ffe27a', 'stroke-width': '1' }));
      var t = svgEl('text', { x: '12', y: '17', 'font-size': '13', 'font-weight': '900', 'text-anchor': 'middle', fill: '#c98a0c' });
      t.textContent = '$';
      svg.appendChild(t);
    } else {
      svg.appendChild(svgEl('path', { d: 'M6 3h12l4 6-10 12L2 9z', fill: '#4cc9ff', stroke: '#1d7fd0', 'stroke-width': '1.2', 'stroke-linejoin': 'round' }));
      svg.appendChild(svgEl('path', { d: 'M2 9h20M9 3l-2 6 5 12 5-12-2-6', fill: 'none', stroke: '#bff0ff', 'stroke-width': '.8' }));
    }
    return svg;
  }

  function create(opts) {
    opts = opts || {};
    var type = pick(opts.type, TYPES, 'gem');
    var size = pick(opts.size, SIZES, 'md');

    var el = doc.createElement('span');
    el.className = 'ut-currency ut-currency-' + type + ' ut-currency-' + size;
    if (typeof opts.className === 'string') {
      opts.className.split(/\s+/).forEach(function (c) { if (c) el.classList.add(c); });
    }
    if (opts.ariaLabel) el.setAttribute('aria-label', String(opts.ariaLabel));

    var icon = doc.createElement('span');
    icon.className = 'ut-currency-icon';
    icon.appendChild(buildIcon(type));

    var val = doc.createElement('span');
    val.className = 'ut-currency-value';
    val.textContent = opts.value == null ? '0' : String(opts.value); /* textContent: value tidak pernah dibaca sebagai HTML */

    el.appendChild(icon);
    el.appendChild(val);
    return el;
  }

  UT.Hud.register('currency', {
    create: create,
    types: TYPES.slice(),
    sizes: SIZES.slice()
  });
})(window, document);
