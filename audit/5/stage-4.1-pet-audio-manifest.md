# Dragon Roll — Stage 4.1: Pet Audio Manifest Integration

Status: IMPLEMENTED + TESTED (Node + VM yang menjalankan kode nyata `pet-viewer.js`). Playback audio di browser nyata: **NOT TESTED**. Gameplay tidak disentuh.

## 1. Kondisi Git
| | Awal | Akhir |
|---|---|---|
| Branch | `restruktur` | `restruktur` |
| HEAD | `d00bcec` (= `origin/restruktur`) | lihat bagian 12 |
| `origin/main` | `aeb11ac` | `aeb11ac` (tidak diubah) |
| Worktree | bersih | bersih setelah commit |

## 2. Audit SFX Pet (kode aktual `assets/js/pet-viewer.js`)
- Sebelum 4.1, path dipetakan hardcoded per **indeks tier** (`PET_FILES[0..6]`), 3 file per Pet, lalu dipasangkan ke `SND[indeks][slot]` (SND = sintesis lama, dipertahankan sebagai cadangan).
- **Tidak ada nama event per file.** Satu-satunya pemutar adalah `playPetSound()`: mengambil slot `k` dari "kantong" acak `[0,1,2]` (tidak mengulang slot yang sama berturut-turut) lalu memanggil `SND[cur][k]()`. Pemicunya hanya dua: (a) timer `sndT=rr(3,5.5)` detik di loop `frame()`, (b) `setTimeout(playPetSound,120)` saat ganti Pet (bila audio sudah di-unlock). Syarat: `soundOn`, `sfxEnabled()` (PlayerData sound + slider `sfxVol` + `UT.Audio` tidak mute), `AC.state==='running'`. Volume: `MASTER.gain=.55*sfxVol`.
- Karena itu manifest memakai **larik berurutan** (slot 0,1,2), bukan nama event rekaan.
- Pemanggil lain `PetViewer`: hanya `pet.html` (`pet-page.js` -> `PetViewer.select(id)`). Tidak ada halaman lain yang memuat `pet-viewer.js`.

## 3. Daftar 7 Pet x 3 SFX = 21 file (lokasi lama `assets/sfx/pet/`, tidak dipindah)
| Pet (id) | slot 0 | slot 1 | slot 2 |
|---|---|---|---|
| pet.forest_pup | forest-pup-bark-burst | forest-pup-bark | forest-pup-whimper |
| pet.copper_golem | copper-golem-clang | copper-golem-steam | copper-golem-servo |
| pet.crystal_axolotl | crystal-axolotl-bubble | crystal-axolotl-chime | crystal-axolotl-squeak |
| pet.arcane_owl | arcane-owl-hoot | arcane-owl-sparkle | arcane-owl-flap |
| pet.storm_wolf | storm-wolf-howl | storm-wolf-thunder | storm-wolf-zap |
| pet.inferno_dragon | inferno-dragon-roar | inferno-dragon-fire | inferno-dragon-wings |
| pet.celestial_kitsune | celestial-kitsune-bell | celestial-kitsune-cry | celestial-kitsune-shine |

Semua berekstensi `.mp3` di `assets/sfx/pet/`. Tidak ada mp3 yatim di folder itu (21 di disk = 21 di manifest).

## 4. Perubahan
- **7 manifest** `data/inventory/pet/<key>/manifest.js`: `assets.sfx` = larik 3 path (urutan = slot). Komentar header diperbarui. Field lain (id, harga, gems, rarity, desc, visual, image) tidak berubah.
- **`pet-viewer.js`**: `PET_FILES` hardcoded dihapus. Fungsi baru `petSfxFromManifest(id)` membaca `UT.ItemRegistry.shared().getItem('pet.'+id).assets.sfx` (dicari per **id**, tidak bergantung urutan Registry/array Pet); wiring `PETS.forEach` memasang file ke `SND[i][slot]` seperti sebelumnya. `petLoad`, `petPlayFile`, `petPreloadFiles`, `playPetSound`, timer, volume, dan sintesis cadangan **tidak diubah**. Bila Registry/`sfx` tidak ada/tidak valid (bukan tepat 3 string), Pet itu memakai sintesis lama; tidak ada pemetaan kedua.
- **ItemCatalog tidak berubah**: item katalog tetap tanpa field `sfx/audio/assets` (deep-equal 147 item = baseline).
- Tidak ada Audio Engine baru, tidak ada struktur `assets/audio/`, Music/Voice tidak disentuh.

