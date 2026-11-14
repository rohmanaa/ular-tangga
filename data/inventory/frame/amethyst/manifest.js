/* Manifest frame.amethyst — dibuat dari ItemCatalog + frame-fx.js (data existing; tidak ada data baru).
   Paritas dengan ItemCatalog dijaga tests/frame-registry-parity.test.js. */
(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
    id: "frame.amethyst",
    kind: "frame",
    gameKey: "amethyst",
    name: "Frame Kecubung",
    rarity: "epic",
    price: 12000,
    gems: null,
    starter: false,
    desc: "Frame kristal kecubung ungu yang berpendar dengan partikel arkana.",
    visual: {"fxKey":"amethyst","tier":4},
    assets: { image: "data/frame/amethyst.webp" }
});
