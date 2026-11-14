(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.nether_star', kind: 'powerup', gameKey: 'nether_star', name: 'Nether Star', rarity: 'legendary',
  price: 1000, gems: null, starter: false, stackable: true,
  desc: 'Semua musuh mundur 3 petak dan kamu mendapat giliran tambahan.',
  visual: { modelKey: 'nether_star', effect2d: 'nether_star' },
  assets: { icon: 'data/power/3d/nether_star.png' }
});
