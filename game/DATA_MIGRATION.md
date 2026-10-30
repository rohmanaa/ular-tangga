# DATA MIGRATION — Ular Tangga Blok (Tahap 3)

## Canonical State (sumber utama baru)

Semua halaman non-gameplay kini membaca/menulis player state dari **satu sumber**:

- File: `assets/js/player-data.js`
- Storage: `localStorage["ularTanggaBlok:player:v1"]`
- Objek global: `window.PlayerData`, difasilitasi oleh `UT.State` (`assets/js/app.js`), event lewat `UT.Events`.

Isi canonical state (`PlayerData.snapshot()`):

| Field      | Isi                                                        |
|------------|------------------------------------------------------------|
| `schema`   | 1                                                          |
| `migration`| versi migrasi terakhir yang sudah dijalankan (saat ini `1`) — ini yang dimaksud `playerDataMigrationVersion` |
| `coins`    | currency utama (harga katalog = coins)                     |
| `gems`     | currency kedua (baru di Tahap 3; sebelumnya hanya ada di halaman legacy) |
| `inventory`| `{ [canonicalId]: {qty, acquiredAt, seq} }` — hanya ID dari `item-catalog.js` |
| `equipped` | `{skin, dice, theme}` — canonical ID yang dimiliki         |
| `settings` | `{music, sound, vibration, graphics}`                      |
| `profile`  | `{name}` (state profil minimal; lvl/xp/statistik masih placeholder halaman) |

## Legacy Sources (dipertahankan, TIDAK dihapus)

| Key                    | Media          | Asal                        | Perlakuan di Tahap 3 |
|------------------------|----------------|-----------------------------|----------------------|
| `inv`                  | localStorage   | inventory/profile/lobby/leaderboard lama | **Sumber migrasi** (currency, own, eq, set, name, daily, bag). Setelah migrasi: daily reward masih read-modify-write field `daily` & `bag` saja (state klaim existing); field lain tidak ditimpa |
| `shop`                 | localStorage   | shop lama                   | **Sumber migrasi** (currency, own, eq, set). Tidak dibaca/ditulis lagi setelah migrasi |
| `modeScreen`           | localStorage   | mode.html lama              | `sel` (pilihan mode UI) tetap dipakai & disimpan (read-modify-write field `sel` saja). Currency lama di dalamnya tidak diimpor (mencegah dobel) |
| `lobbyGift`            | localStorage   | countdown hadiah gratis lobby | Tetap dipakai apa adanya (state klaim/countdown existing) |
| `ut-dadu`              | localStorage   | pilihan dadu gameplay       | Tetap. Dibaca sebagai sumber equip awal; ditulis ulang oleh `PlayerData` (mirror) saat equip agar gameplay lama kompatibel |
| `ut-tema2`             | localStorage   | pilihan tema gameplay       | Sama seperti `ut-dadu` |
| `ut-malam`             | localStorage   | mode malam gameplay         | Tidak disentuh (gameplay-only) |
| `ut-config`            | sessionStorage | config gameplay             | Tetap dipakai gameplay; divalidasi `game-integration.js` terhadap PlayerData/katalog (URL > ut-config > equipped). Tidak mengubah ownership |

Tidak ada `localStorage.clear()` dan tidak ada `localStorage.removeItem()` untuk key legacy di seluruh kode Tahap 3.

## Mapping (legacy ID → canonical ID)

Mapping dibuat **eksplisit** dan hanya berisi pasangan yang dapat dibuktikan dari project:

### Dice (`assets/js/player-data.js` → `LEGACY_DICE_MAP`)

| Legacy ID   | Canonical ID   | Bukti |
|-------------|----------------|-------|
| `standard`  | `dice.klasik`  | Deskripsi legacy "Dadu klasik untuk semua pemain." + ditandai starter (`own:1`) — peran identik dengan `dice.klasik` (starter, default `ut-dadu` gameplay). Juga tercatat sebagai `legacyIds:['standard']` di `item-catalog.js` |
| `emas`      | `dice.emas`    | Kunci & nama sama ("Dadu Emas"), palet emas sama. Tercatat sebagai `legacyIds:['emas']` di `item-catalog.js` |

### Skin (`LEGACY_SKIN_MAP`)

