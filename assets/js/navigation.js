/* Navigasi bawah bersama untuk semua halaman aplikasi (satu sumber, tidak menumpuk).
   Pakai: <body data-page="home|inventory|skins|shop|play"> lalu muat skrip ini.
   "Main" menuju lobby.html (pemilihan mode/skin/tema) — bukan langsung ke gameplay —
   karena gameplay.html butuh konfigurasi dari lobi. */
(function (g) {
  'use strict';
  var ICON = {
    home: '<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/>',
    inventory: '<path d="M3 7h18v5H3zM4 13h16v8H4zM10 12h4v4h-4z"/>',
    skins: '<path d="M8 2h8v7H8zM4 11h16v4h-3v7h-4v-5h-2v5H7v-7H4z"/>',
    shop: '<path d="M2 3h4l1 3h15l-2 9H8L5 5H2zM9 19a2 2 0 1 0 0 .1zM18 19a2 2 0 1 0 0 .1z"/>',
    play: '<path d="M6 3l15 9-15 9z"/>'
  };
  var ITEMS = [
    { page: 'home',      href: 'ular%20tangga.html', label: 'Beranda' },
    { page: 'inventory', href: 'inventory.html',     label: 'Inventory' },
    { page: 'skins',     href: 'skins.html',         label: 'Skin' },
    { page: 'shop',      href: 'shop.html',          label: 'Toko' },
    { page: 'play',      href: 'lobby.html',         label: 'Main' }
  ];

  function mount() {
    if (document.querySelector('nav.bottom-nav')) return;
    var cur = document.body.getAttribute('data-page');
    var nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'Navigasi aplikasi');
    ITEMS.forEach(function (it) {
      var a = document.createElement('a');
      a.href = it.href; a.setAttribute('data-page', it.page);
      if (it.page === cur) a.setAttribute('aria-current', 'page');
      a.innerHTML = '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges" fill="currentColor">' + ICON[it.page] + '</svg>';
      var s = document.createElement('span'); s.className = 'nav-label'; s.textContent = it.label;
      a.appendChild(s);
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  g.AppNav = { mount: mount, items: ITEMS };
})(window);
