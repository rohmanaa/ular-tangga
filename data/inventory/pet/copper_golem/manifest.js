/* Manifest pet.copper_golem — dibuat dari ItemCatalog (data existing; tidak ada data baru). Paritas dijaga tests/pet-registry-parity.test.js.
   tier/role/accent/colors = field katalog existing. assets.image = gambar yang dibangun pet-page.js (IMAGE_ROOT + gameKey + '.png').
   Visual 3D (assets/js/pet-viewer.js) dan audio (assets/sfx/pet/*, dipetakan per tier di pet-viewer.js) TIDAK diduplikasi di sini. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "pet.copper_golem",
    kind: "pet",
    gameKey: "copper_golem",
    name: "Copper Golem",
    rarity: "uncommon",
    tier: 2,
    role: "Pelindung",
    price: 9000,
    gems: null,
    starter: false,
    desc: "Golem tembaga dengan bercak karat hijau, panel pengukur di dada, dan roda gigi di punggung.",
    visual: {"accent":"#ff9a30","colors":["#c8703a","#3fbf9f","#ffb040"]},
    assets: { image: "assets/ng/pet3d/copper_golem.png" }
});
