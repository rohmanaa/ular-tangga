(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.dragon_crystal', kind: 'powerup', gameKey: 'dragon_crystal', name: 'Dragon Crystal', rarity: 'legendary',
  price: 800, gems: null, starter: false, stackable: true,
  desc: 'Meluncur ke Tangga terdekat di depanmu; bila tidak ada, maju 6 petak.',
  visual: { modelKey: 'dragon_crystal', effect2d: 'dragon_crystal' },
  assets: { icon: 'data/power/3d/dragon_crystal.png' }
});
