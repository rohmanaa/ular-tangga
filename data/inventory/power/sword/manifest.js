(function (g, m) {
  if (typeof module === 'object' && module.exports) module.exports = m;
  else ((g.UT = g.UT || {}).ItemManifests = g.UT.ItemManifests || []).push(m);
})(typeof window !== 'undefined' ? window : this, {
  id: 'powerup.sword', kind: 'powerup', gameKey: 'sword', name: 'Iron Sword', rarity: 'common',
  price: 120, gems: null, starter: false, stackable: true,
  desc: 'Serang musuh di petak yang sama, ia mundur 2.',
  off: true, offNote: "DITURUNKAN SEMENTARA (takedown): cukup satu pedang (Diamond Sword); Iron Sword akan diganti item lain. JANGAN DIHAPUS: ID 'sword', baris server, stok pemain, model 3D, ikon, aturan (PUN/PUR) dan efek tetap ada.",
  visual: { modelKey: 'iron_sword', effect2d: 'sword' },
  assets: { icon: 'data/power/3d/sword.png' }
});
