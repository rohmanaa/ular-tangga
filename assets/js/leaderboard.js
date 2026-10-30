/* Ular Tangga Blok — halaman peringkat (data contoh: ganti BASE dengan hasil API) */
(function(){
  var PAL=[
    ['#ffe27a','#f2b705','#c48f00'],['#e4ecf7','#aebdd3','#8497b3'],['#f0a96a','#d17a36','#a35a22'],
    ['#c6ff5a','#58b02d','#2d7a21'],['#8fd0ff','#3b92ee','#1f5fb8'],['#ffb3d1','#e0568f','#a8316a'],
    ['#d8b8ff','#9a63e8','#6a3db0'],['#ffc98a','#f08a24','#b5600f'],['#9ff2e0','#2fbfa3','#1b8672'],['#ff9a9a','#e24b4b','#a82a2a']];
  // Data contoh. Ganti dengan hasil API: [{n,lv,sk,w,wr}, ...]
  var BASE=[
    ['RajaBlok99',58,'Naga Emas',2890,78],['Budi_VoxelMaster',42,'Ksatria',1240,74],['Siti_NinjaBlok',39,'Ninja',980,71],
    ['BlokMaster_Dito',37,'Penjelajah',940,69],['NaraPixel',35,'Robot',905,68],['SiUlarHijau',34,'Ular Neon',860,66],
    ['KubikKuning',33,'Lebah',812,66],['Putra_Tangga',31,'Pendaki',790,64],['Lintang_Voxel',30,'Astronot',744,63],
    ['PixelPanda',29,'Panda',701,62],['Gilang3D',28,'Kapten Blok',668,61],['Mawar_Blocky',27,'Penyihir',630,60],
    ['AriTanggaEmas',26,'Raja Tangga',598,60],['DewiKubus',25,'Peri Hutan',570,59],['Fajar_Dadu6',24,'Penjudi',545,58],
    ['Nusa_Block',23,'Garuda',512,58],['Rani_Voxel',22,'Pelaut',488,57],['TomiTangga',21,'Montir',460,56],
    ['LarasBlok',20,'Pemanah',431,55],['Bayu_Ular',19,'Pawang Ular',402,54]
  ].map(function(r,i){return{i:i,n:r[0],lv:r[1],sk:r[2],w:r[3],wr:r[4]}});
  var SCALE={season:function(p){return p.w},month:function(p){return Math.round(p.w*.22*(.8+((p.i*7)%5)/10))},all:function(p){return Math.round(p.w*2.6*(.85+((p.i*3)%6)/12))}};
  var LABEL={season:'Peringkat musim ini',month:'Peringkat bulan ini',all:'Peringkat sepanjang masa'};
  var tab='season',query='',shown=10;

  function cube(c,w,h){return '<svg width="'+w+'" height="'+h+'" viewBox="-28 -4 56 56" aria-hidden="true"><polygon points="0,0 24,12 0,24 -24,12" fill="'+c[0]+'"/><polygon points="-24,12 0,24 0,48 -24,36" fill="'+c[1]+'"/><polygon points="0,24 24,12 24,36 0,48" fill="'+c[2]+'"/><path d="M-14 22l8 4v7l-8-4zM14 22l-8 4v7l8-4z" fill="#0b1a2e"/></svg>'}
  var fmt=function(n){return n.toLocaleString('id-ID')};
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  function data(){
    var f=SCALE[tab];
    return BASE.map(function(p){var w=f(p);return{n:p.n,lv:p.lv,sk:p.sk,w:w,wr:p.wr,pts:Math.round(w*3.4+p.lv*12),pal:PAL[3+(p.i%7)]}})
      .sort(function(a,b){return b.pts-a.pts}).map(function(p,i){p.rank=i+1;if(i<3)p.pal=PAL[i];return p});
  }

  function podium(top){
    var cfg=[
      {c:'pd2',tag:'#2 PERAK',ts:'background:#d5e0f0;color:#0b1a2e',s:72,h:76},
      {c:'pd1',tag:'#1 JUARA',ts:'background:#ffe27a;color:#3a2a00',s:92,h:98},
      {c:'pd3',tag:'#3 PERUNGGU',ts:'background:#f0a96a;color:#2e1604',s:72,h:76}];
    var who=[1,0,2]; // kartu kiri=#2, tengah=#1, kanan=#3
    return cfg.map(function(o,k){
      var p=top[who[k]],first=(k===1);
      var crown=first?'<svg class="crown" width="44" height="34" viewBox="0 0 40 30" aria-hidden="true"><polygon points="3,25 6,7 14,15 20,3 26,15 34,7 37,25" fill="#ffe27a" stroke="#c48f00" stroke-width="2" stroke-linejoin="round"/><rect x="3" y="25" width="34" height="4" rx="1" fill="#f2b705"/></svg>':'';
      return '<div class="card pd '+o.c+'"><span class="tag" style="'+o.ts+'">'+o.tag+'</span>'
        +'<div class="av">'+crown+cube(p.pal,o.s,o.h)+'</div>'
        +'<h3>'+esc(p.n)+'</h3>'
        +'<div class="sub"'+(first?' style="color:#ffe27a;font-weight:600"':'')+'>Level '+p.lv+' · Skin '+esc(p.sk)+'</div>'
        +'<div class="stat"><span>Kemenangan</span><b>'+fmt(p.w)+' match</b></div></div>';
    }).join('');
  }

  function row(p){
    return '<li class="row"><span class="rk'+(p.rank<=3?' top':'')+'">'+p.rank+'</span>'
      +'<span class="who">'+cube(p.pal,38,40)+'<span style="min-width:0"><span class="nm">'+esc(p.n)+'</span><small>Level '+p.lv+' · Skin '+esc(p.sk)+'</small></span></span>'
      +'<span class="num wins"><b>'+fmt(p.w)+'</b><small>kemenangan</small></span>'
      +'<span class="wr"><span class="bar"><i style="width:'+p.wr+'%"></i></span><em>'+p.wr+'%</em></span>'
      +'<span class="num pts"><b>'+fmt(p.pts)+'</b><small>poin</small></span></li>';
  }

  function render(){
    var all=data(),q=query.trim().toLowerCase(),pod=document.getElementById('podium'),list=document.getElementById('rows'),more=document.getElementById('more');
    document.getElementById('tabNote').textContent=LABEL[tab]+' · top 20 pemain';
    var rows;
    if(q){
      pod.hidden=true;
      rows=all.filter(function(p){return p.n.toLowerCase().indexOf(q)>-1});
      more.hidden=true;
    }else{
      pod.hidden=false;pod.innerHTML=podium(all.slice(0,3));
      rows=all.slice(3);
      var vis=rows.slice(0,shown-3);
      more.hidden=rows.length<=vis.length;
      rows=vis;
    }
    list.innerHTML=rows.length?rows.map(row).join(''):'<li class="empty">Tidak ada pemain dengan nama “'+esc(query)+'”.</li>';
  }

  document.querySelectorAll('.tab').forEach(function(b){
    b.addEventListener('click',function(){
      tab=b.dataset.tab;shown=10;
      document.querySelectorAll('.tab').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});
      render();
    });
  });
  document.getElementById('q').addEventListener('input',function(e){query=e.target.value;render()});
  document.getElementById('moreBtn').addEventListener('click',function(){shown=20;render()});
  render();
})();
