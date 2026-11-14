# Dragon Roll — Stage 4: Pet Registry Pilot

Status: IMPLEMENTED + TESTED (Node + jsdom) di branch `restruktur`. Render visual/audio di browser nyata: **NOT TESTED**. Gameplay tidak disentuh.

## 1. Git baseline & branch
| Item | Nilai |
|---|---|
| Baseline | `main` = `origin/main` = `aeb11ac`, worktree bersih |
| `origin/restruktur` | belum ada; dibuat dari `main` (Stage 2 `3f9c215` dan Stage 3 `19b56b4` + `aeb11ac` sudah di `main`, jadi tidak ada baseline lama yang hilang) |
| Branch kerja | `restruktur`. `main` tidak diubah, tidak ada merge/force push/reset |

## 2. Stage 3 checkpoint
PASS — `frame-catalog-integration` 21/21 (disesuaikan: API baru `petSource`, dan `pet.html` dikecualikan dari cek "halaman lain tanpa rantai"), Frame tetap 14/14 dari Registry.

## 3. Pet item mapping (7/7, sumber: ItemCatalog runtime)
| id | rarity | tier | role | price | gems | gambar (pet-page.js) |
|---|---|---|---|---|---|---|
| pet.forest_pup | common | 1 | Pengendus | 3000 | – | assets/ng/pet3d/forest_pup.png |
| pet.copper_golem | uncommon | 2 | Pelindung | 9000 | – | .../copper_golem.png |
| pet.crystal_axolotl | rare | 3 | Penyembuh | 25000 | – | .../crystal_axolotl.png |
| pet.arcane_owl | epic | 4 | Peramal | 60000 | – | .../arcane_owl.png |
| pet.storm_wolf | legendary | 5 | Penyerang | – | 1500 | .../storm_wolf.png |
| pet.inferno_dragon | mythic | 6 | Pembakar Ular | – | 3000 | .../inferno_dragon.png |
| pet.celestial_kitsune | divine | 7 | Pengubah Takdir | – | 6000 | .../celestial_kitsune.png |

Semua `starter:false`. Harga runtime berasal dari `TIER_PRICE` (literal `pet(...)` memakai `price:null`).

## 4. Temuan audit (struktur Pet BERBEDA dari Frame)
- Item Pet punya field katalog `tier, role, accent, colors[3]` (Frame tidak punya) dan **tidak punya field `image`** — gambar dibangun `pet-page.js` (`IMAGE_ROOT + gameKey + '.png'`).
- Visual 3D dan audio TIDAK ada di katalog: `assets/js/pet-viewer.js` (render, dan peta audio per indeks tier -> 3 mp3 per pet di `assets/sfx/pet/`, 21 file). Tidak diduplikasi ke manifest; `pet-viewer.js`, `pet-page.js`, dan `assets/sfx/` tidak berubah.
- Konsumen data Pet = `pet.html` (`pet-page.js`: daftar kind `pet` urut tier, pembelian via PlayerData/WalletService, equip slot `pet`). Shop menjual peti (bukan Pet), Inventory hanya menautkan tab ke `pet.html`, Profile tidak membaca metadata Pet.

## 5. Manifest implementation
`data/inventory/pet/<gameKey>/manifest.js` (7) + `data/inventory/pet/index.js` (pola sama dengan Frame: KEYS urut tier, `register(registry)` tidak melempar, antrean `UT.ItemManifests` difilter `kind === 'pet'`). Field: `id, kind, gameKey, name, rarity, tier, role, price, gems, starter, desc, visual{accent, colors}, assets{image}`. Kategori `pet` tanpa `fallbackId` (slot opsional, tidak ada pet bawaan) sehingga `getItemOrFallback` -> `null` (sesuai konfigurasi). Nilai dibuat dari snapshot baseline (tidak ada data baru). `assets.image` = path yang memang dipakai `pet-page.js`; adapter tidak menambahkannya ke item katalog (bentuk item = baseline).

## 6. Registry integration
`item-catalog.js`: adapter Frame Stage 3 digeneralisasi menjadi `adoptFromRegistry(kind, build)` (perilaku Frame tidak berubah); `petFromManifest` membangun 7 Pet, posisi/urutan ITEMS sama. API baru diagnostik `petSource()` ('registry'|'legacy'). Jalur cadangan (literal `pet(...)` + `TIER_PRICE`) dipertahankan untuk halaman/tes yang tidak memuat Registry (mis. `gameplay.html`); drift dijaga tes. Registrasi idempoten, tanpa Registry baru.

## 7. Script loading
`pet.html` saja: `item-registry.js` -> 7 manifest -> `pet/index.js` -> `item-catalog.js` -> skrip halaman (tag statis, tanpa `document.write`, tanpa loader async). Halaman lain tidak diubah (memakai jalur cadangan untuk Pet; Frame tetap dari rantai Stage 3 di 5 halamannya). Di `pet.html`, Frame memakai jalur cadangan (identik).

