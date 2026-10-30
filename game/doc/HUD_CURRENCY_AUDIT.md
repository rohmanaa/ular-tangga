# HUD Currency Audit (Stage 4.0.5)

Dokumentasi saja — tidak ada perubahan behavior. Halaman tidak dimigrasi pada stage ini.

## Temuan per halaman

| Halaman | Markup currency | Sumber angka | Catatan |
|---|---|---|---|
| lobby | `.ut-curbar > .ab.cur#gem / #coin` + SVG inline + `span#gemV/#coinV` + tombol `.plus` | `PlayerData.gems()/coins()` via `renderCurrency()` | variabel ukuran: `--cur-h:3.8rem --cur-icon:4.8rem --cur-plus:2.9rem --cur-fs:2.3rem` |
| mode | sama | PlayerData | `--cur-fs:1.9rem --cur-icon:5.4rem` |
| shop | sama | PlayerData | terbesar: `--cur-h:5rem --cur-icon:6rem --cur-plus:4rem --cur-fs:2.9rem` |
| inventory | sama | PlayerData | default shared-ui |
| profile | sama | PlayerData | default shared-ui |
| leaderboard | sama | PlayerData | posisi berbasis `left` + `--curbar-shift` |
| friendship | sama; **angka hardcoded** `120` / `8.450` di HTML (fallback) | PlayerData menimpa saat load | CSS `.cur`, `#gem`, `#coin` juga ada inline di halaman ini |
| dailyreward | ikon disuntik JS (`innerHTML`) ke `span#gemI/#coinI` | PlayerData | state klaim harian masih legacy `localStorage['inv']` (bukan currency) |
| gameplay | tidak ada currency UI | — | tidak disentuh |

## Ikon
- Gem: path `M6 3h12l4 6-10 12L2 9z` (#4cc9ff / stroke #1d7fd0) + garis fasetnya (#bff0ff).
- Coin: lingkaran #ffc83a / stroke #c98a0c, cincin dalam #ffe27a, teks `$`.
- Markup SVG diulang di tiap halaman (copy-paste); `dailyreward` punya salinan sendiri di objek `I`.

## Ukuran existing (`assets/css/shared-ui.css`)
Pill tinggi 4.2rem, ikon 5.2rem, font 2rem sebagai default; tiap halaman menyetel via variabel `--cur-*`. Rentang yang ditemukan: tinggi 3.8–5rem, ikon 4.8–6rem, font 1.9–2.9rem.

## Mapping ke komponen
`sm` font 1.6rem · `md` 2rem (= default shared-ui) · `lg` 2.6rem (mendekati shop). Proporsi dalam em: tinggi 2.1em, ikon 2.6em.

## Legacy / hardcoded
- Angka hardcoded: hanya fallback di `friendship.html`.
- Tidak ada halaman non-gameplay yang membaca currency langsung dari localStorage legacy; semua lewat `PlayerData`. Key legacy `inv`/`shop` masih dipakai untuk state non-currency (klaim harian) dan kompatibilitas migrasi.
- `gameplay.html` memakai localStorage hanya untuk tema/dadu/malam.

## Belum dilakukan (sengaja)
Migrasi halaman ke `UT.Hud.create('currency', …)`, penggantian `.cur`/`#gem`/`#coin`, dan integrasi PlayerData — tahap berikutnya. Komponen tidak menambah tombol `+`; itu tetap milik halaman.
