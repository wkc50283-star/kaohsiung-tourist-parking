/**
 * data.js
 * 高雄熱門地點停車推薦網站：熱門地點基本資料
 *
 * 本檔案只保留：
 * 1. 熱門地點名稱
 * 2. 固定座標
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
   * 熱門地點清單
   *
   * 狀態規則：
   * enabled: true
   *   → 可顯示於首頁熱門地點入口
   *
   * indexable: true
   *   → 通過測試，可加入 sitemap 並允許 Google 收錄
   *
   * coordinateVerified: true
   *   → 搜尋中心座標已完成核對與實際測試
   *
   * 尚未完成測試的地點：
   * - enabled 必須維持 false
   * - indexable 必須維持 false
   * - latitude 與 longitude 先填 null
   */
  const HOTSPOTS = [
    {
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
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: true,
      enabled: true,
      indexable: true
    },

    {
      {
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
  initialRadiusMeters: 800,
  maximumRadiusMeters: 3000,
  minimumResults: 5,
  coordinateVerified: true,
  enabled: true,
  indexable: false
},

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
      id: "kaohsiung-arena",
      slug: "kaohsiung-arena-parking.html",
      name: "高雄巨蛋／巨蛋商圈",
      title: "高雄巨蛋停車場推薦",
      category: "商圈／場館",
      keywords: [
        "高雄巨蛋停車",
        "巨蛋商圈停車",
        "高雄巨蛋停車場"
      ],
      intro:
        "快速查看高雄巨蛋與巨蛋商圈附近路外停車場即時剩餘空位、距離與導航。",
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
      id: "ruifeng-night-market",
      slug: "ruifeng-night-market-parking.html",
      name: "瑞豐夜市",
      title: "瑞豐夜市停車場推薦",
      category: "夜市／商圈",
      keywords: [
        "瑞豐夜市停車",
        "瑞豐夜市停車場",
        "瑞豐夜市附近停車"
      ],
      intro:
        "快速查看瑞豐夜市附近路外停車場即時剩餘空位、距離與導航。",
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
        "快速查看旗津附近路外停車場即時剩餘空位、距離與導航。",
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
      id: "fo-guang-shan",
      slug: "fo-guang-shan-parking.html",
      name: "佛光山",
      title: "佛光山停車場推薦",
      category: "郊區／觀光",
      keywords: [
        "佛光山停車",
        "佛光山停車場",
        "佛陀紀念館停車"
      ],
      intro:
        "快速查看佛光山附近路外停車場即時剩餘空位、距離與導航。",
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
      id: "moon-world",
      slug: "moon-world-parking.html",
      name: "田寮月世界",
      title: "田寮月世界停車場推薦",
      category: "郊區／觀光",
      keywords: [
        "田寮月世界停車",
        "月世界停車場",
        "田寮月世界停車場"
      ],
      intro:
        "快速查看田寮月世界附近路外停車場即時剩餘空位、距離與導航。",
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
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
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    },

    {
      id: "meinong",
      slug: "meinong-parking.html",
      name: "美濃",
      title: "美濃停車場推薦",
      category: "郊區／觀光",
      keywords: [
        "美濃停車",
        "美濃停車場",
        "美濃老街停車"
      ],
      intro:
        "快速查看美濃附近路外停車場即時剩餘空位、距離與導航。",
      latitude: null,
      longitude: null,
      initialRadiusMeters: 800,
      maximumRadiusMeters: 3000,
      minimumResults: 5,
      coordinateVerified: false,
      enabled: false,
      indexable: false
    }
  ];

  /**
   * 檔名正規化。
   */
  function normalizeSlug(value) {
    return String(value || "")
      .trim()
      .split("/")
      .pop()
      .split("?")[0]
      .split("#")[0];
  }

  /**
   * 複製單筆資料，避免其他程式意外修改原始設定。
   */
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

  /**
   * 依照 id 取得熱門地點。
   */
  function findById(id) {
    const hotspot = HOTSPOTS.find(
      (item) => item.id === id
    );

    return cloneHotspot(hotspot);
  }

  /**
   * 依照 HTML 檔名取得熱門地點。
   */
  function findBySlug(slug) {
    const normalizedSlug = normalizeSlug(slug);

    const hotspot = HOTSPOTS.find(
      (item) => item.slug === normalizedSlug
    );

    return cloneHotspot(hotspot);
  }

  /**
   * 依照目前頁面網址取得熱門地點。
   */
  function findByCurrentPage() {
    return findBySlug(global.location.pathname);
  }

  /**
   * 取得首頁可顯示的熱門地點。
   */
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

  /**
   * 取得允許 Google 收錄的熱門地點。
   */
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

  /**
   * 取得全部熱門地點。
   *
   * 後續測試與管理用途可使用。
   */
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
