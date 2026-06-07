/**
 * nearby.js
 * 高雄熱門地點停車推薦網站：目前位置附近停車場頁控制程式
 *
 * 責任：
 * 1. 讀取首頁暫存在 sessionStorage 的一次性定位
 * 2. 若沒有可用定位，顯示「查看附近停車場」按鈕
 * 3. 呼叫 ParkingCore 讀取、清洗並排序附近路外停車場
 * 4. 顯示最近 5 筆可靠且仍有空位的停車場
 * 5. 保留重新定位功能
 *
 * 注意：
 * - 不會持續追蹤位置
 * - 不會將座標傳送到網站伺服器
 * - 關閉分頁後，sessionStorage 會清除
 */

(function (global) {
  "use strict";

  const LOCATION_STORAGE_KEY = "parking_user_location";
  const LOCATION_MAX_AGE_MS = 15 * 60 * 1000;
  const DEFAULT_PROMPT_TEXT =
    "按下按鈕後，瀏覽器只會取得一次目前位置，不會持續追蹤或保存定位紀錄。";

  const elements = {};
  let currentLocation = null;
  let isLoading = false;
  let isLocating = false;

  function getElements() {
    elements.locationPrompt = document.querySelector("#location-prompt");

    elements.promptIntro = elements.locationPrompt
      ? elements.locationPrompt.querySelector(".result-page-intro")
      : null;

    elements.parkingSection = document.querySelector("#parking-section");
    elements.locateButton = document.querySelector("#locate-button");
    elements.relocateButton = document.querySelector("#relocate-button");
    elements.locationStatus = document.querySelector("#location-status");
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
      message ||
      "目前暫時無法取得附近停車場資料，請稍後再試。";

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

  function setPromptVisible(isVisible, message) {
    if (elements.locationPrompt) {
      elements.locationPrompt.hidden = !isVisible;
    }

    setText(
      elements.promptIntro,
      message || DEFAULT_PROMPT_TEXT
    );
  }

  function setParkingSectionVisible(isVisible) {
    if (elements.parkingSection) {
      elements.parkingSection.hidden = !isVisible;
    }
  }

  function setButtonBusy(button, isBusy, busyText, normalText) {
    if (!button) {
      return;
    }

    button.disabled = Boolean(isBusy);

    button.setAttribute(
      "aria-busy",
      String(Boolean(isBusy))
    );

    button.textContent = isBusy
      ? busyText
      : normalText;
  }

  function setLocateButtonsBusy(isBusy) {
    setButtonBusy(
      elements.locateButton,
      isBusy,
      "定位中…",
      "查看附近停車場"
    );

    setButtonBusy(
      elements.relocateButton,
      isBusy,
      "定位中…",
      "重新定位"
    );
  }

  function parseStoredLocation() {
    try {
      const raw = sessionStorage.getItem(
        LOCATION_STORAGE_KEY
      );

      if (!raw) {
        return null;
      }

      const stored = JSON.parse(raw);

      const latitude = Number(stored.lat);
      const longitude = Number(stored.lng);

      const accuracy = Math.max(
        0,
        Math.round(Number(stored.accuracy) || 0)
      );

      const updatedAt = Number(stored.updatedAt);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(updatedAt)
      ) {
        return null;
      }

      if (
        Date.now() - updatedAt >
        LOCATION_MAX_AGE_MS
      ) {
        return null;
      }

      return {
        latitude,
        longitude,
        accuracy,
        updatedAt
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function saveCurrentLocation(position) {
    const latitude = Number(
      position.coords.latitude
    );

    const longitude = Number(
      position.coords.longitude
    );

    const accuracy = Math.max(
      0,
      Math.round(
        Number(position.coords.accuracy) || 0
      )
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error("定位座標格式錯誤。");
    }

    const location = {
      latitude,
      longitude,
      accuracy,
      updatedAt: Date.now()
    };

    sessionStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy,
        updatedAt: location.updatedAt
      })
    );

    return location;
  }

  function getLocationErrorMessage(error) {
    if (!error) {
      return "目前無法取得位置，請稍後再試。";
    }

    const messages = {
      1: "尚未允許定位權限。請允許定位後，再按一次查看附近停車場。",
      2: "目前無法取得位置。請移至訊號較好的位置後，再試一次。",
      3: "定位逾時。請再按一次查看附近停車場。"
    };

    return (
      messages[error.code] ||
      "目前無法取得位置，請稍後再試。"
    );
  }

  function formatAccuracy(location) {
    if (!location || !location.accuracy) {
      return "";
    }

    return `，定位誤差約 ±${location.accuracy} 公尺`;
  }

  function buildMeta(result) {
    const latest =
      result &&
      result.meta &&
      result.meta.latestReliableCollectTime;

    if (!latest) {
      return "即時資料更新時間：無法確認";
    }

    return (
      "即時資料更新時間：" +
      global.ParkingCore.formatLocalTime(latest)
    );
  }

  async function loadNearbyParking() {
    if (isLoading || !currentLocation) {
      return;
    }

    isLoading = true;
    clearResults();

    setText(
      elements.locationStatus,
      `已取得目前位置${formatAccuracy(
        currentLocation
      )}。正在讀取附近路外停車場即時資料…`
    );

    try {
      const result =
        await global.ParkingCore.loadNearbyParking({
          center: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude
          },
          minimumResults: 5,
          maximumResults: 5,
          initialRadiusMeters: 800,
          maximumRadiusMeters: 3000
        });

      setText(
        elements.locationStatus,
        `已取得目前位置${formatAccuracy(
          currentLocation
        )}。停車場依距離目前位置由近到遠排列。`
      );

      setText(
        elements.summary,
        "已更新附近停車場即時空位。"
      );

      setText(
        elements.meta,
        buildMeta(result)
      );

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
        elements.locationStatus,
        "附近停車場資料讀取失敗。"
      );

      showError(
        error && error.userMessage
          ? error.userMessage
          : error && error.message
            ? error.message
            : "目前暫時無法取得附近停車場資料，請稍後再試。"
      );
    } finally {
      isLoading = false;
    }
  }

  function locateAndLoad() {
    if (isLocating) {
      return;
    }

    if (!navigator.geolocation) {
      clearResults();

      setParkingSectionVisible(false);

      setPromptVisible(
        true,
        "這台裝置或瀏覽器暫不支援定位，請回首頁改用熱門地點搜尋。"
      );

      return;
    }

    isLocating = true;

    clearResults();
    setPromptVisible(false);
    setParkingSectionVisible(true);
    setLocateButtonsBusy(true);

    setText(
      elements.locationStatus,
      "正在取得目前位置，瀏覽器只會讀取一次定位。"
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          currentLocation =
            saveCurrentLocation(position);

          await loadNearbyParking();
        } catch (error) {
          console.error(error);

          showError(
            "無法暫存目前位置，請重新操作。"
          );
        } finally {
          isLocating = false;
          setLocateButtonsBusy(false);
        }
      },

      (error) => {
        isLocating = false;
        setLocateButtonsBusy(false);
        clearResults();

        setParkingSectionVisible(false);

        setPromptVisible(
          true,
          getLocationErrorMessage(error)
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  function showLocationPrompt() {
    clearResults();
    setParkingSectionVisible(false);
    setPromptVisible(true);
  }

  function bindEvents() {
    if (elements.locateButton) {
      elements.locateButton.addEventListener(
        "click",
        locateAndLoad
      );
    }

    if (elements.relocateButton) {
      elements.relocateButton.addEventListener(
        "click",
        locateAndLoad
      );
    }
  }

  function init() {
    getElements();
    bindEvents();

    if (!global.ParkingCore) {
      setPromptVisible(false);
      setParkingSectionVisible(true);

      showError(
        "ParkingCore 尚未載入，請重新整理頁面。"
      );

      return;
    }

    currentLocation = parseStoredLocation();

    if (!currentLocation) {
      showLocationPrompt();
      return;
    }

    setPromptVisible(false);
    setParkingSectionVisible(true);

    loadNearbyParking();
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
