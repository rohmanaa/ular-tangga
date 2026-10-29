/* Utilitas UI bersama: pembuat elemen aman, toast, modal, lencana koin, tanggal.
   Teks dari pengguna/data selalu lewat textContent (bukan innerHTML). */
(function (g) {
  'use strict';
  var C = g.ItemCatalog, PD = g.PlayerData;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'on') Object.keys(v).forEach(function (ev) { n.addEventListener(ev, v[ev]); });
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  function fmt(n) { return Number(n).toLocaleString('id-ID'); }
  function fmtDate(ts) {
    try { return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return ''; }
  }

  /* Ikon koin (blok emas) */
  var COIN_SVG = '<svg class="coin-ico" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">' +
    '<rect x="2" y="0" width="8" height="12" fill="#6b4a00"/><rect x="0" y="2" width="12" height="8" fill="#6b4a00"/>' +
    '<rect x="2" y="1" width="8" height="10" fill="#ffd23f"/><rect x="1" y="2" width="10" height="8" fill="#ffd23f"/>' +
    '<rect x="3" y="2" width="6" height="1" fill="#fff3b0"/><rect x="5" y="4" width="2" height="4" fill="#b8860b"/></svg>';

  function coinSpan(n, cls) {
    var s = el('span', { class: 'coin ' + (cls || '') });
    s.insertAdjacentHTML('afterbegin', COIN_SVG);
    s.appendChild(el('span', { class: 'coin-num', text: fmt(n) }));
    return s;
  }

  function rarityBadge(key) {
    var r = C.RARITY[key] || C.RARITY.common;
    return el('span', { class: 'rar rar-' + r.key }, [el('span', { class: 'rar-stars', 'aria-hidden': 'true', text: r.stars }), r.label]);
  }

  /* ---------- Toast ---------- */
  var toastBox = null;
  function toast(msg, type) {
    if (!toastBox) {
      toastBox = el('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(toastBox);
    }
    var t = el('div', { class: 'toast toast-' + (type || 'info') }, [
      el('span', { class: 'toast-tag', text: type === 'error' ? 'Gagal' : type === 'ok' ? 'Berhasil' : 'Info' }),
      el('span', { text: msg })
    ]);
    toastBox.appendChild(t);
    while (toastBox.children.length > 3) toastBox.removeChild(toastBox.firstChild);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 4200);
  }

  /* ---------- Modal (di bawah bottom-nav agar navigasi tetap terlihat) ---------- */
  var openModalEl = null, lastFocus = null;
  function closeModal() {
    if (!openModalEl) return;
    var m = openModalEl; openModalEl = null;
    m.remove(); document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', onKey, true);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  function onKey(e) {
    if (!openModalEl) return;
    if (e.key === 'Escape') { e.stopPropagation(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    var f = openModalEl.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openModal(title, bodyNode, opts) {
    closeModal();
    opts = opts || {};
    lastFocus = document.activeElement;
    var titleId = 'mt-' + Math.random().toString(36).slice(2, 7);
    var close = el('button', { class: 'btn small light modal-x', type: 'button', 'aria-label': 'Tutup', on: { click: closeModal } }, ['Tutup']);
    var box = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId }, [
      el('div', { class: 'modal-head' }, [el('h2', { id: titleId, text: title }), close]),
      el('div', { class: 'modal-body' }, [bodyNode])
    ]);
    var back = el('div', { class: 'modal-back', on: { mousedown: function (e) { if (e.target === back) closeModal(); } } }, [box]);
    document.body.appendChild(back);
    document.body.classList.add('modal-open');
    openModalEl = back;
    document.addEventListener('keydown', onKey, true);
    var focusTarget = (opts.focus && box.querySelector(opts.focus)) || close;
    focusTarget.focus();
    return { close: closeModal, node: box };
  }

  /* ---------- Lencana koin di header (hidup: ikut berubah saat data berubah) ---------- */
  function bindCoinChip(node) {
    if (!node) return;
    function render() {
      node.textContent = '';
      node.insertAdjacentHTML('afterbegin', COIN_SVG);
      node.appendChild(el('span', { class: 'coin-num', text: fmt(PD.coins()) }));
      node.setAttribute('aria-label', 'Saldo koin: ' + fmt(PD.coins()));
    }
    render(); PD.subscribe(render);
  }

  /* Peringatan jika browser tidak mengizinkan penyimpanan lokal */
  function storageNotice() {
    if (PD.persistent) return;
    var main = document.querySelector('main'); if (!main) return;
    main.insertBefore(el('p', { class: 'notice warn', role: 'alert',
      text: 'Penyimpanan browser tidak tersedia, jadi saldo dan item hanya bertahan selama halaman ini terbuka. Coba buka lewat server lokal atau jendela non-privat.' }), main.firstChild);
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindCoinChip(document.getElementById('coinChip'));
    storageNotice();
  });

  g.UI = { el: el, fmt: fmt, fmtDate: fmtDate, coinSpan: coinSpan, rarityBadge: rarityBadge, toast: toast,
           openModal: openModal, closeModal: closeModal, COIN_SVG: COIN_SVG };
})(window);
