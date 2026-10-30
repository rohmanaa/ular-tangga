/* Gambar item (SVG inline berbasis piksel/blok) — tanpa aset eksternal, tanpa emoji.
   Semua data berasal dari katalog internal, bukan input pengguna. */
(function (g) {
  'use strict';
  var C = g.ItemCatalog;

  /* Wajah 8x8 + palet, selaras dengan tampilan skin di lobby.html */
  var FACES = {
    steve:   { p: { h: '#4a2e13', H: '#3a2410', s: '#c58c62', w: '#fff', b: '#3b4fd8', n: '#a56a45', m: '#5a3820' },
               f: ['hhhhhhhh', 'hHhhhhHh', 'hssssssh', 'swbssbws', 'sssnnsss', 'ssmmmmss', 'smmmmmms', 'ssmmmmss'],
               body: { shirt: '#00a8a8', arm: '#c58c62', pants: '#3b4fd8', shoe: '#555a60' } },
    alex:    { p: { o: '#d4701c', O: '#b85a10', s: '#e8b48a', w: '#fff', g: '#2f8f3f', n: '#c98b66', m: '#b0563a' },
               f: ['oooooooo', 'oOooooOo', 'osssssso', 'swgssgws', 'sssnnsss', 'sssmmsss', 'ssssssss', 'ssssssss'],
               body: { shirt: '#6fbf3f', arm: '#e8b48a', pants: '#7a5230', shoe: '#444' } },
    creeper: { p: { g: '#5fb34a', G: '#3f8a35', k: '#0b0b0b' },
               f: ['gGggGggg', 'gkkggkkg', 'gkkggkkg', 'gggkkggg', 'ggkkkkgg', 'ggkkkkgg', 'ggkggkgg', 'gGggggGg'],
               body: { shirt: '#5fb34a', arm: '#4c9a3b', pants: '#3f8a35', shoe: '#2f6a28' } },
    ender:   { p: { b: '#141414', B: '#222', p: '#e879f9', q: '#a21caf' },
               f: ['bbbbbbbb', 'bBbbbbBb', 'bbbbbbbb', 'bbbbbbbb', 'pqpbbpqp', 'bbbbbbbb', 'bBbbbbBb', 'bbbbbbbb'],
               body: { shirt: '#1b1b1b', arm: '#141414', pants: '#141414', shoe: '#0a0a0a' } },
    zombie:  { p: { h: '#2f5f2a', s: '#5e9e4a', S: '#4c8a3b', w: '#fff', b: '#2a2a8a', m: '#1d3d18' },
               f: ['hhhhhhhh', 'hsssssSh', 'ssssssss', 'swbssbws', 'sssSsSss', 'ssmmmmss', 'smmmmmms', 'ssmsmsss'],
               body: { shirt: '#2d8fa8', arm: '#5e9e4a', pants: '#2a2a8a', shoe: '#222a55' } },
    skeleton:{ p: { k: '#e8e8e8', K: '#c4c4c4', d: '#222', m: '#8a8a8a' },
               f: ['kkkkkkkk', 'kKkkkkKk', 'kkkkkkkk', 'kddkkddk', 'kddkkddk', 'kkkddkkk', 'kmdmdmkk', 'kkkkkkkk'],
               body: { shirt: '#d6d6d6', arm: '#e0e0e0', pants: '#c8c8c8', shoe: '#b0b0b0', ribs: '#6f7378' } }
  };

  function rect(x, y, w, h, fill) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"/>'; }

  /* Karakter voxel tampak depan (16x32 unit piksel) */
  function character(skinId, label) {
    var it = C.byId(skinId); if (!it || it.kind !== 'skin') return '';
    var d = FACES[it.gameKey]; if (!d) return '';
    var b = d.body, s = '';
    s += rect(4, 20, 4, 12, b.pants) + rect(8, 20, 4, 12, b.pants) + rect(4, 29, 4, 3, b.shoe) + rect(8, 29, 4, 3, b.shoe);
    s += rect(4, 8, 8, 12, b.shirt) + rect(0, 8, 4, 12, b.arm) + rect(12, 8, 4, 12, b.arm);
    s += rect(4, 19, 8, 1, 'rgba(0,0,0,.22)') + rect(7.9, 20, .2, 12, 'rgba(0,0,0,.25)');
    if (b.ribs) for (var r = 10; r < 19; r += 3) s += rect(5, r, 6, 1, b.ribs);
    s += rect(0, 8, 1, 12, 'rgba(255,255,255,.15)') + rect(15, 8, 1, 12, 'rgba(0,0,0,.18)');
    d.f.forEach(function (row, y) {
      for (var x = 0; x < 8; x++) s += rect(4 + x, y, 1, 1, d.p[row.charAt(x)] || '#000');
    });
    s += rect(4, 0, 8, 1, 'rgba(255,255,255,.18)') + rect(4, 7, 8, 1, 'rgba(0,0,0,.18)');
    return '<svg class="art-char" viewBox="0 0 16 32" shape-rendering="crispEdges" role="img" aria-label="' + (label || it.name) + '">' + s + '</svg>';
  }

  /* Wajah saja (untuk thumbnail kecil) */
  function face(skinId, label) {
    var it = C.byId(skinId); if (!it || it.kind !== 'skin') return '';
    var d = FACES[it.gameKey]; if (!d) return '';
    var s = '';
    d.f.forEach(function (row, y) { for (var x = 0; x < 8; x++) s += rect(x, y, 1, 1, d.p[row.charAt(x)] || '#000'); });
    return '<svg class="art-face" viewBox="0 0 8 8" shape-rendering="crispEdges" role="img" aria-label="' + (label || it.name) + '">' + s + '</svg>';
  }

  /* Dadu: muka angka 5 */
  function dice(itemId, label) {
    var it = C.byId(itemId); if (!it || it.kind !== 'dice') return '';
    var a = it.art, s = '';
    s += rect(4, 4, 56, 56, a.edge) + rect(8, 8, 48, 48, a.bg);
    s += rect(8, 8, 48, 4, 'rgba(255,255,255,.28)') + rect(8, 52, 48, 4, 'rgba(0,0,0,.18)');
    [[18, 18], [46, 18], [32, 32], [18, 46], [46, 46]].forEach(function (p) {
      s += '<rect x="' + (p[0] - 5) + '" y="' + (p[1] - 5) + '" width="10" height="10" fill="' + a.pip + '"/>';
    });
    return '<svg class="art-dice" viewBox="0 0 64 64" shape-rendering="crispEdges" role="img" aria-label="' + (label || it.name) + '">' + s + '</svg>';
  }

  /* Tema papan: langit + tanah blok */
  function theme(itemId, label) {
    var it = C.byId(itemId); if (!it || it.kind !== 'theme') return '';
    var a = it.art, id = 'sk-' + it.gameKey + '-' + Math.random().toString(36).slice(2, 7), s = '';
    s += '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a.skyTop + '"/><stop offset="1" stop-color="' + a.skyBot + '"/></linearGradient></defs>';
    s += '<rect width="96" height="64" fill="url(#' + id + ')"/>';
    s += rect(66, 8, 12, 12, 'rgba(255,255,255,.75)');
    s += rect(0, 40, 96, 8, a.a) + rect(0, 48, 96, 16, a.b);
    for (var j = 0; j < 6; j++) s += rect(j * 16 + 7, 48, 1, 16, 'rgba(0,0,0,.2)');
    s += rect(0, 40, 96, 2, 'rgba(255,255,255,.22)') + rect(0, 56, 96, 1, 'rgba(0,0,0,.2)');
    s += rect(20, 30, 8, 10, '#6a4326') + rect(14, 20, 20, 12, 'rgba(0,0,0,.28)') + rect(14, 20, 20, 10, a.a);
    return '<svg class="art-theme" viewBox="0 0 96 64" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" role="img" aria-label="' + (label || it.name) + '">' + s + '</svg>';
  }

  /* Power-Up (Tahap 3.1): ikon blok sederhana per gameplay key — satu sistem art, tanpa aset eksternal. */
  function powerup(itemId, label) {
    var it = C.byId(itemId); if (!it || it.kind !== 'powerup') return '';
    var k = it.gameKey, s = '';
    if (k === 'sword') {
      s += rect(30, 6, 6, 34, '#cfd8e8') + rect(30, 6, 3, 34, '#f2f7ff') + rect(28, 4, 10, 4, '#e8eefc');
      s += rect(22, 40, 22, 5, '#c9a227') + rect(29, 45, 8, 6, '#8a5a2b') + rect(27, 51, 12, 5, '#6b431c');
    } else if (k === 'feather') {
      s += rect(28, 6, 10, 34, '#f4f9ff') + rect(24, 14, 6, 26, '#e2ecfb') + rect(36, 10, 6, 26, '#e2ecfb');
      s += rect(31, 40, 4, 18, '#b9c9e4') + rect(28, 6, 10, 6, '#cdddf5');
    } else if (k === 'tnt') {
      s += rect(10, 16, 44, 36, '#d63a2a') + rect(10, 16, 44, 8, '#e8564a') + rect(10, 30, 44, 8, '#ffffff');
      s += rect(16, 32, 6, 4, '#4a0d07') + rect(24, 32, 5, 4, '#4a0d07') + rect(31, 32, 6, 4, '#4a0d07') + rect(40, 32, 5, 4, '#4a0d07');
      s += rect(29, 8, 6, 8, '#8a5a2b') + rect(35, 4, 6, 4, '#ffb02e');
    } else if (k === 'apple') {
      s += rect(14, 20, 36, 32, '#ffc83a') + rect(10, 26, 44, 20, '#ffc83a') + rect(14, 20, 10, 6, '#ffe27a');
      s += rect(30, 10, 5, 10, '#7a4a2a') + rect(35, 8, 12, 6, '#4fae3e');
    } else if (k === 'potion') {
      s += rect(26, 4, 12, 6, '#8a5a2b') + rect(24, 10, 16, 8, '#b9c9e4');
      s += rect(14, 18, 36, 38, '#dff3ff') + rect(14, 36, 36, 20, '#c04fd0') + rect(18, 40, 8, 6, '#e08ae8');
      s += rect(14, 18, 36, 4, '#f2fbff');
    } else { /* grass */
      s += rect(8, 24, 48, 32, '#9a6a3b') + rect(8, 24, 48, 12, '#5fae3e') + rect(8, 24, 48, 4, '#78d957');
      s += rect(14, 44, 8, 6, '#7a5230') + rect(34, 38, 10, 6, '#7a5230') + rect(24, 50, 8, 6, '#7a5230');
    }
    return '<svg class="art-powerup" viewBox="0 0 64 64" shape-rendering="crispEdges" role="img" aria-label="' + (label || it.name) + '">' + s + '</svg>';
  }

  /* Gambar utama kartu. variant: 'full' (karakter penuh) | 'face' */
  function forItem(itemId, variant) {
    var it = C.byId(itemId); if (!it) return '';
    if (it.kind === 'skin') return variant === 'face' ? face(itemId) : character(itemId);
    if (it.kind === 'dice') return dice(itemId);
    if (it.kind === 'theme') return theme(itemId);
    if (it.kind === 'powerup') return powerup(itemId);
    return '';
  }

  /* Palet warna karakter untuk renderer 3D halaman (lobby/shop/inventory/profile).
     Satu sumber warna skin: dibaca dari FACES katalog, bukan database warna kedua. */
  function palette(skinId) {
    var it = C.byId(skinId); if (!it || it.kind !== 'skin') return null;
    var d = FACES[it.gameKey]; if (!d) return null;
    var hairKey = d.f[0] ? d.f[0].charAt(0) : '';
    return { gameKey: it.gameKey, hood: d.body.shirt, hair: d.p[hairKey] || d.body.shirt, pants: d.body.pants };
  }

  g.ItemArt = { character: character, face: face, dice: dice, theme: theme, powerup: powerup, forItem: forItem, palette: palette };
})(window);
