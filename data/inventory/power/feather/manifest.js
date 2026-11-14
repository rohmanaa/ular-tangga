(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.feather', kind: 'powerup', gameKey: 'feather', name: 'Feather', rarity: 'common',
  price: 80, gems: null, starter: false, stackable: true,
  desc: 'Giliran tambahan sekali lempar.',
  visual: { modelKey: 'feather', effect2d: 'feather' },
  assets: { icon: 'data/power/3d/feather.png' }
});
