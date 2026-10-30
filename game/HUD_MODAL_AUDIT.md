# HUD Modal Audit (Stage 4.0.6)

Dokumentasi saja — tidak ada modal existing yang diubah atau dimigrasi pada stage ini.

## Pola existing
Tujuh halaman non-gameplay memakai pola yang hampir identik: `<div class="ov" id="modal"><div class="box" role="dialog" aria-modal="true"><button class="x" id="mx" aria-label="Tutup">✕</button><div id="mb"></div></div></div>` dengan `openModal(html, init)` / `closeModal()` buatan halaman. Konten dimasukkan lewat **`innerHTML`** (string template). CSS `.ov/.box/.x` diduplikasi inline di tiap halaman; `shared-ui.css` menambah perbaikan tombol tutup (`html body .ov > .box > .x`, `#mb` yang scroll).

## Perbedaan behavior per halaman
| Halaman | Escape | Backdrop | Fokus | Close anim | Lain-lain |
|---|---|---|---|---|---|
| lobby | ya | ya | `#mx.focus()` saat buka | fade (250ms) | pengaturan, event; `mOpen` flag |
| mode | ya (juga dipakai panah kiri/kanan) | ya | `#mx.focus()` | class `closing` | konfirmasi mode (opsi + Batal/Mulai) |
| shop | ya | ya | `#mx.focus()` | `closing` + callback `onClose` | varian `.box.big`, suara `open`, konfirmasi beli, paket coin/gem, hadiah item |
| inventory | ya | ya | `#mx.focus()` | `closing` + `onClose` | `.box.big`, paket currency, pengaturan |
| profile | ya | ya | `#mx.focus()` | `closing` + `onClose` | ubah nama (input), riwayat, statistik |
| leaderboard | ya | ya | `#mx.focus()` | `closing` | hadiah musim, paket currency, pengaturan |
| dailyreward | ya | ya | `#mx.focus()` | fade | dialog "Hadiah Diklaim"; `.box` lebar tetap 48rem |
| friendship | **tidak** | ya | **tidak ada** | fade | satu-satunya yang tanpa `role=dialog`/`aria-modal`/`aria-label` pada tombol tutup; tanpa flag `mOpen` |
| gameplay | Escape (jeda/keluar) | tidak | `focus()` manual | — | bukan pola `.ov`: `<section class="overlay" role="dialog" aria-modal>` + `hidden`; `pauseMenu`, `exitConfirm` (alertdialog). Tidak disentuh. |

Catatan umum: semua `closeModal` hanya satu modal (singleton via `#modal`), listener Escape global di `window`, tidak ada pemulihan fokus ke elemen pemicu, tidak ada focus trap, id `#mx/#mb/#box` unik per halaman sehingga tidak bisa dipakai dua modal sekaligus.

## Keputusan desain komponen
- Satu instance = satu elemen `.ut-modal` sendiri, ditempel ke `<body>` hanya saat terbuka; tidak ada singleton, tidak memakai `#modal/#mx/#mb/.ov/.box`.
- Isi: `HTMLElement`, `HTMLElement[]`, atau string (= teks aman lewat `textContent`). Tanpa `innerHTML`. Halaman yang nanti migrasi harus membangun isi lewat DOM, bukan string HTML.
- Escape: listener per instance; modal bertumpuk → hanya yang paling atas yang bereaksi.
- Fokus sederhana tanpa focus trap (tidak dibutuhkan audit): ke tombol close saat buka, kembali ke elemen pemicu saat tutup.
- Animasi buka (fade+scale 250ms, sama dengan existing) lewat CSS keyframes; penutupan langsung (tanpa timer) agar `isOpen()` selalu akurat. Menghormati `prefers-reduced-motion`.
- Tampilan mengikuti modal existing (gradasi biru, radius 2.4rem, bayangan `var(--bd)`, tombol tutup merah menonjol) memakai satuan rem seperti halaman; lebar dibatasi `calc(100vw - 4rem)` agar tombol tutup yang menonjol tidak keluar viewport.

## Belum dilakukan (sengaja)
Migrasi `openModal/closeModal` halaman, penghapusan `.ov`/`#modal`, modal gameplay, toast/badge, perubahan `base.css`/`shared-ui.css`.
