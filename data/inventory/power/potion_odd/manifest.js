(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.potion_odd', kind: 'powerup', gameKey: 'potion_odd', name: 'Ramuan Ganjil', rarity: 'common',
  price: 60, gems: null, starter: false, stackable: true,
  desc: 'Dadu berikutnya selalu ganjil: 1, 3, atau 5.',
  visual: { modelKey: 'potion_red', effect2d: 'potion_odd' },
  assets: { icon: 'data/power/3d/potion_odd.png' }
});