**Kosong dengan sengaja.** Tidak ada padanan yang dapat DIBUKTIKAN antara skin legacy
(`explorer-neon`, `snow-ranger`, `red-warrior`, `purple-mystic`, `green-ranger`,
`yellow-scout`, `shadow-ninja`, `future-hero`) dan skin canonical
(`skin.steve`, `skin.alex`, `skin.creeper`, `skin.zombie`, `skin.skeleton`, `skin.ender`).
Persamaan tema warna ada, tetapi itu bukan bukti — jadi tidak dipetakan.

### Theme (`LEGACY_THEME_MAP`)

Kosong — `ut-tema2` sudah memakai kunci tema canonical (minecraft/rumput/gurun/salju/hutan/nether).

## Unmapped (dipertahankan, dilaporkan)

Item legacy berikut **tidak bisa dipetakan dengan aman**. Mereka TIDAK diimpor ke PlayerData,
TETAPI data lamanya tetap utuh di storage legacy (tidak dihapus, tidak ditimpa):

- Skin legacy (semua): `explorer-neon`, `snow-ranger`, `red-warrior`, `purple-mystic`, `green-ranger`, `yellow-scout`, `shadow-ninja`, `future-hero`
- Dice legacy: `ajaib`, `crystal`, `lava`
- Kategori mock lama tanpa item canonical: `item` (chest, booster, dll), `effect`, `emote`

Akibat yang bisa dirasakan user (dilaporkan, bukan bug):

1. Skin legacy tidak muncul di inventory/shop baru; skin yang tersedia = canonical dari katalog
   (starter gratis: Steve, Alex, Creeper, Zombie; beli: Skeleton 300 coin, Enderman 700 coin).
2. Equipped skin legacy (mis. `explorer-neon`) tidak dapat dipulihkan → fallback ke skin default
   canonical (`skin.steve`). Data legacy TETAP tersimpan sehingga bisa dipulihkan bila kelak
   ditambahkan alias/kanonisasi.
3. Hadiah harian Hari 4 & Hari 7 lama memberi skin legacy (`yellow-scout`, `purple-mystic`) yang
   tidak punya padanan canonical → tabel hadiah disesuaikan ke item canonical:
   - Hari 4: ~~Skin Yellow Scout (3 hari)~~ → **Dadu Rumput x1** (kompensasi duplikat +100 coin)
   - Hari 7: ~~Skin Epic Purple Mystic~~ → **Skin Epic Enderman (Permanen)** (tetap "Skin Epic";
     kompensasi duplikat +100 gem, perilaku lama dipertahankan)
   - Hari 5: Dadu Emas tetap (kini canonical `dice.emas`; kompensasi duplikat +300 coin seperti lama)

## Migration Version

- Field di dalam state: `migration` (`playerDataMigrationVersion`), saat ini **1**.
- API: `PlayerData.migrationVersion`.
- `migrateV1()` dijalankan hanya bila `state.migration < 1`; setelah sukses, `migration: 1`
  disimpan bersama state.

## Safety (idempoten & tanpa kehilangan data)

1. **Idempoten**: migrasi berjalan maksimal satu kali per state (ditandai `migration`). Pengaman
   kedua: import item hanya menambah bila belum dimiliki; import currency hanya bila saldo masih
   *pristine* (`coins === 1000` dan `gems === 0`, artinya saldo belum pernah diubah sistem baru).
   Menjalankan migrasi berulang (refresh, buka banyak halaman) tidak menggandakan apa pun.
2. **Default 1000 coins tidak menimpa legacy balance**: user legacy dengan `coins = 8450`,
   `gems = 120` akan mendapat tepat nilai itu setelah migrasi.
3. **Legacy storage tidak dihapus**: semua key di atas tetap ada. `inv` hanya diubah terbatas pada
   field `daily`/`bag` (daily reward), `modeScreen` hanya field `sel` — read-modify-write, field
   lain dipertahankan.
4. **Ownership tidak berubah karena `ut-config`**: `game-integration.js` hanya memvalidasi config
   gameplay terhadap PlayerData/katalog; ia tidak memberi/mengambil item.
5. State PlayerData yang korup tidak dihapus: disalin dulu ke
   `ularTanggaBlok:player:v1:corrupt:<timestamp>` sebelum dibuat ulang.

## Test matrix (lihat laporan Tahap 3)

Fresh / Legacy / Refresh / Multi-halaman / Purchase / Equip / Migrate-twice — dijalankan saat
pengetesan Tahap 3 (hasil ada di STAGE 3 REPORT).
