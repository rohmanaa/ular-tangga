(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.grass', kind: 'powerup', gameKey: 'grass', name: 'Ender Pearl', rarity: 'common',
  price: 100, gems: null, starter: false, stackable: true,
  desc: 'Tukar posisi dengan pemain terdepan.',
  visual: { modelKey: 'ender_pearl', effect2d: 'grass' },
  assets: { icon: 'data/power/3d/grass.png' }
});
