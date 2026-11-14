# Stage 7 — Aura Registry & Full Integration

## Audit pra-implementasi

Temuan bagian ini dicatat sebelum perubahan Registry Stage 7.

### Git dan prasyarat Stage 6

- Branch awal: `restruktur`.
- HEAD awal Stage 7: `178bbae` (`test: align economy assertions and seed checks`); sudah di-push ke `origin/restruktur`.
- Stage 6 implementasi `0a36810` dan audit `3567c225` tersedia di branch.
- `audit/5/stage-6-power-registry.md` tersedia dan sudah di-commit.
- `main` berada di `aeb11acf130df4ade4acc9417f01470e40a33dbb`; tidak disentuh.
- Worktree bersih sebelum implementasi Stage 7.

### Baseline tes sebelum implementasi

Suite Node pada keadaan Stage 7 awal menghasilkan **51/57 lulus**. Enam kegagalan:

`aura-view`, `blocky-actions`, `gameplay-win-result`, `pet-catalog`, `power-rules`, dan `schema-snapshot`.

- `aura-catalog`: **6/6 lulus** pada baseline Stage 7. Kegagalan sebelumnya (`aura.solar`) sudah diperbaiki dalam checkpoint ekonomi `178bbae`: tes kini memahami harga Coin/Gems dan membaca seed ekonomi terbaru.
- `aura-view`: empat tes perilaku pertama lulus, lalu gagal pada assertion `gameplay.html` di `tests/aura-view.test.js`. Assertion mengharapkan pemanggilan `UT.AuraView.create()` dan update langsung di HTML, padahal penggunaan gameplay berada di `gameplay/js/main.js`. Audit Stage 6 juga mencatat kegagalan ini pada baseline sebelum Stage 6; ini merupakan assertion yang membaca sumber lama, bukan bukti bahwa render Aura runtime gagal.
- Lima kegagalan lain bukan kegagalan mata uang Aura. `schema-snapshot` tidak dapat menjalankan `sh` pada Windows. `buy-set-sql.integration.test.js` dilewati karena `PSQL_CMD` tidak tersedia.

Stage 6 audit mencatat suite pra/pasca-implementasi pada saat itu masing-masing 48/57 dan 49/58 dengan sembilan kegagalan baseline yang sama. Perbedaan jumlah saat ini berasal dari checkpoint pengujian ekonomi setelah Stage 6; hasil di atas menjadi baseline pembanding langsung Stage 7.

### Identitas dan metadata katalog

`ItemCatalog` memuat tepat 15 Aura. Harga berikut adalah nilai katalog saat ini; masing-masing item tidak starter dan tidak stackable.

| ID / gameKey | Nama | Rarity | Harga |
|---|---|---|---:|
| `aura.nature` / `nature` | Nature Aura | common | 600 Coin |
| `aura.stone` / `stone` | Stone Aura | common | 600 Coin |
| `aura.flame` / `flame` | Flame Aura | uncommon | 2.000 Coin |
| `aura.frost` / `frost` | Frost Aura | uncommon | 2.000 Coin |
| `aura.electric` / `electric` | Electric Aura | rare | 5.000 Coin |
| `aura.emerald` / `emerald` | Emerald Aura | rare | 5.000 Coin |
| `aura.ender` / `ender` | Ender Aura | epic | 15.000 Coin |
| `aura.nether` / `nether` | Nether Aura | epic | 15.000 Coin |
| `aura.amethyst` / `amethyst` | Amethyst Aura | epic | 15.000 Coin |
| `aura.ocean` / `ocean` | Ocean Aura | epic | 15.000 Coin |
| `aura.solar` / `solar` | Solar Aura | legendary | 500 Emerald |
| `aura.shadow` / `shadow` | Shadow Aura | legendary | 500 Emerald |
| `aura.sculk` / `sculk` | Sculk Aura | legendary | 500 Emerald |
| `aura.dragon` / `dragon` | Dragon Aura | mythic | 1.500 Emerald |
| `aura.celestial` / `celestial` | Celestial Aura | divine | 3.000 Emerald |

