# UI AUDIT — Stage 4.0.1 (Ular Tangga Blok)

Audit baca-saja (tidak ada kode yang diubah). Basis: `game/*.html`, `game/assets/css/base.css`, `game/assets/js/app.js`.
Semua halaman memakai CSS **inline** per halaman; satu-satunya CSS bersama adalah `game/assets/css/base.css` (token/komponen berawalan `ut-`, selector umum dibungkus `:where()`).

## Temuan utama
1. **`UT.UI` sudah ada (Stage 2)** — `UT.UI.toast`, `UT.UI.modal`, `UT.UI.setLoading` di `app.js`, + `.ut-overlay/.ut-modal/.ut-toast` di `base.css`. **Tidak dipakai satu halaman pun** (0 pemanggilan). HUD baru harus membungkus/menggunakan ini, bukan membuat paralel.
2. **Helper legacy ditulis ulang di tiap halaman**: `toast()`, `openModal()`, `closeModal()` ada di 8/8 halaman non-gameplay; `playSound()` ada di 5 halaman (shop, inventory, leaderboard, profile, dailyreward) masing-masing dengan peta SFX sendiri yang membungkus `UT.Audio.play`.
3. **Markup modal + toast identik di 8 halaman** (`#modal.ov > .box > #mx + #mb`, `#toast`); hanya perilaku yang beda (shop: kelas `big`, animasi `closing`, Escape, fokus; halaman lain lebih sederhana).
4. **Ikon gem/coin SVG di-inline** di 8 halaman.
5. **Tidak ada UI Join/Slot pemain sama sekali** saat ini (hanya kartu "Custom Room" di `mode.html` dan tombol undang/tambah teman di `friendship.html`) → komponen baru, murni abstraksi UI.
6. **Gameplay punya sistem sendiri** (`.btn`, `.card`, `.panel`, `.chip`, `.overlay`) → dimigrasi paling akhir (4.0.9).

## UI AUDIT
Button:
- `.cta` — mode (4.3rem, tanpa gradient sendiri, varian `.b/.y`) vs shop (5rem, gradient kuning, font 3.4rem) → 2 varian berbeda.
- `.bt` (+`.own/.gd/.no`) — kartu inventory/shop, tinggi 2.5rem. `.use` di inventory.
- `.ab` / `.ab.blue` — tombol aksi bundar/ikon; **Back = `#back.ab.blue` di 7 halaman** (dailyreward, friendship, inventory, leaderboard, mode, profile, shop) dengan SVG panah yang sama.
- `.mb`, `.pack`, `.heroBtn`, `.bb` (bar mode) — tombol lain buatan halaman.
- gameplay: `.btn`, `.btn.big/.small/.light`, `[aria-pressed]` (JANGAN diubah sebelum 4.0.9).
- Close = `#mx.x` (✕) di 8 halaman, sama.

Card:
- `.card` shop (padding .4rem, gradient `--c1/--c2`) vs inventory (padding .3/.7rem, gradient biru tetap, varian `.lg/.lk/.sel`) → 2 varian.
- Kartu lain: `.gc.lr` (leaderboard, `.me`), `.friend` (friendship), `.row`/`.row.opt`/`.row.cl` (mode, dailyreward, profile, shop), `.panel` (dailyreward, gameplay).

Currency:
- `.cur` dengan **6 varian ukuran** (lobby 3.8rem; mode 4.2; shop 5.0; inventory=profile=friendship 4.2; leaderboard; dailyreward) dan `.cur>svg` 4 varian (4.8 / 5.4 / 6.0 / 5.2rem). Gradient & shadow sama → cukup 1 komponen + modifier ukuran.
- Elemen `#gem` dan `#coin` diisi dari `PlayerData`; komponen hanya menampilkan.

Join:
- Belum ada. Kandidat: kartu `room` di `mode.html` (modal pilih Publik/Privat + kode), `#inviteHero/#addBtn` di `friendship.html`.

Modal:
- 8 salinan `openModal/closeModal`; `UT.UI.modal` tersedia tapi tak terpakai.

Toast:
- 8 salinan `toast(t)` (±1600ms) memakai `#toast`; `UT.UI.toast` sudah kompatibel dengan `#toast` halaman.

Badge:
- `.badge` shop (font 1.9rem) vs inventory (font 1rem); `.tag` (mode: "SEGERA"/`.soon`, dailyreward `.row.cl .tag`).

Tabs:
- `.tab` shop (flex 0 0 17rem) vs inventory (flex:1) vs friendship (`.tab.on`) vs leaderboard (`.tb.on`) → 4 varian, perilaku sama (satu aktif).

Avatar:
- `.av` (leaderboard 5.6rem, profile) vs `.avatar` (friendship 5.2rem) — radius/gradient beda tipis; isi SVG dari `item-art.js`.

Item Card / Shop Card / Inventory Card:
- Sama dengan Card shop/inventory di atas (`.th` thumbnail, `.nm` nama, `.badge` rarity, tombol `.bt`).

Player Card:
- `.gc.lr` leaderboard (rank, avatar, skor), `.friend` friendship.

Reward Card:
- `.row` + `.ri` di dailyreward (`state: now/claimed`), `.row.cl`.

Header / Back / Close:
- Header atas = `.ab` + `.cur` (posisi absolut per halaman). Back/Close sama di semua halaman.

Empty State:
- `.empty` hanya di friendship.

Loading State:
- hanya `UT.UI.setLoading` (kelas `html.ut-loading`); tidak dipakai halaman.

Design tokens:
- `base.css` baru memuat komponen overlay/modal/toast + utilitas. **Belum ada** `--ut-radius-*`, `--ut-space-*`, `--ut-text-*`, `--ut-shadow-*`.

## Keputusan struktur (untuk dikonfirmasi)
- Root aplikasi game = folder `game/` (di repo juga ada landing di root). Maka struktur 4.0 diterapkan sebagai **`game/hud/ui-core.js`** dan **`game/hud/components/*.js`**. Tidak ada `hud/core` maupun `assets/game/core`.
- Bentrok dokumen: tree 4.0 menaruh modul gameplay di `gameplay/`, sedangkan prompt Stage 4 menulis `assets/js/gameplay/`. Diputuskan sebelum 4.1 (di luar cakupan 4.0).
- Catatan Stage 4: prompt menyebut baseline tidak punya marker `GEOM-START/END`, padahal `gameplay.html` (baris ~492 dan ~551) memilikinya. Marker dipertahankan.

## Urutan migrasi usulan (4.0.9)
Lobby → Mode → Shop → Inventory → Profile → Leaderboard → Friendship → Daily Reward → Gameplay (terakhir). Helper legacy (`toast/openModal/closeModal/playSound`) dipertahankan sebagai adapter ke `UT.Hud` sampai tiap halaman lulus tes.
