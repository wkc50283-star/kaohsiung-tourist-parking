/**
 * hotspot-live.js
 * 高雄熱門地點停車推薦網站：熱門地點頁面控制程式
 *
 * 本檔案只服務熱門地點 HTML 頁面。
 *
 * 責任：
 * 1. 依目前 HTML 檔名找出對應熱門地點
 * 2. 驗證該地點是否已完成測試並啟用
 * 3. 使用熱門地點固定座標呼叫 ParkingCore
 * 4. 顯示可靠路外停車場數量、搜尋半徑與更新時間
 * 5. 將停車場依距離由近到遠排列
 *
 * 本檔案不得處理：
 * - 首頁搜尋
 * - 使用者定位
 * - watchPosition
 * - 路邊停車格
 * - 人工整理的舊版靜態停車場
 * - 人工價格
 * - 付款方式
 * - 車牌辨識
 */

(function (global) {
  "use strict";

  /**
   * 為了讓舊版 HTML 過渡到正式樣板時不會立即失效，
   * 這裡暫時允許尋找多組常見 id。
   *
   * 第 7 步整理 pier2-parking.html 時，
   * 會統一改用每組第一個正式 id。
   */
  const SELECTORS = Object.freeze({
    pageTitle: [
      "#hotspot-title",
      "#page-title",
      "h1"
    ],

    pageIntro: [
      "#hotspot-intro",
      "#page-intro",
      ".page-intro"
    ],

    liveStatus: [
      "#live-status",
      "#parking-status",
      "#hotspot-live-status"
    ],

    parkingSummary: [
      "#parking-summary",
      "#live-parking-summary",
      "#result-summary"
    ],

    parkingMeta: [
      "#parking-meta",
      "#live-parking-meta",
      "#result-meta"
    ],

    parkingError: [
      "#parking-error",
      "#live-parking-error",
      "#result-error"
    ],

    parkingResults: [
      "#parking-results",
      "#live-parking-results",
      "#parking-list"
    ],

    retryButton: [
      "#retry-parking-button",
      "#retry-button",
      "button[data-action='retry-parking']"
    ]
  });

  let hotspot = null;
  let isLoading = false;

  /**
   * 找到第一個存在的 HTML 元素。
   */
  function findElement(selectorCandidates) {
    for (const selector of selectorCandidates) {
      const element = document.querySelector(selector);

      if (element) {
        return element;
      }
    }

    return null;
  }

  /**
   * 顯示純文字內容。
   */
  function setText(selectorCandidates, text) {
    const element = findElement(selectorCandidates);

    if (!element) {
      return;
    }

    element.textContent = text || "";
  }

  /**
   * 控制元素顯示或隱藏。
   */
  function setHidden(selectorCandidates, hidden) {
    const element = findElement(selectorCandidates);

    if (!element) {
      return;
    }

    element.hidden = Boolean(hidden);
  }

  /**
   * 清除舊結果。
   */
  function clearResults() {
    const results = findElement(
      SELECTORS.parkingResults
    );

    if (results) {
      results.innerHTML = "";
    }

    setText(SELECTORS.parkingSummary, "");
    setText(SELECTORS.parkingMeta, "");
    setText(SELECTORS.parkingError, "");
    setHidden(SELECTORS.parkingError, true);
  }

  /**
   * 顯示錯誤訊息。
   */
  function showError(message) {
    setText(
      SELECTORS.parkingError,
      message ||
        "暫時無法取得停車場資料，請稍後再試。"
    );

    setHidden(SELECTORS.parkingError, false);
  }

  /**
   * 控制重新整理按鈕狀態。
   */
  function setRetryButtonBusy(isBusy) {
    const button = findElement(
      SELECTORS.retryButton
    );

    if (!button) {
      return;
    }

    button.disabled = Boolean(isBusy);

    button.setAttribute(
      "aria-busy",
      String(Boolean(isBusy))
    );

    button.textContent = isBusy
      ? "正在重新整理…"
      : "重新整理即時資料";
  }

  /**
   * 填入熱門地點名稱與簡短說明。
   */
  function renderHotspotHeader(currentHotspot) {
    setText(
      SELECTORS.pageTitle,
      currentHotspot.title
    );

    setText(
      SELECTORS.pageIntro,
      currentHotspot.intro
    );

    document.title =
      `${currentHotspot.title}｜附近剩餘空位與導航`;
  }

  /**
   * 檢查固定座標是否有效。
   */
  function hasVerifiedCoordinate(currentHotspot) {
    return (
      currentHotspot &&
      currentHotspot.coordinateVerified === true &&
      Number.isFinite(currentHotspot.latitude) &&
      Number.isFinite(currentHotspot.longitude)
    );
  }

  /**
   * 檢查熱門地點是否允許公開。
   */
  function isHotspotEnabled(currentHotspot) {
    return (
      currentHotspot &&
      currentHotspot.enabled === true &&
      currentHotspot.indexable === true &&
      hasVerifiedCoordinate(currentHotspot)
    );
  }

  /**
   * 建立搜尋結果摘要。
   */
  function buildSummary(result) {
    const resultCount =
      result.reliableResultsWithinRadius;

    const radius =
      global.ParkingCore.formatDistance(
        result.radiusMeters
      );

    if (result.minimumResultsReached) {
      return (
        `搜尋範圍約 ${radius}，` +
        `共找到 ${resultCount} 筆可靠且仍有空位的路外停車場。`
      );
    }

    return (
      `搜尋範圍已擴大至 ${radius}，` +
      `目前僅找到 ${resultCount} 筆可靠且仍有空位的路外停車場。` +
      `本站不會使用不可靠資料硬湊備案。`
    );
  }

  /**
   * 建立即時資料資訊。
   */
  function buildMeta(result) {
    const latestTime =
      result.meta.latestReliableCollectTime;

    if (!latestTime) {
      return "即時資料更新時間：無法確認";
    }

    return (
      "即時資料更新時間：" +
      global.ParkingCore.formatLocalTime(
        latestTime
      )
    );
  }

  /**
   * 顯示載入中的狀態。
   */
  function showLoadingState() {
    setText(
      SELECTORS.liveStatus,
      "正在讀取附近路外停車場即時資料…"
    );
  }

  /**
   * 顯示完成狀態。
   */
  function showCompletedState() {
    setText(
      SELECTORS.liveStatus,
      "已完成即時資料更新。停車場依距離由近到遠排列。"
    );
  }

  /**
   * 顯示尚未開放狀態。
   */
  function showDisabledState() {
    clearResults();

    setText(
      SELECTORS.liveStatus,
      "這個熱門地點尚未完成即時停車資料測試。"
    );

    showError(
      "目前尚未開放這個熱門地點。網站只公開已完成座標核對、資料品質檢查與實際導航測試的頁面。"
    );
  }

  /**
   * 載入熱門地點附近停車場。
   */
  async function loadHotspotParking() {
    if (isLoading) {
      return;
    }

    if (!hotspot) {
      showError(
        "找不到這個熱門地點的設定資料。"
      );

      return;
    }

    if (!isHotspotEnabled(hotspot)) {
      showDisabledState();
      return;
    }

    isLoading = true;

    setRetryButtonBusy(true);
    clearResults();
    showLoadingState();

    try {
      const result =
        await global.ParkingCore.loadNearbyParking({
          center: {
            latitude: hotspot.latitude,
            longitude: hotspot.longitude
          },

          minimumResults:
            hotspot.minimumResults,

          initialRadiusMeters:
            hotspot.initialRadiusMeters,

          maximumRadiusMeters:
            hotspot.maximumRadiusMeters
        });

      setText(
        SELECTORS.parkingSummary,
        buildSummary(result)
      );

      setText(
        SELECTORS.parkingMeta,
        buildMeta(result)
      );

      global.ParkingCore.renderParkingCards(
        findElement(SELECTORS.parkingResults),
        result.results
      );

      showCompletedState();

      if (result.results.length === 0) {
        showError(
          "這個熱門地點附近目前沒有符合條件且仍有空位的可靠路外停車場。請稍後再試。"
        );
      }
    } catch (error) {
      const message =
        error && error.userMessage
          ? error.userMessage
          : error && error.message
            ? error.message
            : "暫時無法取得附近停車場資料，請稍後再試。";

      setText(
        SELECTORS.liveStatus,
        "即時停車資料讀取失敗。"
      );

      showError(message);
    } finally {
      isLoading = false;
      setRetryButtonBusy(false);
    }
  }

  /**
   * 綁定重新整理按鈕。
   */
  function bindRetryButton() {
    const button = findElement(
      SELECTORS.retryButton
    );

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      loadHotspotParking
    );
  }

  /**
   * 驗證必要模組是否已載入。
   */
  function assertDependencies() {
    if (!global.KaohsiungParkingData) {
      throw new Error(
        "KaohsiungParkingData 尚未載入。請確認熱門地點頁已先引用 data.js。"
      );
    }

    if (!global.ParkingCore) {
      throw new Error(
        "ParkingCore 尚未載入。請確認熱門地點頁已先引用 parking-core.js。"
      );
    }

    if (!findElement(SELECTORS.parkingResults)) {
      throw new Error(
        "找不到停車場結果顯示區塊。"
      );
    }
  }

  /**
   * 初始化熱門地點頁面。
   */
  function init() {
    try {
      assertDependencies();

      hotspot =
        global.KaohsiungParkingData
          .findByCurrentPage();

      if (!hotspot) {
        showError(
          "找不到這個熱門地點的設定資料。"
        );

        return;
      }

      renderHotspotHeader(hotspot);

      bindRetryButton();

      loadHotspotParking();
    } catch (error) {
      console.error(error);

      showError(
        error && error.message
          ? error.message
          : "熱門地點頁面初始化失敗。"
      );
    }
  }

  /**
   * 對外提供少量必要功能，
   * 方便後續除錯與測試。
   */
  global.HotspotLivePage =
    Object.freeze({
      init,
      loadHotspotParking
    });

  document.addEventListener(
    "DOMContentLoaded",
    init
  );
})(window);
