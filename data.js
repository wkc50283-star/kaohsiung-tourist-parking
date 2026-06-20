/**
 * data.js
 * 高雄熱門地點停車推薦網站：熱門地點基本資料
 *
 * 本檔案只保留：
 * 1. 熱門地點名稱
 * 2. 固定搜尋中心座標
 * 3. 搜尋關鍵字
 * 4. 頁面網址
 * 5. 測試與公開狀態
 *
 * 本檔案不得再放入：
 * - 人工整理停車場 lots
 * - 路邊停車 roads
 * - 人工價格
 * - 人工空位狀態
 * - 付款方式
 * - 車牌辨識標籤
 * - 靜態導航網址
 * - 碰碰運氣建議
 */

(function (global) {
  "use strict";

  const DEFAULT_SEARCH_SETTINGS = Object.freeze({
    initialRadiusMeters: 800,
    maximumRadiusMeters: 3000,
    minimumResults: 5
  });

  /**
   * 狀態規則：
   *
   * coordinateVerified: true
   *   → 已填入固定搜尋中心座標，可啟動即時停車測試
   *
   * enabled: true
   *   → 可由首頁搜尋並開啟熱門地點頁
   *
   * indexable: true
   *   → 已通過後續人工檢查，可加入 sitemap 並允許 Google 收錄
   *
   * 注意：
   * - 所有地點本次一次填入座標，先開放測試。
   * - 除已正式確認的頁面外，indexable 仍維持 false。
   */
  function makeHotspot(config) {
    return Object.freeze({
      initialRadiusMeters: DEFAULT_SEARCH_SETTINGS.initialRadiusMeters,
      maximumRadiusMeters: DEFAULT_SEARCH_SETTINGS.maximumRadiusMeters,
      minimumResults: DEFAULT_SEARCH_SETTINGS.minimumResults,
      coordinateVerified: true,
      enabled: true,
      indexable: false,
      ...config,
      keywords: Array.isArray(config.keywords)
        ? config.keywords.slice()
        : []
    });
  }

  const HOTSPOTS = [
    makeHotspot({
      id: "pier2",
      slug: "pier2-parking.html",
      name: "駁二／棧貳庫／大港橋",
      title: "駁二停車場推薦",
      category: "港區／亞灣",
      keywords: [
        "駁二停車",
        "駁二停車場",
        "駁二藝術特區停車",
        "棧貳庫停車",
        "大港橋停車"
      ],
      intro:
        "快速查看駁二附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.619889,
      longitude: 120.281722,
      indexable: true
    }),

    makeHotspot({
      id: "yancheng",
      slug: "yancheng-parking.html",
      name: "鹽埕區",
      title: "鹽埕區停車場推薦",
      category: "港區／亞灣",
      keywords: [
        "鹽埕區停車",
        "鹽埕停車場",
        "鹽埕埔停車"
      ],
      intro:
        "快速查看鹽埕區附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.62694,
      longitude: 120.28806,
      indexable: true
    }),

    makeHotspot({
      id: "kaohsiung-music-center",
      slug: "kaohsiung-music-center-parking.html",
      name: "高雄流行音樂中心",
      title: "高雄流行音樂中心停車場推薦",
      category: "港區／亞灣",
      keywords: [
        "高雄流行音樂中心停車",
        "高流停車",
        "高流停車場"
      ],
      intro:
        "快速查看高雄流行音樂中心附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.6178,
      longitude: 120.2889,
      indexable: true
    }),

    makeHotspot({
      id: "love-river",
      slug: "love-river-parking.html",
      name: "愛河",
      title: "愛河停車場推薦",
      category: "港區／亞灣",
      keywords: [
        "愛河停車",
        "愛河停車場",
        "愛河附近停車"
      ],
      intro:
        "快速查看愛河附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.62486,
      longitude: 120.28912,
      indexable: true
    }),

    makeHotspot({
      id: "kaohsiung-arena",
      slug: "kaohsiung-arena-parking.html",
      name: "高雄巨蛋／巨蛋商圈",
      title: "高雄巨蛋停車場推薦",
      category: "商圈／場館",
      keywords: [
        "高雄巨蛋停車",
        "巨蛋商圈停車",
        "高雄巨蛋停車場",
        "裕誠商圈停車",
        "裕誠路停車",
        "高雄裕誠商圈停車",
        "裕誠路附近停車",
        "漢神巨蛋裕誠路停車",
        "巨蛋裕誠商圈停車"
      ],
      intro:
        "快速查看高雄巨蛋與巨蛋商圈附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.66917,
      longitude: 120.30194,
      indexable: true
    }),

    makeHotspot({
      id: "shin-kong-mitsukoshi-zuoying",
      slug: "shin-kong-mitsukoshi-zuoying-parking.html",
      name: "新光三越高雄左營店",
      title: "新光三越高雄左營店停車場推薦",
      category: "百貨／商圈",
      keywords: [
        "新光三越高雄左營店停車",
        "新光三越左營停車",
        "高雄左營新光三越停車場",
        "左營新光三越停車",
        "彩虹市集停車",
        "左營高鐵百貨停車"
      ],
      intro:
        "快速查看新光三越高雄左營店附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.6891377,
      longitude: 120.310393,
      indexable: false
    }),

    makeHotspot({
      id: "e-sky-mall",
      slug: "e-sky-mall-parking.html",
      name: "義享時尚廣場",
      title: "義享時尚廣場停車場推薦",
      category: "百貨／商圈",
      keywords: [
        "義享時尚廣場停車",
        "義享天地停車",
        "義享停車場",
        "義享時尚廣場附近停車",
        "大順一路義享停車",
        "高雄義享停車"
      ],
      intro:
        "快速查看義享時尚廣場附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.6564492,
      longitude: 120.3063184,
      indexable: false
    }),

    makeHotspot({
      id: "xinkujiang-central-park",
      slug: "xinkujiang-central-park-parking.html",
      name: "新堀江／中央公園",
      title: "新堀江停車場推薦",
      category: "商圈／生活圈",
      keywords: [
        "新堀江停車",
        "新堀江停車場",
        "中央公園停車"
      ],
      intro:
        "快速查看新堀江與中央公園附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.62364,
      longitude: 120.30147,
      indexable: true
    }),

    makeHotspot({
      id: "dali-department-store",
      slug: "dali-department-store-parking.html",
      name: "大立百貨",
      title: "大立百貨停車場推薦",
      category: "百貨／商圈",
      keywords: [
        "大立百貨停車",
        "大立停車場",
        "大立附近停車"
      ],
      intro:
        "快速查看大立百貨附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.62251,
      longitude: 120.29751,
      indexable: true
    }),

    makeHotspot({
      id: "hanshin-department-store",
      slug: "hanshin-department-store-parking.html",
      name: "漢神百貨",
      title: "漢神百貨停車場推薦",
      category: "百貨／商圈",
      keywords: [
        "漢神百貨停車",
        "漢神停車場",
        "漢神附近停車"
      ],
      intro:
        "快速查看漢神百貨附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.61978,
      longitude: 120.29605,
      indexable: true
    }),

    makeHotspot({
      id: "sanduo-shopping-district",
      slug: "sanduo-shopping-district-parking.html",
      name: "三多商圈",
      title: "三多商圈停車場推薦",
      category: "百貨／商圈",
      keywords: [
        "三多商圈停車",
        "三多商圈停車場",
        "三多附近停車"
      ],
      intro:
        "快速查看三多商圈附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.6137,
      longitude: 120.30448,
      indexable: true
    }),

    makeHotspot({
      id: "far-eastern-department-store",
      slug: "far-eastern-department-store-parking.html",
      name: "高雄大遠百",
      title: "高雄大遠百停車場推薦",
      category: "百貨／商圈",
      keywords: [
        "高雄大遠百停車",
        "高雄大遠百停車場",
        "大遠百停車",
        "大遠百附近停車",
        "遠東百貨高雄店停車",
        "遠百高雄店停車場",
        "三多商圈大遠百停車"
      ],
      intro:
        "快速查看高雄大遠百附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.61333,
      longitude: 120.30361,
      indexable: false
    }),

    makeHotspot({
      id: "dream-mall",
      slug: "dream-mall-parking.html",
      name: "夢時代購物中心",
      title: "夢時代停車場推薦",
      category: "百貨／商圈",
      keywords: [
        "夢時代停車",
        "夢時代停車場",
        "夢時代附近停車"
      ],
      intro:
        "快速查看夢時代附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.59515,
      longitude: 120.30617,
      indexable: true
    }),

    makeHotspot({
      id: "ruifeng-night-market",
      slug: "ruifeng-night-market-parking.html",
      name: "瑞豐夜市",
      title: "瑞豐夜市停車場推薦",
      category: "夜市／商圈",
      keywords: [
        "瑞豐夜市停車",
        "瑞豐夜市停車場",
        "瑞豐夜市附近停車",
        "裕誠路夜市停車",
        "瑞豐裕誠路停車"
      ],
      intro:
        "快速查看瑞豐夜市附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.66657,
      longitude: 120.29962,
      indexable: true
    }),

    makeHotspot({
      id: "formosa-boulevard",
      slug: "formosa-boulevard-parking.html",
      name: "美麗島站／六合夜市",
      title: "美麗島站停車場推薦",
      category: "夜市／生活圈",
      keywords: [
        "美麗島站停車",
        "六合夜市停車",
        "六合夜市停車場"
      ],
      intro:
        "快速查看美麗島站與六合夜市附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.63139,
      longitude: 120.30195,
      indexable: true
    }),

    makeHotspot({
      id: "weiwuying",
      slug: "weiwuying-parking.html",
      name: "衛武營國家藝術文化中心",
      title: "衛武營停車場推薦",
      category: "場館／生活圈",
      keywords: [
        "衛武營停車",
        "衛武營停車場",
        "衛武營國家藝術文化中心停車"
      ],
      intro:
        "快速查看衛武營附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.62508,
      longitude: 120.34267,
      indexable: true
    }),

    makeHotspot({
      id: "cijin",
      slug: "cijin-parking.html",
      name: "旗津",
      title: "旗津停車場推薦",
      category: "觀光／港區",
      keywords: [
        "旗津停車",
        "旗津停車場",
        "旗津老街停車"
      ],
      intro:
        "快速查看旗津老街與渡輪站附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.61298,
      longitude: 120.26841,
      indexable: true
    }),

    makeHotspot({
      id: "xiziwan",
      slug: "xiziwan-parking.html",
      name: "西子灣",
      title: "西子灣停車場推薦",
      category: "觀光／港區",
      keywords: [
        "西子灣停車",
        "西子灣停車場",
        "西子灣附近停車"
      ],
      intro:
        "快速查看西子灣附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.62409,
      longitude: 120.26495,
      indexable: true
    }),

    makeHotspot({
      id: "lotus-pond",
      slug: "lotus-pond-parking.html",
      name: "蓮池潭",
      title: "蓮池潭停車場推薦",
      category: "觀光／生活圈",
      keywords: [
        "蓮池潭停車",
        "蓮池潭停車場",
        "蓮池潭附近停車"
      ],
      intro:
        "快速查看蓮池潭附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.6811,
      longitude: 120.2933,
      indexable: true
    }),

    makeHotspot({
      id: "qishan-old-street",
      slug: "qishan-old-street-parking.html",
      name: "旗山老街",
      title: "旗山老街停車場推薦",
      category: "郊區／觀光",
      keywords: [
        "旗山老街停車",
        "旗山老街停車場",
        "旗山停車場"
      ],
      intro:
        "快速查看旗山老街附近路外停車場即時剩餘空位、距離與導航。",
      latitude: 22.88573,
      longitude: 120.48363,
      indexable: true
    }),
    
  ];

  function normalizeSlug(value) {
    return String(value || "")
      .trim()
      .split("/")
      .pop()
      .split("?")[0]
      .split("#")[0];
  }

  function cloneHotspot(hotspot) {
    if (!hotspot) {
      return null;
    }

    return {
      ...hotspot,
      keywords: Array.isArray(hotspot.keywords)
        ? hotspot.keywords.slice()
        : []
    };
  }

  function findById(id) {
    return cloneHotspot(
      HOTSPOTS.find((item) => item.id === id)
    );
  }

  function findBySlug(slug) {
    const normalizedSlug = normalizeSlug(slug);

    return cloneHotspot(
      HOTSPOTS.find(
        (item) => item.slug === normalizedSlug
      )
    );
  }

  function findByCurrentPage() {
    return findBySlug(global.location.pathname);
  }

  function getEnabledHotspots() {
    return HOTSPOTS
      .filter(
        (item) =>
          item.enabled === true &&
          item.coordinateVerified === true &&
          Number.isFinite(item.latitude) &&
          Number.isFinite(item.longitude)
      )
      .map(cloneHotspot);
  }

  function getIndexableHotspots() {
    return HOTSPOTS
      .filter(
        (item) =>
          item.enabled === true &&
          item.indexable === true &&
          item.coordinateVerified === true &&
          Number.isFinite(item.latitude) &&
          Number.isFinite(item.longitude)
      )
      .map(cloneHotspot);
  }

  function getAllHotspots() {
    return HOTSPOTS.map(cloneHotspot);
  }

  global.KaohsiungParkingData = Object.freeze({
    DEFAULT_SEARCH_SETTINGS,
    findById,
    findBySlug,
    findByCurrentPage,
    getEnabledHotspots,
    getIndexableHotspots,
    getAllHotspots
  });
})(window);
