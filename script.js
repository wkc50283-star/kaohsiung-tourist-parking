function normalize(text){return (text||'').toLowerCase().replace(/停車|停車場|即時|推薦|景點|\s/g,'');}
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
        <p>查看附近停車場與可嘗試路段</p>
      </a>`).join('')}</div>`).join('');
}
function renderPage(){
  const site = findSiteBySlug();
  const parkingRoot = document.querySelector('#parking-list');
  const roadRoot = document.querySelector('#road-list');
  if(!site || !parkingRoot) return;
  document.title = `${site.title}｜高雄觀光景點停車推薦`;
  document.querySelector('#page-title').textContent = site.title;
  document.querySelector('#page-intro').textContent = site.intro;
  document.querySelector('#page-keywords').textContent = site.keywords.join('、');
  parkingRoot.innerHTML = site.lots.map(lot=>{
    const [txt, cls] = statusLabel(lot.status);
    const paymentBadges = [lot.epay, lot.plate].filter(Boolean).map(v=>`<span>${v}</span>`).join('');
    return `<article class="parking-card decision-card">
      <div class="status-line ${cls}">${txt}</div>
      <h3>${lot.name}</h3>
      <p class="distance">📍 ${lot.distance}</p>
      <a class="nav-btn" target="_blank" rel="noopener" href="${lot.maps}">🧭 開始導航</a>
      <div class="price-lines">
        <div>${lot.weekday}</div>
        <div>${lot.holiday}</div>
      </div>
      <div class="mini-tags">${paymentBadges}</div>
      <p class="card-note">${lot.note || ''}</p>
    </article>`;
  }).join('');
  if(roadRoot){
    const roads = site.roads || [];
    roadRoot.innerHTML = roads.map(r=>`
      <article class="road-card">
        <h3>${r.name}</h3>
        <p class="road-status">${r.status}</p>
        <p class="card-note">${r.note}</p>
        <a class="nav-btn light" target="_blank" rel="noopener" href="${r.maps}">🧭 導航到路段</a>
      </article>`).join('') || '<p class="empty">目前尚未整理可嘗試路段。</p>';
  }
}
function bindSearch(){
  const input = document.querySelector('#searchInput');
  const go = document.querySelector('#searchBtn');
  const msg = document.querySelector('#searchMsg');
  if(!input) return;
  function submit(){
    const site = findSiteByQuery(input.value);
    if(site) location.href = site.slug;
    else if(msg) msg.textContent = '目前找不到這個景點，請試試：駁二、高流、旗津、西子灣。';
  }
  go?.addEventListener('click', submit);
  input.addEventListener('keydown', e=>{ if(e.key==='Enter') submit(); });
}
document.addEventListener('DOMContentLoaded',()=>{renderHome();renderPage();bindSearch();});
