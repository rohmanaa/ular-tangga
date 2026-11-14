(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.golden_apple', kind: 'powerup', gameKey: 'golden_apple', name: 'Golden Apple', rarity: 'rare',
  price: 200, gems: null, starter: false, stackable: true,
  desc: 'Dadu berikutnya mendapat bonus +3 petak.',
  maps: ['minecraft'],
  visual: { modelKey: 'golden_apple', effect2d: 'golden_apple' },
  assets: { icon: 'data/power/3d/golden_apple.png' }
});
