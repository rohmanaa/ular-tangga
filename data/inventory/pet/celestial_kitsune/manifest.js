/* Manifest pet.celestial_kitsune — dibuat dari ItemCatalog (data existing; tidak ada data baru). Paritas dijaga tests/pet-registry-parity.test.js.
   tier/role/accent/colors = field katalog existing. assets.image = gambar yang dibangun pet-page.js (IMAGE_ROOT + gameKey + '.png').
   Visual 3D (assets/js/pet-viewer.js) dan audio (assets/sfx/pet/*, dipetakan per tier di pet-viewer.js) TIDAK diduplikasi di sini. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "pet.celestial_kitsune",
    kind: "pet",
    gameKey: "celestial_kitsune",
    name: "Celestial Kitsune",
    rarity: "divine",
    tier: 7,
    role: "Pengubah Takdir",
    price: null,
    gems: 6000,
    starter: false,
    desc: "Rubah sembilan ekor melayang di atas lingkaran sihir. Ekornya besar, berbulu tebal, mengembang seperti kipas dan berujung bintang.",
    visual: {"accent":"#ffe08a","colors":["#fdfbf4","#ffcf4a","#6ae8ff"]},
    assets: { image: "assets/ng/pet3d/celestial_kitsune.png" }
});
