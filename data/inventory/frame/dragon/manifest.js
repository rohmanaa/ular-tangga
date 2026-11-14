/* Manifest frame.dragon — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.dragon",
    kind: "frame",
    gameKey: "dragon",
    name: "Frame Naga",
    rarity: "legendary",
    price: null,
    gems: 800,
    starter: false,
    desc: "Frame sisik naga bertanduk dengan bara merah dan kilatan crimson.",
    visual: {"fxKey":"dragon","tier":6},
    assets: { image: "data/frame/dragon.webp" }
});
