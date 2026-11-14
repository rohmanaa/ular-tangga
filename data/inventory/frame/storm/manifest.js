/* Manifest frame.storm — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.storm",
    kind: "frame",
    gameKey: "storm",
    name: "Frame Badai",
    rarity: "legendary",
    price: null,
    gems: 600,
    starter: false,
    desc: "Frame baja badai dengan petir yang menyambar di tepinya.",
    visual: {"fxKey":"storm","tier":5,"marginCells":6},
    assets: { image: "data/frame/storm.webp" }
});
