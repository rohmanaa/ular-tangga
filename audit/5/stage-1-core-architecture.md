# Dragon Roll — Stage 1: Core Architecture & Project Structure Audit

Status: audit + dokumentasi saja. Tidak ada kode, aset, atau Gameplay yang diubah.
Metode: pembacaan isi file dan pemanggilan aktual (`<script>`, `window.*`, `PlayerData.*`), bukan tebakan dari nama file.
Catatan kejujuran: bagian bertanda **(belum diverifikasi mendalam)** hanya diperiksa di level pemanggilan API, bukan baca baris-per-baris.

---

## 1. Git baseline

| Item | Nilai |
|---|---|
| Branch | `main` (tracking `origin/main`) |
| HEAD | `ecc8c874863161bcb2bed84b43da833635584127` |
| origin/main | `ecc8c874863161bcb2bed84b43da833635584127` (sama) |
| Commit terakhir | `ecc8c87 Dadu dunia sedikit lebih besar: sisi 0,65 -> 0,75 (efek ikut diskala); sw v175` |
| Worktree | bersih sebelum audit |
| Folder `audit/` | belum ada sebelum dokumen ini |

---

## 2. Existing project structure

Repo = situs statis (tanpa bundler, tanpa `package.json`). Semua skrip klasik (IIFE + global `window.*`), kecuali dua katalog visual yang ES module (lihat bagian 5).

```
/ (root)
├── *.html            24 halaman, markup saja (HTML/CSS/JS sudah dipisah, lihat README "Struktur halaman")
├── gameplay.html     17 KB, kerangka; logika di gameplay/  (DILARANG disentuh)
├── gameplay/         css/ (9), js/ (~30 + maps/), assets/
├── assets/
│   ├── js/           skrip bersama + pages/ (skrip per halaman) + dice-kit/ + power3d/ + multiplayer/ + vendor/
│   ├── css/          base, shared-ui, fonts, scene-bg, pages/
│   ├── ng/css/       CSS desain "newgui" per halaman (common, page, sub, bg, shop, karakter, ...)
│   ├── Images/ (8.3M) icons/ fonts/ music/ (12M, 6 mp3) sfx/ (2.6M) "new sound"/ lobby-backdrop/ preload-manifest.json
├── data/             frame/ (15 webp), power/ (power-fx.js, 3d/)
├── hud/              ui-core.js + components/ + theme/fantasy.css (komponen UI bersama)
├── supabase/         migrations/ (39), snapshot/, tests/
├── tests/            55 berkas tes (+ multiplayer/)
├── tools/            generator & utilitas (character-data, aura-fx, blocky-character, wallet/gen-item-seed.js, sim, ...)
├── old/ referensi/ (90M) promosi/   arsip & referensi, tidak dimuat runtime
├── sw.js             Service Worker PWA (VERSION 'ut-pwa-v175')
└── manifest.webmanifest, .github/workflows/db-migrate.yml
```

Hal penting: **folder `pages/`, `src/`, dan `data/inventory|shop|karakter` dari target arsitektur belum ada.** Hampir semua HTML berada di root dan dirujuk dengan path relatif/absolut-root oleh SW, manifest, navigasi, dan banyak skrip.

---

## 3. Existing system dependencies

Urutan muat khas halaman non-gameplay (inventory/shop/karakter/profile/lobby):

```
session.js -> boot-guard.js -> prefs.js -> prefs-sync.js -> item-catalog.js
  -> player-data.js -> wallet-service.js -> (appearance-service.js) -> app.js -> hud/ui-core.js
  -> (live-sync.js) -> pages/<halaman>.js
```

Hubungan antar modul:

```
UT.Session ──► PlayerData (kunci localStorage per akun)
ItemCatalog ─► PlayerData (validasi slot/kepemilikan, defaultEquipped, starters)
PlayerData ◄─► WalletService (server: Supabase RPC, mirror ke PlayerData)
PlayerData ◄─► AppearanceService (sinkron tampilan/outfit ke server)
PlayerData ──► game-integration.js ──► gameplay.html (hanya menormalkan ut-config/URL)
ItemArt / CharacterData / CharacterFace / AuraFx / FrameFx = renderer & data visual bersama
inventory.html = host 5 tab; tiap tab = halaman lama di <iframe ?embed=inv>
   (frame.html, dadu.html, efek.html, powerup.html, pet.html) + inventory-bridge.js
```

Ketergantungan lintas-halaman yang mengikat nama file: `inventory.js` (TABS -> `*.html`), `inventory-bridge.js` (TABS map + redirect), `room-modal-bridge.js`, `sw.js` (CORE list), `preload-manifest.json`, tes statis (`tests/_page.js`, `pages-split.test.js`).

