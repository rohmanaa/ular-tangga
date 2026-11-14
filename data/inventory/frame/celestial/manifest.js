/* Manifest frame.celestial — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.celestial",
    kind: "frame",
    gameKey: "celestial",
    name: "Frame Surgawi",
    rarity: "legendary",
    price: null,
    gems: 1500,
    starter: false,
    desc: "Frame surgawi bersayap dengan halo berputar, sinar emas, dan bintang berkilau.",
    visual: {"fxKey":"celestial","tier":7,"marginCells":7},
    assets: { image: "data/frame/celestial.webp" }
});
