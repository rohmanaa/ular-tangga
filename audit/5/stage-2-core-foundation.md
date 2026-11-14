# Dragon Roll — Stage 2: Core Foundation & Item Registry

Status: IMPLEMENTED + TESTED (lokal). Tidak ada file existing yang diubah. Gameplay tidak disentuh.

## 1. Git baseline

| Item | Nilai |
|---|---|
| Branch | `main` |
| HEAD awal | `06365a865fb7cb18356d30161c1ed43e24c03123` (`06365a8 docs(architecture): audit modular project structure`) |
| origin/main awal | `06365a865fb7cb18356d30161c1ed43e24c03123` (sama) |
| Worktree awal | bersih |

## 2. Registry implementation

`assets/js/item-registry.js` — skrip klasik ES5 (UMD): `window.UT.ItemRegistry` di browser, `module.exports` di Node.
Lokasi di `assets/js/` mengikuti pola repo (appearance-service.js, wallet-service.js), bukan `src/` (folder itu belum ada; target `src/core` tetap bisa dicapai nanti dengan memindahkan/membungkus file ini).
Tidak ada registry lain di repo sebelumnya (dicek dengan grep) — ini bukan registry kedua.

Sifat: tanpa DOM, tanpa localStorage, tanpa ketergantungan pada ItemCatalog/PlayerData; hasil registrasi di-deep-freeze dan disalin (manifest asli tidak bisa memutasi registry).

## 3. Registry API

| API | Fungsi |
|---|---|
| `ItemRegistry.create()` / `.shared()` | instance baru terisolasi / singleton |
| `registerCategory({key, kind, label?, fallbackId?, rarities?, assetExtensions?, assets?})` | daftar kategori; duplikat `key` (`duplicate-category`) atau `kind` (`duplicate-kind`) ditolak |
| `registerItem(manifest)` | validasi lalu daftar. Alasan tolak: `unknown-category`, `invalid-manifest`, `invalid-asset-path`, `duplicate-id` (ID sama isi beda), `duplicate-registration` (manifest identik) |
| `getItem(id)` | ketat; `null` bila tidak ada (aman dari `constructor`/`__proto__`) |
| `getItemOrFallback(id)` | ID hilang/ditolak -> item `fallbackId` kategori; `null` bila tak ada fallback |
| `getCategory(key)` / `getAll(kind?)` / `categories()` / `has(id)` | baca; hasil berupa salinan array |
| `rejected()` | log penolakan `{id, reason, errors[]}` |
| `checkCompleteness(key, expectedIds, recommended?)` | `missing`, `extra`, `incomplete` (field anjuran kosong) |
| `validateManifest(m, category?)` | **lapis 1** struktur: id, kind, nama, rarity, price/gems (null atau int >= 0), starter, visual, assets |
| `validateAssetPaths(m, category?)` | **lapis 2** FORMAT path: relatif, tanpa skema/URL/`..`/`//`/spasi/backslash, ekstensi whitelist |

Tiga lapis dipisah: manifest valid != path berformat benar != file ada != aset berhasil dimuat di browser (lapis terakhir **tidak diuji**, lihat bagian 8).

## 4. Manifest convention

- Satu item = satu folder `data/inventory/<kategori>/<gameKey>/manifest.js`. Nama folder = `gameKey` item (contoh `stone`, bukan `batu`; contoh nama di prompt hanya ilustrasi, ID wajib sama dengan ItemCatalog).
- `manifest.js` berupa skrip klasik yang di Node meng-`module.exports` objek, di browser mendorong objek ke antrean `UT.ItemManifests`.
- `index.js` kategori: deskriptor kategori + daftar `keys` + `register(registry)` (tidak melempar; mengembalikan `{ok, registered, rejected[]}`).
- CSS/JS/assets/audio per item **opsional dan tidak dibuat** (tidak ada kebutuhan; tidak ada file kosong/placeholder — dijaga tes).
- Field manifest Frame: `id, kind, gameKey, name, rarity, price, gems, starter, desc, [featured], visual{fxKey, tier, [marginCells]}, assets{image}`.

## 5. Frame item mapping (14/14)

Sumber kebenaran: **nilai runtime** `ItemCatalog.items` (bukan literal `frame(...)`), `frame-fx.js`, aset `data/frame/`.

| id | rarity | price | gems | fxKey | tier | gambar |
|---|---|---|---|---|---|---|
| frame.default | common | 0 (starter) | – | wood | 1 | data/frame/frame-default.webp |
| frame.stone | common | 500 | – | stone | 1 | data/frame/stone.webp |
| frame.copper | rare | 1500 | – | copper | 2 | data/frame/copper.webp |
| frame.iron | rare | 2500 | – | iron | 2 | data/frame/iron.webp |
| frame.gold (featured) | epic | 6000 | – | gold | 3 | data/frame/frame-gold.webp |
| frame.diamond | epic | 9000 | – | diamond | 3 | data/frame/diamond.webp |
| frame.amethyst | epic | 12000 | – | amethyst | 4 | data/frame/amethyst.webp |
| frame.nether | epic | 20000 | – | nether | 4 | data/frame/nether.webp |
| frame.ender | legendary | – | 450 | ender | 5 | data/frame/ender.webp |
| frame.storm | legendary | – | 600 | storm | 5 (margin 6) | data/frame/storm.webp |
| frame.dragon | legendary | – | 800 | dragon | 6 | data/frame/dragon.webp |
| frame.phoenix | legendary | – | 1100 | phoenix | 6 (margin 7) | data/frame/phoenix.webp |
| frame.celestial | legendary | – | 1500 | celestial | 7 (margin 7) | data/frame/celestial.webp |
| frame.cosmic | legendary | – | 2000 | cosmic | 7 | data/frame/cosmic.webp |

