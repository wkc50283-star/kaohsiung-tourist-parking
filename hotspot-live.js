"use strict";

const HOTSPOT_LIVE_DATA_URL =
  "https://kaohsiung-parking-api-test.vercel.app/api/nearby-data";

const HOTSPOT_CONFIGS = {
  "pier2-parking.html": {
    name: "駁二",
    latitude: 22.619889,
    longitude: 120.281722,
    searchRadiusMeters: 1200,
    maximumResults: 5,
  },
};

function getCurrentHotspotConfig() {
  const fileName =
    location.pathname.split("/").pop() ||
    "index.html";

  return HOTSPOT_CONFIGS[fileName] || null;
}

function escapeHotspotHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function hotspotToRadians(value) {
  return (value * Math.PI) / 180;
}

function hotspotDistanceMeters(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  const earthRadius = 6371000;

  const latitudeDifference =
    hotspotToRadians(
      latitude2 -
      latitude1
    );

  const longitudeDifference =
    hotspotToRadians(
      longitude2 -
      longitude1
    );

  const a =
    Math.sin(
      latitudeDifference / 2
    ) *
      Math.sin(
        latitudeDifference / 2
      ) +
    Math.cos(
      hotspotToRadians(
        latitude1
      )
    ) *
      Math.cos(
        hotspotToRadians(
          latitude2
        )
      ) *
      Math.sin(
        longitudeDifference / 2
      ) *
      Math.sin(
        longitudeDifference / 2
      );

  return (
    earthRadius *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

function formatHotspotDistance(
  meters
) {
  if (meters < 1000) {
    return `${Math.round(
      meters
    )} 公尺`;
  }

  return `${(
    meters / 1000
  ).toFixed(1)} 公里`;
}

function formatHotspotAgeMinutes(
  value
) {
  const minutes =
    Number(value);

  if (
    !Number.isFinite(
      minutes
    )
  ) {
    return "無法判斷";
  }

  if (minutes < 1) {
    return "1 分鐘內";
  }

  return `約 ${Math.round(
    minutes
  )} 分鐘前`;
}

function formatHotspotDateTime(
  value
) {
  const timestamp =
    Date.parse(value);

  if (
    !Number.isFinite(
      timestamp
    )
  ) {
    return "無法判斷";
  }

  return new Date(
    timestamp
  ).toLocaleString(
    "zh-TW"
  );
}

function getHotspotNavigationUrl(
  parkingLot
) {
  const destination =
    `${parkingLot.latitude},${parkingLot.longitude}`;

  return (
    "https://www.google.com/maps/dir/?api=1" +
    `&destination=${encodeURIComponent(
      destination
    )}` +
    "&travelmode=driving"
  );
}

function renderHotspotParkingCard(
  parkingLot,
  hotspotName
) {
  return `
    <article
      class="parking-card decision-card"
    >
      <div
        class="status-line available"
      >
        🟢 即時剩餘 ${
          parkingLot.availableSpaces
        } 格
      </div>

      <h3>
        ${escapeHotspotHtml(
          parkingLot.name
        )}
      </h3>

      <p class="distance">
        📍 距離${escapeHotspotHtml(
          hotspotName
        )}約 ${
          formatHotspotDistance(
            parkingLot.distanceMeters
          )
        }
      </p>

      <a
        class="nav-btn"
        target="_blank"
        rel="noopener noreferrer"
        href="${
          getHotspotNavigationUrl(
            parkingLot
          )
        }"
      >
        🧭 開始導航
      </a>

      <div class="price-lines">
        <div>
          資料更新：${
            formatHotspotAgeMinutes(
              parkingLot.dataAgeMinutes
            )
          }
        </div>

        <div>
          總格位：${
            parkingLot.totalSpaces
          } 格
        </div>
      </div>

      <p class="card-note">
        ${
          escapeHotspotHtml(
            parkingLot.address ||
            "地址資料不足"
          )
        }
      </p>
    </article>
  `;
}

async function loadHotspotParkingData() {
  const response =
    await fetch(
      HOTSPOT_LIVE_DATA_URL,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },
      }
    );

  if (!response.ok) {
    throw new Error(
      `即時停車資料取得失敗，狀態碼：${
        response.status
      }`
    );
  }

  const data =
    await response.json();

  if (
    !data.ok ||
    !Array.isArray(
      data.parkingLots
    )
  ) {
    throw new Error(
      "即時停車資料格式不正確"
    );
  }

  return data;
}

