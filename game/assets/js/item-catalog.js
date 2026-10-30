/* Katalog item Ular Tangga Blok — SATU-SATUNYA sumber harga & metadata item.
   Hanya berisi item yang benar-benar didukung gameplay (skin karakter, skin dadu, tema papan).
   `gameKey` = kunci yang dipakai lobby.html / gameplay.html.
   Kepemilikan pemain TIDAK disimpan di sini (lihat player-data.js). */
(function (g) {
  'use strict';

  var RARITY = {
    common:    { key: 'common',    label: 'Umum',       rank: 1, stars: '★' },
    rare:      { key: 'rare',      label: 'Langka',     rank: 2, stars: '★★' },
    epic:      { key: 'epic',      label: 'Epik',       rank: 3, stars: '★★★' },
    legendary: { key: 'legendary', label: 'Legendaris', rank: 4, stars: '★★★★' }
  };

  var CATEGORIES = [
    { key: 'skin',     label: 'Skin' },
    { key: 'aksesori', label: 'Aksesori' },
    { key: 'efek',     label: 'Efek' },
    { key: 'emote',    label: 'Emote' },
    { key: 'lainnya',  label: 'Lainnya' }
  ];

  var SKIN_GROUPS = ['Default', 'Adventure', 'Fantasy', 'Rare', 'Epic', 'Legendary', 'PNG'];

  /* Folder texture skin PNG, RELATIF terhadap halaman di game/ (tanpa path absolut / URL eksternal). */
  var SKIN_DIR = 'data/skins/';

  /* kind: skin -> bidak karakter | dice -> skin dadu | theme -> tema papan | powerup -> power-up gameplay
     slot powerup = null: consumable (quantity), BUKAN equipment — tidak masuk defaultEquipped. */
  var KIND_META = {
    skin:    { category: 'skin',     noun: 'Skin',       slot: 'skin' },
    dice:    { category: 'aksesori', noun: 'Skin dadu',  slot: 'dice' },
    theme:   { category: 'lainnya',  noun: 'Tema papan', slot: 'theme' },
    powerup: { category: 'efek',     noun: 'Power-Up',   slot: null }
  };

  /* Skin legacy (palet bawaan di item-art.js / gameplay.html): texture = null, renderer = 'palette'.
     Tidak ada PNG palsu untuk skin ini. */
  function skin(gameKey, name, group, rarity, price, desc, extra) {
    return Object.assign({ id: 'skin.' + gameKey, kind: 'skin', gameKey: gameKey, name: name, group: group,
      rarity: rarity, price: price, desc: desc, starter: price === 0,
      texture: null, renderer: 'palette' }, extra || {});
  }
  /* Skin PNG (Tahap 3.2): PNG = TEXTURE untuk model voxel yang sama, BUKAN model 3D baru.
     texture  = path relatif ke file PNG (template Minecraft 64x64, lihat SKIN_SYSTEM.md).
     arms     = 'classic' (lengan 4 px) | 'slim' (lengan 3 px) — hasil audit piksel PNG, bukan karangan.
     price: null = EKONOMI BELUM DITENTUKAN — tidak dijual di shop, tidak boleh diarang (sama seperti Power-Up).
     rarity 'common' = default netral untuk UI, BUKAN rarity sungguhan.
     Menambah skin baru = taruh PNG di data/skins/ + satu baris skinPng() di bawah + kepemilikan di PlayerData. */
  function skinPng(gameKey, name, file, extra) {
    return Object.assign({ id: 'skin.' + gameKey, kind: 'skin', gameKey: gameKey, name: name, group: 'PNG',
      rarity: 'common', price: null, desc: 'Skin PNG bergaya Minecraft (64\u00d764).', starter: false,
      texture: SKIN_DIR + file, renderer: 'png', arms: 'classic' }, extra || {});
  }
  /* Path texture harus relatif, berakhiran .png, tanpa skema/URL, drive Windows, '..' atau spasi. */
  function validTexturePath(p) {
    return typeof p === 'string' && /^[A-Za-z0-9_\-]+(\/[A-Za-z0-9_\-]+)*\.png$/.test(p);
  }
  function dice(gameKey, name, rarity, price, desc, art, extra) {
    return Object.assign({ id: 'dice.' + gameKey, kind: 'dice', gameKey: gameKey, name: 'Dadu ' + name,
      rarity: rarity, price: price, desc: desc, starter: price === 0, art: art }, extra || {});
  }
  function theme(gameKey, name, rarity, price, desc, art, extra) {
    return Object.assign({ id: 'theme.' + gameKey, kind: 'theme', gameKey: gameKey, name: 'Tema ' + name,
      rarity: rarity, price: price, desc: desc, starter: price === 0, art: art }, extra || {});
  }
  /* Power-Up (Tahap 3.1): consumable ber-quantity.
     ID canonical = PERSIS key gameplay di gameplay.html (p.pu: sword/feather/tnt/apple/potion/grass)
     — tanpa prefiks, agar tidak perlu bridge ID (lihat DATA_MIGRATION.md "Power-Up").
     price: null = EKONOMI BELUM DITENTUKAN — tidak dijual di shop, tidak boleh diarang.
     rarity 'common' = default netral untuk UI; gameplay sendiri tidak mengenal rarity power-up. */
  function powerup(gameKey, name, rarity, desc, extra) {
    return Object.assign({ id: gameKey, kind: 'powerup', gameKey: gameKey, name: name,
      rarity: rarity, price: null, desc: desc, starter: false, stackable: true }, extra || {});
  }

  var ITEMS = [
    /* ---- Skin karakter ---- */
    skin('steve',    'Steve',    'Default',   'common', 0,   'Petualang blok klasik. Siap melangkah ke petak mana pun.'),
    skin('alex',     'Alex',     'Default',   'common', 0,   'Penjelajah lincah berambut oranye dengan jiwa petualang.'),
    skin('creeper',  'Creeper',  'Adventure', 'common', 0,   'Hijau, diam-diam, dan penuh kejutan di setiap giliran.'),
    skin('zombie',   'Zombie',   'Adventure', 'common', 0,   'Berjalan lambat tapi pantang menyerah sampai petak 100.'),
    skin('skeleton', 'Skeleton', 'Rare',      'rare',   300, 'Tulang-belulang pemanah dari gua gelap. Dingin dan tajam.'),
    skin('ender',    'Enderman', 'Epic',      'epic',   700, 'Makhluk tinggi dari dimensi lain dengan mata ungu menyala.', { featured: true }),

    /* ---- Skin PNG (Tahap 3.2) — hasil audit game/data/skins/*.png (semua 64x64, template Minecraft) ---- */
    skinPng('hero',      'Hero',      'hero.png'),
    skinPng('knight',    'Knight',    'knight.png',    { arms: 'slim' }),
    skinPng('ninja_red', 'Ninja Red', 'ninja_red.png'),
    skinPng('pejabat',   'Pejabat',   'pejabat.png'),
    skinPng('sakura',    'Sakura',    'sakura.png',    { arms: 'slim' }),
    skinPng('warden',    'Warden',    'warden.png'),

    /* ---- Skin dadu (Aksesori) ---- */
    /* legacyIds = metadata migrasi Tahap 3 (ID lama yang dipetakan eksplisit ke ID canonical ini).
       ID legacy yang tidak tercantum di sini adalah UNMAPPED (lihat DATA_MIGRATION.md). */
    dice('klasik',   'Klasik',   'common',    0,   'Dadu putih sederhana yang tidak pernah ketinggalan zaman.',
         { bg: '#ffffff', pip: '#1b2a3b', edge: '#1b2a3b' }, { legacyIds: ['standard'] }),
    dice('rumput',   'Rumput',   'common',    100, 'Dadu hijau segar bergaya blok rumput.',
         { bg: '#5fae3e', pip: '#1f4a12', edge: '#2c5a1c' }),
    dice('tnt',      'TNT',      'rare',      200, 'Dadu merah meledak-ledak. Semoga angkanya ikut meledak!',
         { bg: '#d63a2a', pip: '#ffffff', edge: '#4a0d07' }),
    dice('diamond',  'Diamond',  'epic',      450, 'Dadu biru kristal berkilau seperti berlian dari tambang dalam.',
         { bg: '#4aedd9', pip: '#0b4f4a', edge: '#0b4f4a' }),
    dice('obsidian', 'Obsidian', 'epic',      500, 'Dadu ungu gelap dari obsidian dengan titik berpendar.',
         { bg: '#2a1747', pip: '#d3b4ff', edge: '#0d0618' }),
    dice('emas',     'Emas',     'legendary', 900, 'Dadu emas berkilau untuk pemain yang percaya diri.',
         { bg: '#ffd23f', pip: '#6b4a00', edge: '#6b4a00' }, { featured: true, legacyIds: ['emas'] }),

    /* ---- Tema papan (Lainnya) ---- */
    theme('minecraft', 'Minecraft', 'common', 0,   'Padang rumput blok bergaya klasik.',
          { skyTop: '#6EC6FF', skyBot: '#E6F7FF', a: '#5FAE3E', b: '#8A5B33' }),
    theme('rumput',    'Rumput',    'common', 0,   'Hamparan rumput hijau cerah di bawah langit biru.',
          { skyTop: '#5EC1FF', skyBot: '#DDF4FF', a: '#78D957', b: '#9A6A3B' }),
    theme('gurun',     'Gurun',     'rare',   250, 'Pasir hangat dan langit keemasan.',
          { skyTop: '#FFD27A', skyBot: '#FFF4D8', a: '#FFD98C', b: '#D9763C' }),
    theme('salju',     'Salju',     'rare',   250, 'Dataran putih dingin dengan salju turun.',
          { skyTop: '#46AEEF', skyBot: '#E4F6FF', a: '#F4FCFF', b: '#54AEDB' }),
    theme('hutan',     'Hutan',     'rare',   300, 'Rimbun, teduh, dan penuh pepohonan blok.',
          { skyTop: '#27B2B8', skyBot: '#C9F5E4', a: '#46C46E', b: '#1F5F4D' }),
    theme('nether',    'Nether',    'epic',   600, 'Dunia api dan batu merah yang berbahaya.',
          { skyTop: '#2a0606', skyBot: '#8a2410', a: '#8A2B2B', b: '#3A0D0D' }, { featured: true }),

    /* ---- Power-Up (Tahap 3.1) ----
       Metadata & efek = hasil audit gameplay.html (PUN + usePU), TIDAK diarang:
       sword  -> p.bonus=3 (langkah berikutnya +3)      feather -> p.extra=true (giliran tambahan)
       tnt    -> pemain terdepan mundur 6 (teleport)    apple   -> p.shield=true (kebal 1 ular/mob)
       potion -> p.p4=true (dadu berikutnya 4-6)        grass   -> tukar posisi dgn pemain terdepan
       Pemakaian & pengurangan quantity tetap di gameplay (p.pu); integrasi PlayerData menyusul. */
    powerup('sword',   'Pedang',     'common', 'Langkah berikutnya +3.'),
    powerup('feather', 'Bulu',       'common', 'Giliran tambahan sekali lempar.'),
    powerup('tnt',     'TNT',        'common', 'Pemain terdepan mundur 6 petak.'),
    powerup('apple',   'Apel Emas',  'common', 'Kebal dari 1 ular atau mob jahat.'),
    powerup('potion',  'Ramuan',     'common', 'Dadu berikutnya selalu 4 sampai 6.'),
    powerup('grass',   'Blok Rumput','common', 'Tukar posisi dengan pemain terdepan.')
  ];

  var DEFAULT_EQUIPPED = Object.freeze({ skin: 'skin.steve', dice: 'dice.klasik', theme: 'theme.minecraft' });
  var BY_ID = {};
  ITEMS.forEach(function (it) {
    var meta = KIND_META[it.kind];
    it.category = meta.category;
    it.slot = meta.slot;
    it.stackable = !!it.stackable;
    it.featured = !!it.featured;
    if (it.kind === 'skin') { /* validasi texture ringan: path buruk TIDAK membuat halaman crash, skin tampil dgn fallback */
      it.textureValid = it.renderer === 'png' && validTexturePath(it.texture);
      if (it.renderer === 'png' && !it.textureValid && g.console) g.console.error('[ItemCatalog] path texture skin tidak valid: ' + it.id);
    }
    if (it.art) Object.freeze(it.art);
    Object.freeze(it);
    if (BY_ID[it.id]) throw new Error('ID item ganda: ' + it.id);
    BY_ID[it.id] = it;
  });

  g.ItemCatalog = Object.freeze({
    version: 1,
    RARITY: RARITY,
    CATEGORIES: CATEGORIES,
    SKIN_GROUPS: SKIN_GROUPS,
    KIND_META: KIND_META,
    items: Object.freeze(ITEMS.slice()),
    byId: function (id) { return Object.prototype.hasOwnProperty.call(BY_ID, id) ? BY_ID[id] : null; },
    byGameKey: function (kind, gameKey) { return BY_ID[kind + '.' + gameKey] || null; },
    /* Path texture PNG skin (relatif) atau null untuk skin legacy / path tidak valid */
    skinTexture: function (id) { var it = BY_ID[id]; return it && it.kind === 'skin' && it.textureValid ? it.texture : null; },
    /* Skin cadangan bila texture hilang/rusak (= skin default; selalu dimiliki sebagai starter) */
    fallbackSkinId: function () { return DEFAULT_EQUIPPED.skin; },
    starters: function () { return ITEMS.filter(function (i) { return i.starter; }); },
    categoryLabel: function (key) { var c = CATEGORIES.filter(function (x) { return x.key === key; })[0]; return c ? c.label : key; },
    /* Item default tiap slot saat data pemain dibuat */
    defaultEquipped: DEFAULT_EQUIPPED
  });
})(window);
