/* Manifest frame.diamond — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.diamond",
    kind: "frame",
    gameKey: "diamond",
    name: "Frame Berlian",
    rarity: "epic",
    price: 9000,
    gems: null,
    starter: false,
    desc: "Frame kristal berlian dengan kilauan dan partikel kecil yang berhamburan.",
    visual: {"fxKey":"diamond","tier":3},
    assets: { image: "data/frame/diamond.webp" }
});
