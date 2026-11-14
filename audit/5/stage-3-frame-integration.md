# Dragon Roll — Stage 3: Frame Registry Integration

Status: IMPLEMENTED + TESTED (Node + jsdom). Render nyata di browser: **NOT TESTED**. Gameplay tidak disentuh.

## 1. Git baseline
| Item | Nilai |
|---|---|
| Baseline | `main` = `origin/main` = `06365a865fb7cb18356d30161c1ed43e24c03123`, worktree bersih |
| Branch kerja | `stage-3-frame-integration` (fast-forward ke `main` saat push, tanpa force) |

## 2. Stage 2 checkpoint status
Stage 2 **belum ada di GitHub** saat Stage 3 dimulai (tidak ada di `main` maupun branch remote mana pun). Diterima sebagai patch + tarball dari pengguna; tarball identik dengan patch (`diff -r` kosong). Patch diterapkan apa adanya (`git am`) sebagai commit checkpoint tersendiri `3f9c215`, lalu Stage 3 dikerjakan di atasnya sebagai commit terpisah. Audit ulang kode: API Registry sesuai laporan; `item-registry.test.js` 16/16 dan `frame-registry-parity.test.js` 18/18 lulus. Registry, manifest, validasi, proteksi duplikat, fallback, deep-freeze tidak diubah.

## 3. Registry integration design
```
14 manifest Frame (data/inventory/frame/<key>/manifest.js)
   -> UT.ItemCategories.frame.register(UT.ItemRegistry.shared())
   -> adapter frameFromManifest()  (di item-catalog.js)
   -> ITEMS[] (posisi/urutan item Frame TIDAK berubah)  -> ItemCatalog (API publik tetap)
```
- Adapter dijalankan sesudah loop `TIER_PRICE`, sehingga hasil Registry menimpa nilai literal/TIER_PRICE untuk Frame. Pendaftaran idempoten (`getCategory('frame')` dicek dulu) -> tidak ada registrasi ganda.
- Item hasil adapter dibangun ulang sebagai objek baru (bukan item deep-frozen Registry) lalu melewati pipeline ItemCatalog yang sama (category/slot/stackable/featured, freeze).
- ItemCatalog tidak bergantung pada DOM. Tambahan API: `ItemCatalog.frameSource()` -> `'registry' | 'legacy'` (diagnostik saja).
- **Jalur cadangan (`legacy`)**: bila Registry/manifest tidak dimuat, literal `frame(...)` + `TIER_PRICE` lama tetap dipakai. Ini disengaja: `gameplay.html` (dilarang diubah) dan ~15 tes Node memuat `item-catalog.js` tanpa Registry. Konsekuensi: untuk sementara data Frame ada di dua tempat (manifest = sumber utama di halaman terhubung; literal = cadangan). Drift dijaga tes (kedua jalur harus identik dengan baseline). Rekomendasi: hapus jalur cadangan setelah `gameplay.html` boleh disentuh.

## 4. Script loading order
Dipakai tag `<script>` klasik statis (deterministik), tepat sebelum `item-catalog.js`:
`item-registry.js` -> 14 `manifest.js` (urutan KEYS) -> `data/inventory/frame/index.js` -> `item-catalog.js`.
Halaman terhubung (5): `shop.html`, `inventory.html`, `karakter.html`, `profile.html`, `frame.html`. Halaman lain (termasuk `gameplay.html`) tidak diubah dan memakai jalur cadangan (hasil identik). Tidak ada pemuatan ganda manifest; tidak ada race (semua sinkron, berurutan).
Catatan: percobaan awal memakai loader `document.write` dibuang karena di jsdom skrip hasil write dieksekusi SETELAH `item-catalog.js`; perilaku browser nyata tidak bisa dibuktikan di sini, sedangkan tag statis terbukti.

## 5. ItemCatalog API compatibility
Seluruh 24 kunci API baseline tetap ada dengan tipe sama; satu kunci baru (`frameSource`). `byId`, `byGameKey`, `cost`, `starters`, `defaultEquipped`, `FRAME_TAB_ICON`, `items` (frozen) diuji sama di kedua jalur. `byId('frame.tidak-ada')` -> `null`.

## 6. 147-item parity
Baseline = snapshot runtime sebelum perubahan (`tests/fixtures/item-catalog-baseline.json`, dibuat dari kode asli). Hasil: 147/147 item, urutan ID sama, tidak ada ID ganda, **deep-equal seluruh field** terhadap baseline untuk jalur Registry dan jalur cadangan; 133 item non-Frame identik.

## 7. 14-frame metadata parity
14/14: id, name, kind, rarity, price, gems, starter, desc, featured, image, gameKey, category, slot, stackable = baseline. `visual` (fxKey, tier, marginCells) tetap di manifest/Registry dan sudah dicocokkan dengan `frame-fx.js` oleh tes Stage 2 (18/18). Bukti sumber: tes memutasi satu manifest (nama, gems, harga) pada salinan -> katalog mengikuti manifest.

