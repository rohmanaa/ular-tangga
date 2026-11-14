(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.ice_crystal', kind: 'powerup', gameKey: 'ice_crystal', name: 'Ice Crystal', rarity: 'rare',
  price: 250, gems: null, starter: false, stackable: true,
  desc: 'Pemain terdepan membeku dan melewatkan giliran berikutnya.',
  maps: ['minecraft'],
  visual: { modelKey: 'ice_crystal', effect2d: 'ice_crystal' },
  assets: { icon: 'data/power/3d/ice_crystal.png' }
});
