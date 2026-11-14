/* Manifest frame.iron — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.iron",
    kind: "frame",
    gameKey: "iron",
    name: "Frame Besi",
    rarity: "rare",
    price: 2500,
    gems: null,
    starter: false,
    desc: "Frame besi tempa ala ksatria dengan kilatan metalik.",
    visual: {"fxKey":"iron","tier":2},
    assets: { image: "data/frame/iron.webp" }
});
