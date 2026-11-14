# Stage 8.0 — Dragon Roll Terminology Audit

## Status dan batas audit

**Status: AUDIT SELESAI — menunggu tinjauan glossary.** Tidak ada source, data pemain, ID, manifest, database, RPC, atau nama berkas yang diubah. Rekomendasi berstatus `PROPOSED` atau `NEEDS CLARIFICATION`, bukan keputusan final. Stage 8 Character Registry belum dimulai.

- Branch: `restruktur`
- HEAD saat audit dimulai: `aa1c83be52ee0f0aed25369cce08f1ba87e31a87`
- `origin/restruktur` saat audit dimulai: sama dengan HEAD.
- `main` dan `origin/main`: `aeb11acf130df4ade4acc9417f01470e40a33dbb`.
- Worktree bersih sebelum laporan dibuat.
- Pemeriksaan dilakukan pada file aktif, katalog/manifest, test, migrasi dan snapshot Supabase, serta struktur folder. `old/`, `referensi/`, dan prototipe di `tools/` diperlakukan sebagai arsip/desain, bukan sumber istilah UI yang aktif.

## Ringkasan temuan

1. Keputusan pengguna yang sudah pasti: label kategori karakter adalah **Karakter**, label kategori Aura adalah **Aura**, dan **Efek** tidak boleh menjadi nama menu pengganti Aura. Istilah teknis `kind: aura`, `slot: aura`, `AuraFX`, dan `AuraView` dipertahankan.
2. UI saat ini belum konsisten dengan keputusan Aura: judul `efek.html`, tab Inventory, kartu Koleksi Profil, dan beberapa keterangan masih memakai **Efek**, sedangkan identitas katalog, equip, renderer, dan server memakai **Aura**.
3. Ada dua konsep berbeda yang sama-sama memakai kata *skin*: item katalog `skin.*` yang dipasang pada slot `equipped.skin`, dan warna kulit di `look.skin` (`s1`–`s5`). UI menyebut halaman utamanya **Karakter**, bukan Skin.
4. **Power-up** di UI, **Power** di sejumlah panel/teks, `kind: powerup`, dan folder `data/inventory/power/` adalah nama lapisan berbeda, bukan satu identifier yang bisa diganti serentak.
5. **Dadu** di UI berdampingan dengan `kind: dice`, folder `dice`, serta modul `DiceKit`/`DiceCatalog`. **Frame** dan **Pet** hampir sama antara UI dan identifier teknis; istilah Indonesia `Bingkai`/`Hewan peliharaan` tidak menjadi label utama aktif.
6. Pilihan papan disebut `Peta`, `Maps`, `Map`, dan `Theme/Tema` di lapisan berbeda. Data item tetap memakai `kind/slot: theme`.
7. **Inventory** dan **Koleksi** berfungsi berbeda: Inventory adalah daftar kepemilikan/kuantitas; Koleksi adalah ringkasan progres yang dihitung dari item dimiliki dibanding katalog.
8. Ditemukan placeholder Room bernama `effect`/`effectId` yang belum terhubung ke slot Aura `aura`. Ini bukan bukti adanya kategori Aura kedua; kontrak public-profile lama perlu ditinjau sebelum dihapus atau dipetakan ulang.
9. Halaman umum **Toko** menjual peti/menukar mata uang; halaman kategori item (mis. Aura dan Power-up) memiliki UI transaksi masing-masing. Toko umum menampilkan campuran **Coin/Koin** dan **Emerald**, sementara metadata katalog mengelompokkan Aura serta Power-up di kategori teknis `efek`.

## Inventaris kategori katalog dan Registry

Runtime `ItemCatalog` berisi **147 item** dengan kelompok teknis berikut:

