function normalize(text){
  return (text||'')
    .toLowerCase()
    .replace(/停車|停車場|即時|推薦|景點|\s/g,'');
}
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
  return SITES.find(s =>
    normalize(s.name).includes(n) ||
    n.includes(normalize(s.name)) ||
    s.keywords.some(k=>normalize(k).includes(n) || n.includes(normalize(k)))
  );
}
function shortPrice(lot){
  if(lot.weekday && lot.weekday !== '需確認') return lot.weekday;
  if(lot.holiday && lot.holiday !== '需確認') return lot.holiday;
  return '價格待確認';
}
function paymentText(lot){
  if(lot.cash && lot.cash !== '不確定') return lot.cash;
  if(lot.epay && lot.epay !== '不確定') return '電子支付';
  return '付款待確認';
}
function renderHome(){
  const root = document.querySelector('#site-list');
  if(!root) return;

  const popularIds = ['pier2','kmc','cijin','xiziwan','weiwuying'];
  const popular = popularIds.map(id => SITES.find(s => s.id === id)).filter(Boolean);
  const others = SITES.filter(s => !popularIds.includes(s.id));

  root.innerHTML = `
    <h2 class="category">熱門景點</h2>
    <div class="grid featured-sites">
      ${popular.map(s=>`
        <a class="site-card site-card-featured" href="${s.slug}">
          <h3>${s.name}</h3>
          <p>${s.intro}</p>
        </a>`).join('')}
    </div>
    <details class="all-sites">
      <summary>查看全部景點</summary>
      ${renderSiteGroups(others)}
    </details>
  `;
}
function renderSiteGroups(items){
  const groups = {};
  items.forEach(s => { groups[s.category] ??= []; groups[s.category].push(s); });
  return Object.entries(groups).map(([cat,groupItems])=>`
    <h2 class="category">${cat}</h2>
    <div class="grid">
      ${groupItems.map(s=>`
        <a class="site-card" href="${s.slug}">
          <h3>${s.name}</h3>
          <p>${s.intro}</p>
        </a>`).join('')}
    </div>`).join('');
}
function sortLots(lots){
  const order = {available: 0, unknown: 1, full: 2};
  return [...lots].sort((a,b)=>(order[a.status] ?? 9) - (order[b.status] ?? 9));
}
function renderPage(){
  const site = findSiteBySlug();
  const root = document.querySelector('#parking-list');
  if(!site || !root) return;
  document.title = `${site.title}｜高雄觀光景點停車即時推薦`;
  document.querySelector('#page-title').textContent = site.title;
  document.querySelector('#page-intro').textContent = site.intro;
  document.querySelector('#page-keywords').textContent = site.keywords.join('、');

  root.innerHTML = sortLots(site.lots).map(lot=>{
    const [txt, cls] = statusLabel(lot.status);
    const note = lot.note ? `<p class="lot-note">${lot.note}</p>` : '';
    return `<article class="parking-card parking-card-${cls}">
      <div class="decision-top">
        <span class="status ${cls}">${txt}</span>
        <h3>${lot.name}</h3>
      </div>
      <div class="quick-facts">
        <div class="quick-fact"><span>🚶</span><strong>${lot.walk}</strong></div>
        <div class="quick-fact"><span>💰</span><strong>${shortPrice(lot)}</strong></div>
        <div class="quick-fact"><span>💵</span><strong>${paymentText(lot)}</strong></div>
      </div>
      ${note}
      <a class="btn maps" target="_blank" rel="noopener" href="${lot.maps}">📍 Google Maps</a>
      <details class="more-info">
        <summary>更多資訊</summary>
        <div class="facts compact-facts">
          <div class="fact"><span class="label">平日價格</span>${lot.weekday}</div>
          <div class="fact"><span class="label">假日價格</span>${lot.holiday}</div>
          <div class="fact"><span class="label">現金</span>${lot.cash}</div>
          <div class="fact"><span class="label">電子支付</span>${lot.epay}</div>
          <div class="fact"><span class="label">車牌辨識</span>${lot.plate}</div>
          <div class="fact"><span class="label">更新時間</span>${lot.updated}</div>
        </div>
      </details>
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
    if(!SR){
      if(msg) msg.textContent = '這台裝置或瀏覽器暫不支援語音搜尋，請改用文字輸入。';
      return;
    }
    const rec = new SR();
    rec.lang = 'zh-TW';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    if(msg) msg.textContent = '請說出景點名稱，例如：駁二停車。';
    rec.onresult = e => { input.value = e.results[0][0].transcript; submit(); };
    rec.onerror = () => { if(msg) msg.textContent = '語音辨識失敗，請再試一次或改用文字輸入。'; };
    rec.start();
  });
}
document.addEventListener('DOMContentLoaded',()=>{renderHome();renderPage();bindSearch();});
