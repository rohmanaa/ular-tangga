# HUD Toast Audit (Stage 4.0.7)

Dokumentasi + komponen baru saja — tidak ada `toast()` / `#toast` existing yang diubah atau dimigrasi pada stage ini.

## Pola existing
Delapan halaman non-gameplay (lobby, mode, shop, inventory, profile, leaderboard, friendship, dailyreward) memakai pola yang hampir identik: markup `<div id="toast"></div>`, CSS `#toast` inline (+ `#toast.on`, di friendship kelas `.toastOn`), dan helper buatan halaman `function toast(t){ e.textContent=t; e.classList.add('on'); clearTimeout(toast.t); toast.t=setTimeout(()=>e.classList.remove('on'), ms) }`. `gameplay.html` dan `splash.html` tidak punya toast.

| Halaman | Durasi | Font | Posisi bawah | Catatan |
|---|---|---|---|---|
| lobby | 1700 | 2.4rem | 3rem | `soon()` memanggil toast |
| mode | 1800 | 2.4rem | 3rem | |
| shop | 1600 | 2.2rem | 2.5rem | padding/radius sedikit lebih kecil |
| inventory | 1600 | 2.6rem | 3rem | |
| profile | 1600 | 2.6rem | 3rem | |
| leaderboard | 1600 | 2.2rem | 2.5rem | padding/radius sedikit lebih kecil |
| friendship | 1800 | 2rem | 3rem | state `.toastOn`, timer di `window.tt` |
| dailyreward | 1700 | 2.2rem | 3rem | |

Perilaku yang sama di semua halaman: pil biru `var(--bd)` + teks putih, `pointer-events:none`, `white-space:nowrap`, masuk dari bawah dengan pegas (`translate` + `opacity`), **tanpa** tombol tutup, **tanpa** varian (success/error/info semuanya satu gaya; pesan error hanya dibedakan oleh teksnya), **tanpa** `role`/`aria-*`, satu elemen + satu timer per halaman. Panggilan beruntun **menimpa** toast sebelumnya (timer lama dibersihkan) — tidak pernah ada lebih dari satu toast tampil, jadi stacking tidak dibutuhkan oleh UI existing. Pesan selalu lewat `textContent`; `white-space:nowrap` membuat pesan panjang bisa overflow di layar sempit.

## UT.UI.toast (Stage 2)
`UT.UI.toast(message, ms)` ada di `assets/js/app.js`: memakai `#toast` milik halaman bila ada (selain itu membuat satu `.ut-toast` di `body`), satu timer bersama, default 1800ms, mengembalikan elemen. Gaya `.ut-toast` / `.ut-toast.on` ada di `assets/css/base.css`. Tidak dipanggil dari halaman mana pun.

Karena singleton dan terikat ke `#toast`, ia **tidak bisa** menjadi mesin untuk komponen HUD: tidak ada banyak instance, varian, `hide()`, maupun `isVisible()`, dan memanggilnya dari HUD justru menyalakan `#toast` legacy. Maka:
- DOM/timer `UT.UI.toast` **tidak** dipakai ulang; API-nya tidak diubah.
- Yang dibagi: kelas dasar `.ut-toast` + kelas state `.on` (kontrak sama dengan base.css), dan default durasi 1600ms dari toast legacy mayoritas halaman.
- Tidak ada sistem paralel baru: tidak ada `UT.Toast` / `ToastManager`; komponen hanya mendaftar lewat `UT.Hud.register('toast', …)`.
- Arah migrasi (stage berikutnya, bukan sekarang): `toast()` halaman dan `UT.UI.toast` menjadi adapter ke `UT.Hud.create('toast')`, sehingga tersisa satu implementasi.

## Keputusan desain komponen
- API: `UT.Hud.create('toast', { message, variant, duration, className, ariaLabel })` → `show()`, `hide()`, `isVisible()`, `setMessage()`, `element`.
- `variant`: `info|success|warning|error`; selain itu → `info`. `duration`: `0` = permanen; angka positif = timeout (maks 2147483647); invalid/negatif/NaN/Infinity → `1600`.
- Pesan hanya lewat `textContent`; `ariaLabel` lewat `setAttribute`. Tanpa `innerHTML`.
- Satu timer per instance; `show()` ulang membersihkan timer lama. Tidak ada listener dokumen sama sekali (toast tidak interaktif), jadi tidak ada listener yang bisa menumpuk.
- Akar `.ut-toast.ut-toast-hud.ut-toast-<variant>` hanya ada di DOM saat tampil, di dalam **satu** host bersama `.ut-toast-stack` (dibuat saat toast pertama tampil, dibuang saat kosong). Banyak instance tampil bersamaan tersusun vertikal (flex column) tanpa saling menutup. Menyembunyikan = langsung dilepas dari DOM (tanpa timer fade-out) agar `isVisible()` selalu akurat; animasi masuk (pegas 350ms) lewat CSS keyframes, menghormati `prefers-reduced-motion`.
- Aksesibilitas: `error` → `role="alert"`; `info/success/warning` → `role="status"` + `aria-live="polite"`; `aria-atomic="true"`; tanpa `tabindex`; `pointer-events:none` sehingga tidak merebut fokus/klik. Catatan: pembaca layar kadang tidak membacakan region live yang disisipkan sudah berisi teks; `role="alert"` pada error adalah yang paling andal untuk kasus ini.
- Teks membungkus (`overflow-wrap:anywhere`, `max-width:100%`, host dibatasi viewport) sehingga pesan panjang / tanpa spasi tidak overflow horizontal di 360–1366px.
- CSS: semua selector diawali `.ut-toast`; aturan visual diawali `.ut-toast.ut-toast-hud` agar `.ut-toast` polos (fallback `UT.UI.toast` di base.css), `#toast`, dan `.toast` legacy tidak berubah.
- Tampilan mengikuti toast legacy (pil `var(--bd)`, rem, bayangan tidak ada); varian hanya mengganti warna latar/teks.

## Verifikasi (headless Chromium)
Registrasi/duplikasi, 7 kasus varian, 5 kasus XSS, durasi (0/100/1600/invalid/negatif/NaN/Infinity), lifecycle & re-show (satu timer, nol listener), 3 instance independen + non-overlap, `className`, a11y, responsive (360/390/412/768/1366 × pesan panjang & tanpa spasi), non-interference `toast.css` pada 8 halaman di 1366×768 (selisih rect = 0 dan computed style = 0 untuk seluruh elemen, termasuk probe `#toast`, `.toast`, `.ut-toast` polos; animasi CSS dijeda dan rAF dibekukan agar sebanding. Satu-satunya pengecualian: sebuah `<text>` SVG di leaderboard yang berubah sendiri ~0,05px antar dua capture *sebelum* `toast.css` dipasang, jadi bukan efek toast), `localStorage` tidak berubah, `UT.UI.toast` dan `toast()` halaman tetap berfungsi berdampingan dengan toast HUD.

## Belum dilakukan (sengaja)
Migrasi `toast()` halaman, penghapusan `#toast`, perubahan `UT.UI.toast`/`base.css`/`shared-ui.css`, penambahan `toast.js/css` ke halaman atau ke daftar `ASSETS` preload di `splash.html`, toast di gameplay.