ItemCatalog saat ini membangun Aura lewat array legacy dan `TIER_PRICE`; kategori `aura` memakai kategori UI `efek` dan slot opsional `aura`. Tidak ada Registry Aura. Engine visual memiliki katalog perilaku tersendiri, dengan ID `gameKey` yang sama.

### Alur data dan konsumen aktual

- `assets/js/item-registry.js` memvalidasi manifest dan kategori tanpa mengelola PlayerData atau transaksi. Pola kategori saat ini adalah `ItemManifests` → `data/inventory/<kind>/index.js` → `ItemCatalog` dengan jalur fallback legacy.
- `assets/js/item-catalog.js` adalah sumber yang dipakai UI untuk nama, rarity, warna thumbnail, harga, dan gameKey. `assets/js/item-art.js` menghasilkan thumbnail Aura dari `item.colors`; tidak ada gambar per Aura.
- `assets/js/pages/efek.js` adalah halaman toko/pemakaian Aura. Daftar item diambil dari `ItemCatalog`, status dari `PlayerData.owns`/`isEquipped`, thumbnail dari `ItemArt.aura`, pembelian akun dari `WalletService.buy`, dan equip dari `PlayerData`. Tab Efek di `inventory.html` memuat `efek.html` melalui iframe. `shop.html` adalah toko Coin/Emerald dan bukan toko item Aura.
- `assets/js/pages/karakter.js` memakai `UT.AuraView` untuk pratinjau Aura yang sedang dipakai; `assets/js/pages/lobby.js` dan `assets/js/pages/profile.js` memasang Aura pada karakter lokal.
- `gameplay/js/main.js` memasang satu `AuraView` bersama untuk pion. Aura sendiri berasal dari `PlayerData`; Aura pemain lain berasal dari `equipped.aura` pada hasil `room_appearance_get`.
- `assets/js/aura-view.js` mengubah ID item melalui `ItemCatalog.byId()` menjadi gameKey yang dikenali `UT.AuraFX`, lalu menggunakan satu `AuraSystem`.
- `tools/aura-fx/src/AuraCatalog.js` mendefinisikan emitter partikel dan dekor per efek; `AuraParticles.js`, `AuraDecor.js`, dan `AuraSystem.js` menyediakan implementasi bersama. Model, mesh, shader, partikel, ring, sayap, glow, dan respons gerak dibuat prosedural memakai Three.js; tidak ada model/animasi eksternal per Aura. Efek lompatan berasal dari siklus karakter/`AuraSystem.jump()`.
- Tidak ditemukan audio/SFX khusus Aura pada engine Aura. Halaman Efek memainkan suara UI umum (`button`/`power`), bukan audio per Aura.
- `assets/js/aura-fx.js` adalah bundle hasil `tools/aura-fx/build.js`; sumber yang benar untuk perubahan engine adalah `tools/aura-fx/src`, bukan bundle hasil build.

### Kepemilikan, equip, dan server

- Kunci localStorage PlayerData tetap `ularTanggaBlok:player:v1` (atau suffix akun `:acct:<id>`). Inventory dan slot equip disimpan di PlayerData; Aura tidak memiliki state kedua.
- Slot `aura` opsional pada `ItemCatalog`. `PlayerData.equip()` menolak item yang tidak dimiliki; `unequip('aura')` melepasnya. Bentuk appearance yang dikirim tetap `{look, equipped, gearDye}`.
- Server memiliki item melalui `item_catalog`/`player_inventory`. `buy_item(p_item_id)` memvalidasi harga, mata uang, dan kepemilikan; Aura tetap memakai RPC yang sama.
- `202611200001_aura_catalog.sql` mendaftarkan 15 ID dan slot equip `aura`. Harga awal di migrasi tersebut sudah diperbarui oleh seed fase ekonomi `202611280001_economy_phase3_gems.sql`; harga server saat ini cocok dengan katalog.
- `appearance_save` memvalidasi slot dan kepemilikan lewat `_item_equip_slot` dan `_owns_item`; `appearance_get` serta `room_appearance_get` menyinkronkan field `equipped` tanpa kontrak Aura tersendiri.
- Tidak ada bukti kebutuhan untuk mengubah database, RPC, struktur PlayerData, localStorage, atau aturan gameplay.

