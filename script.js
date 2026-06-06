/**
 * script.js
 * 高雄停車推薦網站：首頁控制程式
 *
 * 本檔案只服務 index.html。
 *
 * 首頁功能：
 * 1. 顯示已完成測試並正式開放的熱門地點
 * 2. 搜尋熱門地點
 * 3. 按下「查看附近停車場」後取得一次性定位
 * 4. 將座標帶至 nearby.html
 *
 * 隱私原則：
 * - 不使用 watchPosition
 * - 不持續追蹤位置
 * - 不將座標存入 localStorage
 * - 不將座標存入 sessionStorage
 * - 座標只透過網址參數暫時帶入 nearby.html
 * - nearby.js 讀取後會立即移除網址中的座標參數
 */

(function (global) {
  "use strict";

  const SELECTORS = Object.freeze({
    searchInput: "#hotspot-search-input",
    searchButton: "#hotspot-search-button",
    searchMessage: "#homepage-message",
    hotspotList: "#hotspot-list",
    nearbyButton: "#view-nearby-button",
    locationStatus: "#location-status"
  });

  const GEOLOCATION_OPTIONS = Object.freeze({
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0
  });

  /**
   * 若定位誤差超過 500 公尺，
   * 不直接帶使用者進入附近停車場頁面。
   */
  const MAXIMUM_ACCEPTED_ACCURACY_METERS = 500;

  /**
   * 高雄市及周邊合理座標範圍。
   * 用來避免定位偏移或使用者位於服務範圍外。
   */
  const KAOHSIUNG_BOUNDS = Object.freeze({
    minLatitude: 22.45,
    maxLatitude: 23.55,
    minLongitude: 120.0,
    maxLongitude: 120.95
  });

  let enabledHotspots = [];
  let isLocating = false;

  function getElement(selector) {
    return document.querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[／/｜|、，,。．.（）()－\-_]/g, "");
  }

  function buildSearchableText(hotspot) {
    return normalizeText(
      [
        hotspot.name,
        hotspot.title,
        hotspot.category,
        ...(Array.isArray(hotspot.keywords)
          ? hotspot.keywords
          : [])
      ].join(" ")
    );
  }

  function setSearchMessage(message, type) {
    const element = getElement(
      SELECTORS.searchMessage
    );

    if (!element) {
      return;
    }

    element.textContent = message || "";
    element.dataset.statusType = type || "info";
    element.hidden = !message;
  }

  function setLocationStatus(message, type) {
    const element = getElement(
      SELECTORS.locationStatus
    );

    if (!element) {
      return;
    }

    element.textContent = message || "";
    element.dataset.statusType = type || "info";
    element.hidden = !message;
  }

  function setNearbyButtonBusy(isBusy) {
    const button = getElement(
      SELECTORS.nearbyButton
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
      ? "正在取得目前位置…"
      : "查看附近停車場";
  }

  function createHotspotCardHtml(hotspot) {
    return `
      <a
        class="hotspot-card"
        href="${escapeHtml(hotspot.slug)}"
        aria-label="查看${escapeHtml(hotspot.title)}"
      >
        <div class="hotspot-card__content">
          <p class="hotspot-card__category">
            ${escapeHtml(hotspot.category)}
          </p>

          <h3 class="hotspot-card__title">
            ${escapeHtml(hotspot.name)}
          </h3>

          <p class="hotspot-card__intro">
            ${escapeHtml(hotspot.intro)}
          </p>
        </div>

        <span class="hotspot-card__action">
          查看附近停車場
        </span>
      </a>
    `.trim();
  }

  function renderHotspotList(hotspots) {
    const container = getElement(
      SELECTORS.hotspotList
    );

    if (!container) {
      return;
    }

    if (
      !Array.isArray(hotspots) ||
      hotspots.length === 0
    ) {
      container.innerHTML = `
        <p class="empty-state">
          目前尚無已完成測試的熱門地點。
        </p>
      `.trim();

      return;
    }

    container.innerHTML = hotspots
      .map(createHotspotCardHtml)
      .join("\n");
  }

  function filterHotspots(query) {
    const normalizedQuery =
      normalizeText(query);

    if (!normalizedQuery) {
      return enabledHotspots.slice();
    }

    return enabledHotspots
      .map((hotspot) => {
        const searchableText =
          buildSearchableText(hotspot);

        const normalizedName =
          normalizeText(hotspot.name);

        const normalizedTitle =
          normalizeText(hotspot.title);

        let priority = 999;

        if (
          normalizedName === normalizedQuery ||
          normalizedTitle === normalizedQuery
        ) {
          priority = 1;
        } else if (
          normalizedName.startsWith(
            normalizedQuery
          ) ||
          normalizedTitle.startsWith(
            normalizedQuery
          )
        ) {
          priority = 2;
        } else if (
          searchableText.includes(
            normalizedQuery
          )
        ) {
          priority = 3;
        }

        return {
          hotspot,
          priority
        };
      })
      .filter(
        (item) => item.priority < 999
      )
      .sort(
        (a, b) => a.priority - b.priority
      )
      .map((item) => item.hotspot);
  }

  function handleSearchInput() {
    const input = getElement(
      SELECTORS.searchInput
    );

    if (!input) {
      return;
    }

    const query = input.value.trim();

    if (!query) {
      renderHotspotList(enabledHotspots);
      setSearchMessage("", "info");
      return;
    }

    const matches =
      filterHotspots(query);

    renderHotspotList(matches);

    if (matches.length === 0) {
      setSearchMessage(
        "目前尚未開放這個熱門地點。網站只顯示已完成即時資料測試的地點。",
        "warning"
      );

      return;
    }

    setSearchMessage(
      `找到 ${matches.length} 個已完成測試的熱門地點。`,
      "success"
    );
  }

  function handleSearchSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    const input = getElement(
      SELECTORS.searchInput
    );

    const query = input
      ? input.value.trim()
      : "";

    if (!query) {
      setSearchMessage(
        "請先輸入想前往的高雄熱門地點。",
        "warning"
      );

      if (input) {
        input.focus();
      }

      return;
    }

    const matches =
      filterHotspots(query);

    renderHotspotList(matches);

    if (matches.length === 0) {
      setSearchMessage(
        "目前尚未開放這個熱門地點。網站只顯示已完成即時資料測試的地點。",
        "warning"
      );

      return;
    }

    if (matches.length === 1) {
      global.location.href =
        matches[0].slug;

      return;
    }

    setSearchMessage(
      `找到 ${matches.length} 個已完成測試的熱門地點，請選擇要查看的地點。`,
      "success"
    );
  }

  function isCoordinateInsideKaohsiungBounds(
    latitude,
    longitude
  ) {
    return (
      latitude >=
        KAOHSIUNG_BOUNDS.minLatitude &&
      latitude <=
        KAOHSIUNG_BOUNDS.maxLatitude &&
      longitude >=
        KAOHSIUNG_BOUNDS.minLongitude &&
      longitude <=
        KAOHSIUNG_BOUNDS.maxLongitude
    );
  }

  function requestOneTimeLocation() {
    return new Promise(
      (resolve, reject) => {
        if (
          !("geolocation" in navigator)
        ) {
          reject(
            new Error(
              "目前瀏覽器不支援定位功能，請改用熱門地點搜尋。"
            )
          );

          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude:
                position.coords.latitude,

              longitude:
                position.coords.longitude,

              accuracy:
                position.coords.accuracy
            });
          },

          (error) => {
            if (
              error.code ===
              error.PERMISSION_DENIED
            ) {
              reject(
                new Error(
                  "尚未取得定位權限，請允許瀏覽器使用目前位置。"
                )
              );

              return;
            }

            if (
              error.code ===
              error.POSITION_UNAVAILABLE
            ) {
              reject(
                new Error(
                  "目前無法取得位置，請確認手機定位服務已開啟。"
                )
              );

              return;
            }

            if (
              error.code ===
              error.TIMEOUT
            ) {
              reject(
                new Error(
                  "定位等候時間過久，請移至訊號較佳的位置後再試一次。"
                )
              );

              return;
            }

            reject(
              new Error(
                "無法取得目前位置，請稍後再試。"
              )
            );
          },

          GEOLOCATION_OPTIONS
        );
      }
    );
  }

  function buildNearbyUrl(location) {
    const params =
      new URLSearchParams({
        lat: String(
          location.latitude
        ),

        lng: String(
          location.longitude
        ),

        accuracy: String(
          location.accuracy ?? ""
        )
      });

    return `nearby.html?${params.toString()}`;
  }

  async function handleNearbyButtonClick() {
    if (isLocating) {
      return;
    }

    isLocating = true;

    setNearbyButtonBusy(true);

    setLocationStatus(
      "正在取得目前位置…",
      "info"
    );

    try {
      const location =
        await requestOneTimeLocation();

      if (
        !isCoordinateInsideKaohsiungBounds(
          location.latitude,
          location.longitude
        )
      ) {
        throw new Error(
          "目前位置不在高雄市服務範圍內，請改用熱門地點搜尋。"
        );
      }

      if (
        Number.isFinite(
          location.accuracy
        ) &&
        location.accuracy >
          MAXIMUM_ACCEPTED_ACCURACY_METERS
      ) {
        throw new Error(
          `目前定位誤差約 ±${Math.round(
            location.accuracy
          )} 公尺，精準度不足。請移至較空曠處後再試一次。`
        );
      }

      setLocationStatus(
        `已取得目前位置，定位誤差約 ±${Math.round(
          location.accuracy || 0
        )} 公尺。正在開啟附近停車場…`,
        "success"
      );

      global.location.href =
        buildNearbyUrl(location);
    } catch (error) {
      setLocationStatus(
        error && error.message
          ? error.message
          : "暫時無法取得目前位置，請稍後再試。",
        "warning"
      );

      setNearbyButtonBusy(false);

      isLocating = false;
    }
  }

  function attachSearchSuggestions() {
    const input = getElement(
      SELECTORS.searchInput
    );

    if (!input) {
      return;
    }

    let dataList =
      document.querySelector(
        "#hotspot-search-suggestions"
      );

    if (!dataList) {
      dataList =
        document.createElement(
          "datalist"
        );

      dataList.id =
        "hotspot-search-suggestions";

      document.body.appendChild(
        dataList
      );
    }

    dataList.innerHTML =
      enabledHotspots
        .map(
          (hotspot) =>
            `<option value="${escapeHtml(
              hotspot.name
            )}"></option>`
        )
        .join("\n");

    input.setAttribute(
      "list",
      dataList.id
    );
  }

  function bindEvents() {
    const searchInput = getElement(
      SELECTORS.searchInput
    );

    const searchButton = getElement(
      SELECTORS.searchButton
    );

    const nearbyButton = getElement(
      SELECTORS.nearbyButton
    );

    if (searchInput) {
      searchInput.addEventListener(
        "input",
        handleSearchInput
      );

      searchInput.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter") {
            handleSearchSubmit(event);
          }
        }
      );
    }

    if (searchButton) {
      searchButton.addEventListener(
        "click",
        handleSearchSubmit
      );
    }

    if (nearbyButton) {
      nearbyButton.addEventListener(
        "click",
        handleNearbyButtonClick
      );
    }
  }

  function init() {
    if (
      !global.KaohsiungParkingData
    ) {
      console.error(
        "KaohsiungParkingData 尚未載入。請確認 index.html 已先引用 data.js。"
      );

      return;
    }

    enabledHotspots =
      global.KaohsiungParkingData
        .getEnabledHotspots();

    renderHotspotList(
      enabledHotspots
    );

    attachSearchSuggestions();

    bindEvents();
  }

  global.KaohsiungParkingHomepage =
    Object.freeze({
      init,
      filterHotspots,
      requestOneTimeLocation,
      buildNearbyUrl
    });

  document.addEventListener(
    "DOMContentLoaded",
    init
  );
})(window);