| `kind` | Jumlah | Sumber metadata aktif | Istilah UI yang ditemukan |
|---|---:|---|---|
| `frame` | 14 | Registry `data/inventory/frame/` | Frame |
| `skin` | 6 | Builder legacy di ItemCatalog | Karakter; nama item skin |
| `dice` | 23 | Registry `data/inventory/dice/` | Dadu |
| `theme` | 2 | Builder legacy di ItemCatalog | Peta / Maps / Map |
| `powerup` | 17 | Registry `data/inventory/power/` | Power, Power-up |
| `gear` | 63 | Builder legacy di ItemCatalog | Perlengkapan, Equipment, Gear, Outfit |
| `aura` | 15 | Registry `data/inventory/aura/` | Efek, Aura |
| `pet` | 7 | Registry `data/inventory/pet/` | Pet |

Registry sekarang memiliki kategori `frame`, `dice`, `powerup`, `aura`, dan `pet`; belum ada kategori/manifest `character`, `skin`, `gear`, atau `theme`. Struktur folder mengikuti nama kategori/konvensi teknis (mis. `power` untuk `kind: powerup`), bukan selalu nama menu yang terlihat pemain. Ringkasan `kind` dan nama kategori katalog terdapat di [item-catalog.js](../../assets/js/item-catalog.js#L18) dan index Registry di `data/inventory/<kategori>/index.js`.

`ItemCatalog.CATEGORIES` adalah grouping metadata: Skin, Aksesori, Efek, Emote, dan Lainnya. `KIND_META` memetakan Aura dan Power-up ke grouping `efek`, Dice/Frame/Gear ke `aksesori`, serta Pet/Theme ke `lainnya`. `Emote` tercantum sebagai grouping tetapi tidak ada `kind: emote` di delapan kind runtime yang terinventaris; apakah ini kategori rencana atau legacy belum jelas. Ini **tidak** sama dengan tab halaman umum [shop.html](../../shop.html#L9), yang berjudul Toko dan menawarkan peti, Coin, Emerald, serta riwayat; item kategori dibeli dari halaman kategori masing-masing. Tidak ada bukti bahwa Toko umum menampilkan `ItemCatalog.CATEGORIES` sebagai tab.

## Temuan per istilah

### 1. Character / Karakter / Skin

- **UI:** [karakter.html](../../karakter.html#L4) berjudul Karakter. Profil menyebut “Karakter aktif”; Room menampilkan slot “KARAKTER”. Builder mengelompokkan pengaturan sebagai Gender, Penampilan, Outfit, Aksesori, dan Set di [karakter.js](../../assets/js/pages/karakter.js#L1101) serta [karakter.js](../../assets/js/pages/karakter.js#L1304).
- **Katalog/teknis:** tidak ada `kind: character`. Item avatar memakai `kind: skin`, ID `skin.<gameKey>`, slot `skin`; model runtime bernama `BlockyCharacter`, `CharacterData`, dan `CharacterFace`. Gear karakter adalah `kind: gear`, bukan Character.
- **Penyimpanan:** `PlayerData` menyimpan item yang dipakai dalam `equipped.skin`, tetapi konfigurasi builder disimpan terpisah sebagai `look`. `look.skin` adalah kode warna kulit seperti `s1`–`s5`, bukan ID item `skin.*`. Kunci localStorage tetap `ularTanggaBlok:player:v1` (dengan suffix akun).
- **Server:** public profile game memakai field `characterSkinId`; appearance/equip memakai objek `equipped` dan `look`. Achievement server menghitung item dengan `kind = 'skin'`.
- **Risiko/ketidakjelasan:** “Character Registry” dapat berarti enam item identitas `skin.*`, konfigurasi bentuk/warna `look`, model karakter prosedural, atau gabungan. Menganggap semuanya satu jenis berisiko mengubah data `look` menjadi inventory item atau memutus `equipped.skin`.
- **Status:** **CONFIRMED** untuk label UI **Karakter**. **NEEDS CLARIFICATION** untuk cakupan “Character Registry” dan apakah `skin` tetap menjadi `kind` teknis.

### 2. Aura / Efek

- **UI aktif:** `efek.html` memiliki judul Efek ([efek.html](../../efek.html#L4), [efek.html](../../efek.html#L13)); tab Inventory berlabel Efek ([inventory.js](../../assets/js/pages/inventory.js#L6)); Koleksi Profil juga berlabel Efek ([profile.js](../../assets/js/pages/profile.js#L120)). Halaman itu berisi 15 Aura, bukan kategori efek generik.
- **Katalog dan teknis:** nama domain `Aura`; `kind: aura`, `slot: aura`, ID `aura.*`, Registry `data/inventory/aura/`, renderer `AuraFX`, adapter `AuraView`. Aura juga muncul di Character preview, Lobby, Profile, dan Gameplay.
- **Server:** `item_catalog.kind = 'aura'`, `player_appearance.equipped['aura']`, `_item_equip_slot()` memetakan kind Aura ke slot Aura; pembelian melalui `buy_item`. Migrasi lama masih berkomentar “Aura karakter (kategori Efek)”.
- **Ketidaksesuaian Room:** [room.js](../../assets/js/pages/room.js#L74) masih mendefinisikan slot placeholder `effect`, mengambil `PD.equippedId('effect')`, dan menampilkan “Segera”; normalisasi `PlayerData` menggunakan `ItemCatalog.optionalSlots()` yang memuat slot opsional gear, `aura`, dan `pet`, bukan `effect` ([player-data.js](../../assets/js/player-data.js#L100), [item-catalog.js](../../assets/js/item-catalog.js#L488)). [room.js](../../assets/js/pages/room.js#L57) mengirim `effectId` dalam public profile, sementara allowlist `set_game_public_profile` masih menerima key itu di [202611060001_game_events.sql](../../supabase/migrations/202611060001_game_events.sql#L111). Dengan kontrak aktif saat ini, field `effectId` bukan slot Aura dan jalur UI Room tersebut tidak memasang Aura.
- **Grouping dan Shop:** komentar aktif [efek.js](../../assets/js/pages/efek.js#L11) secara eksplisit menamai halaman itu “Efek = Aura karakter”. Ini tidak sesuai keputusan kategori UI Aura. Di sisi lain, kategori katalog `efek` juga mencakup Power-up; grouping tersebut perlu dibedakan dari nama kategori Aura pada UI. Apakah grouping teknis `efek` akan tetap digunakan di metadata atau diganti adalah hal terpisah dari penggantian label halaman.
- **Pilihan tanpa Aura:** kartu tanpa item memakai nama “Tanpa Efek” di halaman Aura. **PROPOSED:** pertimbangkan “Tanpa Aura” agar cocok dengan kategori yang telah dikonfirmasi; ini tetap perlu persetujuan.
- **Status:** **CONFIRMED** bahwa nama kategori/menu adalah **Aura**, bukan Efek. **CONFIRMED** untuk mempertahankan `kind/slot: aura`, `AuraFX`, dan `AuraView`. **NEEDS CLARIFICATION** apakah placeholder Room `effect`/`effectId` akan tetap menjadi kontrak lama, dipetakan ke Aura, atau didepresiasi dalam tahap kompatibilitas terpisah. Nama `efek.html` dan `assets/js/pages/efek.js` hanya dicatat untuk evaluasi; tidak di-rename.

### 3. Power / Power-up / Powerup

- **UI:** halaman dan tab Inventory memakai **Power-up**; Room memakai **POWER** dan “Power”; beberapa teks hadiah/HUD menyebut Power. Lihat [powerup.html](../../powerup.html#L5), [inventory.js](../../assets/js/pages/inventory.js#L10), [room.html](../../room.html#L21), dan [hud.js](../../gameplay/js/hud.js#L10).
- **Teknis:** `kind: powerup`, kategori Registry `powerup`, folder `data/inventory/power/`, manifest ID `powerup.<gameKey>` yang dipetakan ke ID gameplay lama tanpa prefiks. Gameplay memakai istilah `Power`, data aturan `PUN`/`PUR`, dan efek visual/audio `PowerFX`/`PowerSound`.
- **Server:** `item_catalog.kind = 'powerup'`; stok tersimpan di `player_inventory`; kontrak khususnya `buy_powerup` dan `use_powerup`, bukan `buy_item` satuan. ID Power juga dipakai aturan gameplay, stok, dan peta yang diperbolehkan.
- **Risiko:** mengubah `powerup` atau ID publik berdampak pada manifest, loader, loadout Room, gameplay, stok, RPC, dan data pemain. Label UI dapat distandardisasi terpisah dari kontrak.
- **Status:** **PROPOSED** menstandardisasi label UI menjadi **Power-up**, sambil mempertahankan istilah ringkas “Power” hanya di konteks yang muat/tepat. Identifier teknis `powerup`, folder `power`, serta RPC tidak diubah oleh usulan ini.

### 4. Dice / Dadu

- **UI:** tab Inventory memakai **Dadu**; tombol lempar gameplay bertuliskan **Roll**. Tombol pemilihan map di gameplay memakai **Maps**, menunjukkan bahasa UI belum sepenuhnya konsisten.
- **Teknis:** `kind: dice`, folder Registry `data/inventory/dice/`, `DiceKit`, `DiceCatalog`, `DiceEffectsCore`; identifier serta data server tetap `dice.*`/`diceId`.
- **Status:** **PROPOSED** mempertahankan **Dadu** sebagai label UI dan `dice`/`Dice*` sebagai identifier/modul teknis. Ini bukan keputusan teknis untuk mengganti nama modul.

### 5. Frame / Bingkai

- **UI dan domain:** halaman, tab Inventory, Profile, serta identitas `kind` menggunakan **Frame**. Tidak ditemukan `Bingkai` sebagai label utama pada halaman aktif; kata tersebut muncul pada copy/desain alat Frame di `tools/frame-design/Character_Frames.html`, yang bukan halaman game.
- **Teknis/server:** `kind: frame`, folder Registry `data/inventory/frame/`, ID `frame.*`, slot `frame`, aset profil di `data/frame/`, dan renderer `FrameFX`.
- **Status:** **PROPOSED** mempertahankan **Frame** sebagai istilah UI untuk menghindari campur istilah dengan “bingkai” generik. Persetujuan pengguna tetap diperlukan sebelum glossary ini dianggap final.

### 6. Pet / Hewan peliharaan

- **UI:** halaman dan Inventory menggunakan **Pet**; halaman Pet memberi label `Koleksi pet`.
- **Teknis/server:** `kind: pet`, Registry `data/inventory/pet/`, slot opsional `pet`, pembelian tetap `buy_item`, equip lewat `player_appearance.equipped['pet']`. `supabase/pet_catalog.sql` menyimpan skill, visual, animasi, efek, dan sound data Pet.
- **Status:** **PROPOSED** menggunakan **Pet** secara konsisten sebagai nama kategori UI; istilah teknis `pet` dipertahankan.

### 7. Gear / Equipment / Perlengkapan / Outfit

- **UI:** builder menampilkan label bagian Indonesia seperti Baju, Celana, Zirah, Aksesori, sekaligus kelompok **Outfit**. [karakter.html](../../karakter.html#L18) memiliki label aksesibilitas “Perlengkapan sisi kiri/kanan”; Room memakai judul iframe **Equipment** dan bagian “EQUIPMENT”.
- **Katalog/teknis:** 63 item `kind: gear`; slot tersimpan seperti `g.top`, `g.legs`, `g.acc.<kunci>`. `PlayerData.gearDye` dan server column `gear_dye` adalah pewarna item, bukan nama kategori.
- **Status:** **PROPOSED** memakai **Perlengkapan** untuk istilah UI umum; **Gear** tetap untuk `kind`, field, dan folder/identitas teknis. **NEEDS CLARIFICATION** apakah “Outfit” berarti set kombinasi yang disimpan, kategori pakaian, atau keduanya; data outfit tersimpan terpisah melalui `player_outfits`.

### 8. Theme / Tema / Map / Peta

- **UI:** pemilih mode memakai **Peta sebelumnya/berikutnya**; gameplay menampilkan tombol **Maps** dengan aria-label “Ganti peta”; Room menampilkan nama map dan “Game Mode”.
- **Katalog/teknis:** hanya ada 2 item `kind: theme`, nama katalog berbentuk `Map ...`, slot `theme`, key gameplay `minecraft`/`nether`. `ItemCatalog` menjelaskan map sebagai bagian game, bukan item dagangan; `RoomFlow`/gameplay memakai map key.
- **Status:** **PROPOSED** memakai **Peta** untuk pilihan papan dalam UI. Pertahankan `kind/slot: theme` dan key map sampai keputusan teknis dan migrasi kompatibilitas disetujui. Perlu dipastikan apakah “Tema” akan merujuk skin visual papan atau seluruh map gameplay.

### 9. Item / Inventory / Collection / Koleksi

- **UI:** `inventory.html` berjudul **Inventory**; tabnya adalah kategori item. Profile berjudul **Koleksi** dan menampilkan rasio dimiliki/total; Pet memakai label “Koleksi pet”.
- **Data:** `ItemCatalog` adalah metadata katalog statis. `PlayerData.inventory` dan `public.player_inventory` adalah kepemilikan/kuantitas. `Collection` juga muncul sebagai tipe penghitung achievement; bukan tabel yang menggantikan inventory.
- **Status:** **PROPOSED** membedakan item = definisi katalog, Inventory = kepemilikan/stok, dan Koleksi = ringkasan progres UI. **NEEDS CLARIFICATION** apakah judul UI `Inventory` akan dipertahankan atau diterjemahkan menjadi `Inventori`.

### 10. Istilah gameplay dan ekonomi lain

- **Roll / lempar:** tombol gameplay bertuliskan **Roll**, sementara teks lain memakai “lempar” dan **Giliran**.
- **Computer / CPU / Komputer:** kode/HUD memakai `cpu`, `Computer`, `VS Computer`; teks UI berbahasa Indonesia juga memakai “pemain/komputer”.
- **Coin / Koin / Emerald:** label dompet dan katalog menggunakan Coin/Emerald, sementara hasil hadiah menyebut Koin. `coins`/`gems` tetap nama field teknis; `gems` ditampilkan sebagai Emerald.
- **Toko:** `shop.html` berjudul **Toko**, menyediakan Coin dan Emerald serta peti/riwayat; `shop-page.js` memakai pesan seperti “Coin tidak cukup”, “Emerald tidak cukup”, dan nama paket Koin. Pembelian item kategori berlangsung pada halaman kategori masing-masing, bukan sebagai tab `shop.html`.
- **Status:** **PROPOSED** memakai “Lempar” dan “Komputer” untuk copy UI berbahasa Indonesia; **NEEDS CLARIFICATION** untuk apakah mata uang UI mengikuti nama merek **Coin** atau terjemahan **Koin**. **Emerald** adalah label UI yang ditemukan dan `gems` nama field penyimpanan/API; jangan mengganti `gems` hanya karena label UI.

## Usulan standar berdasarkan lapisan

1. **UI kategori yang sudah disepakati:** Karakter dan Aura. Tab/menu Aura tidak diberi label Efek.
2. **UI kategori yang diajukan:** Power-up, Dadu, Frame, Pet, Perlengkapan, dan Peta. Ini masih `PROPOSED`, bukan keputusan final.
3. **Copy generik:** usulan membatasi “Efek” untuk dampak visual/gameplay secara umum, bukan nama kategori/menu Aura; ini tidak membatalkan grouping teknis `efek` yang saat ini memuat Aura dan Power-up. Usulan lain: “Koleksi” khusus ringkasan progres, bukan sinonim Inventory.
4. **Teknis:** pertahankan identifier legacy `skin`, `dice`, `theme`, `powerup`, `frame`, `gear`, `aura`, `pet`; slot `skin`, `dice`, `theme`, `frame`, `aura`, `pet`, dan `g.*`; serta nama API/RPC yang ada sampai tinjauan kontrak khusus disetujui. Jangan menyimpulkan bahwa label UI baru membutuhkan perubahan `kind`.
5. **Nama file/route:** label UI tidak mengharuskan rename `efek.html`/`efek.js`. Jika kelak diputuskan mengganti route, sediakan evaluasi alias/redirect dan perbarui semua referensi sebelum file lama dihentikan.

## Dampak jika istilah teknis diubah

| Lapisan | Lokasi yang ditemukan | Dampak rename teknis |
|---|---|---|
| UI dan navigasi | `*.html`, `assets/js/pages/*.js`, [inventory-bridge.js](../../assets/js/inventory-bridge.js#L7), `room.js`, `profile.js`, `mail.js`, `splash.js` | Semua label, route, iframe/tab, allowlist halaman, deep link, dan tes yang membaca route harus selaras. `efek.html` direferensikan oleh Inventory, Room, Profile, Mail, splash/preloader, README, dan tes. |
| Katalog/Registry | [item-catalog.js](../../assets/js/item-catalog.js#L30), `data/inventory/{aura,dice,frame,pet,power}/`, `assets/js/item-registry.js` | `kind`, prefiks ID, `gameKey`, fallback, urutan manifest, dan pemetaan UI dapat tidak cocok. Label tampilan dapat diubah tanpa mengubahnya. |
| PlayerData/localStorage | [player-data.js](../../assets/js/player-data.js#L18), objek `inventory`, `equipped`, `look`, `outfits`, `gearDye` | ID/slot tersimpan lintas sesi/perangkat. Rename field/slot memerlukan migrasi versi dan pembacaan data lama; jangan mengganti key `ularTanggaBlok:player:v1` atau bentuk `look/equipped` dalam audit istilah ini. |
| Supabase/database | `item_catalog`, `player_inventory`, `player_appearance`, `player_outfits`, `pet_catalog`, 39 migrasi dan schema snapshot | `item_id` adalah foreign key; `kind` dan `starter/stackable` dipakai pembelian/equip/achievement; `_item_equip_slot` memetakan kind ke slot. Rename memerlukan migrasi data, seed, snapshot, dan tes, bukan sekadar perubahan label. |
| API/RPC | `buy_item`, `buy_powerup`, `use_powerup`, `appearance_save`, `appearance_get`, `room_appearance_get`, `set_game_public_profile` | Nama fungsi dan payload merupakan kontrak klien-server. Pertahankan atau sediakan kompatibilitas/alias selama klien lama mungkin masih aktif. `effectId` adalah kontrak public-profile tersendiri, bukan bukti slot Aura. |
| Gameplay/Room | `gameplay/js/config.js`, `gameplay/js/main.js`, `gameplay/js/hud.js`, `assets/js/pages/room.js` | `powerup`, `theme`, `dice`, serta slot equip dan map key memengaruhi aturan, stok, loadout, render, dan sinkronisasi; tidak aman untuk rename massal. |
| File dan cache | `efek.html`, `assets/js/pages/efek.js`, script tags, `assets/preload-manifest.json`, `sw.js`, tes dan README | Rename folder/file dapat membuat 404. Update import/route, preload, test paths, serta evaluasi versi cache service worker diperlukan. `sw.js` saat ini tidak mencantumkan setiap halaman item sebagai CORE; splash/preloader punya daftar halaman sendiri. |

## Glossary untuk ditinjau dan disetujui

| Konsep | Istilah UI saat ini | Nama teknis/penyimpanan saat ini | Usulan standar | Status |
|---|---|---|---|---|
| Kategori avatar | Karakter | Item `skin`, slot `skin`; data model `look` terpisah | **Karakter** untuk kategori; scope Character Registry masih harus diputuskan | CONFIRMED untuk UI; NEEDS CLARIFICATION untuk scope Registry |
| Item `skin.*` | Karakter / Skin | `kind: skin`, ID `skin.*` | Pertahankan `skin` sebagai identifier lama; jangan campur dengan `look.skin` | NEEDS CLARIFICATION |
| Aura kosmetik | Efek (beberapa menu) / Aura; opsi “Tanpa Efek” | `kind/slot: aura`, `AuraFX`, `AuraView` | **Aura** sebagai kategori; pertimbangkan “Tanpa Aura” untuk opsi nonaktif | CONFIRMED untuk label Aura dan nama teknis; PROPOSED untuk copy opsi/nonkategori |
| Emote | Emote (grouping katalog) | Tidak ada `kind: emote` di katalog runtime saat ini | Pastikan apakah grouping tetap diperlukan | NEEDS CLARIFICATION |
| Power | Power / Power-up | `kind: powerup`, folder `power`, RPC `buy_powerup`/`use_powerup` | Power-up di UI; Power boleh menjadi copy ringkas | PROPOSED |
| Dadu | Dadu | `kind: dice`, `DiceKit`, `DiceCatalog` | Dadu di UI; Dice di modul/identifier | PROPOSED |
| Frame | Frame | `kind/slot: frame`, `FrameFX` | Frame | PROPOSED |
| Pet | Pet | `kind/slot: pet`, katalog skill pet | Pet | PROPOSED |
| Perlengkapan karakter | Perlengkapan / Equipment / Gear / Outfit | `kind: gear`, slot `g.*`, `player_outfits` | Perlengkapan untuk UI umum; bedakan Gear dari Outfit tersimpan | PROPOSED; Outfit NEEDS CLARIFICATION |
| Papan permainan | Peta / Maps / Map / Tema | `kind/slot: theme`, map keys | Peta untuk pilihan papan; Theme tetap identifier | PROPOSED |
| Daftar kepemilikan | Inventory | `PlayerData.inventory`, `player_inventory` | Inventory atau Inventori—pilih satu label UI | NEEDS CLARIFICATION |
| Progres kepemilikan | Koleksi | Hitungan dimiliki/total; achievement `collection` | Pertahankan Koleksi untuk progres, bukan storage inventory | PROPOSED |
| Objek katalog | Item | `ItemCatalog`, `item_catalog`, item IDs | Item untuk definisi katalog; jangan disamakan dengan kepemilikan | PROPOSED |
| Aksi lempar dadu | Roll / lempar | `btnRoll`, `DiceKit` | Lempar sebagai copy UI; identifier tetap | PROPOSED |
| Lawan komputer | Computer / CPU / Komputer | `cpu`, `VS Computer` | Komputer untuk UI Indonesia | PROPOSED |
| Mata uang Coin | Coin / Koin | `coins` | Tentukan Coin atau Koin untuk UI | NEEDS CLARIFICATION |
| Mata uang Emerald | Emerald | `gems` | Emerald di UI; `gems` tetap field/API | PROPOSED |

## Keputusan yang menunggu pengguna

Sebelum Character Registry dimulai, mohon tinjau terutama:

1. Apakah Character Registry akan mengatur item avatar `skin.*`, konfigurasi `look`, model karakter, atau hanya salah satunya?
2. Apakah `kind: skin` dan slot `skin` dipertahankan sebagai identifier kompatibilitas, sementara UI menggunakan Karakter?
3. Apakah istilah `Gear`, `Outfit`, dan `Perlengkapan` mewakili konsep berbeda pada UI?
4. Apakah UI akan memilih Peta atau Tema untuk tab/pilihan board; Inventory atau Inventori; Coin atau Koin?
5. Apa perlakuan kontrak placeholder Room `effect`/`effectId` ketika label Aura dibakukan?

## Validasi dan batas audit

- Audit ini bersifat pembacaan statis atas implementasi, manifest/katalog, route/script loading, referensi tes, dan migrasi SQL. Tidak ada test/build dijalankan karena tidak ada perubahan runtime.
- Tes yang merekam penamaan/kontrak lama meliputi `tests/aura-catalog.test.js` (mengharapkan `category === 'efek'`), `tests/aura-fx.test.js` dan `tests/room-page-modal.test.js` (route `efek.html`), serta tes Registry Aura yang memeriksa chain script dan label tab. Assertion tersebut perlu ditinjau hanya jika perubahan UI/kontrak benar-benar disetujui; jangan mengubah tes agar terminologi tampak konsisten tanpa mengubah perilaku yang dimaksud.
- Pengujian browser nyata, visual, animasi, audio, dan alur transaksi langsung tidak dilakukan dalam Stage 8.0.
- Audit tidak mengubah ataupun menguji database Supabase aktif. Temuan kontrak server didasarkan pada migrasi lokal dan schema snapshot dalam repository.

Tidak ada perubahan kode atau migrasi dalam Stage 8.0. Stage 8 Character Registry tetap **menunggu persetujuan glossary**.