### Keputusan integrasi sebelum implementasi

1. Tambahkan Registry kategori `aura` dan 15 manifest dengan metadata katalog saat ini serta warna yang dipakai thumbnail.
2. Manifest menunjuk `gameKey`/`effectKey` yang sudah ada pada `AuraFX` dan referensi renderer bersama; jangan salin emitter, shader, model, animasi, atau audio ke manifest.
3. Adopsi Registry di `ItemCatalog` tanpa mengubah bentuk item publik; pertahankan jalur builder legacy untuk halaman yang belum memuat Registry.
4. Muat rantai Aura Registry sebelum `item-catalog.js` pada halaman yang benar-benar menggunakan toko/preview/render Aura, khususnya Efek, Karakter, Lobi, Profil, dan Gameplay.
5. Pertahankan kontrak PlayerData, AppearanceService, WalletService, Supabase, dan gameplay. Tidak menambahkan referensi audio/model yang tidak ada.
6. Perbarui tes `aura-view` agar memeriksa pemanggil gameplay pada `gameplay/js/main.js` dan urutan pemuatan aktual; jangan menganggap implementasi berada inline di HTML.

## Implementasi Stage 7

### Hasil implementasi

Status keseluruhan: **PARTIAL**. Seluruh 15 Aura masuk Registry dan seluruh tes khusus Aura lulus. Lima tes Node non-Aura tetap gagal pada kondisi baseline; browser visual/gameplay penuh dan integrasi SQL tidak tersedia di environment ini.

#### Registry dan paritas

Dibuat 15 manifest, satu per `gameKey`, di `data/inventory/aura/<gameKey>/manifest.js`:

`nature`, `stone`, `flame`, `frost`, `electric`, `emerald`, `ender`, `nether`, `amethyst`, `ocean`, `solar`, `shadow`, `sculk`, `dragon`, `celestial`.

Index `data/inventory/aura/index.js` mendaftarkan kategori `aura` dan memuat manifest dengan pola `ItemRegistry` yang sama seperti kategori lain. Manifest menyimpan metadata katalog (`id`, `kind`, `gameKey`, nama, rarity, Coin/Emerald, deskripsi, status starter/stackable) dan referensi visual yang memang ada: `effectKey`, tema, warna, serta renderer AuraFX bersama. Kategori menunjuk `assets/js/aura-view.js` sebagai adapter bersama.

Tes membandingkan semua item manifest terhadap output katalog legacy sesudah harga `TIER_PRICE` diterapkan dan terhadap definisi 15 Aura di bundle `assets/js/aura-fx.js`. ID, `gameKey`, nama, rarity, warna, deskripsi, starter, dan harga/mata uang cocok untuk **15/15**. Tidak ada model, animasi, particle, shader, atau SFX per item yang ditambahkan: renderer, `AuraSystem`, `AuraParticles`, dan `AuraDecor` tetap sistem prosedural bersama.

#### Integrasi dan kompatibilitas

- `ItemCatalog` mengadopsi Aura dari `ItemRegistry` hanya bila kategori lengkap; getter diagnostik `auraSource()` menunjukkan sumber aktif. Bentuk item publik, urutan, harga, slot `aura`, kategori UI `efek`, dan API lama tetap sama. Jalur legacy tetap dipakai saat Registry tidak dimuat atau manifest tidak lengkap.
- Rantai Registry dimuat sebelum `ItemCatalog` di `efek.html`, `inventory.html`, `karakter.html`, `lobby.html`, `profile.html`, dan `gameplay.html`. Tes memeriksa urutan tag, keberadaan file, dan tidak adanya duplikasi script.
- Shop Aura tetap berada di `efek.html`; Inventory membuka tab Efek melalui iframe. Character builder/preview, Lobby, Profile, dan Gameplay tetap menggunakan `AuraView`/`AuraFX` yang sudah ada. Gameplay menerima Aura lokal dari PlayerData dan Aura pemain lain dari `equipped.aura` server; hanya rantai metadata di HTML yang ditambahkan, bukan aturan permainan atau implementasi gameplay.
- `PlayerData`, kunci localStorage, ownership/equip, `AppearanceService`, `WalletService`, kontrak RPC/Supabase, migrasi SQL, dan server tidak diubah. Tes memastikan item yang belum dimiliki tetap tidak dapat dipakai dan Aura tersimpan di slot appearance lama.
- `sw.js` dinaikkan ke `ut-pwa-v180`; preload manifest mencakup 15 manifest dan index dengan ukuran byte yang diverifikasi. Generator Python tidak dapat dijalankan karena Python tidak tersedia; manifest diperbarui memakai ukuran file aktual melalui Node dan diverifikasi oleh tes.

