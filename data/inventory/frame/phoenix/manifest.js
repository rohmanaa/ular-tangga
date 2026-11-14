/* Manifest frame.phoenix — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.phoenix",
    kind: "frame",
    gameKey: "phoenix",
    name: "Frame Phoenix",
    rarity: "legendary",
    price: null,
    gems: 1100,
    starter: false,
    desc: "Frame api phoenix bersayap; lidah api hidup dan bulu membara naik ke atas.",
    visual: {"fxKey":"phoenix","tier":6,"marginCells":7},
    assets: { image: "data/frame/phoenix.webp" }
});
