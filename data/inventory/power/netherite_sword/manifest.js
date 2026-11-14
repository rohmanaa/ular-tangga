(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.netherite_sword', kind: 'powerup', gameKey: 'netherite_sword', name: 'Netherite Sword', rarity: 'epic',
  price: 450, gems: null, starter: false, stackable: true,
  desc: 'Musuh dalam jarak 4 petak mundur 5 petak.',
  off: true, offNote: 'DITURUNKAN SEMENTARA (takedown): cukup satu pedang (Diamond Sword); Netherite Sword akan diganti item lain. JANGAN DIHAPUS: ID, baris server, stok pemain, model 3D, ikon, aturan (PUN/PUR) dan efek tetap ada.',
  visual: { modelKey: 'netherite_sword', effect2d: 'netherite_sword' },
  assets: { icon: 'data/power/3d/netherite_sword.png' }
});
