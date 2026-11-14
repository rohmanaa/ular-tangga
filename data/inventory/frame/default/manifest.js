/* Manifest frame.default — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.default",
    kind: "frame",
    gameKey: "default",
    name: "Frame Kayu",
    rarity: "common",
    price: 0,
    gems: null,
    starter: true,
    desc: "Frame kayu oak sederhana berhias daun hijau di sudutnya. Terpasang sejak awal.",
    visual: {"fxKey":"wood","tier":1},
    assets: { image: "data/frame/frame-default.webp" }
});
