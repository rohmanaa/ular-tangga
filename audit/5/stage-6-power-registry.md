# Stage 6 — Power Registry & Full Integration

## Ringkasan

Stage 6 selesai pada branch `restruktur`. Seluruh 17 Power memiliki manifest `ItemRegistry`; katalog lama tetap mempertahankan ID/gameKey dan bentuk item publik. Perubahan mencakup metadata, rujukan sistem efek/aset, pemuatan halaman, preload, dan tes paritas. Implementasi gameplay, kontrak RPC, kepemilikan, dan aturan transaksi tidak diubah.

## Audit dan keputusan integrasi

- **Identitas dan metadata:** 17 `gameKey` serta urutannya sama dengan katalog baseline. ID Registry memakai `powerup.<gameKey>`; `ItemCatalog` memetakan kembali ke ID lama tanpa prefix. Nama, rarity, harga, mata uang, deskripsi, maps, dan status takedown cocok dengan baseline. Power tidak memiliki field `tier` terpisah pada katalog lama, sehingga tidak ditambahkan. Harga pada manifest tetap cocok dengan harga Coin server; `gems` tetap `null`.
- **Katalog dan fallback:** `ItemCatalog` mengadopsi Power hanya jika seluruh manifest valid dan cocok; tanpa rantai Registry lengkap, builder legacy tetap dipakai. Paritas semua 147 item dan API katalog lama diuji.
- **Kepemilikan dan transaksi:** Power tetap consumable dengan quantity, `slot: null`, bukan equipment. PlayerData dan server tetap menjadi pemilik data kepemilikan; pemakaian/pembelian tetap melalui RPC `use_powerup` dan `buy_powerup`. Halaman Power-up adalah alur pembelian tersendiri; tidak dipindahkan ke transaksi `buy_item`. Harga pada metadata klien diverifikasi terhadap migrasi SQL server, yang tetap otoritatif.
- **Shop, Inventory, dan halaman:** rantai Registry/manifest Power dimuat sebelum `ItemCatalog` pada `shop.html`, `inventory.html`, `room.html`, `gameplay.html`, dan `powerup.html`. Tidak ada duplikasi tag atau perubahan bentuk katalog.
- **Model dan efek bersama:** `visual.modelKey` menghubungkan manifest ke `PowerCatalog`/renderer bersama; `PowerRegistry` menyediakan fallback untuk halaman lama. Animasi, aura, partikel 3D, dan audio tetap menggunakan modul bersama. `PowerFX` mengambil `visual.effect2d` dan mempertahankan alias efek lama untuk guard/totem.
- **Audio:** semua file yang diwajibkan oleh tabel suara gameplay tersedia. Lima file opsional belum tersedia: `feather.mp3`, `golden-apple.mp3`, `shield-up.mp3`, `diamond-sword-use.mp3`, dan `netherite-sword-use.mp3`. Kode yang ada menyediakan fallback; pedang memakai `swordUse`, sedangkan Power lain memakai `PowerSound` sintetis/pop. Tes memastikan jalur fallback tersebut tetap aktif.
- **Server dan sinkronisasi:** tidak ada perubahan skema, migrasi, RPC, atau sinkronisasi PlayerData. Tes memeriksa harga 17 Power terhadap migrasi server, serta memastikan Power tidak mendapat slot equip.

## Temuan Particle FX

Referensi `room.html` sebelumnya mengarah ke path yang tidak ada. Path diperbaiki menjadi `gameplay/js/particle-fx.js` dan `gameplay/css/particle-fx.css`; kedua file ada. Browser lokal mengembalikan HTTP 200 dengan MIME JavaScript/CSS yang sesuai untuk keduanya.

## Aset dan cache

Semua 17 ikon PNG tersedia dan lolos validasi path/ukuran minimum. Referensi model, animasi, aura, partikel, FX, dan audio bersama tersedia. `assets/preload-manifest.json` diperbarui menjadi 779 entri; pemeriksaan berkas dan ukuran menemukan 0 ketidakcocokan. Versi service worker dinaikkan ke `ut-pwa-v179`.

## Pengujian

| Lapisan | Hasil |
|---|---|
| Tes khusus Stage 6 (`tests/power-registry-parity.test.js`) | 11/11 lulus |
| Renderer 3D (`tests/power3d.test.js`) | 8 lulus |
| Integrasi Frame yang terdampak perubahan API (`tests/frame-catalog-integration.test.js`) | 21 lulus |
| Suite Node lengkap, baseline bersih pada `1e615c8` | 48/57 lulus; 9 gagal |
| Suite Node lengkap setelah Stage 6 | 49/58 lulus; 9 gagal |
| Browser | Pemeriksaan HTTP aset/halaman lulus; alur visual/gameplay penuh tidak teruji |
| jsdom | Tidak dijalankan |
| Eksekusi migrasi SQL/integrasi database | Tidak dijalankan; pemeriksaan migrasi bersifat statis |

Suite lengkap direproduksi pada worktree baseline terpisah dan menghasilkan sembilan kegagalan yang sama sebelum maupun sesudah perubahan: `aura-catalog`, `aura-view`, `blocky-actions`, `dice-registry-parity`, `gameplay-win-result`, `pet-catalog`, `power-rules`, `schema-snapshot`, dan `store-card-status`. Kegagalan `dice-registry-parity` mencakup pemeriksaan seed SQL lama yang sudah usang; `power-rules` gagal pada assertion gameplay `resolveTileAt`; `schema-snapshot` bergantung pada `sh` yang tidak tersedia di Windows. Kegagalan tersebut telah ada pada baseline dan tidak diperluas atau diperbaiki sebagai bagian Stage 6.

**Batas pengujian browser:** navigasi ke halaman aplikasi diarahkan ke splash/login, sehingga tidak ada sesi yang mencapai layar Power atau gameplay. Pemeriksaan browser langsung mengonfirmasi status 200 untuk halaman terkait, Registry, manifest, modul Power 3D, serta Particle FX. Satu peringatan MIME modul muncul pada navigasi splash melalui server statis uji; karena layar target tidak tercapai, hasil ini tidak dianggap sebagai tes browser end-to-end. Tidak ada klaim pengujian visual atau penggunaan Power langsung.

## Git

- Titik awal: `restruktur` dan `origin/restruktur` di `1e615c83793c652ba3667c7b247295d2dc76c2f4`.
- Implementasi: commit `0a36810` (`feat(power): integrate Stage 6 registry`), sudah didorong ke `origin/restruktur`.
- `main` berada di `aeb11acf130df4ade4acc9417f01470e40a33dbb` saat audit; tidak diubah.
- Stage 7 tidak dimulai.
