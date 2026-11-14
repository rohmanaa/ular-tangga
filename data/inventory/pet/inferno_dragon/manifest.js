/* Manifest pet.inferno_dragon — dibuat dari ItemCatalog (data existing; tidak ada data baru). Paritas dijaga tests/pet-registry-parity.test.js.
   tier/role/accent/colors = field katalog existing. assets.image = gambar yang dibangun pet-page.js (IMAGE_ROOT + gameKey + '.png').
   Visual 3D (assets/js/pet-viewer.js) dan audio (assets/sfx/pet/*, dipetakan per tier di pet-viewer.js) TIDAK diduplikasi di sini. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "pet.inferno_dragon",
    kind: "pet",
    gameKey: "inferno_dragon",
    name: "Inferno Dragon",
    rarity: "mythic",
    tier: 6,
    role: "Pembakar Ular",
    price: null,
    gems: 3000,
    starter: false,
    desc: "Naga obsidian dengan retakan lava di dada. Setiap beberapa detik rahangnya terbuka dan menyemburkan api.",
    visual: {"accent":"#ff4a3a","colors":["#1b0a10","#a0182c","#ff7a18"]},
    assets: { image: "assets/ng/pet3d/inferno_dragon.png" }
});