## 8. Parity
- ItemCatalog 147/147; Pet 7/7; Frame 14/14; urutan ID sama; tanpa ID ganda; **deep-equal seluruh 147 item terhadap baseline** pada kombinasi jalur: cadangan, Pet-Registry saja, Pet+Frame-Registry.
- Metadata Pet (id, kind, gameKey, nama, rarity, tier, role, price, gems, starter, desc, accent, colors) = baseline 7/7. Bukti sumber: mutasi manifest `storm_wolf` pada VM bersih mengubah katalog.
- Semua API baseline tetap ada (tipe sama); tambahan hanya `frameSource`, `petSource`.

## 9. Price / gems & server compatibility
Server tetap otoritas; seed/migrasi TIDAK diubah. `node tools/wallet/gen-item-seed.js --check` -> sinkron (147 item, 63 gear). Tes mencocokkan id/kind/koin/gems/starter 7 Pet dengan blok `PET SEED` migrasi `202611290001_pet_catalog.sql` dan keberadaan gameKey di `supabase/pet_catalog.sql`. Tidak ada perbedaan klien-server (tidak ada STOP).

## 10. Asset validation (dipisah)
| Lapis | Hasil |
|---|---|
| A. validateManifest | PASS 7/7 |
| B. FORMAT path | PASS 7/7 (7 path unik) |
| C. file ada, tidak kosong, header PNG | PASS 7/7; 21 mp3 sfx Pet ada |
| D. pemuatan di browser | **NOT TESTED** |

## 11. Audio & visual regression
Kode render/audio tidak disentuh (`git diff` kosong untuk `pet-viewer.js`, `pet-page.js`, `assets/sfx/`). Tes memastikan 21 mp3 ada dan masih dirujuk `pet-viewer.js`. Perilaku visual/animasi/audio saat dijalankan: **NOT TESTED** (tidak ada browser).

## 12. Browser test
jsdom 24 (parser HTML nyata): `pet.html` -> `petSource=registry`, 7 Pet, 147 item, 0 file 404, 0 skrip ganda. `shop/inventory/profile/karakter/frame` -> `petSource=legacy`, Frame `registry`, 7 Pet/147 item. `gameplay.html`, `lobby.html` -> legacy, 147 item. Error konsol jsdom hanya keterbatasan jsdom (canvas/WebGL/matchMedia). Shop/Inventory/Profile di browser nyata: **NOT TESTED**.

## 13. Automated tests
Baru: `tests/pet-registry-parity.test.js` **29/29 PASS**. Stage 2/3: 16/16, 18/18, 21/21 PASS. Suite: **49 PASS, 8 FAIL**; daftar identik dengan baseline Stage 3 (di luar tes baru); keluaran 7 kegagalan `.js` identik sebelum/sesudah. `pet-catalog.test.js` gagal sejak sebelumnya hanya pada asersi terakhir (`lobby.html` harus memuat string `pet:'pet.html'`), 13 `ok` sebelum dan sesudah; tidak terkait Registry.

## 14. Service worker & preload
`sw.js` `ut-pwa-v176` -> `v177`; `tools/gen-preload-manifest.py`: +8 file (7 manifest + `pet/index.js`), ukuran `item-catalog.js` berubah; tidak ada perubahan lain.

## 15. Files
Dibuat: `data/inventory/pet/index.js`, `data/inventory/pet/<7 key>/manifest.js`, `tests/pet-registry-parity.test.js`, laporan ini.
Diubah: `assets/js/item-catalog.js`, `pet.html` (rantai skrip), `sw.js`, `assets/preload-manifest.json`, `tests/frame-catalog-integration.test.js` (penyesuaian di bagian 2).
Tidak berubah (diverifikasi): `gameplay.html`, `gameplay/`, `assets/js/game-integration.js`, `assets/js/player-data.js`, `supabase/`, `data/frame/`, `pet-viewer.js`, `pet-page.js`, `assets/sfx/`, `assets/ng/pet3d/`.

## 16. Known issues
1. Data Pet ada di dua tempat sementara (manifest + jalur cadangan), dijaga tes — sama seperti Frame.
2. Visual/audio/render Pet dan halaman Shop/Inventory/Profile di browser nyata belum diuji.
3. 8 tes gagal pra-ada belum ditangani.
4. CI `db-migrate.yml` (terpicu perubahan `assets/js/**`/`tests/**`) belum diperiksa.
5. Jalur cadangan baru bisa dihapus bila `gameplay.html` boleh disentuh atau semua halaman memuat rantai Registry.

## 17. Next
STAGE 5 — DICE REGISTRY. Catatan: Dice dipakai `gameplay` dan `assets/js/dice-kit/` (DiceCatalog.js punya data visual sendiri) -> audit sumber data visual dulu, jangan menduplikasi. Pertimbangkan helper generik agar rantai skrip per halaman tidak makin panjang.

## 18. Commit & push
Lihat laporan akhir / `git log` (hash dicatat setelah verifikasi push).
