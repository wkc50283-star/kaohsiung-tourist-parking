/**
 * homepage-announcements.js
 * 首頁低調公告列：集中維護公告內容與播放狀態。
 */

(function () {
  "use strict";

  const ANNOUNCEMENTS = [
    "新功能｜即時空位停車場篩選已上線，出發前可重新整理最新資料。",
    "使用提醒｜實際行車路線與時間，請以 Google 地圖導航為準。",
    "網站更新｜停車場卡片已簡化，優先顯示空位、更新時間與導航。",
    "功能預告｜地址與店家搜尋功能正在測試中。"
  ];
  const SEPARATOR = "\u00A0\u00A0\u00A0\u00A0\u00A0";

  function buildAnnouncementLoop() {
    const announcementGroup =
      ANNOUNCEMENTS.join(SEPARATOR);

    return [
      announcementGroup,
      announcementGroup
    ].join(SEPARATOR);
  }

  function setButtonState(button, isPaused) {
    button.textContent = isPaused ? "播放" : "暫停";
    button.setAttribute(
      "aria-label",
      isPaused ? "播放最新公告" : "暫停最新公告播放"
    );
    button.setAttribute(
      "aria-pressed",
      isPaused ? "true" : "false"
    );
  }

  function initAnnouncements() {
    const root = document.querySelector(
      "[data-homepage-announcements]"
    );

    if (!root) {
      return;
    }

    const track = root.querySelector(
      "[data-announcement-track]"
    );
    const text = root.querySelector(
      "[data-announcement-text]"
    );
    const toggle = root.querySelector(
      "[data-announcement-toggle]"
    );

    if (!track || !text || !toggle) {
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let isPaused = false;

    function applyPausedState(nextPaused) {
      isPaused = nextPaused;
      root.classList.toggle(
        "is-paused",
        isPaused || reducedMotionQuery.matches
      );
      setButtonState(toggle, isPaused);
    }

    function applyMotionPreference() {
      if (reducedMotionQuery.matches) {
        text.textContent = ANNOUNCEMENTS[0];
        root.classList.add("is-paused");
        toggle.hidden = true;
        toggle.disabled = true;
        return;
      }

      toggle.hidden = false;
      toggle.disabled = false;
      applyPausedState(isPaused);
    }

    text.textContent = buildAnnouncementLoop();
    applyMotionPreference();

    toggle.addEventListener("click", function () {
      applyPausedState(!isPaused);
    });

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener(
        "change",
        applyMotionPreference
      );
    } else if (
      typeof reducedMotionQuery.addListener === "function"
    ) {
      reducedMotionQuery.addListener(applyMotionPreference);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initAnnouncements
    );
  } else {
    initAnnouncements();
  }
})();
