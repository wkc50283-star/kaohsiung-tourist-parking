function normalize(text){return (text||'').toLowerCase().replace(/停車|停車場|即時|推薦|景點|地點|\s/g,'');}
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
const HOME_CATEGORY_ORDER = ['港區／亞灣','商圈／百貨','夜市／活動區','熱門生活圈','其他地點'];
function homeCategory(site){
  return site.category || '其他地點';
}
function renderHome(){
  const groups = {};
  SITES.forEach(s => {
    const category = homeCategory(s);
    groups[category] ??= [];
    groups[category].push(s);
  });
  const root = document.querySelector('#site-list');
  if(!root) return;
  root.innerHTML = HOME_CATEGORY_ORDER
    .filter(cat => groups[cat]?.length)
    .map(cat=>`
    <h2 class="category">${cat}</h2>
    <div class="grid">${groups[cat].map(s=>`
      <a class="site-card" href="${s.slug}">
        <h3>${s.name}</h3>
        <p>查看附近停車場、車位狀態與導航</p>
      </a>`).join('')}</div>`).join('');
}
function renderPage(){
  const site = findSiteBySlug();
  const parkingRoot = document.querySelector('#parking-list');
  const roadRoot = document.querySelector('#road-list');
  if(!site || !parkingRoot) return;
  document.title = `${site.title}｜高雄熱門地點停車推薦`;
  document.querySelector('#page-title').textContent = site.title;
  document.querySelector('#page-intro').textContent = site.intro;
  document.querySelector('#page-keywords').textContent = site.keywords.join('、');
  parkingRoot.innerHTML = site.lots.length ? site.lots.map(lot=>{
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
  }).join('') : '<p class="empty">目前正在整理附近停車場資料，完成後會補上空位狀態、距離與導航。</p>';
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
    else if(msg) msg.textContent = '目前找不到這個地點，請試試：駁二、高流、巨蛋、瑞豐夜市、新堀江。';
  }
  go?.addEventListener('click', submit);
  input.addEventListener('keydown', e=>{ if(e.key==='Enter') submit(); });
}
function bindCurrentLocation(){
  const button = document.querySelector('#locationBtn');
  const msg = document.querySelector('#locationMsg');
  const result = document.querySelector('#locationResult');
  const accuracy = document.querySelector('#locationAccuracy');
  const nearbyLink = document.querySelector('#nearbyParkingMaps');
  if(!button) return;

  function restoreButton(){
    button.disabled = false;
    button.textContent = '📍 使用目前位置';
  }

  button.addEventListener('click', ()=>{
    if(!navigator.geolocation){
      if(msg) msg.textContent = '這台裝置或瀏覽器暫不支援定位。';
      return;
    }

    button.disabled = true;
    button.textContent = '定位中…';
    if(msg) msg.textContent = '請允許網站取得你目前的位置。';
    result?.classList.add('hidden');

    navigator.geolocation.getCurrentPosition(position=>{
      const lat = Number(position.coords.latitude).toFixed(6);
      const lng = Number(position.coords.longitude).toFixed(6);
      const meters = Math.round(position.coords.accuracy || 0);
      sessionStorage.setItem('parking_user_location', JSON.stringify({lat:Number(lat), lng:Number(lng), updatedAt:Date.now()}));
      if(msg) msg.textContent = '';
      if(accuracy) accuracy.textContent = meters > 0 ? `定位精度約 ${meters} 公尺` : '';
      if(nearbyLink){
        nearbyLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`停車場 near ${lat},${lng}`)}`;
      }
      result?.classList.remove('hidden');
      restoreButton();
    }, error=>{
      const messages = {
        1: '你尚未允許定位權限，請改用地點搜尋。',
        2: '目前無法取得位置，請稍後再試或改用地點搜尋。',
        3: '定位逾時，請再試一次或改用地點搜尋。'
      };
      if(msg) msg.textContent = messages[error.code] || '目前無法取得位置，請改用地點搜尋。';
      restoreButton();
    }, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    });
  });
}
document.addEventListener('DOMContentLoaded',()=>{renderHome();renderPage();bindSearch();bindCurrentLocation();});
