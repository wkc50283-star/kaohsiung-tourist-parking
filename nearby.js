/**
 * nearby.js
 * 使用目前位置搜尋附近停車場：頁面控制程式
 *
 * 責任：
 * 1. 只在使用者主動操作後取得一次性定位
 * 2. 呼叫 ParkingCore 共用核心
 * 3. 顯示搜尋狀態、可靠結果數量、搜尋半徑與更新時間
 * 4. 將附近路外停車場依距離由近到遠顯示
 *
 * 隱私原則：
 * - 不使用 watchPosition。
 * - 不持續追蹤位置。
 * - 不將座標寫入 localStorage 或 sessionStorage。
 * - 不將座標傳送至本網站伺服器。
 * - 若首頁曾以網址參數傳入一次性座標，讀取後立即移除座標參數。
 */

(function (global) {
  "use strict";

  const PAGE_CONFIG = Object.freeze({
    minimumResults: 5,
    initialRadiusMeters: 800,
    maximumRadiusMeters: 3000,

    /**
     * 定位誤差超過 500 公尺時，不直接列出附近停車場。
     * 避免使用者因位置偏差被導向不合理的結果。
     */
    maximumAcceptedAccuracyMeters: 500,

    geolocationOptions: {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    }
  });

  const SELECTORS = Object.freeze({
    locationButton: "#use-current-location-button",
    locationStatus: "#location-status",
    parkingSummary: "#parking-summary",
    parkingMeta: "#parking-meta",
    parkingError: "#parking-error",
    parkingResults: "#parking-results"
  });

  let isSearching = false;

  function getElement(selector) {
    return document.querySelector(selector);
  }

  function requireElement(selector) {
    const element = getElement(selector);

    if (!element) {
      throw new Error(`Missing required element: ${selector}`);
    }

    return element;
  }

  function setText(selector, text) {
    const element = getElement(selector);

    if (element) {
      element.textContent = text || "";
    }
  }

  function setHidden(selector, hidden) {
    const element = getElement(selector);

    if (element) {
      element.hidden = hidden;
    }
  }

  function setButtonBusy(isBusy) {
    const button = getElement(SELECTORS.locationButton);

    if (!button) {
      return;
    }

    button.disabled = isBusy;
    button.setAttribute("aria-busy", String(isBusy));
    button.textContent = isBusy
      ? "正在取得位置…"
      : "使用目前位置搜尋附近停車場";
  }

  function clearResults() {
    const results = getElement(SELECTORS.parkingResults);

    if (results) {
      results.innerHTML = "";
    }

    setText(SELECTORS.parkingSummary, "");
    setText(SELECTORS.parkingMeta, "");
    setText(SELECTORS.parkingError, "");
    setHidden(SELECTORS.parkingError, true);
  }

  function showError(message) {
    setText(
      SELECTORS.parkingError,
      message || "暫時無法取得附近停車場資料，請稍後再試。"
    );

    setHidden(SELECTORS.parkingError, false);
  }

  function toFiniteNumber(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  }

  function isCoordinateInsideKaohsiungBounds(latitude, longitude) {
    const bounds = global.ParkingCore.DEFAULT_CONFIG.kaohsiungBounds;

    return (
      latitude >= bounds.minLatitude &&
      latitude <= bounds.maxLatitude &&
      longitude >= bounds.minLongitude &&
      longitude <= bounds.maxLongitude
    );
  }

  function normalizeLocation(location) {
    const latitude = toFiniteNumber(location && location.latitude);
    const longitude = toFiniteNumber(location && location.longitude);
    const accuracy = toFiniteNumber(location && location.accuracy);

    if (latitude === null || longitude === null) {
      throw new Error("目前位置座標無效，請重新定位。");
    }

    if (!isCoordinateInsideKaohsiungBounds(latitude, longitude)) {
      throw new Error(
        "目前位置不在高雄市服務範圍內。請改用首頁的熱門地點入口。"
      );
    }

    if (
      accuracy !== null &&
      accuracy > PAGE_CONFIG.maximumAcceptedAccuracyMeters
    ) {
      throw new Error(
        `目前定位誤差約 ±${Math.round(
          accuracy
        )} 公尺，精準度不足。請移至較空曠處重新定位，或改用熱門地點搜尋。`
      );
    }

    return {
      latitude,
      longitude,
      accuracy
    };
  }

  function parseLocationFromQuery() {
    const url = new URL(global.location.href);
    const params = url.searchParams;

    const latitude = toFiniteNumber(
      params.get("lat") || params.get("latitude")
    );

    const longitude = toFiniteNumber(
      params.get("lng") ||
        params.get("lon") ||
        params.get("longitude")
    );

    const accuracy = toFiniteNumber(params.get("accuracy"));

    if (latitude === null || longitude === null) {
      return null;
    }

    return {
      latitude,
      longitude,
      accuracy
    };
  }

  function removeLocationQueryParameters() {
    const url = new URL(global.location.href);

    [
      "lat",
      "latitude",
      "lng",
      "lon",
      "longitude",
      "accuracy"
    ].forEach((key) => url.searchParams.delete(key));

    const query = url.searchParams.toString();

    const cleanUrl =
      `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;

    global.history.replaceState({}, "", cleanUrl);
  }

  function requestOneTimeLocation() {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(
          new Error(
            "目前瀏覽器不支援定位功能。請改用首頁的熱門地點入口。"
          )
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },

        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            reject(
              new Error(
                "尚未取得定位權限。請允許瀏覽器使用目前位置，或改用熱門地點搜尋。"
              )
            );

            return;
          }

          if (error.code === error.POSITION_UNAVAILABLE) {
            reject(
              new Error(
                "目前無法取得位置。請確認手機定位服務已開啟，再重新嘗試。"
              )
            );

            return;
          }

          if (error.code === error.TIMEOUT) {
            reject(
              new Error(
                "定位等候時間過久。請移至訊號較佳的位置後重新嘗試。"
              )
            );

            return;
          }

          reject(
            new Error("無法取得目前位置，請稍後再試。")
          );
        },

        PAGE_CONFIG.geolocationOptions
      );
    });
  }

  function formatAccuracy(accuracy) {
    if (accuracy === null || accuracy === undefined) {
      return "定位誤差未知";
    }

    return `定位誤差約 ±${Math.round(accuracy)} 公尺`;
  }

  function buildSummary(result) {
    const count = result.reliableResultsWithinRadius;

    const radius =
      global.ParkingCore.formatDistance(result.radiusMeters);

    if (result.minimumResultsReached) {
      return `搜尋半徑 ${radius}，共找到 ${count} 筆可靠且有空位的路外停車場。`;
    }

    return `搜尋半徑已擴大至 ${radius}，目前僅找到 ${count} 筆可靠且有空位的路外停車場。本站不會用不可靠資料硬湊備案。`;
  }

  function buildMeta(result) {
    const latestTime =
      result.meta.latestReliableCollectTime;

    if (!latestTime) {
      return "即時資料更新時間：無法確認";
    }

    return `即時資料更新時間：${global.ParkingCore.formatLocalTime(
      latestTime
    )}`;
  }

  async function searchNearbyParking(location) {
    if (isSearching) {
      return;
    }

    isSearching = true;
    setButtonBusy(true);
    clearResults();

    try {
      const normalizedLocation =
        normalizeLocation(location);

      setText(
        SELECTORS.locationStatus,
        `已取得目前位置，${formatAccuracy(
          normalizedLocation.accuracy
        )}。正在讀取附近路外停車場…`
      );

      const result =
        await global.ParkingCore.loadNearbyParking({
          center: {
            latitude: normalizedLocation.latitude,
            longitude: normalizedLocation.longitude
          },

          minimumResults:
            PAGE_CONFIG.minimumResults,

          initialRadiusMeters:
            PAGE_CONFIG.initialRadiusMeters,

          maximumRadiusMeters:
            PAGE_CONFIG.maximumRadiusMeters
        });

      setText(
        SELECTORS.locationStatus,
        `已取得目前位置，${formatAccuracy(
          normalizedLocation.accuracy
        )}。`
      );

      setText(
        SELECTORS.parkingSummary,
        buildSummary(result)
      );

      setText(
        SELECTORS.parkingMeta,
        buildMeta(result)
      );

      global.ParkingCore.renderParkingCards(
        SELECTORS.parkingResults,
        result.results
      );

      if (result.results.length === 0) {
        showError(
          "附近目前沒有符合條件且仍有空位的可靠路外停車場。請改用熱門地點搜尋，或稍後再試。"
        );
      }
    } catch (error) {
      const message =
        error && error.userMessage
          ? error.userMessage
          : error && error.message
            ? error.message
            : "暫時無法取得附近停車場資料，請稍後再試。";

      setText(SELECTORS.locationStatus, "");
      showError(message);
    } finally {
      isSearching = false;
      setButtonBusy(false);
    }
  }

  async function handleLocationButtonClick() {
    if (isSearching) {
      return;
    }

    clearResults();

    setText(
      SELECTORS.locationStatus,
      "正在取得目前位置…"
    );

    try {
      const location =
        await requestOneTimeLocation();

      await searchNearbyParking(location);
    } catch (error) {
      setText(SELECTORS.locationStatus, "");

      showError(error.message);

      setButtonBusy(false);
      isSearching = false;
    }
  }

  function assertDependencies() {
    if (!global.ParkingCore) {
      throw new Error(
        "ParkingCore 尚未載入。請確認 nearby.html 已先引用 parking-core.js。"
      );
    }

    requireElement(SELECTORS.locationButton);
    requireElement(SELECTORS.parkingResults);
  }

  async function init() {
    try {
      assertDependencies();

      const button =
        requireElement(SELECTORS.locationButton);

      button.addEventListener(
        "click",
        handleLocationButtonClick
      );

      const queryLocation =
        parseLocationFromQuery();

      if (queryLocation) {
        removeLocationQueryParameters();

        await searchNearbyParking(
          queryLocation
        );

        return;
      }

      setText(
        SELECTORS.locationStatus,
        "按下按鈕後，瀏覽器只會取得一次目前位置，不會持續追蹤或保存定位紀錄。"
      );
    } catch (error) {
      showError(
        error && error.message
          ? error.message
          : "頁面初始化失敗。"
      );
    }
  }

  global.NearbyParkingPage =
    Object.freeze({
      init,
      searchNearbyParking,
      requestOneTimeLocation
    });

  document.addEventListener(
    "DOMContentLoaded",
    init
  );
})(window);
