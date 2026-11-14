(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.wooden_shield', kind: 'powerup', gameKey: 'wooden_shield', name: 'Wooden Shield', rarity: 'common',
  price: 90, gems: null, starter: false, stackable: true,
  desc: 'Menahan 1 serangan Power dari pemain lain secara otomatis.',
  maps: ['minecraft'],
  visual: { modelKey: 'wooden_shield', effect2d: 'wooden_shield' },
  assets: { icon: 'data/power/3d/wooden_shield.png' }
});
