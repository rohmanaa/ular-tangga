/* Manifest frame.nether — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.nether",
    kind: "frame",
    gameKey: "nether",
    name: "Frame Nether",
    rarity: "epic",
    price: 20000,
    gems: null,
    starter: false,
    desc: "Frame batu nether dengan bara api dan asap tipis yang naik.",
    visual: {"fxKey":"nether","tier":4},
    assets: { image: "data/frame/nether.webp" }
});