## 5. Validasi path (dipisah)
| Lapis | Hasil |
|---|---|
| A. validateManifest | PASS 7/7 |
| B. format path (ekstensi mp3) | PASS 21/21 |
| C. file ada, >1000 byte, header MP3 (ID3/frame sync), tanpa yatim | PASS 21/21 |
| D. pemuatan/pemutaran di browser | **NOT TESTED** |

## 6. Tes
- `tests/pet-registry-parity.test.js`: 29 -> **38/38 PASS**. Asersi lama "manifest tidak mereferensikan audio" diganti; ditambah: 21 referensi (3/Pet, unik), path+urutan = baseline Stage 4 (dibekukan di tes), validasi A/B/C, ItemCatalog tidak menggandakan SFX, viewer tanpa literal mp3, **kode nyata viewer dijalankan di VM** (PET_FILES = baseline per indeks tier; `SND[pet][slot]` tetap fungsi; cadangan sintesis jalan), mutasi manifest mengubah yang dibaca viewer, urutan registrasi dibalik tidak berpengaruh, tanpa Registry/`sfx` tidak melempar, event/trigger/timing/volume tidak berubah (potongan kode kunci), urutan skrip `pet.html`, 21 mp3 terdaftar di preload manifest.
- Regresi: `item-registry` 16/16, `frame-registry-parity` 18/18, `frame-catalog-integration` 21/21 PASS.
- Suite penuh: **49 PASS / 8 FAIL**, sama dengan baseline sebelum 4.1: daftar kegagalan identik (aura-catalog, aura-view, blocky-actions, gameplay-win-result, pet-catalog, power-rules, store-card-status, gameplay-dice-throw-race) dan keluaran 7 tes `.js` identik. **Tidak ada kegagalan tambahan.**
- Catatan batas bukti: VM menguji *wiring dan sumber data*, bukan bunyi. Itu bukan bukti audio terdengar.

## 7. Browser
**NOT TESTED** (sesi ini tanpa browser). Perlu dicek manual di `pet.html`: ganti ke tiap Pet -> terdengar rekaman asli (bukan sintesis), 3 suara bergantian acak, mengikuti tombol Suara dan slider Efek suara; tab Network tanpa 404 untuk `data/inventory/pet/*/manifest.js` dan `assets/sfx/pet/*.mp3`.

## 8. Service worker & preload
Tidak diubah (bump/regenerasi tanpa alasan teknis tidak dilakukan): JS diambil network-first sehingga manifest dan `pet-viewer.js` baru dipakai saat online; MP3 sama (path tidak berubah) dan cache-first tetap berlaku; ke-21 mp3 sudah ada di `preload-manifest.json`.

## 9. File
Dibuat: `audit/5/stage-4.1-pet-audio-manifest.md`.
Diubah: 7 `data/inventory/pet/<key>/manifest.js`, `assets/js/pet-viewer.js`, `tests/pet-registry-parity.test.js`.
Tidak berubah (diverifikasi `git diff`): `gameplay.html`, `gameplay/`, `assets/js/player-data.js`, `assets/js/item-catalog.js`, `assets/js/game-integration.js`, `supabase/`, `sw.js`, `assets/preload-manifest.json`, `pet.html`, `pet-page.js`, `assets/sfx/`, Shop/Inventory/Character/Profile, `data/inventory/frame/`.

## 10. Known issues
1. `preload-manifest.json` menyimpan ukuran byte 8 file JS (7 manifest + `pet-viewer.js`) yang kini selisih beberapa ratus byte; hanya memengaruhi hitungan bar loading, bukan fungsi. Diperbaiki otomatis pada regenerasi berikutnya yang memang diperlukan.
2. Playback browser belum diuji.
3. 8 tes gagal pra-ada belum ditangani.
4. CI `db-migrate.yml` belum diperiksa.
5. Selama sesi `assets/preload-manifest.json` sempat berubah sendiri setelah suite tes dijalankan (hanya 8 ukuran file di atas; penyebab tidak teridentifikasi, tidak dipicu perintah saya). Dikembalikan ke HEAD (`git checkout`) agar sesuai keputusan tanpa regenerasi.
6. Larik `assets.sfx` bergantung urutan slot; urutan itu hanya bermakna di dalam manifest (viewer tidak membedakan slot, mengacaknya).

## 11. Next
Menunggu instruksi. Tidak memulai Stage 5 (Dice Registry) maupun restrukturisasi audio global.

## 12. Commit & push
Lihat laporan akhir / `git log`.
