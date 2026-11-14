(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.blaze_core', kind: 'powerup', gameKey: 'blaze_core', name: 'Blaze Core', rarity: 'epic',
  price: 400, gems: null, starter: false, stackable: true,
  desc: 'Jebakan ledakan: pasang di petak 1–6 di depanmu. Musuh yang mendarat di sana (dan 2 petak sekitarnya) mundur 2 petak.',
  maps: ['nether'],
  visual: { modelKey: 'blaze_core', effect2d: 'blaze_core' },
  assets: { icon: 'data/power/3d/blaze_core.png' }
});
