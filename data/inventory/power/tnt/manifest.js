(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.tnt', kind: 'powerup', gameKey: 'tnt', name: 'TNT', rarity: 'common',
  price: 150, gems: null, starter: false, stackable: true,
  desc: 'Jebakan: pasang di petak 1–6 di depanmu. Musuh yang mendarat di sana (dan 1 petak sekitarnya) mundur 6 petak.',
  visual: { modelKey: 'tnt', effect2d: 'tnt' },
  assets: { icon: 'data/power/3d/tnt.png' }
});
