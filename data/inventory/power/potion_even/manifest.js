(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.potion_even', kind: 'powerup', gameKey: 'potion_even', name: 'Ramuan Genap', rarity: 'common',
  price: 60, gems: null, starter: false, stackable: true,
  desc: 'Dadu berikutnya selalu genap: 2, 4, atau 6.',
  visual: { modelKey: 'potion_blue', effect2d: 'potion_even' },
  assets: { icon: 'data/power/3d/potion_even.png' }
});
