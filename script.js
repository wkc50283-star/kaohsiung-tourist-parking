/**
 * script.js
 * 高雄熱門地點停車推薦網站：首頁控制程式
 *
 * 責任：
 * 1. 處理熱門地點搜尋
 * 2. 處理首頁「查看附近停車場」按鈕
 * 3. 由使用者主動操作後，取得一次目前位置
 * 4. 將座標暫存在 sessionStorage
 * 5. 前往 nearby.html
 *
 * 注意：
 * - 不會持續追蹤位置
 * - 不會將座標傳送到網站伺服器
 * - 關閉分頁後，sessionStorage 會清除
 */

(function (global) {
  "use strict";

  const LOCATION_STORAGE_KEY = "parking_user_location";

  function getElement(selector) {
    return document.querySelector(selector);
  }

  function setMessage(element, message) {
    if (!element) {
      return;
    }

    element.textContent = message || "";
    element.hidden = !message;
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(
        /停車場|停車|即時|推薦|附近|高雄市|高雄|\s|\/|／|、|，|,|。/g,
        ""
      )
      .trim();
  }

  function getAllHotspots() {
    if (
      !global.KaohsiungParkingData ||
      typeof global.KaohsiungParkingData.getAllHotspots !== "function"
    ) {
      return [];
    }

    return global.KaohsiungParkingData.getAllHotspots();
  }

  function isHotspotReady(hotspot) {
    return Boolean(
      hotspot &&
      hotspot.enabled === true &&
      hotspot.coordinateVerified === true &&
      Number.isFinite(hotspot.latitude) &&
      Number.isFinite(hotspot.longitude) &&
      hotspot.slug
    );
  }

  function findHotspot(query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return null;
    }

    return getAllHotspots().find((hotspot) => {
      const searchableValues = [
        hotspot.name,
        hotspot.title,
        ...(Array.isArray(hotspot.keywords)
          ? hotspot.keywords
          : [])
      ];

      return searchableValues.some((value) => {
        const normalizedValue = normalizeText(value);

        return (
          normalizedValue &&
          (
            normalizedValue.includes(normalizedQuery) ||
            normalizedQuery.includes(normalizedValue)
          )
        );
      });
    }) || null;
  }

  function submitHotspotSearch() {
    const input = getElement("#hotspot-search-input");
    const message = getElement("#homepage-message");

    if (!input) {
      return;
    }

    const query = input.value.trim();

    if (!query) {
      setMessage(message, "請先輸入想前往的高雄地點。");
      input.focus();
      return;
    }

    const hotspot = findHotspot(query);

    if (!hotspot) {
      setMessage(
        message,
        "目前尚未整理這個地點，請改用「查看附近停車場」。"
      );
      return;
    }

    if (!isHotspotReady(hotspot)) {
      setMessage(
        message,
        "這個熱門地點尚未完成即時資料測試，請改用「查看附近停車場」。"
      );
      return;
    }

    setMessage(message, "");
    global.location.href = hotspot.slug;
  }

  function getLocationErrorMessage(error) {
    if (!error) {
      return "目前無法取得位置，請稍後再試。";
    }

    const messages = {
      1: "你尚未允許定位權限，請允許定位後再試一次。",
      2: "目前無法取得位置，請稍後再試一次。",
      3: "定位逾時，請再試一次。"
    };

    return messages[error.code] ||
      "目前無法取得位置，請稍後再試一次。";
  }

  function saveCurrentLocation(position) {
    const latitude = Number(position.coords.latitude);
    const longitude = Number(position.coords.longitude);
    const accuracy = Math.round(
      Number(position.coords.accuracy) || 0
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error("定位座標格式錯誤。");
    }

    sessionStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({
        lat: latitude,
        lng: longitude,
        accuracy,
        updatedAt: Date.now()
      })
    );
  }

  function restoreNearbyButton(button) {
    if (!button) {
      return;
    }

    button.disabled = false;
    button.textContent = "查看附近停車場";
  }

  function openNearbyParking() {
    const button = getElement("#view-nearby-button");
    const status = getElement("#location-status");

    if (!button) {
      return;
    }

    if (!navigator.geolocation) {
      setMessage(
        status,
        "這台裝置或瀏覽器暫不支援定位，請改用熱門地點搜尋。"
      );
      return;
    }

    button.disabled = true;
    button.textContent = "定位中…";

    setMessage(
      status,
      "正在取得目前位置，瀏覽器只會讀取一次定位。"
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          saveCurrentLocation(position);

          setMessage(
            status,
            "已取得目前位置，正在開啟附近停車場。"
          );

          global.location.href = "nearby.html";
        } catch (error) {
          console.error(error);

          setMessage(
            status,
            "無法暫存目前位置，請重新操作。"
          );

          restoreNearbyButton(button);
        }
      },

      (error) => {
        setMessage(
          status,
          getLocationErrorMessage(error)
        );

        restoreNearbyButton(button);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  function bindSearch() {
    const input = getElement("#hotspot-search-input");
    const button = getElement("#hotspot-search-button");

    if (button) {
      button.addEventListener(
        "click",
        submitHotspotSearch
      );
    }

    if (input) {
      input.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submitHotspotSearch();
          }
        }
      );
    }
  }

  function bindNearbyButton() {
    const button = getElement("#view-nearby-button");

    if (button) {
      button.addEventListener(
        "click",
        openNearbyParking
      );
    }
  }

  function init() {
    bindSearch();
    bindNearbyButton();
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
