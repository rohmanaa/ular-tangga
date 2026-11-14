/* Manifest pet.storm_wolf — dibuat dari ItemCatalog (data existing; tidak ada data baru). Paritas dijaga tests/pet-registry-parity.test.js.
   tier/role/accent/colors = field katalog existing. assets.image = gambar yang dibangun pet-page.js (IMAGE_ROOT + gameKey + '.png').
   Visual 3D (assets/js/pet-viewer.js) dan audio (assets/sfx/pet/*, dipetakan per tier di pet-viewer.js) TIDAK diduplikasi di sini. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "pet.storm_wolf",
    kind: "pet",
    gameKey: "storm_wolf",
    name: "Storm Wolf",
    rarity: "legendary",
    tier: 5,
    role: "Penyerang",
    price: null,
    gems: 1500,
    starter: false,
    desc: "Serigala baja dengan surai duri petir. Awan badai di atasnya menyambar tanah dan surainya secara acak.",
    visual: {"accent":"#7fd0ff","colors":["#5a6a8a","#e8f4ff","#7fd0ff"]},
    assets: { image: "assets/ng/pet3d/storm_wolf.png" }
});