---

## 4. Existing PlayerData

`assets/js/player-data.js` (623 baris) = **single source of truth sisi klien** (`window.PlayerData`).

- Penyimpanan: `localStorage["ularTanggaBlok:player:v1"]` (tamu) dan `...:v1:acct:<id akun>` (akun login). Backup korup `:corrupt:`.
- `SCHEMA = 1`, `MIGRATION_VERSION = 1`.
- Bentuk state nyata:

```js
{ schema, migration, createdAt, coins, gems, xp,
  stats: { plays, wins, streak, bestStreak, points, weekKey, weekPoints, seen[] },
  walletSyncedAt, nextSeq,
  inventory: { [itemId]: { qty, acquiredAt, seq } },      // BUKAN array ownedItems
  equipped:  { skin, dice, theme, frame, aura?, pet?, 'g.<bagian>'?, 'g.acc.<kunci>'? },
  gearDye:   { [itemId]: dyeId },
  look:      { gender, skin, eyes{id,dye}, hair{id,dye}, body{height,build} } | null,
  outfits:   [{ slot 0..4, name, data, updatedAt }],
  settings, profile: { name } }
```

- Pengaturan perangkat sudah dipindah ke `UT.Prefs` (bukan di blob akun).
- Mode server: untuk akun login, saldo dan inventory datang dari server (`applyServer*`); klien tidak menambah saldo sendiri (`walletDenied()`).
- API publik utama: `coins/gems/xp/levelInfo/stats/profile`, `owns/qty/equippedId/equippedSkin/isEquipped`, `equip/unequip`, `list owned`, `gearLook`, `outfits`, `appearanceSnapshot`, `subscribe`, `walletReady`, `serverMode`.
- Perbedaan dengan contoh kontrak di prompt: ownership sudah berbentuk **map**, equipped sudah **per slot string id**, dan `power` bukan slot equipped (consumable ber-`qty`).

---

## 5. Existing ItemCatalog

`assets/js/item-catalog.js` (448 baris) = satu-satunya sumber harga & metadata (`window.ItemCatalog`, frozen).

Jumlah item per jenis (hasil hitung factory call): **147 item**: gear 63, dice 23, powerup 17, aura 15, frame 14, pet 7, skin 6, theme 2. (Tidak ada `emote`.)

ID bersifat namespaced: `skin.<key>`, `dice.<key>`, `frame.<key>`, `theme.<key>`, `aura.<key>`, `pet.<key>`, `gear.<bagian>.<key>`; powerup memakai `gameKey` polos. Slot ditentukan `KIND_META`; gear punya slot per item (`g.<bagian>`, `g.acc.<kunci>`). API: `byId`, `byGameKey`, `items`, `starters`, `defaultEquipped`, `optionalSlots`, `gearSlots`, `skinTexture`, `powerOnMap`, `fallbackSkinId`.

**Katalog lain yang tumpang-tindih (risiko "database ganda", sudah ada sekarang):**

| Katalog | Lokasi | Isi | Catatan |
|---|---|---|---|
| ItemCatalog | `assets/js/item-catalog.js` | id, nama, rarity, harga, slot | sumber utama klien |
| DiceCatalog | `assets/js/dice-kit/DiceCatalog.js` (ES module) | 20+ dadu: material, efek, suara | visual; id sama dengan `gameKey` dadu |
| PowerCatalog | `assets/js/power3d/PowerCatalog.js` (ES module) | 15 item 3D: material, partikel, animasi | visual |
| power-fx | `data/power/power-fx.js` | efek partikel 2D per power | visual |
| Katalog server | `supabase/migrations/*_catalog*.sql`, `wallet_b2_server.sql` | harga & kepemilikan yang divalidasi | **otoritas harga sebenarnya** |
| Seed generator | `tools/wallet/gen-item-seed.js` | membangun seed server dari ItemCatalog | jembatan klien -> server |

Jadi pemisahan yang ada: ItemCatalog = identitas/harga; Dice/PowerCatalog = visual per item. Ini selaras dengan ide manifest, tetapi sinkronisasi id antar-katalog belum dijaga oleh validator khusus **(belum diverifikasi mendalam)**.

---

## 6. Inventory audit

