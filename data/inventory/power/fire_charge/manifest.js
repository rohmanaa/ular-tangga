(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.fire_charge', kind: 'powerup', gameKey: 'fire_charge', name: 'Fire Charge', rarity: 'common',
  price: 120, gems: null, starter: false, stackable: true,
  desc: 'Jebakan api: pasang di petak 1–6 di depanmu. Musuh yang mendarat di sana mundur 3 petak.',
  maps: ['nether'],
  visual: { modelKey: 'fire_charge', effect2d: 'fire_charge' },
  assets: { icon: 'data/power/3d/fire_charge.png' }
});
