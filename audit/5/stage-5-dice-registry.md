# Dragon Roll — Stage 5: Dice Registry & Integration

Status: IMPLEMENTED + TESTED (Node + VM + jsdom) di branch `restruktur`. Render 3D, animasi lempar, efek, suara, dan alur beli/equip di browser nyata: **NOT TESTED**. Gameplay, PlayerData, server/Supabase, DiceKit, dan aset **tidak disentuh**.

## 1. Git baseline
| Item | Nilai |
|---|---|
| Branch | `restruktur` (tracking `origin/restruktur`) |
| HEAD awal | `12c15c8` (Stage 4.1) = checkpoint yang diminta; worktree bersih |
| `main` | tidak diubah, tidak ada merge/force push/reset |
| GitHub token | tidak diminta dan tidak dipakai (repo publik, clone anonim) |

## 2. Baseline tes sebelum perubahan
Suite penuh (`tests/*.test.js` + `*.test.mjs`): **49 PASS, 8 FAIL** — identik dengan angka Stage 4. 8 gagal pra-ada: `aura-catalog`, `aura-view`, `blocky-actions`, `gameplay-dice-throw-race` (.mjs), `gameplay-win-result`, `pet-catalog`, `power-rules`, `store-card-status`.
`gameplay-dice-throw-race` gagal karena stub THREE pada harness (`THREE.MeshStandardMaterial is not a constructor`), bukan karena Registry.

## 3. Temuan audit: sistem Dice sebelum Stage 5
| Lapisan | Lokasi | Isi |
|---|---|---|
| Metadata katalog (klien) | `assets/js/item-catalog.js`: literal `dice(...)` (23) + `TIER_PRICE` | id `dice.<key>`, nama, rarity UI (4 tingkat), harga koin/gems, starter, desc, `art{bg,accent?,pip,edge}`, `tier`/`collection`/`materialName` (20 dadu Dragon Roll), `featured`, `legacyIds` (klasik, emas) |
| Material & efek 3D | `assets/js/dice-kit/DiceCatalog.js` (modul ES) | 23 dadu: material, efek (partikel, glow, landing, suara prosedural), rarity visual 7 tingkat. Dipakai `dadu.html` (preview), `room-dice-art.js` (thumbnail), `gameplay/js/dice-throw.js` (import dinamis), `dice-ui.js` |
| Render/fisika/suara dadu | `assets/js/dice-kit/*.js` | Prosedural: **tidak ada berkas gambar per dadu**. Suara efek = WebAudio di `DiceEffectsCore.js`. Satu-satunya berkas suara: `assets/sfx/dice/dice-roll.mp3`, milik peta audio gameplay (`gameplay/js/audio.js`, kunci `roll`) |
| Harga/kepemilikan/transaksi | Server (`item_catalog`, migrasi `202611170001` + phase3 `202611280001`), `wallet-service.js`, `PlayerData` | Klien hanya menampilkan; server otoritas |
| Equip | `PlayerData` slot `dice`; `ItemCatalog.defaultEquipped.dice = 'dice.klasik'`; event `diceChanged` (`app.js`) | |
| Konsumen | `dadu.js` (daftar/beli/equip), `room.js` (+`room-dice-art.js`), `mode.js`, `room-flow.js`, `game-integration.js` (`PD.owns('dice.'+key)`, fallback `klasik`), `gameplay/main.js` (dadu pemain lain: `equipped.dice` → `byId` → `gameKey`), `dice-ui.js` (`DiceKit.has(key)` else `klasik`), `profile.js` (hitung koleksi), `item-art.js` (ikon statis) | |
| Shop / Inventory | `shop.js`, `inventory.js` | Tidak membaca metadata kind `dice` (verifikasi grep + tes). Halaman Dadu = `dadu.html` |
| Service worker / preload | `sw.js` VERSION, `assets/preload-manifest.json` (`tools/gen-preload-manifest.py`) | |

### Dependensi nyata yang dipetakan
`manifest.js` ×23 → `data/inventory/dice/index.js` → `ItemRegistry.shared()` → `ItemCatalog.adoptFromRegistry('dice')` → `ItemCatalog.items/byId/byGameKey` → {`dadu.js`, `room.js`, `item-art.js`, `PlayerData` (validasi slot), `game-integration.js`, `mode.js`, `room-flow.js`, `gameplay`}. Visual 3D: `gameKey` → `DiceKit.has/mount/thumb` (tidak lewat Registry).