- `inventory.html` = host tab; `pages/inventory.js` (66 baris) memuat 5 iframe: Frame, Dadu, Efek, Power-up, Pet. Tiap iframe dibuat sekali lalu di-toggle.
- Tiap tab = halaman lama dengan `?embed=inv`; `inventory-bridge.js` menyembunyikan header dan meneruskan navigasi ke induk. Dibuka langsung, halaman tab dialihkan ke `inventory.html?tab=...`.
- Tab membaca `PlayerData` + `ItemCatalog` yang sama (owns, equip, unequip, qty). Tidak ada salinan database per tab.
- Tab Skin/Karakter/Gear **tidak** ada di Inventory; dikelola di `karakter.html`.
- Risiko: sistem iframe membuat tiap tab memuat ulang seluruh stack skrip (prefs, catalog, PlayerData) di dokumen terpisah; sinkron antar tab lewat `PlayerData.subscribe` + `live-sync.js` + event `storage` **(belum diverifikasi mendalam)**.

## 7. Shop audit

- `shop.html` + `assets/js/shop-page.js` (315 baris). Memakai `PlayerData` (coins, gems, `walletReady`, `addCurrency`, `subscribe`) dan `UT.WalletService`.
- Pembelian lewat RPC server: `buy_item`, `buy_powerup`, `buy_set`, `exchange_gems`, `claim_daily_reward`, dsb. Hasil dicerminkan ke PlayerData (`applyServerItem`). Ada idempotensi (`once`, `opId`).
- **Temuan penting (terverifikasi dengan grep):** `shop-page.js` sendiri tidak memanggil `buy/buySet/buyPowerup/purchase`; yang dipakainya hanya saldo, `exchange`, `addCurrency`, dan `subscribe`. Pembelian item nyata terjadi di `pages/dadu.js`, `pages/frame.js`, `pages/efek.js`, `pages/powerup.js`, `pages/karakter.js`, dan `pet-page.js` (semua lewat `WalletService`). Jadi peran "Shop = tempat beli item" belum terpusat: **alur beli tersebar di 6 skrip halaman**.
- Katalog Shop = `ItemCatalog` yang sama (tidak ada database item terpisah). Ikon tab/komponen memakai `assets/ng/komponen/`.

## 8. Character audit

- `karakter.html` + `pages/karakter.js` (**1661 baris**, file halaman terbesar). Menangani builder: `look`, outfit (5 slot), gear (`g.*`), dye, skin; memakai `AppearanceService`, `AuraFx`, `blocky-character.js`, `three.min.js`.
- Data model karakter: `character-data.js` (model voxel bersama, diekstrak otomatis dari `gameplay.html` oleh `tools/character-data/build.js`; `gameplay.html` tidak diubah), `character-face.js`, `character-view.js`, `item-art.js`.
- Validasi kepemilikan/gender outfit dilakukan di server (`202611130001_player_outfits.sql`); klien hanya membersihkan bentuk data.
- Konsep "skins/baju/celana/rambut/sepatu/aksesoris/emote" dari target sebagian ada sebagai `gear.<bagian>` (63 item, termasuk `acc`). **Emote belum ada** sebagai item katalog.

## 9. Profile audit

- `profile.html` + `pages/profile.js` (179 baris). Membaca `PlayerData.stats/profile/equippedId/levelInfo`, `ItemCatalog.byId`, merender karakter + frame + aura. `setName` menulis nama lokal.
- Tidak menyimpan data sendiri; murni konsumen PlayerData. Sudah sesuai peran "Profile menampilkan data pemain dan item yang dipakai".

## 10. Asset dan audio audit

- 385 gambar (png/webp) dan 75 mp3 di `assets/`; `assets/Images` 8.3M, `music` 12M, `sfx` 2.6M. `referensi/` 90M tidak dimuat runtime.
- Aset **tidak** berada di folder per item. Pola sekarang: gambar frame di `data/frame/*.webp`; audio dadu `assets/sfx/dice/dice-roll.mp3` (satu file bersama); audio pet per pet di `assets/sfx/pet/`; ikon per halaman di `assets/ng/komponen/` & `assets/icons/`.
- Pemuatan aset: `splash.html` mengunduh media sekali (`preload-manifest.json` dibuat `tools/gen-preload-manifest.py`); `sw.js` = media cache-first, kode network-first; setiap perubahan aset wajib menaikkan `VERSION` dan regenerasi manifest. **Memindahkan aset ke folder per item akan memutus preload manifest dan cache SW kecuali keduanya ikut diperbarui.**
- Dadu: satu geometri bersama + `DiceTextures/Materials/Effects` prosedural (bukan file aset per dadu).
- Kunci localStorage lain yang ditemukan: `ut-config`, `ut-dadu`, `ut-ambience`, `ut-room*`, `ut-mp-*`, `ut-inv-tab` (sessionStorage), `ut-ghud-*`, dll. Sebagian adalah state UI/gameplay, bukan data pemain.

