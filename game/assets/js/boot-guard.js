/* Boot guard: halaman apa pun yang dibuka langsung (tanpa lewat splash) dialihkan ke splash.html dulu.
   Splash memuat semua data & aset, lalu kembali ke halaman tujuan. Flag disimpan per tab (sessionStorage). */
(function () {
  try {
    if (sessionStorage.getItem('ut:booted') === '1') return;
  } catch (e) { return; }
  var page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'splash.html' || page === 'loading.html') return;
  var next = (page === 'index.html' || page === '') ? 'lobby.html' : page + location.search;
  location.replace('splash.html?next=' + encodeURIComponent(next));
})();
