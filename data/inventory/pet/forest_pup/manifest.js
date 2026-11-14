/* Manifest pet.forest_pup — dibuat dari ItemCatalog (data existing; tidak ada data baru). Paritas dijaga tests/pet-registry-parity.test.js.
   tier/role/accent/colors = field katalog existing. assets.image = gambar yang dibangun pet-page.js (IMAGE_ROOT + gameKey + '.png').
   Visual 3D (assets/js/pet-viewer.js) dan audio (assets/sfx/pet/*, dipetakan per tier di pet-viewer.js) TIDAK diduplikasi di sini. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "pet.forest_pup",
    kind: "pet",
    gameKey: "forest_pup",
    name: "Forest Pup",
    rarity: "common",
    tier: 1,
    role: "Pengendus",
    price: 3000,
    gems: null,
    starter: false,
    desc: "Anak anjing hutan dengan kalung papan kayu. Gerakannya sederhana: bernapas, mengibas ekor, berkedip.",
    visual: {"accent":"#6fd05a","colors":["#b8803f","#f0dcb0","#3fa04a"]},
    assets: { image: "assets/ng/pet3d/forest_pup.png" }
});