---

## 11. Target architecture (penyesuaian berdasarkan audit)

Pendekatan tetap **Hybrid Modular**, tetapi diterapkan **bertahap dan tanpa memindahkan HTML dulu**:

1. **Jangan pindahkan halaman ke `pages/` pada tahap awal.** Banyak rujukan nama file (SW CORE, manifest, navigasi `nav()`, TABS inventory, tes statis). Nilai tambahnya rendah, risikonya tinggi. Tunda ke akhir, jika memang perlu.
2. **`src/core` tidak perlu dibuat dari nol.** Padanan sudah ada: `session.js`, `prefs.js`, `player-data.js` (state+storage), `app.js`, `live-sync.js` (event). Rekomendasi: bungkus/alias, bukan tulis ulang.
3. **Data item adalah area utama yang bisa dimodularkan** (`data/inventory/<kategori>/<item>/manifest.js`), dengan `ItemCatalog` berubah menjadi *agregator* dari index kategori, API publiknya tetap sama.
4. **Gameplay tetap membaca lewat `game-integration.js` / `PlayerData` / `ItemCatalog`.** Tidak ada perubahan.

Target akhir (sama dengan prompt, ditandai status):

```
dragon-roll/
├── index.html, gameplay.html            [TETAP DI ROOT]
├── pages/                               [DITUNDA / opsional]
├── src/core|systems|shared              [BERTAHAP; mulai dari wrapper tipis]
├── data/inventory/{dice,frame,power,pet,effects}/<item>/manifest.js   [TARGET UTAMA]
├── data/karakter/{skins,baju,celana,rambut,sepatu,aksesoris,emote}/  [setelah gear dipetakan]
└── data/shop/                           [hanya bila perlu; harga tetap satu sumber]
```

---

## 12. Item-based folder convention

- Satu item = satu folder `data/<domain>/<kategori>/<itemKey>/`.
- Wajib: `manifest.js`. Opsional: `<itemKey>.css`, `<itemKey>.js` (hanya bila ada perilaku/animasi khusus), `assets/`, `audio/`.
- Item yang hanya beda warna/texture: manifest saja, dirender oleh renderer bersama (mis. `DiceMaterials`, `PowerMaterials`).
- `index.js` kategori mendaftarkan item; ID final harus **sama dengan ID ItemCatalog saat ini** (`dice.klasik`, `frame.dragon`, ...) agar save lama dan server tetap cocok.
- Manifest minimal yang diusulkan:

```js
{ id: 'dice.klasik', kind: 'dice', gameKey: 'klasik', name, rarity, price, starter,
  visual: { /* material/efek/tier */ }, audio: { roll }, assets: { icon } }
```

- Harga tetap bersumber dari satu tempat (server menang). Manifest tidak boleh punya field gameplay (mis. luck/bonus dadu), sesuai aturan di `DiceCatalog.js`.

---

## 13. Shared data contract

Kontrak final yang diusulkan **mempertahankan skema existing** (tidak memerlukan migrasi data):

```js
PlayerData (schema 1, tidak berubah) = {
  coins, gems, xp, stats, profile,
  inventory: { [itemId]: { qty, acquiredAt, seq } },   // kepemilikan
  equipped:  { skin, dice, theme, frame, aura, pet, 'g.*' },
  gearDye, look, outfits
}
ItemCatalog.byId(id) -> { id, kind, slot, name, rarity, price, ... }   // satu katalog
```

Aturan:
1. `ItemCatalog` tetap satu-satunya katalog klien; berubah dari literal besar menjadi hasil registrasi manifest (API sama).
2. Shop membeli lewat `WalletService`; Inventory memakai via `PlayerData.equip/unequip`; Profile hanya membaca.
3. Tidak ada `ownedItems[]` baru dan tidak ada slot `power` di `equipped` (consumable memakai `inventory[id].qty`).
4. Perubahan skema hanya lewat naik `SCHEMA` / `MIGRATION_VERSION` + tes (`player-data-server.test.js`, `legacy-cleanup.test.js`).
5. Server (Supabase) tetap otoritas untuk harga, kepemilikan, dan validasi outfit; klien tidak punya validasi kedua.

---

## 14. Migration risks

| # | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| 1 | Memindahkan HTML ke `pages/` | memutus SW CORE, manifest, navigasi, TABS iframe, tes statis | tunda; jika dilakukan, buat redirect + perbarui semua daftar |
| 2 | Memindahkan aset ke folder per item | memutus `preload-manifest.json` dan cache SW | regenerasi manifest + naik `VERSION` dalam commit yang sama |
| 3 | Mengubah ID item | menghapus kepemilikan/equipped di save lama & mismatch dengan server | ID dibekukan; tes paritas ID lama vs baru |
| 4 | Katalog klien tidak sinkron dengan seed server | pembelian ditolak | pertahankan `tools/wallet/gen-item-seed.js`; tes paritas |
| 5 | ES module (`DiceCatalog`, `PowerCatalog`) vs skrip klasik | urutan muat, `file://`, SW | pertahankan pola import dinamis yang sudah ada |
| 6 | Lazy loading item | flash UI, race dengan `walletReady` | manifest ringan eager, aset berat lazy |
| 7 | `karakter.js` 1661 baris | regresi saat dipecah | pecah belakangan, per fitur, dengan `karakter-equip.test.js` sebagai jaring |
| 8 | Iframe tab Inventory | sinkron state antar dokumen | jangan ubah mekanisme tab dulu |
| 9 | Gameplay membaca `ItemCatalog`/`PlayerData` langsung | perubahan API merusak gameplay | API publik dibekukan (bagian 15) |
| 10 | Tes yang membaca teks halaman | gagal bila file pindah | perbarui `tests/_page.js` bersamaan |

---

## 15. Files to preserve (jangan diubah/dipindah tanpa persetujuan)

- **Gameplay:** `gameplay.html`, seluruh `gameplay/` (khususnya `main.js`, `config.js`, `game-core.js`, `dice-throw.js`, `skin-uv.js`, `module-bridge.js`), `assets/js/game-integration.js`, `assets/js/multiplayer/*`.
- **Data & kontrak:** `assets/js/player-data.js`, `assets/js/item-catalog.js` (permukaan API), `session.js`, `prefs.js`, `wallet-service.js`, `appearance-service.js`.
- **Renderer bersama:** `character-data.js`, `item-art.js`, `character-face.js`, `blocky-character.js`, `aura-fx.js`, `frame-fx.js`, `dice-kit/*`, `power3d/*`.
- **Infrastruktur:** `sw.js`, `manifest.webmanifest`, `assets/preload-manifest.json`, `supabase/` (migrations append-only), `.github/workflows/db-migrate.yml`, `tests/`, `tools/`.
- **Halaman root:** semua `*.html` tetap di root dengan nama sekarang.
- **localStorage keys:** `ularTanggaBlok:player:v1[:acct:<id>]`, `ut-auth`, `ut-config` dan key `ut-*` lain.

---

## 16. Recommended implementation order

1. **Stage 2 (Core Foundation):** tambah `data/inventory/` + registry kecil (`ItemRegistry`: register, validate manifest, duplicate guard, fallback) **tanpa** mengubah konsumen. Jalankan paralel dengan `ItemCatalog` lama.
2. Tes paritas: setiap item di `ItemCatalog` lama harus punya padanan manifest dengan ID/harga/slot identik, dan seed server tetap cocok.
3. Pilot satu kategori kecil dan rendah risiko: **frame** (14 item, aset `data/frame/` sudah terpusat), lalu **pet** (7), **dice** (23).
4. `ItemCatalog` membaca dari registry untuk kategori yang sudah migrasi (API tetap; fallback ke literal lama).
5. Pindahkan aset/audio per item hanya setelah poin 4 stabil, dengan regenerasi `preload-manifest.json` + naik `VERSION` SW.
6. Gear/karakter (`g.*`, 63 item) dan emote: terakhir, setelah `karakter.js` dipecah.
7. Konsolidasi alur beli ke satu modul Shop/Purchase (saat ini tersebar di 6 skrip halaman).
8. `pages/` dan `src/` penuh: opsional dan paling akhir.
9. Integrasi gameplay: stage terpisah; gameplay hanya membaca `PlayerData.equippedId` + `ItemCatalog.byId`.

Kebutuhan integrasi Gameplay (hanya dokumentasi): kontrak baca-saja `PlayerData.equippedId(slot)`, `PlayerData.equippedSkin()`, `ItemCatalog.byId/byGameKey`, serta `game-integration.js` sebagai satu-satunya jembatan. Tidak ada database item khusus Gameplay.

---

## 17. Next checkpoint

**STAGE 2 — CORE FOUNDATION** (menunggu instruksi eksplisit; tidak dijalankan di tahap ini).

Keputusan yang perlu persetujuan sebelum Stage 2:
1. Setuju **tidak memindahkan HTML ke `pages/`** pada tahap awal?
2. Setuju memakai **skema PlayerData existing** (map `inventory`, `equipped` per slot) sebagai kontrak final, bukan `ownedItems[]`?
3. Kategori pilot: frame (disarankan) atau lainnya?
