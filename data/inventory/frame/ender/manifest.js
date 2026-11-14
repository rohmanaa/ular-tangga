/* Manifest frame.ender — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.ender",
    kind: "frame",
    gameKey: "ender",
    name: "Frame Ender",
    rarity: "legendary",
    price: null,
    gems: 450,
    starter: false,
    desc: "Frame obsidian dimensi Ender; partikel ungu muncul dan menghilang di tepinya.",
    visual: {"fxKey":"ender","tier":5},
    assets: { image: "data/frame/ender.webp" }
});
