/* Manifest frame.gold — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.gold",
    kind: "frame",
    gameKey: "gold",
    name: "Frame Emas",
    rarity: "epic",
    price: 6000,
    gems: null,
    starter: false,
    desc: "Frame emas kerajaan dengan permata biru dan kilau emas yang bergerak di pinggirannya.",
    featured: true,
    visual: {"fxKey":"gold","tier":3},
    assets: { image: "data/frame/frame-gold.webp" }
});
