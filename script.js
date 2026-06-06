/**
 * script.js
 * 高雄熱門地點停車推薦網站：首頁控制程式
 *
 * 本檔案只服務 index.html。
 *
 * 責任：
 * 1. 顯示已通過測試並啟用的熱門地點
 * 2. 提供首頁地點搜尋
 * 3. 提供關鍵字比對
 * 4. 讓使用者主動取得一次性定位
 * 5. 將目前座標帶至 nearby.html
 *
 * 本檔案不得再處理：
 * - 熱門地點頁面即時資料
 * - TDX 停車場資料
 * - 人工整理停車場 lots
 * - 路邊停車 roads
 * - 人工價格
 * - 付款方式
 * - 車牌辨識
 * - 舊版停車卡片
 */

(function (global) {
  "use strict";

  /**
   * 首頁可能仍保留部分舊版 HTML。
   *
   * 為避免改檔過程中因 id 名稱略有不同而整頁失效，
   * 這裡允許依序尋找多種常見選擇器。
   *
   * 後續整理 index.html 時，
   * 將統一改用每組第一個正式 id。
   */
  const SELECTORS = Object.freeze({
    searchInput: [
      "#hotspot-search-input",
      "#search-input",
      "#location-search",
      "#searchInput",
      "input[type='search']"
    ],

    searchButton: [
      "#hotspot-search-button",
      "#search-button",
      "#searchButton",
      "button[data-action='search-hotspot']"
    ],

    hotspotList: [
      "#hotspot-list",
      "#popular-hotspots",
      "#location-list",
      "#hotspot-results"
    ],

    searchMessage: [
      "#homepage-message",
      "#search-message",
      "#search-status"
    ],

    useCurrentLocationButton: [
      "#use-current-location-button",
      "#current-location-button",
      "#location-button",
      "button[data-action='use-current-location']"
    ],

    locationStatus: [
      "#location-status",
      "#current-location-status",
      "#geolocation-status"
    ],

    viewNearbyButton: [
      "#view-nearby-button",
      "#open-nearby-button",
      "a[data-action='view-nearby']",
      "button[data-action='view-nearby']"
    ]
  });

  const LOCATION_OPTIONS = Object.freeze({
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0
  });

  /**
   * 定位誤差超過 500 公尺時，
   * 不直接帶使用者前往附近停車場頁面。
   */
  const MAXIMUM_ACCEPTED_ACCURACY_METERS = 500;

  let enabledHotspots = [];
  let currentLocation = null;

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
   * 避免資料內容破壞 HTML。
   */
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * 統一搜尋文字格式。
   */
  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[／/｜|、，,。．.（）()－\-_]/g, "");
  }

  /**
   * 將熱門地點資料轉換為可搜尋文字。
   */
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

  /**
   * 顯示首頁訊息。
   */
  function setHomepageMessage(message, type) {
    const element = findElement(
      SELECTORS.searchMessage
    );

    if (!element) {
      return;
    }

    element.textContent = message || "";

    element.dataset.statusType =
      type || "info";

    element.hidden = !message;
  }

  /**
   * 顯示定位狀態。
   */
  function setLocationStatus(message, type) {
    const element = findElement(
      SELECTORS.locationStatus
    );

    if (!element) {
      return;
    }

    element.textContent = message || "";

    element.dataset.statusType =
      type || "info";

    element.hidden = !message;
  }

  /**
   * 顯示按鈕忙碌狀態。
   */
  function setLocationButtonBusy(isBusy) {
    const button = findElement(
      SELECTORS.useCurrentLocationButton
    );

    if (!button) {
      return;
    }

    button.disabled = isBusy;

    button.setAttribute(
      "aria-busy",
      String(isBusy)
    );

    button.textContent = isBusy
      ? "正在取得目前位置…"
      : "使用目前位置";
  }

  /**
   * 熱門地點卡片。
   */
  function createHotspotCardHtml(hotspot) {
    return `
      <a
        class="hotspot-card"
        href="${escapeHtml(hotspot.slug)}"
        aria-label="查看${escapeHtml(
          hotspot.title
        )}"
      >
        <div class="hotspot-card__content">
          <p class="hotspot-card__category">
            ${escapeHtml(
              hotspot.category
            )}
          </p>

          <h3 class="hotspot-card__title">
            ${escapeHtml(
              hotspot.name
            )}
          </h3>

          <p class="hotspot-card__intro">
            ${escapeHtml(
              hotspot.intro
            )}
          </p>
        </div>

        <span class="hotspot-card__action">
          查看附近停車場
        </span>
      </a>
    `.trim();
  }

  /**
   * 顯示熱門地點清單。
   */
  function renderHotspotList(hotspots) {
    const container = findElement(
      SELECTORS.hotspotList
    );

    if (!container) {
      return;
    }

    if (!Array.isArray(hotspots)) {
      container.innerHTML = "";
      return;
    }

    if (hotspots.length === 0) {
      container.innerHTML = `
        <p class="empty-state">
          目前沒有符合條件且已完成測試的熱門地點。
        </p>
      `.trim();

      return;
    }

    container.innerHTML = hotspots
      .map(createHotspotCardHtml)
      .join("\n");
  }

  /**
   * 搜尋已啟用熱門地點。
   *
   * 尚未測試通過的地點不會出現在首頁，
   * 也不會透過搜尋入口提前公開。
   */
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
          normalizedName ===
            normalizedQuery ||
          normalizedTitle ===
            normalizedQuery
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
        (a, b) =>
          a.priority - b.priority
      )
      .map((item) => item.hotspot);
  }

  /**
   * 即時篩選首頁卡片。
   */
  function handleSearchInput() {
    const input = findElement(
      SELECTORS.searchInput
    );

    if (!input) {
      return;
    }

    const query = input.value.trim();

    const matches =
      filterHotspots(query);

    renderHotspotList(matches);

    if (!query) {
      setHomepageMessage("", "info");
      return;
    }

    if (matches.length === 0) {
      setHomepageMessage(
        "目前尚未開放這個熱門地點。網站只顯示已完成即時資料測試的地點。",
        "warning"
      );

      return;
    }

    setHomepageMessage(
      `找到 ${matches.length} 個已完成測試的熱門地點。`,
      "success"
    );
  }

  /**
   * 使用搜尋按鈕時：
   *
   * - 若只有一筆符合結果，直接進入該地點頁面。
   * - 若有多筆結果，留在首頁顯示篩選結果。
   * - 若查無已啟用地點，誠實顯示尚未開放。
   */
  function handleSearchSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    const input = findElement(
      SELECTORS.searchInput
    );

    const query = input
      ? input.value.trim()
      : "";

    const matches =
      filterHotspots(query);

    renderHotspotList(matches);

    if (!query) {
      setHomepageMessage(
        "請輸入想前往的高雄熱門地點。",
        "warning"
      );

      if (input) {
        input.focus();
      }

      return;
    }

    if (matches.length === 0) {
      setHomepageMessage(
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

    setHomepageMessage(
      `找到 ${matches.length} 個已完成測試的熱門地點，請選擇要查看的頁面。`,
      "success"
    );
  }

  /**
   * 確認座標是否落在高雄及周邊合理範圍。
   */
  function isCoordinateInsideKaohsiungBounds(
    latitude,
    longitude
  ) {
    const bounds =
      global.ParkingCore &&
      global.ParkingCore.DEFAULT_CONFIG
        ? global.ParkingCore.DEFAULT_CONFIG
            .kaohsiungBounds
        : {
            minLatitude: 22.45,
            maxLatitude: 23.55,
            minLongitude: 120.0,
            maxLongitude: 120.95
          };

    return (
      latitude >= bounds.minLatitude &&
      latitude <= bounds.maxLatitude &&
      longitude >= bounds.minLongitude &&
      longitude <= bounds.maxLongitude
    );
  }

  /**
   * 取得一次性定位。
   *
   * 不使用 watchPosition。
   * 不保存座標。
   * 不持續追蹤位置。
   */
  function requestOneTimeLocation() {
    return new Promise(
      (resolve, reject) => {
        if (
          !("geolocation" in navigator)
        ) {
          reject(
            new Error(
              "目前瀏覽器不支援定位功能。請改用熱門地點搜尋。"
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
                  "尚未取得定位權限。請允許瀏覽器使用目前位置，或改用熱門地點搜尋。"
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
                  "目前無法取得位置。請確認手機定位服務已開啟，再重新嘗試。"
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
                  "定位等候時間過久。請移至訊號較佳的位置後重新嘗試。"
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

          LOCATION_OPTIONS
        );
      }
    );
  }

  /**
   * 建立前往 nearby.html 的網址。
   *
   * 座標只會存在於網址參數中。
   * nearby.js 讀取後會立即從瀏覽器網址列移除。
   */
  function buildNearbyUrl(location) {
    const params = new URLSearchParams({
      lat: String(location.latitude),
      lng: String(location.longitude),
      accuracy: String(
        location.accuracy ?? ""
      )
    });

    return `nearby.html?${params.toString()}`;
  }

  /**
   * 顯示或建立「查看附近停車場」按鈕。
   */
  function prepareViewNearbyButton(location) {
    let button = findElement(
      SELECTORS.viewNearbyButton
    );

    const url = buildNearbyUrl(location);

    if (button) {
      if (
        button.tagName.toLowerCase() ===
        "a"
      ) {
        button.href = url;
      } else {
        button.onclick = () => {
          global.location.href = url;
        };
      }

      button.hidden = false;
      button.removeAttribute("disabled");

      return;
    }

    const status = findElement(
      SELECTORS.locationStatus
    );

    if (!status || !status.parentElement) {
      global.location.href = url;
      return;
    }

    button =
      document.createElement("a");

    button.id = "view-nearby-button";
    button.className =
      "view-nearby-button";

    button.href = url;

    button.textContent =
      "查看附近停車場";

    status.insertAdjacentElement(
      "afterend",
      button
    );
  }

  /**
   * 使用者主動按下定位按鈕。
   */
  async function handleUseCurrentLocation() {
    setLocationButtonBusy(true);

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
          "目前位置不在高雄市服務範圍內。請改用熱門地點搜尋。"
        );
      }

      if (
        Number.isFinite(location.accuracy) &&
        location.accuracy >
          MAXIMUM_ACCEPTED_ACCURACY_METERS
      ) {
        throw new Error(
          `目前定位誤差約 ±${Math.round(
            location.accuracy
          )} 公尺，精準度不足。請移至較空曠處重新定位，或改用熱門地點搜尋。`
        );
      }

      currentLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      };

      setLocationStatus(
        `已取得目前位置，定位誤差約 ±${Math.round(
          location.accuracy || 0
        )} 公尺。`,
        "success"
      );

      prepareViewNearbyButton(
        currentLocation
      );
    } catch (error) {
      currentLocation = null;

      setLocationStatus(
        error && error.message
          ? error.message
          : "暫時無法取得目前位置，請稍後再試。",
        "warning"
      );
    } finally {
      setLocationButtonBusy(false);
    }
  }

  /**
   * 加入搜尋自動完成提示。
   */
  function attachSearchSuggestions() {
    const input = findElement(
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

  /**
   * 綁定首頁操作。
   */
  function bindEvents() {
    const searchInput = findElement(
      SELECTORS.searchInput
    );

    const searchButton = findElement(
      SELECTORS.searchButton
    );

    const locationButton = findElement(
      SELECTORS.useCurrentLocationButton
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

    if (locationButton) {
      locationButton.addEventListener(
        "click",
        handleUseCurrentLocation
      );
    }
  }

  /**
   * 初始化首頁。
   */
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
