/* Ular Tangga Blok — gameplay/themes.js (Stage 4.1.14.3: extract gameplay themes data)
   Skrip klasik (tanpa import/export/type=module). Dimuat SETELAH gameplay/module-bridge.js
   dan SEBELUM blok skrip gameplay inline.
   HANYA data tema statis. Tidak ada THREE, DOM, RNG, localStorage, timer, atau state gameplay di sini.
   Dipindahkan APA ADANYA dari gameplay.html (isi object, property, nilai, dan URUTAN array tidak diubah).
   URUTAN WAJIB TETAP: gameplay.html memakai THEMES.indexOf(th) untuk seed dunia (20241022 + index * 977)
   dan THEMES[0] sebagai tema default. Jangan sort/reorder/rename/tambah/hapus tema tanpa memperhitungkan itu.
   Namespace: UT.Gameplay.Themes (slot object dari module-bridge.js, tidak ditimpa).
   API:  UT.Gameplay.Themes.LIST   Array<theme>  — array yang sama persis dengan THEMES lama
   Idempotent: aman dimuat lebih dari sekali, tidak menimpa LIST yang sudah terisi. */
(function (win) {
  'use strict';
  var UT = win.UT = win.UT || {};
  var G = UT.Gameplay = UT.Gameplay || {};
  var T = G.Themes = G.Themes || {};

  T.LIST = T.LIST || [
  {key:'minecraft',name:'Minecraft',skyTop:'#6EC6FF',skyBot:'#E6F7FF',
   tileA:0x5FAE3E,tileB:0x5FAE3E,ladderTile:0xE2BE3C,snakeTile:0xD9577A,goalTile:0xE6E3A6,
   wall:[0x8A5B33,0x7B4E2B,0x946339,0x6B4424],deep:[0x7A7A7A,0x6A6A6A,0x8A8A8A],ground:0x4F9A34,
   sw:['#5FAE3E','#8A5B33'],label:'#FFFFFF',labelLine:'rgba(0,0,0,.85)',rail:0x6B4423,rung:0xB07A42,
   snakes:[[0x45C94B,0x1E6B22],[0x7BD96A,0x2E7D32],[0x3FB950,0x145A1E],[0x66CC55,0x2A7A2A],[0x55D060,0x1B6B2B],[0x8FE070,0x3A8A2A],[0x2FAF45,0x105A20]],
   hemi:0xA8D08D,decor:'mc',snow:false,cloud:0xFFFFFF,flag:0xF0453A},
  {key:'rumput',name:'Rumput',skyTop:'#5EC1FF',skyBot:'#DDF4FF',
   tileA:0x78D957,tileB:0x62C845,ladderTile:0xFFE27A,snakeTile:0xFF8F7A,goalTile:0xFFD23F,
   wall:[0x9A6A3B,0x8A5C32,0xA9783F,0x7B4F2A],deep:[0x9AA5B1,0x8591A0,0xAEB8C2],ground:0x6AD04E,
   sw:['#78D957','#9A6A3B'],label:'#FFFFFF',labelLine:'rgba(18,58,30,.9)',rail:0x6B4423,rung:0xB07A42,
   snakes:[[0x45C94B,0xFFD93D],[0xB066FF,0xFFF176],[0xFF8A3D,0xFFE066],[0x2BC4B4,0xFFFFFF],[0xFF5C8A,0xFFE3F0],[0x86D12A,0xE9FF70],[0x3D9BFF,0xBFE3FF]],
   hemi:0xB9D7A0,decor:'oak',snow:false,cloud:0xFFFFFF,flag:0xF0453A},
  {key:'gurun',name:'Gurun',skyTop:'#FFD27A',skyBot:'#FFF4D8',
   tileA:0xFFD98C,tileB:0xF7C879,ladderTile:0xFFF0B0,snakeTile:0xE8785A,goalTile:0xFFB020,
   wall:[0xD9763C,0xC96A32,0xE38B4C,0xB95C28],deep:[0xB4552A,0x9C4822,0xC2622F],ground:0xF0CE88,
   sw:['#FFD98C','#D9763C'],label:'#D98A2B',labelLine:'rgba(255,240,200,.85)',rail:0x4E2C12,rung:0x6E4220,
   snakes:[[0x7A2E4E,0xE0899F],[0x5E2A6B,0xC79AE0],[0x8A3B1E,0xF0A66A],[0x3D4A8A,0xA9B8F0],[0x2E6B4E,0x9BE0B8],[0x8A1E2E,0xF08A96],[0x6B5A1E,0xE8D27A]],
   hemi:0xE8C58A,decor:'desert',snow:false,cloud:0xFFF6E0,flag:0xE53935},
  {key:'salju',name:'Salju',skyTop:'#46AEEF',skyBot:'#E4F6FF',
   tileA:0xF4FCFF,tileB:0xDCF0FA,ladderTile:0xFFE27A,snakeTile:0xFF9E8A,goalTile:0xFFD23F,
   wall:[0x62BCE6,0x54AEDB,0x74C9EE,0x4A9FD0],deep:[0x3B86B8,0x2F76A6,0x4694C4],ground:0xF7FDFF,
   sw:['#F4FCFF','#54AEDB'],label:'#3C98D4',labelLine:'rgba(247,253,255,.9)',rail:0x1E3248,rung:0x2F4A66,
   snakes:[[0x1F5C86,0x8FD3F4],[0x2B3F8F,0xA9B8FF],[0x1D7A7A,0x9BF0E8],[0x5B3E9A,0xCDB8FF],[0x2A6FB5,0xBFE3FF],[0x20406A,0x7FB8E8],[0x1B8A8F,0xC8FFF6]],
   hemi:0xBFE3F5,decor:'snow',snow:true,cloud:0xFFFFFF,flag:0xF0453A},
  {key:'hutan',name:'Hutan',skyTop:'#27B2B8',skyBot:'#C9F5E4',
   tileA:0x46C46E,tileB:0x38B25F,ladderTile:0xFFE27A,snakeTile:0xFF8F7A,goalTile:0xFFD23F,
   wall:[0x1F5F4D,0x1A5444,0x246B56,0x174A3C],deep:[0x143E33,0x10352C,0x1A4A3D],ground:0x2FA35B,
   sw:['#46C46E','#1F5F4D'],label:'#D8FFE4',labelLine:'rgba(10,60,40,.9)',rail:0xD98A3D,rung:0xF0B35E,
   snakes:[[0x8FE39A,0xD8FFB0],[0xF2D14B,0x8A7410],[0x63D0E0,0xE0FAFF],[0xE87BA6,0xFFD6E6],[0xB6E05A,0x5B8A18],[0xFFA65A,0xFFE0B0],[0x9A8FF0,0xE0DCFF]],
   hemi:0x8FD4A8,decor:'jungle',snow:false,cloud:0xEFFFF6,flag:0xF0453A},
  {key:'nether',name:'Nether',skyTop:'#2a0606',skyBot:'#8a2410',
   tileA:0x8A2B2B,tileB:0x6E2222,ladderTile:0xFFD07A,snakeTile:0xFF7A3A,goalTile:0xE8B84A,
   wall:[0x5A1818,0x4A1212,0x6A1E1E,0x3A0D0D],deep:[0x2A0A0A,0x3A1010,0x1E0707],ground:0x7A2424,
   sw:['#8A2B2B','#3A0D0D'],label:'#FFE3B0',labelLine:'rgba(40,5,5,.9)',rail:0x2A1A12,rung:0x5A3A22,
   snakes:[[0xFF7A1A,0xFFD23F],[0xC0392B,0xFF9A5A],[0xE0561A,0xFFC070],[0x8A1E1E,0xFF8A5A],[0xFFA31A,0xFFE08A],[0xB02A2A,0xFF7A7A],[0xD8481A,0xFFB070]],
   hemi:0xFF8A5A,decor:'nether',snow:false,ember:0xFFA23A,cloud:0x6A2A22,flag:0x3AA8F0}
  ];
})(window);
