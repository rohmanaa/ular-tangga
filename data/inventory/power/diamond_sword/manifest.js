(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.diamond_sword', kind: 'powerup', gameKey: 'diamond_sword', name: 'Diamond Sword', rarity: 'rare',
  price: 250, gems: null, starter: false, stackable: true,
  desc: 'Musuh dalam jarak 2 petak mundur 3 petak.',
  visual: { modelKey: 'diamond_sword', effect2d: 'diamond_sword' },
  assets: { icon: 'data/power/3d/diamond_sword.png' }
});
