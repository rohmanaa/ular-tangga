# HUD Badge / Tag Audit (Stage 4.0.8)

Audit baca-saja sebelum komponen `UT.Hud.create('badge', …)`. Tidak ada halaman, `.badge`, `.tag`, atau `.soon` existing yang diubah atau dimigrasi pada stage ini.

## Pemakaian existing
| Halaman | Kelas | Peran | Teks | Interaktif? |
|---|---|---|---|---|
| shop | `.badge` | **status item (rarity)** pojok kartu + panel info | COMMON / RARE / EPIC / LEGENDARY | tidak (informasi) |
| shop | `.pr.soon` | label harga "Segera hadir" (bukan badge, teks biasa) | — | tidak |
| inventory | `.badge` | **status item (rarity)**, warna lewat style inline gradient `RB[rarity]` | sama | tidak |
| mode | `.tag` | **label mode** (kapasitas pemain) di atas kartu mode, warna `var(--tg)` per mode | "4 Player", "Solo / Duo", "2 - 4 Player", … | tidak |
| mode | `.soon` | **status** "SEGERA" di judul mode | SEGERA | tidak |
| dailyreward | `.tag` | **reward state** pada baris hadiah (kuning `.row.cl` untuk hari ini) | Diklaim / Klaim! / Menunggu | tidak (tombol klaim terpisah) |
| friendship | `.badgeCount` | **penghitung** pada tab (online, permintaan) | angka | tidak |
| lobby, profile, leaderboard | — | tidak ada badge/tag | — | — |

Semua badge/tag existing murni informasi: **tidak ada** `role`, `tabindex`, atau click handler. Konten dirender lewat template `innerHTML` di halaman (teks berasal dari konstanta kode, bukan input pengguna); komponen baru memakai `textContent`.

## Visual
| Varian existing | Padding | Radius | Font / line-height | Latar | Catatan |
|---|---|---|---|---|---|
| shop `.badge` (info) | 0 1rem | 1rem | 1.5rem / 2.2rem | `var(--rc, --r1)` | inset highlight putih |
| shop `.card .badge` | 0 .6rem | 1rem | 1.1rem / 1.5rem | sama | absolut di pojok kartu |
| inventory `.badge` | 0 1.1rem | 1rem | 1rem / 1.5rem (kartu .95/1.4; mobile .85/1.25) | gradient rarity | + bayangan bawah |
| mode `.tag` | 0 1.3rem | 1.3rem | 1.2rem / tinggi 2.5rem | `var(--tg)` per mode | ring putih + bayangan |
| mode `.soon` | 0 1rem | 1rem | 1rem / 1.7rem | kuning `#ffe36a→#ffb62a`, teks `#8a4a0a` | |
| dailyreward `.tag` | .2rem .9rem | 1rem | 1.2rem | abu `#7a8fb0`; hijau `var(--g)` saat aktif | `margin-left:auto` |
| friendship `.badgeCount` | .25rem .8rem | 1rem | 1rem | `#1b55c0` | angka |

Pola bersama: pil kecil (radius ≈ 1rem), font 1–1.5rem, highlight inset putih, tanpa ikon. Rem mengikuti skala halaman (`html{font-size:min(1vw,1.78vh)}`). Posisi absolut (pojok kartu) adalah urusan halaman, bukan bagian komponen.

## Keputusan komponen
- **Variant** (sesuai spesifikasi): `default` (biru/netral), `success` (hijau, mis. Diklaim/Owned), `warning` (kuning, mis. SEGERA/Locked), `danger` (merah), `info` (biru muda, mis. New). Warna rarity dinamis dan warna `--tg` per mode **tidak** dijadikan variant: tetap ditangani halaman sampai tahap migrasi.
- **Size** `sm` ≈ inventory/kartu (1.1rem), `md` ≈ mode/dailyreward (1.2rem), `lg` ≈ shop panel info (1.5rem).
- Hanya `label`, tanpa ikon (audit: tidak ada ikon). Bukan elemen interaktif; `aria-label` hanya bila diberikan.
- Posisi/margin tidak diatur komponen; `overflow-wrap:anywhere` agar label panjang aman.
