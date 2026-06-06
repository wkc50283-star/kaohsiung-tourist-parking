function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/停車場|停車|即時|推薦|景點|地點|\s/g, "");
}

function findSiteBySlug() {
  const fileName =
    location.pathname.split("/").pop() ||
    "index.html";

  return SITES.find(
    (site) => site.slug === fileName
  );
}

function findSiteByQuery(query) {
  const normalizedQuery =
    normalize(query);

  if (!normalizedQuery) {
    return null;
  }

  return SITES.find((site) => {
    const normalizedName =
      normalize(site.name);

    const matchedName =
      normalizedName.includes(
        normalizedQuery
      ) ||
      normalizedQuery.includes(
        normalizedName
      );

    const matchedKeyword =
      site.keywords.some((keyword) => {
        const normalizedKeyword =
          normalize(keyword);

        return (
          normalizedKeyword.includes(
            normalizedQuery
          ) ||
          normalizedQuery.includes(
            normalizedKeyword
          )
        );
      });

    return (
      matchedName ||
      matchedKeyword
    );
  });
}

const HOME_CATEGORY_ORDER = [
  "港區／亞灣",
  "商圈／百貨",
  "夜市／活動區",
  "熱門生活圈",
  "其他地點",
];

function homeCategory(site) {
  return (
    site.category ||
    "其他地點"
  );
}

function renderHome() {
  const root =
    document.querySelector(
      "#site-list"
    );

  if (!root) {
    return;
  }

  const groups = {};

  SITES.forEach((site) => {
    const category =
      homeCategory(site);

    groups[category] ??= [];

    groups[category].push(
      site
    );
  });

  root.innerHTML =
    HOME_CATEGORY_ORDER
      .filter(
        (category) =>
          groups[category]?.length
      )
      .map(
        (category) => `
          <h2 class="category">
            ${category}
          </h2>

          <div class="grid">
            ${groups[category]
              .map(
                (site) => `
                  <a
                    class="site-card"
                    href="${site.slug}"
                  >
                    <h3>
                      ${site.name}
                    </h3>

                    <p>
                      查看附近停車場、車位狀態與導航
                    </p>
                  </a>
                `
              )
              .join("")}
          </div>
        `
      )
      .join("");
}
function renderPage() {
  const site =
    findSiteBySlug();

  const roadRoot =
    document.querySelector(
      "#road-list"
    );

  if (!site) {
    return;
  }

  document.title =
    `${site.title}｜高雄熱門地點停車推薦`;

  const pageTitle =
    document.querySelector(
      "#page-title"
    );

  const pageIntro =
    document.querySelector(
      "#page-intro"
    );

  const pageKeywords =
    document.querySelector(
      "#page-keywords"
    );

  if (pageTitle) {
    pageTitle.textContent =
      site.title;
  }

  if (pageIntro) {
    pageIntro.textContent =
      site.intro || "";
  }

  if (pageKeywords) {
    pageKeywords.textContent =
      (
        site.keywords ||
        []
      ).join("、");
  }

  if (roadRoot) {
    const roads =
      site.roads || [];

    roadRoot.innerHTML =
      roads.length
        ? roads
            .map(
              (road) => `
                <article class="road-card">
                  <h3>
                    ${road.name}
                  </h3>

                  <p class="road-status">
                    ${road.status}
                  </p>

                  <p class="card-note">
                    ${road.note}
                  </p>

                  <a
                    class="nav-btn light"
                    target="_blank"
                    rel="noopener"
                    href="${road.maps}"
                  >
                    🧭 導航到路段
                  </a>
                </article>
              `
            )
            .join("")
        : `
          <p class="empty">
            目前尚未整理可嘗試路段。
          </p>
        `;
  }
}

function bindCurrentLocation() {
  const button =
    document.querySelector(
      "#locationBtn"
    );

  const message =
    document.querySelector(
      "#locationMsg"
    );

  const result =
    document.querySelector(
      "#locationResult"
    );

  const accuracy =
    document.querySelector(
      "#locationAccuracy"
    );

  const nearbyLink =
    document.querySelector(
      "#nearbyParkingMaps"
    );

  if (!button) {
    return;
  }

  function restoreButton() {
    button.disabled =
      false;

    button.textContent =
      "📍 使用目前位置";
  }

  button.addEventListener(
    "click",
    () => {
      if (
        !navigator
          .geolocation
      ) {
        if (message) {
          message.textContent =
            "這台裝置或瀏覽器暫不支援定位。";
        }

        return;
      }

      button.disabled =
        true;

      button.textContent =
        "定位中…";

      if (message) {
        message.textContent =
          "請允許網站取得你目前的位置。";
      }

      result?.classList.add(
        "hidden"
      );

      navigator
        .geolocation
        .getCurrentPosition(
          (position) => {
            const latitude =
              Number(
                position
                  .coords
                  .latitude
                  .toFixed(6)
              );

            const longitude =
              Number(
                position
                  .coords
                  .longitude
                  .toFixed(6)
              );

            const accuracyMeters =
              Math.round(
                Number(
                  position
                    .coords
                    .accuracy
                ) ||
                  0
              );

            try {
              sessionStorage.setItem(
                "parking_user_location",
                JSON.stringify({
                  lat:
                    latitude,

                  lng:
                    longitude,

                  accuracy:
                    accuracyMeters,

                  updatedAt:
                    Date.now(),
                })
              );
            } catch (error) {
              if (message) {
                message.textContent =
                  "目前無法暫存定位結果，請確認瀏覽器未封鎖網站儲存功能。";
              }

              restoreButton();

              return;
            }

            if (message) {
              message.textContent =
                "";
            }

            if (accuracy) {
              accuracy.textContent =
                accuracyMeters >
                0
                  ? `定位精度約 ${accuracyMeters} 公尺`
                  : "";
            }

            if (nearbyLink) {
              nearbyLink.href =
                "nearby.html";

              nearbyLink.removeAttribute(
                "target"
              );
            }

            result?.classList.remove(
              "hidden"
            );

            restoreButton();
          },

          (error) => {
            const messages = {
              1:
                "你尚未允許定位權限，請改用地點搜尋。",

              2:
                "目前無法取得位置，請稍後再試或改用地點搜尋。",

              3:
                "定位逾時，請再試一次或改用地點搜尋。",
            };

            if (message) {
              message.textContent =
                messages[
                  error.code
                ] ||
                "目前無法取得位置，請改用地點搜尋。";
            }

            restoreButton();
          },

          {
            enableHighAccuracy:
              true,

            timeout:
              8000,

            maximumAge:
              0,
          }
        );
    }
  );
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    renderHome();
    renderPage();
    bindSearch();
    bindCurrentLocation();
  }
);
