function normalize(text){return (text||'').toLowerCase().replace(/停車|停車場|即時|推薦|\s/g,'');}
function statusLabel(status){
  if(status==='available') return ['🟢 有車位','available'];
  if(status==='full') return ['🔴 可能已滿','full'];
  return ['⚪ 無即時資料','unknown'];
}
function findSiteBySlug(){
  const file = location.pathname.split('/').pop() || 'index.html';
  return SITES.find(s=>s.slug===file);
}
function findSiteByQuery(q){
  const n = normalize(q);
  if(!n) return null;
  return SITES.find(s => normalize(s.name).includes(n) || n.includes(normalize(s.name)) || s.keywords.some(k=>normalize(k).includes(n) || n.includes(normalize(k))));
}
function renderHome(){
  const groups = {};
  SITES.forEach(s => { groups[s.category] ??= []; groups[s.category].push(s); });
  const root = document.querySelector('#site-list');
  if(!root) return;
  root.innerHTML = Object.entries(groups).map(([cat,items])=>`
    <h2 class="category">${cat}</h2>
    <div class="grid">${items.map(s=>`
      <a class="site-card" href="${s.slug}">
        <h3>${s.name}</h3>
        <p>${s.intro}</p>
      </a>`).join('')}</div>`).join('');
}
function renderPage(){
  const site = findSiteBySlug();
  const root = document.querySelector('#parking-list');
  if(!site || !root) return;
  document.title = `${site.title}｜高雄觀光景點停車即時推薦`;
  document.querySelector('#page-title').textContent = site.title;
  document.querySelector('#page-intro').textContent = site.intro;
  document.querySelector('#page-keywords').textContent = site.keywords.join('、');
  root.innerHTML = site.lots.map(lot=>{
    const [txt, cls] = statusLabel(lot.status);
    return `<article class="parking-card">
      <span class="status ${cls}">${txt}</span>
      <h3>${lot.name}</h3>
      <p>${lot.note || ''}</p>
      <div class="facts">
        <div class="fact"><span class="label">步行時間</span>${lot.walk}</div>
        <div class="fact"><span class="label">更新時間</span>${lot.updated}</div>
        <div class="fact"><span class="label">平日價格</span>${lot.weekday}</div>
        <div class="fact"><span class="label">假日價格</span>${lot.holiday}</div>
        <div class="fact"><span class="label">現金</span>${lot.cash}</div>
        <div class="fact"><span class="label">電子支付</span>${lot.epay}</div>
        <div class="fact"><span class="label">車牌辨識</span>${lot.plate}</div>
      </div>
      <a class="btn maps" target="_blank" rel="noopener" href="${lot.maps}">📍 開啟 Google Maps</a>
    </article>`;
  }).join('');
}
function bindSearch(){
  const input = document.querySelector('#searchInput');
  const go = document.querySelector('#searchBtn');
  const voice = document.querySelector('#voiceBtn');
  const msg = document.querySelector('#searchMsg');
  if(!input) return;
  function submit(){
    const site = findSiteByQuery(input.value);
    if(site) location.href = site.slug;
    else if(msg) msg.textContent = '目前找不到這個景點，請試試：駁二、高流、旗津、西子灣。';
  }
  go?.addEventListener('click', submit);
  input.addEventListener('keydown', e=>{ if(e.key==='Enter') submit(); });
  voice?.addEventListener('click', ()=>{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ if(msg) msg.textContent = '這台裝置或瀏覽器暫不支援語音搜尋，請改用文字輸入。'; return; }
    const rec = new SR();
    rec.lang = 'zh-TW'; rec.interimResults = false; rec.maxAlternatives = 1;
    if(msg) msg.textContent = '請說出景點名稱，例如：駁二停車。';
    rec.onresult = e => { input.value = e.results[0][0].transcript; submit(); };
    rec.onerror = () => { if(msg) msg.textContent = '語音辨識失敗，請再試一次或改用文字輸入。'; };
    rec.start();
  });
}
document.addEventListener('DOMContentLoaded',()=>{renderHome();renderPage();bindSearch();});
