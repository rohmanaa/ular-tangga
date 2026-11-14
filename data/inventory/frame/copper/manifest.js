/* Manifest frame.copper — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.copper",
    kind: "frame",
    gameKey: "copper",
    name: "Frame Tembaga",
    rarity: "rare",
    price: 1500,
    gems: null,
    starter: false,
    desc: "Frame tembaga berkarat hijau dengan kilau tembaga yang lewat sesekali.",
    visual: {"fxKey":"copper","tier":2},
    assets: { image: "data/frame/copper.webp" }
});