#### Tes dan verifikasi

Hasil Stage 7 sesudah perubahan:

| Pemeriksaan | Hasil |
|---|---:|
| `aura-registry-parity.test.js` | 7/7 PASS |
| `aura-catalog.test.js` | 6/6 PASS |
| `aura-view.test.js` | 6/6 PASS |
| `frame-catalog-integration.test.js` | 21/21 PASS |
| `dice-registry-parity.test.js` | 27/27 PASS |
| `power-registry-parity.test.js` | 11/11 PASS |
| Semua `tests/*.test.js` | **53/58 lulus**, 5 gagal |

Kegagalan `aura-view` baseline sudah diperbaiki pada tes: assertion kini memeriksa `assets/js/pages/lobby.js`, `assets/js/pages/profile.js`, `gameplay/js/main.js`, dan `assets/js/pages/karakter.js` tempat pemanggilan sebenarnya berada; perilaku Aura diuji tetap sama. Lima kegagalan suite penuh yang tersisa sama dengan baseline Stage 7 awal: `blocky-actions`, `gameplay-win-result`, `pet-catalog`, `power-rules`, dan `schema-snapshot`. Perbandingan langsung: baseline 51/57 dengan enam gagal, pasca-Stage 7 53/58 dengan lima gagal; satu baseline failure (`aura-view`) hilang dan satu tes Registry ditambahkan.

`buy-set-sql.integration.test.js` melaporkan skip karena `PSQL_CMD` tidak tersedia. `schema-snapshot.test.js` tetap gagal di Windows karena executable `sh` tidak tersedia; kegagalan ini bukan regresi Registry. Suite yang dijalankan adalah tes Node/jsdom/static yang ada di repository, bukan keseluruhan integrasi browser dan database.

Integrated browser dipakai untuk memuat Three.js, ItemRegistry, 15 manifest, index, ItemCatalog, AuraFX, dan AuraView dalam urutan runtime. Hasilnya `auraSource === 'registry'`, jumlah katalog dan Registry sama-sama 15, tidak ada respons aset lokal gagal, dan tidak ada exception JavaScript. Ini adalah pemeriksaan script-loading terisolasi, bukan uji visual seluruh halaman, transaksi nyata, animasi/audio yang diperdengarkan, atau gameplay multiplayer.

#### File, lingkup, dan commit

- Manifest/index baru: `data/inventory/aura/`.
- Integrasi katalog: `assets/js/item-catalog.js`.
- Pemuatan halaman: `efek.html`, `inventory.html`, `karakter.html`, `lobby.html`, `profile.html`, `gameplay.html`.
- Preload/cache: `assets/preload-manifest.json`, `sw.js`.
- Tes baru: `tests/aura-registry-parity.test.js`; tes sumber aktual Aura: `tests/aura-view.test.js`; assertion API/version yang bergantung versi diperbarui di tes Frame, Dice, dan Power.
- Tidak ada perubahan pada gameplay JS, renderer/effect engine, PlayerData, server, SQL, RPC, atau Supabase.

Commit implementasi: `04bc5d4` (`feat: integrate aura registry`), sudah di-push ke `origin/restruktur`.  
Commit audit: dibuat terpisah setelah laporan ini difinalkan.

#### Batas verifikasi

Tidak dilakukan uji visual/browser penuh pada seluruh halaman, uji audio dengan perangkat, transaksi akun nyata, multiplayer langsung, atau migrasi terhadap database aktif. Lima kegagalan baseline di atas tidak diperbaiki karena tidak terkait perubahan Aura dan berada di luar lingkup Stage 7.
