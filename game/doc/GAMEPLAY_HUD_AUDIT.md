# GAMEPLAY_HUD_AUDIT — Stage 4.0.9

Status: audit `gameplay.html` (sebelum perubahan) + implementasi `game/gameplay/hud.js` (`UT.GameplayHUD`).
`gameplay.html` tetap source of truth. Tidak ada perubahan logic, dadu, gerak, power, aturan, atau perhitungan naga.

## 1. HUD yang sudah ada (sebelum 4.0.9)

| Elemen | Lokasi | Catatan |
|---|---|---|
| Dice control | `#btnRoll`, `#dieScene/#die`, `setRoll()` | disabled saat `busy`/CPU/gameOver |
| Turn indicator | `#turnName` (diisi `renderChips()`), `.pr.on` di `#players`, teks `#msg` | **sudah benar → dipakai ulang**, tidak dibuat versi kedua |
| Player status | `#players` (`.pr`: posisi, badge 🗡️/🪶/🧪/🍎, bar `.hp` naga saat pos 100), `#scores` | |
| Power buttons | `#pus` (`.pb`, dibuat `renderChips()`), 6 power: sword, feather, tnt, apple, potion, grass | disabled bila `busy`/CPU/stok 0 |
| Pause | `#btnMenu` → `#pauseMenu` (`aria-modal`), `#exitConfirm` (`alertdialog`) | |
| Settings | `#btnSnd`, `#pmVol`, tema/dadu (`#btnTheme`, `#btnDice` hidden) | |
| Day/night | `#btnNight` (hidden), `#pmDay/#pmNight` | |
| Camera | `#btnCam`, `#btnPov` | |
| Overlays | `#puCard` (kartu chest/serangan, `role=status`), `#win` | `#win` sebelumnya tanpa `aria-modal` → ditambah |
| Dragon battle UI | `.hp` bar di `#players`, `#msg` | tidak ada banner/panel khusus |
| Result/win | `#win` (`Main lagi`, `Menu`) | tetap dipakai |
| Power Shop lama (Magic Shield, Rocket Boost, Mega Magnet) | — | **tidak ada di state/inventory gameplay** → tidak dipresentasikan |

## 2. Feedback event (sebelum → sesudah)

Sebelum: hampir semua event hanya lewat `setMsg()` (satu baris teks di panel giliran, kecil di mobile) + `sfx.*`.

| Event | Sebelum | Sesudah (4.0.9) |
|---|---|---|
| Gerak / hop | animasi + sfx.hop | tidak berubah (tidak perlu feedback) |
| Tangga | setMsg + sfx | banner "Naik Tangga! +N langkah" sebelum `climb` |
| Ular | setMsg + sfx + animasi `bite` | banner "Kena Ular! Turun ke X" sebelum animasi |
| Mob (creeper/ender/skeleton/villager/zombie/warden/blaze) | setMsg (+`showAttackCard` untuk hit) | banner "<Mob>! efek" sebelum efek |
| Chest | setMsg + kartu `#puCard` | banner "Chest ditemukan! Dapat <power>" (kartu lama tetap) |
| Power dipakai | setMsg (+kartu serangan sword/tnt/grass) | banner "<Power> digunakan/aktif!" |
| Apel (perisai) saat kena | setMsg | banner "Apel Emas melindungi …" |
| Potion / Feather / Sword | setMsg + badge `renderChips` | banner power |
| Tiga 6 | setMsg saja | panel "Tiga kali 6! Giliran hangus." |
| Extra turn (6 / bulu) | setMsg | banner "Giliran tambahan!" |
| Overshoot bounce | setMsg | banner "Kelebihan N! Memantul ke X" |
| Tiba di 100 | setMsg | banner "tiba di The End" |
| Serangan naga + HP | setMsg + `showAttackCard` | strip combat + bar HP naga (nilai `p.dhp` existing) |
| Naga kalah | setMsg + confetti | panel "Ender Dragon kalah!" |
| Menang | `#win` (delay 500ms) | tetap `#win` (+`aria-modal="true"`) |
| Giliran berganti | `#turnName`/`#msg` | banner singkat "Giliran X" / "Giliran Computer" |

Tidak ada di gameplay existing (sehingga tidak dibuat): **serangan naga ke pemain / damage pemain** — pemain hanya menyerang naga. Tidak ada sistem lose.

## 3. Desain 4.0.9

- `game/gameplay/hud.js` — classic script, tanpa import/export, CSS di-inject sekali (`#ut-ghud-css`), tanpa `hud.css`.
- Level 1 = banner `role=status` (non-blocking, `pointer-events:none`, di bawah toolbar atas, tidak menutup papan). Level 2 = panel penting otomatis hilang, juga non-blocking sehingga `role=status` (bukan `dialog`, karena tidak menangkap input). Dialog blocking tetap `#win`, `#pauseMenu`, `#exitConfirm`.
- Tidak ada `role=button`/`tabindex` pada elemen informasi.
- Wiring di `gameplay.html`: 1 `<script src>`, helper `hud()` (try/catch, aman bila HUD tidak termuat), `init({getGameId,isPaused})`, dan 1 pemanggilan `hud(...)` di titik event existing (di samping `setMsg`, urutan tidak berubah). `hud('reset')` di `startGame()` membersihkan timer.
- Stale: event di dalam `playTurn/doRoll` mengirim `{gid}`; HUD membuang event bila `getGameId()!==gid`. Semua timer (1 per lapisan) dibersihkan oleh `reset()`; tidak ada listener dokumen.
- Satu banner aktif sekali waktu (yang baru menggantikan yang lama) → tidak menumpuk.
- Tidak ada render loop, audio, atau file ekstraksi baru. Marker `/*LOGIC-END*/`, `/*GEOM-START*/`, `/*GEOM-END*/` utuh (`/*LOGIC-START*/` memang sudah tidak ada di file sebelum tahap ini).