async function renderHotspotLiveParking() {
  const config =
    getCurrentHotspotConfig();

  const statusRoot =
    document.querySelector(
      "#hotspot-live-status"
    );

  const summaryRoot =
    document.querySelector(
      "#hotspot-live-summary"
    );

  const listRoot =
    document.querySelector(
      "#hotspot-live-list"
    );

  if (
    !config ||
    !statusRoot ||
    !summaryRoot ||
    !listRoot
  ) {
    return;
  }

  statusRoot.textContent =
    "正在讀取 TDX 即時停車資料……";

  listRoot.innerHTML =
    "";

  try {
    const data =
      await loadHotspotParkingData();

    const parkingLots =
      data.parkingLots
        .filter(
          (parkingLot) => {
            const availableSpaces =
              Number(
                parkingLot
                  .availableSpaces
              );

            const totalSpaces =
              Number(
                parkingLot
                  .totalSpaces
              );

            const latitude =
              Number(
                parkingLot
                  .latitude
              );

            const longitude =
              Number(
                parkingLot
                  .longitude
              );

            const dataAgeMinutes =
              Number(
                parkingLot
                  .dataAgeMinutes
              );

            return (
              parkingLot.status ===
                "available" &&
              Number.isFinite(
                availableSpaces
              ) &&
              availableSpaces > 0 &&
              Number.isFinite(
                totalSpaces
              ) &&
              totalSpaces > 0 &&
              availableSpaces <=
                totalSpaces &&
              Number.isFinite(
                latitude
              ) &&
              Number.isFinite(
                longitude
              ) &&
              Number.isFinite(
                dataAgeMinutes
              ) &&
              dataAgeMinutes >= 0 &&
              dataAgeMinutes <= 15
            );
          }
        )
        .map(
          (parkingLot) => ({
            ...parkingLot,

            distanceMeters:
              hotspotDistanceMeters(
                config.latitude,
                config.longitude,
                Number(
                  parkingLot
                    .latitude
                ),
                Number(
                  parkingLot
                    .longitude
                )
              ),
          })
        )
        .filter(
          (parkingLot) =>
            parkingLot
              .distanceMeters <=
            config
              .searchRadiusMeters
        )
        .sort(
          (
            firstParkingLot,
            secondParkingLot
          ) => {
            if (
              firstParkingLot
                .distanceMeters !==
              secondParkingLot
                .distanceMeters
            ) {
              return (
                firstParkingLot
                  .distanceMeters -
                secondParkingLot
                  .distanceMeters
              );
            }

            if (
              Number(
                firstParkingLot
                  .dataAgeMinutes
              ) !==
              Number(
                secondParkingLot
                  .dataAgeMinutes
              )
            ) {
              return (
                Number(
                  firstParkingLot
                    .dataAgeMinutes
                ) -
                Number(
                  secondParkingLot
                    .dataAgeMinutes
                )
              );
            }

            return (
              Number(
                secondParkingLot
                  .availableSpaces
              ) -
              Number(
                firstParkingLot
                  .availableSpaces
              )
            );
          }
        );

    const visibleParkingLots =
      parkingLots.slice(
        0,
        config.maximumResults
      );

    summaryRoot.textContent =
      `搜尋範圍：距離${config.name}約 ${
        config.searchRadiusMeters
      } 公尺內。符合條件的即時停車場共 ${
        parkingLots.length
      } 筆。TDX 最新資料時間：${
        formatHotspotDateTime(
          data
            .dataTimeRange
            ?.newestDataCollectTime
        )
      }。`;

    if (
      !visibleParkingLots.length
    ) {
      statusRoot.textContent =
        "⚠️ 目前在搜尋範圍內，暫時找不到可靠且仍有空位的即時停車場資料。請參考下方原有停車資訊。";

      statusRoot.className =
        "notice";

      return;
    }

    statusRoot.textContent =
      "✅ 已取得附近停車場即時資料。請自行比較距離、剩餘空位與更新時間。";

    statusRoot.className =
      "notice";

    listRoot.innerHTML =
      visibleParkingLots
        .map(
          (parkingLot) =>
            renderHotspotParkingCard(
              parkingLot,
              config.name
            )
        )
        .join("");
  } catch (error) {
    console.error(
      error
    );

    statusRoot.textContent =
      `⚠️ ${
        error.message ||
        "即時停車資料暫時無法取得。"
      } 請參考下方原有停車資訊。`;

    statusRoot.className =
      "notice";
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    renderHotspotLiveParking();
  }
);