## 4. Struktur sebelum dan sesudah
Sebelum: metadata Dice hanya di literal `item-catalog.js`.
Sesudah:
```
data/inventory/dice/index.js              kategori 'dice' (fallbackId dice.klasik), KEYS urut katalog, register()
data/inventory/dice/<gameKey>/manifest.js 23 manifest (satu folder per Dice)
```
Field manifest: `id, kind, gameKey, name, rarity, [tier, collection, materialName], price, gems, starter, [featured], [legacyIds], desc, visual{bg,accent?,pip,edge}, assets:{}`.
`assets` per item **kosong dengan sengaja** (tidak ada berkas per dadu). Referensi aset yang nyata ada di kategori: `assets.renderKit = assets/js/dice-kit/DiceCatalog.js` (rujukan ke sumber render, bukan salinan). `dice-roll.mp3` tidak dirujuk di manifest agar tidak menduplikasi peta audio gameplay.
Tidak ada: struktur audio global baru, pemindahan aset, perubahan ID/format, field kepemilikan/equip/transaksi di manifest.

## 5. Integrasi yang dilakukan
- `item-catalog.js`: `diceFromManifest` + `adoptFromRegistry('dice', ...)` (pola Stage 3/4); API baru diagnostik `diceSource()` ('registry'|'legacy'). Posisi/urutan ITEMS dan bentuk item = baseline. Jalur cadangan (literal `dice(...)` + `TIER_PRICE`) **dipertahankan**.
- `dadu.html` dan `room.html`: rantai skrip statis `item-registry.js` → 23 manifest → `dice/index.js` → `item-catalog.js`. Dua halaman ini membaca metadata Dice (daftar/harga/rarity, nama & thumbnail equip).
- `sw.js` `ut-pwa-v177` → `v178`; `assets/preload-manifest.json` diregenerasi (+24 berkas Dice).
- Equip/Gameplay: **tidak ada perubahan kode**. Satu sumber ID: `PlayerData.equipped.dice` (`dice.<key>`) → `ItemCatalog.byId(id).gameKey` → `DiceKit` (23/23 gameKey ada di DiceKit, urutan sama). Perubahan Gameplay tidak diperlukan karena Gameplay hanya memakai `gameKey` dan API ItemCatalog yang tidak berubah.
- Server: tidak berubah (`supabase/`, `tools/wallet/` diff kosong). Otoritas transaksi, saldo, kepemilikan tetap server.

## 6. File berubah
Dibuat: `data/inventory/dice/index.js`, `data/inventory/dice/<23 key>/manifest.js`, `tests/dice-registry-parity.test.js`, laporan ini.
Diubah: `assets/js/item-catalog.js`, `dadu.html`, `room.html`, `sw.js`, `assets/preload-manifest.json`, `tests/frame-catalog-integration.test.js`.
Tidak berubah (diverifikasi `git diff` kosong dan ada di tes): `gameplay.html`, `gameplay/`, `assets/js/player-data.js`, `assets/js/game-integration.js`, `assets/js/dice-kit/`, `assets/sfx/`, `supabase/`, `tools/wallet/`, `profile.html`, `shop.html`, `inventory.html`, `lobby.html`.
Catatan: `profile.html` sempat diberi rantai Dice lalu dibatalkan — tes Stage 3 mewajibkan rantai Frame tepat sebelum `item-catalog.js` di sana, dan profil hanya menghitung kepemilikan (jalur cadangan identik).
Catatan preload: regenerasi juga memperbarui ukuran `pet-viewer.js` dan 7 manifest Pet yang basi sejak Stage 4.1 (di luar Dice, efek samping yang benar).

## 7. Hasil tes
| Tes | Hasil |
|---|---|
| `tests/dice-registry-parity.test.js` (baru) | **27/27 PASS** |
| Suite penuh sesudah | **50 PASS, 8 FAIL** (49 + tes baru) |
| Status per tes vs baseline | identik (di luar tes baru) |
| Keluaran 8 tes gagal | identik sebelum/sesudah (diff kosong) |
| Jumlah `ok` per tes | tidak ada yang berubah |
| `gen-item-seed.js --check` | sinkron (147 item, 63 gear) |

Perubahan pada tes lama (bukan regresi, penyesuaian lingkup): `frame-catalog-integration.test.js` — daftar tambahan API kini `['diceSource','frameSource','petSource']`; cek "halaman lain tanpa rantai" mengizinkan `dadu`/`room` memuat `item-registry.js` (tetap dilarang memuat rantai Frame). Sebelum penyesuaian tes ini sempat gagal (21→6, lalu 21→17 `ok`); setelahnya kembali penuh. Pola sama dengan Stage 4.