Ikon tab kategori: `data/frame/icon-frame.webp` (sama dengan `FRAME_TAB_ICON`).

## 6. Frame parity result

Diuji di `tests/frame-registry-parity.test.js` (18 tes, semua lulus):
- ID, kind, gameKey, nama, rarity, starter, desc, featured = ItemCatalog; urutan sama; 14 = 14 tanpa hilang/ekstra/ganda.
- Harga koin dan gems = ItemCatalog runtime **dan** = seed server fase 3 (`202611280001_economy_phase3_gems.sql`, 13 frame berbayar). `frame.default` = starter, server menandainya starter dengan harga null (`202611160001_frame_catalog.sql`).
- Visual: `fxKey`, `tier`, `marginCells` = `frame-fx.js` (di-parse dari sumber).
- Mutation check manual: 9 mutasi (harga, gems, rarity, path file, tier, ID ganda, nama kosong, path traversal, manifest dihapus) semuanya membuat tes GAGAL; manifest lalu dipulihkan.

## 7. Asset reference validation (dipisah)

| Lapis | Hasil |
|---|---|
| A. Manifest validation | PASS (14/14 diterima, 0 ditolak) |
| B. Format path aset | PASS (14 gambar + ikon tab) |
| C. File ada di disk, tidak kosong, header WebP `RIFF....WEBP` | PASS (15 file) |
| D. Pemuatan aset sebenarnya di browser/render | **NOT TESTED** (tidak ada browser di lingkungan ini; belum ada halaman yang memuat manifest) |

## 8. Automated test result

- Baru: `tests/item-registry.test.js` 16/16 PASS; `tests/frame-registry-parity.test.js` 18/18 PASS.
- Regresi seluruh suite (`tests/*.test.js`, `*.test.mjs`, `tests/multiplayer`): **48 PASS, 8 FAIL**. Delapan kegagalan **sudah ada di HEAD sebelum perubahan** dan identik sebelum/sesudah (diff kosong):
  `aura-catalog`, `aura-view`, `blocky-actions`, `gameplay-win-result`, `pet-catalog`, `power-rules`, `store-card-status`, `gameplay-dice-throw-race.mjs` (THREE.MeshStandardMaterial tidak tersedia di Node).
  Stage 2 tidak memperbaiki maupun menyebabkannya. Catatan: `store-card-status` terkait Shop dan sudah gagal sejak baseline.
- Tes statis/Node saja. Inventory/Shop/Character **tidak dijalankan di browser**; klaim "tidak rusak" didasarkan pada: tidak ada file existing yang diubah + tes existing terkait (`shop-render`, `karakter-equip`, `player-data-server`, `legacy-cleanup`, `gear-player-data`, `appearance-service`, `lobby-appearance`) tetap PASS.

## 9. Existing system compatibility

- ItemCatalog: tidak diubah; 147 item, API utuh (dites). PlayerData: tidak diubah. Seed server/RPC/migrasi: tidak diubah.
- Tidak ada halaman, `sw.js`, `preload-manifest.json`, atau `index.html` yang memuat file baru -> perilaku runtime game tidak berubah.

## 10. Files created

- `assets/js/item-registry.js`
- `data/inventory/frame/index.js`
- `data/inventory/frame/<14 key>/manifest.js` (default, stone, copper, iron, gold, diamond, amethyst, nether, ender, storm, dragon, phoenix, celestial, cosmic)
- `tests/item-registry.test.js`, `tests/frame-registry-parity.test.js`
- `audit/5/stage-2-core-foundation.md`

## 11. Files modified

Tidak ada.

## 12. Files untouched (dijaga)

`gameplay.html`, `gameplay/`, `assets/js/game-integration.js`, `assets/js/player-data.js`, `assets/js/item-catalog.js`, `supabase/`, `sw.js`, `data/frame/*` (aset tidak dipindah), semua halaman HTML.

## 13. Known issues / catatan untuk Stage 3

1. **Literal harga di `frame(...)` usang.** `item-catalog.js` menimpa harga lewat `TIER_PRICE` (mis. stone 150 -> 500; frame legendary dijual gems). Manifest mengikuti nilai runtime/server; siapa pun yang membaca source literal akan salah.
2. **Harga/gems di manifest adalah salinan.** Dijaga tes paritas, tetapi ada risiko drift sampai Stage 3 memutuskan otoritas (disarankan: manifest = sumber untuk klien, tetap divalidasi terhadap seed server).
3. **`frame.default`:** klien `price: 0, starter: true`; server `price: null, starter: true`. Manifest mengikuti klien. Perbedaan sudah ada sebelumnya.
4. **8 tes gagal pra-ada** (bagian 8) — perlu ditangani terpisah; menyulitkan klaim "suite hijau".
5. **Manifest belum masuk SW/preload.** Saat Stage 3 menautkan ke halaman: naikkan `VERSION` di `sw.js` dan jalankan `tools/gen-preload-manifest.py` bila aset/berkas yang di-precache berubah.
6. **Pemuatan aset di browser belum diuji** (lapis D).
7. Push yang menyentuh `assets/js/**` atau `tests/**` memicu CI `db-migrate.yml` (tes klien + migrasi Supabase lokal); tidak dijalankan di sini.

## 14. Next checkpoint

**STAGE 3 — FRAME REGISTRY INTEGRATION** (belum dijalankan; menunggu instruksi). Berhenti sesuai stop condition: Dice/Power/Pet/Character tidak dimigrasi; Shop/Inventory/Gameplay tidak diubah.
