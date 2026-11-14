(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.trident', kind: 'powerup', gameKey: 'trident', name: 'Trident', rarity: 'legendary',
  price: 600, gems: null, starter: false, stackable: true,
  desc: 'Pemain terdepan mundur 4 petak dan kamu maju 2 petak.',
  visual: { modelKey: 'trident', effect2d: 'trident' },
  assets: { icon: 'data/power/3d/trident.png' }
});
