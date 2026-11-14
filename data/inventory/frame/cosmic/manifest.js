/* Manifest frame.cosmic — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.cosmic",
    kind: "frame",
    gameKey: "cosmic",
    name: "Frame Kosmik",
    rarity: "legendary",
    price: null,
    gems: 2000,
    starter: false,
    desc: "Frame kosmik dengan bintang yang mengorbit dan nebula warna-warni yang bergerak.",
    visual: {"fxKey":"cosmic","tier":7},
    assets: { image: "data/frame/cosmic.webp" }
});
