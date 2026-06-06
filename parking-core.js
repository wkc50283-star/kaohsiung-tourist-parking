/**
 * parking-core.js
 * 高雄熱門地點停車推薦網站：全站共用停車核心模組
 *
 * 責任：
 * 1. 讀取 Vercel 快取後的 TDX 路外停車場即時資料
 * 2. 在瀏覽器端再次執行防呆清洗
 * 3. 排除不可靠資料
 * 4. 計算直線距離
 * 5. 依序擴大搜尋半徑
 * 6. 依距離由近到遠排列
 * 7. 產生統一停車場卡片
 * 8. 產生 Google 地圖導航連結
 *
 * 注意：
 * - 本檔案不主動取得使用者定位。
 * - 本檔案不保存使用者座標。
 * - 本檔案不持續追蹤使用者位置。
 * - 首頁、熱門地點頁與目前位置頁都應共用本模組。
 */

(function (global) {
  "use strict";

  /**
   * 全站預設設定
   *
   * 若未來 Vercel API 網址不同，只需要修改 apiUrl 這一行。
   */
  const DEFAULT_CONFIG = Object.freeze({
    apiUrl:
      "https://kaohsiung-parking-api-test.vercel.app/api/nearby-data",

    requestTimeoutMs: 12000,

    /**
     * 即時資料超過 20 分鐘未更新，視為過期資料。
     * 後續可依實際測試結果調整。
     */
    staleAfterMinutes: 20,

    /**
     * 原則上至少提供 5 筆可靠結果。
     */
    minimumResults: 5,

    /**
 * 手機畫面預設只顯示距離最近的 5 筆可靠結果。
 * 完整可靠筆數仍會保留於搜尋摘要中。
 */
maximumResults: 5,

    /**
     * 依序擴大搜尋範圍。
     */
    radiusStepsMeters: [800, 1200, 1600, 2000, 3000],

    /**
     * 高雄市及周邊合理座標範圍。
     * 用於排除明顯錯誤座標。
     */
    kaohsiungBounds: {
      minLatitude: 22.45,
      maxLatitude: 23.55,
      minLongitude: 120.0,
      maxLongitude: 120.95
    }
  });

  /**
   * 統一錯誤格式。
   */
  class ParkingCoreError extends Error {
    constructor(code, message, userMessage) {
      super(message);

      this.name = "ParkingCoreError";
      this.code = code;

      this.userMessage =
        userMessage || "暫時無法取得停車場資料，請稍後再試。";
    }
  }

  /**
   * 合併預設設定與個別頁面設定。
   */
  function mergeConfig(overrides) {
    const source = overrides || {};

    return {
      ...DEFAULT_CONFIG,
      ...source,

      radiusStepsMeters: Array.isArray(source.radiusStepsMeters)
        ? source.radiusStepsMeters.slice()
        : DEFAULT_CONFIG.radiusStepsMeters.slice(),

      kaohsiungBounds: {
        ...DEFAULT_CONFIG.kaohsiungBounds,
        ...(source.kaohsiungBounds || {})
      }
    };
  }

  /**
   * 判斷是否為一般物件。
   */
  function isPlainObject(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  }

  /**
   * 從多個可能欄位路徑中，取得第一個有效值。
   */
  function firstDefined(object, paths) {
    for (const path of paths) {
      const value = path.split(".").reduce((current, key) => {
        if (current === null || current === undefined) {
          return undefined;
        }

        return current[key];
      }, object);

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return undefined;
  }

  /**
   * 轉換為有限數字。
   */
  function toFiniteNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  }

  /**
   * 轉換為文字並移除頭尾空白。
   */
  function toText(value) {
    return value === null || value === undefined
      ? ""
      : String(value).trim();
  }

  /**
   * 解析日期。
   */
  function parseDate(value) {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  /**
   * 轉換為整數。
   */
  function clampInteger(value) {
    const number = toFiniteNumber(value);

    if (number === null) {
      return null;
    }

    return Math.trunc(number);
  }

  /**
   * 統一搜尋中心座標格式。
   */
  function normalizeCenter(center) {
    const latitude = toFiniteNumber(
      center && (center.latitude ?? center.lat)
    );

    const longitude = toFiniteNumber(
      center &&
        (
          center.longitude ??
          center.lng ??
          center.lon
        )
    );

    if (latitude === null || longitude === null) {
      throw new ParkingCoreError(
        "INVALID_CENTER",
        "Missing or invalid search center coordinates.",
        "無法確認搜尋中心位置，請重新操作。"
      );
    }

    return {
      latitude,
      longitude
    };
  }

  /**
   * 檢查座標是否落在合理範圍內。
   */
  function isCoordinateInsideBounds(
    latitude,
    longitude,
    bounds
  ) {
    return (
      latitude >= bounds.minLatitude &&
      latitude <= bounds.maxLatitude &&
      longitude >= bounds.minLongitude &&
      longitude <= bounds.maxLongitude
    );
  }

  /**
   * 判斷物件是否可能為停車場資料。
   */
  function looksLikeParkingRecord(record) {
    if (!isPlainObject(record)) {
      return false;
    }

    const name = firstDefined(record, [
      "CarParkName.Zh_tw",
      "CarParkName",
      "name",
      "carParkName"
    ]);

    const available = firstDefined(record, [
      "AvailableSpaces",
      "availableSpaces",
      "available",
      "carAvailableSpaces"
    ]);

    const latitude = firstDefined(record, [
      "PositionLat",
      "latitude",
      "lat",
      "position.latitude",
      "position.lat",
      "CarParkPosition.PositionLat"
    ]);

    return (
      name !== undefined &&
      (
        available !== undefined ||
        latitude !== undefined
      )
    );
  }

  /**
   * 從 API 回傳內容中，找出停車場陣列。
   *
   * 此處保留多種格式支援，避免 Vercel 回傳結構稍微調整後，
   * 前端整個失效。
   */
  function extractParkingRecords(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (!isPlainObject(payload)) {
      return [];
    }

    const preferredPaths = [
      "parkingLots",
      "carParks",
      "records",
      "items",
      "results",
      "data.parkingLots",
      "data.carParks",
      "data.records",
      "data.items",
      "data.results",
      "data"
    ];

    for (const path of preferredPaths) {
      const value = firstDefined(payload, [path]);

      if (
        Array.isArray(value) &&
        value.some(looksLikeParkingRecord)
      ) {
        return value;
      }
    }

    let bestCandidate = [];

    function walk(value, depth) {
      if (
        depth > 4 ||
        value === null ||
        value === undefined
      ) {
        return;
      }

      if (Array.isArray(value)) {
        const records = value.filter(looksLikeParkingRecord);

        if (records.length > bestCandidate.length) {
          bestCandidate = records;
        }

        return;
      }

      if (!isPlainObject(value)) {
        return;
      }

      Object.values(value).forEach((child) => {
        walk(child, depth + 1);
      });
    }

    walk(payload, 0);

    return bestCandidate;
  }

  /**
   * 統一取得停車場名稱。
   */
  function getRecordName(record) {
    const rawName = firstDefined(record, [
      "CarParkName.Zh_tw",
      "CarParkName.Zh_zh",
      "CarParkName",
      "carParkName",
      "name"
    ]);

    if (isPlainObject(rawName)) {
      return toText(
        rawName.Zh_tw ||
          rawName.Zh_zh ||
          rawName.En ||
          rawName.en
      );
    }

    return toText(rawName);
  }

  /**
   * 排除大型車、遊覽車、機車等專用停車場。
   *
   * 網站第一版只服務一般汽車駕駛。
   */
  function hasExcludedVehicleName(name) {
    return /(大型車|大客車|遊覽車|巴士|公車|貨車|卡車|機車|摩托車|自行車|腳踏車|重機).*(專用|停車場)?|^(大型車|大客車|遊覽車|巴士|貨車|卡車|機車|摩托車|自行車|腳踏車|重機)/i.test(
      name
    );
  }

  /**
   * 若資料有明確標示不支援一般汽車，則排除。
   */
  function hasExplicitUnsupportedVehicleType(record) {
    const vehicleType = toText(
      firstDefined(record, [
        "vehicleType",
        "VehicleType",
        "spaceType",
        "SpaceType",
        "carType",
        "CarType"
      ])
    );

    if (!vehicleType) {
      return false;
    }

    if (
      /(car|automobile|passenger|小客車|汽車|自小客)/i.test(
        vehicleType
      )
    ) {
      return false;
    }

    return /(bus|truck|motorcycle|bike|bicycle|大型車|大客車|遊覽車|巴士|貨車|卡車|機車|摩托車|自行車|腳踏車|重機)/i.test(
      vehicleType
    );
  }

  /**
   * 排除明確停用、關閉、故障或維修中的資料。
   */
  function hasExplicitUnavailableServiceStatus(record) {
    const status = firstDefined(record, [
      "ServiceStatus",
      "serviceStatus",
      "status"
    ]);

    if (status === false) {
      return true;
    }

    if (typeof status !== "string") {
      return false;
    }

    return /(停用|停止服務|暫停|關閉|故障|維修|無法使用|closed|disabled|suspended|offline|maintenance|fault)/i.test(
      status
    );
  }

  /**
   * 清洗單筆停車場資料。
   */
  function normalizeParkingRecord(record, config, now) {
    const name = getRecordName(record);

    const id = toText(
      firstDefined(record, [
        "CarParkID",
        "carParkId",
        "parkingId",
        "id"
      ])
    );

    const latitude = toFiniteNumber(
      firstDefined(record, [
        "PositionLat",
        "latitude",
        "lat",
        "position.latitude",
        "position.lat",
        "CarParkPosition.PositionLat"
      ])
    );

    const longitude = toFiniteNumber(
      firstDefined(record, [
        "PositionLon",
        "PositionLng",
        "longitude",
        "lng",
        "lon",
        "position.longitude",
        "position.lng",
        "position.lon",
        "CarParkPosition.PositionLon"
      ])
    );

    const totalSpaces = clampInteger(
      firstDefined(record, [
        "TotalSpaces",
        "totalSpaces",
        "total",
        "carTotalSpaces"
      ])
    );

    const availableSpaces = clampInteger(
      firstDefined(record, [
        "AvailableSpaces",
        "availableSpaces",
        "available",
        "carAvailableSpaces"
      ])
    );

    const address = toText(
      firstDefined(record, [
        "Address",
        "address",
        "CarParkAddress",
        "carParkAddress"
      ])
    );

    const dataCollectTimeRaw = firstDefined(record, [
      "DataCollectTime",
      "dataCollectTime",
      "UpdateTime",
      "updateTime",
      "updatedAt"
    ]);

    const dataCollectTime = parseDate(dataCollectTimeRaw);

    const reasons = [];

    if (!name) {
      reasons.push("missing_name");
    }

    if (latitude === null || longitude === null) {
      reasons.push("missing_coordinate");
    }

    if (
      latitude !== null &&
      longitude !== null &&
      !isCoordinateInsideBounds(
        latitude,
        longitude,
        config.kaohsiungBounds
      )
    ) {
      reasons.push("coordinate_outside_kaohsiung");
    }

    if (totalSpaces === null || totalSpaces <= 0) {
      reasons.push("invalid_total_spaces");
    }

    if (availableSpaces === null) {
      reasons.push("missing_live_available_spaces");
    }

    if (
      availableSpaces !== null &&
      availableSpaces < 0
    ) {
      reasons.push("negative_available_spaces");
    }

    /**
     * 滿位停車場不列入導航備案。
     * 網站不拿無空位資料湊數。
     */
    if (
      availableSpaces !== null &&
      availableSpaces === 0
    ) {
      reasons.push("full_parking_lot");
    }

    if (
      totalSpaces !== null &&
      availableSpaces !== null &&
      availableSpaces > totalSpaces
    ) {
      reasons.push("available_spaces_exceed_total");
    }

    if (!dataCollectTime) {
      reasons.push("missing_or_invalid_collect_time");
    } else {
      const ageMinutes =
        (now.getTime() - dataCollectTime.getTime()) /
        60000;

      if (ageMinutes > config.staleAfterMinutes) {
        reasons.push("stale_data");
      }

      if (ageMinutes < -5) {
        reasons.push("collect_time_in_future");
      }
    }

    if (hasExcludedVehicleName(name)) {
      reasons.push("excluded_vehicle_name");
    }

    if (hasExplicitUnsupportedVehicleType(record)) {
      reasons.push("unsupported_vehicle_type");
    }

    if (hasExplicitUnavailableServiceStatus(record)) {
      reasons.push("unavailable_service_status");
    }

    if (reasons.length > 0) {
      return {
        accepted: false,
        reasons
      };
    }

    return {
      accepted: true,

      lot: {
        id:
          id ||
          `${name}-${latitude}-${longitude}`,

        name,
        address,
        latitude,
        longitude,
        totalSpaces,
        availableSpaces,

        dataCollectTime:
          dataCollectTime.toISOString(),

        raw: record
      }
    };
  }

  /**
   * 建立排除原因統計物件。
   */
  function createRejectSummary() {
    return Object.create(null);
  }

  /**
   * 統計排除原因。
   */
  function addRejectReasons(summary, reasons) {
    reasons.forEach((reason) => {
      summary[reason] =
        (summary[reason] || 0) + 1;
    });
  }

  /**
   * 排除重複停車場。
   *
   * 若同一停車場出現多筆資料，保留更新時間較新的資料。
   */
  function deduplicateParkingLots(lots) {
    const map = new Map();

    lots.forEach((lot) => {
      const key =
        lot.id ||
        `${lot.name}-${lot.latitude}-${lot.longitude}`;

      const previous = map.get(key);

      if (!previous) {
        map.set(key, lot);
        return;
      }

      const previousTime =
        new Date(previous.dataCollectTime).getTime();

      const currentTime =
        new Date(lot.dataCollectTime).getTime();

      if (currentTime >= previousTime) {
        map.set(key, lot);
      }
    });

    return Array.from(map.values());
  }

  /**
   * 清洗整批停車場資料。
   */
  function cleanParkingLots(records, options) {
    const config = mergeConfig(options);

    const now =
      options && options.now instanceof Date
        ? options.now
        : new Date();

    const acceptedLots = [];

    const rejectedReasons =
      createRejectSummary();

    records.forEach((record) => {
      const normalized =
        normalizeParkingRecord(
          record,
          config,
          now
        );

      if (normalized.accepted) {
        acceptedLots.push(normalized.lot);
      } else {
        addRejectReasons(
          rejectedReasons,
          normalized.reasons
        );
      }
    });

    const lots =
      deduplicateParkingLots(acceptedLots);

    return {
      lots,

      stats: {
        inputRecords: records.length,

        acceptedBeforeDeduplication:
          acceptedLots.length,

        acceptedRecords:
          lots.length,

        rejectedRecords:
          records.length -
          acceptedLots.length,

        duplicateRecords:
          acceptedLots.length -
          lots.length,

        rejectedReasons
      }
    };
  }

  /**
   * 角度轉弧度。
   */
  function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  /**
   * 使用 Haversine 公式計算兩個座標之間的直線距離。
   *
   * 網站只負責提供快速比較距離。
   * 實際道路導航交由 Google 地圖處理。
   */
  function distanceMeters(origin, destination) {
    const start = normalizeCenter(origin);
    const end = normalizeCenter(destination);

    const earthRadiusMeters = 6371000;

    const deltaLatitude =
      toRadians(
        end.latitude -
        start.latitude
      );

    const deltaLongitude =
      toRadians(
        end.longitude -
        start.longitude
      );

    const latitude1 =
      toRadians(start.latitude);

    const latitude2 =
      toRadians(end.latitude);

    const haversine =
      Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(latitude1) *
        Math.cos(latitude2) *
        Math.sin(deltaLongitude / 2) ** 2;

    return (
      2 *
      earthRadiusMeters *
      Math.asin(Math.sqrt(haversine))
    );
  }

  /**
   * 建立搜尋半徑順序。
   */
  function buildRadiusSteps(
    initialRadiusMeters,
    maximumRadiusMeters,
    configuredSteps
  ) {
    const initial = Math.max(
      1,
      Math.trunc(
        toFiniteNumber(initialRadiusMeters) ||
          800
      )
    );

    const maximum = Math.max(
      initial,
      Math.trunc(
        toFiniteNumber(maximumRadiusMeters) ||
          3000
      )
    );

    const steps = [initial]
      .concat(configuredSteps || [])
      .concat([maximum])
      .map((value) =>
        Math.trunc(
          toFiniteNumber(value) || 0
        )
      )
      .filter(
        (value) =>
          value >= initial &&
          value <= maximum
      );

    return Array.from(new Set(steps)).sort(
      (a, b) => a - b
    );
  }

  /**
   * 尋找附近可靠停車場。
   *
   * 流程：
   * 800 公尺
   * → 不足 5 筆
   * → 1200 公尺
   * → 1600 公尺
   * → 2000 公尺
   * → 3000 公尺
   * → 仍不足時誠實顯示實際筆數
   */
  function findNearbyParkingLots(
    lots,
    center,
    options
  ) {
    const config = mergeConfig(options);

    const normalizedCenter =
      normalizeCenter(center);

    const minimumResults = Math.max(
      1,
      Math.trunc(
        toFiniteNumber(
          config.minimumResults
        ) || 5
      )
    );

    const maximumResults = Math.max(
      minimumResults,
      Math.trunc(
        toFiniteNumber(
          config.maximumResults
        ) || 20
      )
    );

    const radiusSteps = buildRadiusSteps(
      config.initialRadiusMeters,
      config.maximumRadiusMeters,
      config.radiusStepsMeters
    );

    const rankedLots = lots
      .map((lot) => ({
        ...lot,

        distanceMeters: Math.round(
          distanceMeters(
            normalizedCenter,
            lot
          )
        )
      }))
      .sort((a, b) => {
        if (
          a.distanceMeters !==
          b.distanceMeters
        ) {
          return (
            a.distanceMeters -
            b.distanceMeters
          );
        }

        return (
          b.availableSpaces -
          a.availableSpaces
        );
      });

    let selectedRadius =
      radiusSteps[radiusSteps.length - 1];

    let withinRadius = [];

    for (const radius of radiusSteps) {
      withinRadius = rankedLots.filter(
        (lot) =>
          lot.distanceMeters <= radius
      );

      selectedRadius = radius;

      if (
        withinRadius.length >=
        minimumResults
      ) {
        break;
      }
    }

    return {
      center: normalizedCenter,

      radiusMeters: selectedRadius,

      radiusStepsMeters:
        radiusSteps,

      minimumResults,

      minimumResultsReached:
        withinRadius.length >=
        minimumResults,

      reliableResultsWithinRadius:
        withinRadius.length,

      results: withinRadius.slice(
        0,
        maximumResults
      )
    };
  }

  /**
   * 讀取 JSON API。
   *
   * 注意：
   * 此處刻意不使用 cache: "no-store"。
   * 避免破壞 Vercel CDN 快取策略。
   */
  async function fetchJson(url, timeoutMs) {
    const controller =
      new AbortController();

    const timer = setTimeout(
      () => controller.abort(),
      timeoutMs
    );

    try {
      const response = await fetch(url, {
        method: "GET",

        headers: {
          Accept: "application/json"
        },

        signal: controller.signal
      });

      if (!response.ok) {
        throw new ParkingCoreError(
          "HTTP_ERROR",

          `Parking API request failed with status ${response.status}.`,

          "即時停車資料暫時無法讀取，請稍後再試。"
        );
      }

      return await response.json();
    } catch (error) {
      if (
        error instanceof
        ParkingCoreError
      ) {
        throw error;
      }

      if (
        error &&
        error.name === "AbortError"
      ) {
        throw new ParkingCoreError(
          "REQUEST_TIMEOUT",

          "Parking API request timed out.",

          "即時停車資料讀取逾時，請稍後再試。"
        );
      }

      throw new ParkingCoreError(
        "NETWORK_ERROR",

        error && error.message
          ? error.message
          : "Unknown network error.",

        "目前無法連線至即時停車資料，請檢查網路後再試。"
      );
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * 取得 API 回傳的中繼資料。
   */
  function extractPayloadMeta(payload) {
    const generatedAt = parseDate(
      firstDefined(payload, [
        "generatedAt",
        "meta.generatedAt",
        "data.generatedAt"
      ])
    );

    const upstreamDataCollectTime =
      parseDate(
        firstDefined(payload, [
          "dataCollectTime",
          "meta.dataCollectTime",
          "data.dataCollectTime"
        ])
      );

    return {
      generatedAt: generatedAt
        ? generatedAt.toISOString()
        : null,

      upstreamDataCollectTime:
        upstreamDataCollectTime
          ? upstreamDataCollectTime.toISOString()
          : null
    };
  }

  /**
   * 取得可靠資料中最新的更新時間。
   */
  function latestCollectTime(lots) {
    let latest = null;

    lots.forEach((lot) => {
      const time = parseDate(
        lot.dataCollectTime
      );

      if (
        time &&
        (!latest || time > latest)
      ) {
        latest = time;
      }
    });

    return latest
      ? latest.toISOString()
      : null;
  }

  /**
   * 統一執行完整搜尋流程。
   *
   * hotspot-live.js 與 nearby.js 後續都呼叫這個方法。
   */
  async function loadNearbyParking(options) {
    const config = mergeConfig(options);

    const payload = await fetchJson(
      config.apiUrl,
      config.requestTimeoutMs
    );

    const records =
      extractParkingRecords(payload);

    if (records.length === 0) {
      throw new ParkingCoreError(
        "EMPTY_API_RECORDS",

        "No parking records were found in the API response.",

        "目前沒有可用的即時停車資料，請稍後再試。"
      );
    }

    const cleaned =
      cleanParkingLots(records, config);

    const nearby =
      findNearbyParkingLots(
        cleaned.lots,
        config.center,
        config
      );

    return {
      ...nearby,

      meta: {
        ...extractPayloadMeta(payload),

        latestReliableCollectTime:
          latestCollectTime(
            cleaned.lots
          )
      },

      cleaningStats:
        cleaned.stats
    };
  }

  /**
   * 產生 Google 地圖開車導航連結。
   */
  function buildGoogleMapsNavigationUrl(lot) {
    const latitude = toFiniteNumber(
      lot && lot.latitude
    );

    const longitude = toFiniteNumber(
      lot && lot.longitude
    );

    if (
      latitude === null ||
      longitude === null
    ) {
      return "";
    }

    const destination =
      encodeURIComponent(
        `${latitude},${longitude}`
      );

    return (
      "https://www.google.com/maps/dir/" +
      "?api=1" +
      `&destination=${destination}` +
      "&travelmode=driving"
    );
  }

  /**
   * 避免資料內容破壞 HTML。
   */
  function escapeHtml(value) {
    return toText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * 格式化距離。
   */
  function formatDistance(meters) {
    const distance =
      toFiniteNumber(meters);

    if (distance === null) {
      return "距離未知";
    }

    if (distance < 1000) {
      return `${Math.round(
        distance
      )} 公尺`;
    }

    return `${(
      distance / 1000
    ).toFixed(
      distance < 10000 ? 1 : 0
    )} 公里`;
  }

  /**
   * 格式化台灣時間。
   */
  function formatLocalTime(value) {
    const date = parseDate(value);

    if (!date) {
      return "時間未知";
    }

    return new Intl.DateTimeFormat(
      "zh-TW",
      {
        timeZone: "Asia/Taipei",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }
    ).format(date);
  }

  /**
   * 顯示距離排名。
   */
  function rankLabel(index) {
    return index === 0
      ? "距離最近"
      : `第 ${index + 1} 近`;
  }

  /**
   * 產生單張停車場卡片 HTML。
   */
  function createParkingCardHtml(
    lot,
    index
  ) {
    const navigationUrl =
      buildGoogleMapsNavigationUrl(lot);

    const address = lot.address
      ? escapeHtml(lot.address)
      : "地址資料未提供";

    return `
      <article class="parking-card">
        <div class="parking-card__topline">
          <span class="parking-rank">${escapeHtml(
            rankLabel(index)
          )}</span>

          <span class="parking-availability">
            剩餘 ${escapeHtml(
              lot.availableSpaces
            )} 格
          </span>
        </div>

        <h3 class="parking-card__title">
          ${escapeHtml(lot.name)}
        </h3>

        <dl class="parking-card__details">
          <div>
            <dt>距離</dt>
            <dd>${escapeHtml(
              formatDistance(
                lot.distanceMeters
              )
            )}</dd>
          </div>

          <div>
            <dt>總格位</dt>
            <dd>${escapeHtml(
              lot.totalSpaces
            )} 格</dd>
          </div>

          <div>
            <dt>更新時間</dt>
            <dd>${escapeHtml(
              formatLocalTime(
                lot.dataCollectTime
              )
            )}</dd>
          </div>

          <div>
            <dt>地址</dt>
            <dd>${address}</dd>
          </div>
        </dl>

        <a
          class="parking-navigation-button"
          href="${escapeHtml(
            navigationUrl
          )}"
          target="_blank"
          rel="noopener noreferrer"
        >
          開始導航
        </a>
      </article>
    `.trim();
  }

  /**
   * 將停車場卡片放進指定 HTML 容器。
   */
  function renderParkingCards(
    container,
    lots
  ) {
    const element =
      typeof container === "string"
        ? document.querySelector(
            container
          )
        : container;

    if (!element) {
      throw new ParkingCoreError(
        "MISSING_CONTAINER",

        "Parking card container was not found.",

        "頁面顯示區塊設定錯誤。"
      );
    }

    if (
      !Array.isArray(lots) ||
      lots.length === 0
    ) {
      element.innerHTML = "";
      return;
    }

    element.innerHTML = lots
      .map(createParkingCardHtml)
      .join("\n");
  }

  /**
   * 對外開放的共用功能。
   */
  global.ParkingCore = Object.freeze({
    DEFAULT_CONFIG,

    ParkingCoreError,

    cleanParkingLots,

    distanceMeters,

    findNearbyParkingLots,

    loadNearbyParking,

    buildGoogleMapsNavigationUrl,

    createParkingCardHtml,

    renderParkingCards,

    formatDistance,

    formatLocalTime,

    rankLabel
  });
})(window);
