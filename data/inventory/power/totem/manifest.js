(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.totem', kind: 'powerup', gameKey: 'totem', name: 'Totem', rarity: 'common',
  price: 200, gems: null, starter: false, stackable: true,
  desc: 'Saat kena ular, mob jahat, atau serangan Power dari pemain lain, kamu bisa memilih memakai Totem untuk menahannya.',
  visual: { modelKey: 'totem', effect2d: 'totem' },
  assets: { icon: 'data/power/3d/totem.png' }
});
