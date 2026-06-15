/**
 * hotspot-live.js
 * 高雄熱門地點停車推薦網站：熱門地點結果頁控制程式
 *
 * 責任：
 * 1. 依目前 HTML 檔名取得熱門地點固定座標
 * 2. 呼叫 ParkingCore 讀取與清洗即時路外停車資料
 * 3. 依距離由近到遠顯示最近 5 筆可靠停車場
 * 4. 顯示簡短狀態文字，不顯示停車場總筆數
 * 5. 保留重新整理功能
 */

(function (global) {
  "use strict";

  const elements = {};
  let currentHotspot = null;
  let isLoading = false;

  function getElements() {
    elements.title = document.querySelector("#hotspot-title");
    elements.intro = document.querySelector("#hotspot-intro");
    elements.retryButton = document.querySelector("#retry-parking-button");
    elements.liveStatus = document.querySelector("#live-status");
    elements.summary = document.querySelector("#parking-summary");
    elements.meta = document.querySelector("#parking-meta");
    elements.error = document.querySelector("#parking-error");
    elements.results = document.querySelector("#parking-results");
  }

  function setText(element, text) {
    if (element) {
      element.textContent = text || "";
    }
  }

  function clearError() {
    if (!elements.error) {
      return;
    }

    elements.error.textContent = "";
    elements.error.hidden = true;
  }

  function showError(message) {
    if (!elements.error) {
      return;
    }

    elements.error.textContent =
      message || "目前暫時無法取得最新車位資料，請稍後再試一次。";

    elements.error.hidden = false;
  }

  function clearResults() {
    if (elements.results) {
      elements.results.innerHTML = "";
    }

    setText(elements.summary, "");
    setText(elements.meta, "");
    clearError();
  }

  function setBusy(isBusy) {
    if (!elements.retryButton) {
      return;
    }

    elements.retryButton.disabled = Boolean(isBusy);
    elements.retryButton.setAttribute("aria-busy", String(Boolean(isBusy)));

    elements.retryButton.textContent = isBusy
      ? "正在整理…"
      : "重新整理";
  }

  function isUsableHotspot(hotspot) {
    return Boolean(
      hotspot &&
      hotspot.enabled === true &&
      hotspot.coordinateVerified === true &&
      Number.isFinite(hotspot.latitude) &&
      Number.isFinite(hotspot.longitude)
    );
  }

  function renderHeader(hotspot) {
    setText(elements.title, hotspot.title);
    setText(elements.intro, hotspot.intro);

    document.title = `${hotspot.title}｜附近即時空位與導航`;
  }

  function buildSummary(result) {
    if (!result || result.results.length === 0) {
      return "";
    }

    return "已更新附近停車場即時空位。以下空位僅顯示一般汽車位，實際車位仍以現場為準。";
  }

  function buildMeta(result) {
    const latest =
      result &&
      result.meta &&
      result.meta.latestReliableCollectTime;

    if (!latest) {
      return "資料取得時間：無法確認";
    }

    return `資料取得時間：${global.ParkingCore.formatLocalTime(latest)}`;
  }

  async function loadParking() {
    if (isLoading) {
      return;
    }

    if (!isUsableHotspot(currentHotspot)) {
      showError("這個熱門地點尚未完成即時停車資料測試。");
      return;
    }

    isLoading = true;
    clearResults();
    setBusy(true);

    setText(
      elements.liveStatus,
      "正在讀取附近路外停車場即時資料…"
    );

    try {
      const result = await global.ParkingCore.loadNearbyParking({
        center: {
          latitude: currentHotspot.latitude,
          longitude: currentHotspot.longitude
        },
        minimumResults: currentHotspot.minimumResults || 5,
        maximumResults: 5,
        initialRadiusMeters: currentHotspot.initialRadiusMeters || 800,
        maximumRadiusMeters: currentHotspot.maximumRadiusMeters || 3000
      });

      setText(
        elements.liveStatus,
        "已完成資料更新。系統會優先列出資料來源目前顯示仍有空位的附近停車場。現場狀況可能快速變動，請以停車場入口資訊為準。"
      );

      setText(elements.summary, buildSummary(result));
      setText(elements.meta, buildMeta(result));

      global.ParkingCore.renderParkingCards(
        elements.results,
        result.results
      );

      if (result.results.length === 0) {
        showError(
          "附近目前沒有符合條件且仍有空位的可靠路外停車場，請稍後再試一次。"
        );
      }
    } catch (error) {
      console.error(error);

      setText(
        elements.liveStatus,
        "即時停車資料讀取失敗。"
      );

      showError(
        error && error.userMessage
          ? error.userMessage
          : error && error.message
            ? error.message
            : "目前暫時無法取得最新車位資料，請稍後再試一次。"
      );
    } finally {
      isLoading = false;
      setBusy(false);
    }
  }

  function init() {
    getElements();

    try {
      if (!global.KaohsiungParkingData) {
        throw new Error("KaohsiungParkingData 尚未載入。");
      }

      if (!global.ParkingCore) {
        throw new Error("ParkingCore 尚未載入。");
      }

      currentHotspot =
        global.KaohsiungParkingData.findByCurrentPage();

      if (!currentHotspot) {
        throw new Error("找不到目前熱門地點的設定資料。");
      }

      renderHeader(currentHotspot);

      if (elements.retryButton) {
        elements.retryButton.addEventListener(
          "click",
          loadParking
        );
      }

      loadParking();
    } catch (error) {
      console.error(error);

      setText(
        elements.liveStatus,
        "頁面初始化失敗。"
      );

      showError(
        error && error.message
          ? error.message
          : "頁面初始化失敗。"
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})(window);
