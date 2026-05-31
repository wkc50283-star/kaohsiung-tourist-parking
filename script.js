function normalize(text){return (text||'').toLowerCase().replace(/路邊停車格|停車格|停車場|停車|即時|推薦|附近|\s/g,'');}
function statusLabel(status){
  if(status==='available') return ['🟢 目前有車位資料','available'];
  if(status==='full') return ['🔴 目前可能已滿','full'];
  return ['⚪ 無即時資料','unknown'];
}
function roadLabel(type){
  if(type==='avoid') return ['❌ 不建議亂繞','avoid'];
  if(type==='has') return ['🅿️ 有路邊停車格','road-ok'];
  return ['🅿️ 周邊街道路邊停車格','road-unknown'];
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
  const root = document.querySelector('#site-list');
  if(!root) return;
  const hotIds = ['pier2','kmc','cijin','xiziwan','weiwuying'];
  const hot = SITES.filter(s=>hotIds.includes(s.id));
  const rest = SITES.filter(s=>!hotIds.includes(s.id));
  const groups = {};
  rest.forEach(s => { groups[s.category] ??= []; groups[s.category].push(s); });
  root.innerHTML = `
    <h2 class="category">熱門景點</h2>
    <div class="grid home-grid">${hot.map(siteCard).join('')}</div>
    <details class="all-sites">
      <summary>查看全部景點</summary>
      ${Object.entries(groups).map(([cat,items])=>`
        <h2 class="category">${cat}</h2>
        <div class="grid home-grid">${items.map(siteCard).join('')}</div>`).join('')}
    </details>`;
}
function siteCard(s){
  return `<a class="site-card" href="${s.slug}">
    <h3>${s.name}</h3>
    <p>先看停車場，再看周邊街道路邊停車格</p>
  </a>`;
}
function renderPage(){
  const site = findSiteBySlug();
  const root = document.querySelector('#parking-list');
  if(!site || !root) return;
  document.title = `${site.title}｜高雄景點停車查詢`;
  document.querySelector('#page-title').textContent = site.title;
  document.querySelector('#page-intro').textContent = site.intro;
  document.querySelector('#page-keywords').textContent = site.keywords.join('、');
  root.innerHTML = `
    <section class="result-section">
      <div class="section-title">
        <h2>第一優先：停車場</h2>
        <p>先看可直接導航的停車場，車位狀態依可取得資料呈現，不保證抵達時仍有車位。</p>
      </div>
      <div class="grid">${site.lots.map(renderLotCard).join('')}</div>
    </section>
    <section class="result-section">
      <div class="section-title">
        <h2>第二優先：周邊街道路邊停車格</h2>
        <p>停車場不合適時，再看附近哪些路段有路邊停車格或可嘗試停車，避免一直亂繞。路邊格無即時空位資料，請以現場標線與告示為準。</p>
      </div>
      <div class="grid">${(site.roads||[]).map(renderRoadCard).join('')}</div>
    </section>`;
}
function renderRoadCard(road){
  const [txt, cls] = roadLabel(road.type);
  return `<article class="parking-card road-card">
    <span class="status ${cls}">${txt}</span>
    <h3>${road.name}</h3>
    <p class="priority-line">${road.distance || '距離依現場為準'}</p>
    <p>${road.note || ''}</p>
    <a class="btn maps compact" target="_blank" rel="noopener" href="${road.maps}">📍 導航到這個路段</a>
  </article>`;
}
function renderLotCard(lot){
  const [txt, cls] = statusLabel(lot.status);
  const distance = lot.distance || lot.walk || '距離待確認';
  return `<article class="parking-card">
    <span class="status ${cls}">${txt}</span>
    <h3>${lot.name}</h3>
    <p class="priority-line">📍 ${distance}</p>
    <p class="quick-facts"><span>💵 ${lot.cash || '付款方式待確認'}</span><span>💰 平日 ${lot.weekday || '需確認'}</span></p>
    <p>${lot.note || ''}</p>
    <details class="more-info">
      <summary>更多資訊</summary>
      <div class="facts">
        <div class="fact"><span class="label">假日價格</span>${lot.holiday}</div>
        <div class="fact"><span class="label">電子支付</span>${lot.epay}</div>
        <div class="fact"><span class="label">車牌辨識</span>${lot.plate}</div>
        <div class="fact"><span class="label">更新時間</span>${lot.updated}</div>
      </div>
    </details>
    <a class="btn maps compact" target="_blank" rel="noopener" href="${lot.maps}">📍 Google Maps</a>
  </article>`;
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
    else if(msg) msg.textContent = '目前找不到這個地點，請試試：駁二、高流、旗津、西子灣。';
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