## 8. Price / gems authority
- Urutan pembentukan harga klien (diverifikasi): literal `frame(...)` (usang) -> ditimpa `TIER_PRICE` -> (Stage 3) ditimpa manifest Registry bila dimuat. Nilai akhir identik dengan runtime sebelumnya.
- **Sumber metadata klien untuk Frame = manifest.** Server tetap otoritas transaksi/kepemilikan; seed/migrasi Supabase TIDAK diubah.
- Tes mencocokkan harga/gems 13 Frame berbayar dengan seed server fase 3; `node tools/wallet/gen-item-seed.js --check` -> "seed sinkron (147 item, 63 gear)".
- Perbedaan klien-server yang sudah ada & dipertahankan: `frame.default` klien `price 0, starter true`, server `price null, starter true`. `TIER_PRICE` untuk Frame kini hanya dipakai jalur cadangan.

## 9. Browser validation
| Lapis | Hasil |
|---|---|
| jsdom 24 (parser HTML nyata, skrip eksternal dari `file://`) | 5 halaman: `frameSource=registry`, 147 item, 14 Frame, 0 file 404, 0 skrip ganda pada dokumen masing-masing. `gameplay.html`: `legacy`, 147 item. |
| Error konsol jsdom | Hanya keterbatasan jsdom (canvas `getContext`/`createImageData`, WebGL, `matchMedia`, navigasi) — bukan dari perubahan ini. |
| Render visual Frame di browser, tampilan Shop/Inventory/Character/Profile, DevTools console/network | **NOT TESTED** (tidak ada browser sungguhan di lingkungan ini) |

## 10. Asset loading
Aset tetap di `data/frame/` (tidak dipindah). Path 14 gambar + ikon tab sama dengan sebelumnya (parity), 15 file ada di disk dengan header WebP valid (tes Stage 2 lapis C). Pemuatan gambar di browser: **NOT TESTED**. Fallback ID hilang: `Registry.getItemOrFallback` -> `frame.default`; `ItemCatalog.byId` -> `null` (perilaku lama).

## 11. Regression test
- Baru: `tests/frame-catalog-integration.test.js` **21/21 PASS**.
- Stage 2: `item-registry` 16/16, `frame-registry-parity` 18/18 PASS.
- Seluruh suite: **48 PASS, 8 FAIL**. Delapan kegagalan = pra-ada (aura-catalog, aura-view, blocky-actions, gameplay-win-result, pet-catalog, power-rules, store-card-status, gameplay-dice-throw-race.mjs); daftar PASS/FAIL identik dengan baseline dan keluaran kegagalan (7 tes .js) identik sebelum/sesudah. Tes multiplayer: PASS.
- PlayerData: snapshot (kepemilikan, equip, pembelian ditolak tanpa login) identik di kedua jalur. AppearanceService memuat dengan katalog jalur Registry. Logika transaksi/penyimpanan tidak diubah.

## 12. File changes
Diubah: `assets/js/item-catalog.js` (+31), `shop.html`, `inventory.html`, `karakter.html`, `profile.html`, `frame.html` (rantai skrip), `sw.js` (`ut-pwa-v175` -> `v176`), `assets/preload-manifest.json` (dijalankan `tools/gen-preload-manifest.py`: +17 file baru, ukuran `item-catalog.js` berubah; tidak ada perubahan aset lain).
Baru: `tests/frame-catalog-integration.test.js`, `tests/fixtures/item-catalog-baseline.json`, laporan ini.
Tidak berubah (diverifikasi `git diff`): `gameplay.html`, `gameplay/`, `assets/js/game-integration.js`, `assets/js/player-data.js`, `supabase/`, `data/frame/`.

## 13. Known issues
1. Data Frame duplikat sementara (manifest + jalur cadangan) — dijaga tes, lihat bagian 3.
2. Render/jaringan di browser nyata belum diuji (bagian 9).
3. 8 tes gagal pra-ada belum ditangani.
4. Push menyentuh `assets/js/**` dan `tests/**` -> memicu CI `db-migrate.yml`; hasil CI tidak diperiksa di sini.
5. Halaman dalam `iframe` (mis. `inventory.html` menyematkan halaman lain) memuat rantai skrip per dokumen — normal, bukan duplikasi dalam satu dokumen.

## 14. Rekomendasi Stage 4 (Pet Registry Pilot)
Ulangi pola Frame (manifest -> index.js -> adapter -> parity vs baseline). Pet punya data skill di `supabase/pet_catalog.sql` dan `TIER_PRICE` tersendiri; mulai dari audit sumber harga/skill. Pertimbangkan helper adapter generik agar tidak menyalin blok di `item-catalog.js`, dan minta izin menyentuh `gameplay.html` agar jalur cadangan bisa dihapus.

## 15. Commit & push
Lihat laporan akhir / `git log` (hash dicatat setelah verifikasi push).
