/* Manifest frame.stone — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.stone",
    kind: "frame",
    gameKey: "stone",
    name: "Frame Batu",
    rarity: "common",
    price: 500,
    gems: null,
    starter: false,
    desc: "Frame batu kokoh dengan debu batu yang sesekali beterbangan.",
    visual: {"fxKey":"stone","tier":1},
    assets: { image: "data/frame/stone.webp" }
});