Yang dibuktikan tes paritas: 23/23 terdaftar, 0 ditolak; jumlah & ID = baseline; urutan sama; tanpa ID ganda; id/kind/gameKey/nama/rarity/tier/collection/materialName/harga/gems/starter/featured/desc/`art` = baseline; **deep-equal 147 item** terhadap baseline pada jalur cadangan, Dice-Registry, dan semua Registry; API publik sama (+`diceSource`); mutasi manifest pada VM bersih mengubah katalog (bukti sumber); manifest hilang satu → jalur cadangan, katalog utuh; harga/gems = blok seed phase3 + 23 id ada di migrasi `dice_catalog`; manifest tanpa field kepemilikan/saldo/equip; 23 gameKey = DiceKit (id, urutan, warna bg/accent/pip, tier, collection, materialName).

## 8. Validasi aset (lapis dipisah)
| Lapis | Hasil |
|---|---|
| A. validateManifest | PASS 23/23 |
| B. FORMAT path | PASS 23/23 (assets per item kosong) + path `renderKit` valid |
| C. berkas ada | PASS: `DiceCatalog.js`, modul `dice-kit` utama, 24 berkas rantai, `dice-roll.mp3` |
| D. pemuatan di browser nyata | **NOT TESTED** |

## 9. Uji jsdom 24 (di luar repo, `/tmp`) — parser HTML & skrip nyata
| Halaman | `diceSource` | Dice / item | 404 rantai | skrip ganda |
|---|---|---|---|---|
| dadu.html | registry | 23 / 147 | 0 | 0 |
| room.html | registry | 23 / 147 | 0 | 0 |
| shop, inventory, profile, gameplay, lobby | legacy | 23 / 147 | 0 | 0 |
`dadu.html` merender 23 entri. Error konsol jsdom hanya keterbatasan jsdom (navigasi, canvas/WebGL).

## 10. BELUM diuji
- Render 3D dadu, animasi lempar, efek partikel, suara, dan thumbnail di browser/perangkat nyata (juga tidak otomatis: `gameplay-dice-throw-race` gagal sejak sebelum Stage 5 karena stub THREE).
- Alur beli (koin/emerald), equip, dan sinkron antar-halaman di browser nyata; alur multiplayer dengan dadu pemain lain.
- Shop dan Inventory di browser nyata (keduanya memakai jalur cadangan yang identik secara data).
- CI `db-migrate.yml` (terpicu perubahan `assets/js/**`/`tests/**`) belum diperiksa.
- Migrasi/SQL tidak dijalankan (tidak ada perubahan).

## 11. Risiko dan pekerjaan lanjutan yang benar-benar diperlukan
1. Data Dice ada di dua tempat sementara (manifest + jalur cadangan literal/`TIER_PRICE`), dijaga tes — sama seperti Frame/Pet. Cadangan baru bisa dihapus bila `gameplay.html` (dan halaman lain) memuat rantai Registry atau semua pemakainya sudah dimigrasikan.
2. Warna Dice juga ada di `DiceCatalog.js` (material) dan manifest (`visual`); selaras 23/23 dan dijaga tes. Menyatukan keduanya perlu mengubah modul ES `DiceCatalog.js` ke sumber Registry — tidak dilakukan (di luar lingkup, menyentuh render).
3. Dua skala rarity: katalog klien 4 tingkat UI (`common/rare/epic/legendary`) vs DiceKit 7 tingkat visual. Manifest menyimpan nilai baseline (UI) + `tier`; tidak disatukan karena akan mengubah tampilan/harga yang dikunci baseline. Keputusan produk, bukan teknis.
4. Nama `dice.emas`: katalog "Dadu Emas" vs DiceKit "Gold Dice" — sudah ada sebelumnya, tidak diubah (dicatat di tes).
5. Migrasi `202611170001_dice_catalog.sql` memuat harga lama; harga berlaku ditimpa phase3 (`202611280001`) dan sinkron lewat `gen-item-seed.js --check`.
6. Temuan di luar Dice: `room.html` memuat `gameplay/particle-fx.js` yang tidak ada (file sebenarnya `gameplay/js/particle-fx.js`) — 404 pra-ada, tidak diperbaiki karena di luar lingkup.
7. 8 tes gagal pra-ada belum ditangani (tidak terkait Registry).
8. Bila Stage berikutnya memuat Registry di `gameplay.html`, gunakan urutan rantai yang sama; `diceSource()` bisa dipakai untuk diagnosis.
