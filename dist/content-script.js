// content-script.js

// Optional: avoid injecting into iframes (uncomment if desired)
// if (window.top !== window) { return; }

let sidebar;
let lastAnalysisResult = null;

// Restrict postMessage to your extension origin
const EXT_ORIGIN = new URL(chrome.runtime.getURL("")).origin;

// Pair this content script and its iframe (defense-in-depth)
let sessionToken = null;

// --- Utilities

function canAnalyzeHere() {
  return /^https?:$/i.test(location.protocol);
}

function debounce(fn, wait = 250) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function ensureAnalysis() {
  if (!canAnalyzeHere()) return null;
  if (typeof SEOAnalyzer === "undefined") return null;
  try {
    if (!lastAnalysisResult) {
      const analyzer = new SEOAnalyzer();
      lastAnalysisResult = analyzer.analyzeCurrentPage();
    }
    return lastAnalysisResult;
  } catch (e) {
    console.warn("SEOAnalyzer failed:", e);
    return null;
  }
}

function computeAndSendBadge(pushToSidebar = true) {
  if (!canAnalyzeHere() || typeof SEOAnalyzer === "undefined") {
    chrome.runtime.sendMessage({ action: "clearBadge" }).catch(() => {});
    return;
  }

  const analyzer = new SEOAnalyzer();
  const result = analyzer.analyzeCurrentPage();
  lastAnalysisResult = result;

  const score = result.seoScore;
  const color = analyzer.getScoreColor(score);

  chrome.runtime.sendMessage({
    action: "setBadge",
    score: String(score),
    color,
    result
  }).catch(() => {});

  if (pushToSidebar) {
    const el = document.getElementById("rankingsfactor-sidebar");
    if (el && el.classList.contains("open")) {
      el.contentWindow?.postMessage(
        { action: "seoResult", data: result, t: sessionToken },
        EXT_ORIGIN
      );
    }
  }
}

const recomputeDebounced = debounce(() => computeAndSendBadge(true), 300);

// --- Style injection

function injectStyles() {
  if (document.getElementById("rankingsfactor-style")) return;
  const style = document.createElement("style");
  style.id = "rankingsfactor-style";
  style.textContent = `
    iframe#rankingsfactor-sidebar { 
      position: fixed !important;
      top: 1% !important;
      right: -480px !important;
      width: 470px !important;
      height: 98% !important;
      max-height: 98% !important;
      z-index: 2147483647 !important;
      background: white !important;
      box-shadow: rgba(0, 0, 0, 0.12) 4px 2px 12px !important;
      border: 2px solid rgba(155, 155, 155, 0.18) !important;
      border-radius: 8px !important;
      transition: right 0.5s ease-out !important;
    }
    iframe#rankingsfactor-sidebar.open {
      right: 6px !important;
    }
  `;
  document.head.appendChild(style);
}

// --- Sidebar injection

function injectSidebar() {
  sidebar = document.getElementById("rankingsfactor-sidebar");
  if (sidebar) return; // already injected

  injectStyles();

  // Session token for pairing with the iframe (soft-checked)
  sessionToken = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random());

  const url = new URL(chrome.runtime.getURL("./assets/index.html"));
  url.searchParams.set("t", sessionToken);

  sidebar = document.createElement("iframe");
  sidebar.src = url.toString();
  sidebar.id = "rankingsfactor-sidebar";
  sidebar.style.display = "none";

  document.body.appendChild(sidebar);

  sidebar.onload = () => {
    sidebar.style.display = "block";
    setTimeout(() => sidebar.classList.add("open"), 50);
    addSidebarListeners();

    // If we already have a result, push it now
    if (lastAnalysisResult) {
      sidebar.contentWindow.postMessage(
        { action: "seoResult", data: lastAnalysisResult, t: sessionToken },
        EXT_ORIGIN
      );
    }
  };
}

// --- Add / remove events robustly

function addSidebarListeners() {
  document.removeEventListener("click", handleClickOutside, true);
  document.addEventListener("click", handleClickOutside, true);
  document.removeEventListener("keydown", handleEscape);
  document.addEventListener("keydown", handleEscape);
}

function removeSidebarListeners() {
  document.removeEventListener("click", handleClickOutside, true);
  document.removeEventListener("keydown", handleEscape);
}

// --- Toggle logic

function toggleSidebar() {
  sidebar = document.getElementById("rankingsfactor-sidebar");
  if (!sidebar) {
    injectSidebar();
  } else {
    const isOpen = sidebar.classList.contains("open");
    if (isOpen) {
      sidebar.classList.remove("open");
      setTimeout(() => {
        sidebar.style.display = "none";
        removeSidebarListeners();
      }, 300);
    } else {
      sidebar.style.display = "block";
      setTimeout(() => sidebar.classList.add("open"), 10);
      addSidebarListeners();

      // Ensure we have fresh data when opening
      const res = ensureAnalysis();
      if (res) {
        sidebar.contentWindow.postMessage(
          { action: "seoResult", data: res, t: sessionToken },
          EXT_ORIGIN
        );
      }
    }
  }
}

// --- Click/escape handlers

function handleClickOutside(event) {
  const el = document.getElementById("rankingsfactor-sidebar");
  if (!el || !el.classList.contains("open")) return;
  if (el.contains(event.target)) return;
  el.classList.remove("open");
  setTimeout(() => {
    el.style.display = "none";
    removeSidebarListeners();
  }, 300);
}

function handleEscape(event) {
  if (event.key !== "Escape") return;
  const el = document.getElementById("rankingsfactor-sidebar");
  if (!el || !el.classList.contains("open")) return;
  el.classList.remove("open");
  setTimeout(() => {
    el.style.display = "none";
    removeSidebarListeners();
  }, 300);
}

// --- Initial analyze + badge update on load

window.addEventListener("load", () => {
  if (!canAnalyzeHere()) {
    chrome.runtime.sendMessage({ action: "clearBadge" }).catch(() => {});
    return;
  }
  if (typeof SEOAnalyzer === "undefined") {
    console.error("❌ SEOAnalyzer class not found.");
    chrome.runtime.sendMessage({ action: "clearBadge" }).catch(() => {});
    return;
  }

  computeAndSendBadge(true);
});

// --- postMessage bridge: content-script <-> iframe

function messageHandler(event) {
  // Only accept messages from our iframe
  if (event.origin !== EXT_ORIGIN) return;
  if (!sidebar || event.source !== sidebar.contentWindow) return;

  const data = event.data;
  if (!data || typeof data !== "object") return;
  // Soft-check token if provided
  if (sessionToken && data.t && data.t !== sessionToken) return;

  if (data.action === "requestSeoResult") {
    sidebar.contentWindow.postMessage(
      { action: "seoResult", data: lastAnalysisResult, t: sessionToken },
      EXT_ORIGIN
    );
  }
}
window.addEventListener("message", messageHandler);

// --- Listen for messages from background

chrome.runtime.onMessage.addListener((request) => {
  if (!request || typeof request !== "object") return;

  if (request.action === "toggleSidebar") {
    toggleSidebar();
    return;
  }

  // Background pings us on tab/window changes
  if (request.action === "requestSeoBadge") {
    recomputeDebounced();
    return;
  }
});

// --- SPA (Next.js) route-change detection

(function initSpaRouteWatcher() {
  let lastUrl = location.href;

  const _pushState = history.pushState;
  const _replaceState = history.replaceState;

  function onUrlChanged() {
    const current = location.href;
    if (current === lastUrl) return;
    lastUrl = current;
    // Let the app render, then recompute
    recomputeDebounced();
  }

  history.pushState = function (...args) {
    const ret = _pushState.apply(this, args);
    onUrlChanged();
    return ret;
  };
  history.replaceState = function (...args) {
    const ret = _replaceState.apply(this, args);
    onUrlChanged();
    return ret;
  };

  window.addEventListener("popstate", onUrlChanged);

  // Fallback: poll URL in case router updates without touching history
  const urlPoll = setInterval(() => {
    if (location.href !== lastUrl) onUrlChanged();
  }, 1000);

  // Watch Next.js root for DOM swaps/hydration
  const root = document.getElementById("__next") || document.body;
  if (root && window.MutationObserver) {
    const mo = new MutationObserver(() => {
      recomputeDebounced();
    });
    mo.observe(root, { childList: true, subtree: true });
    window.addEventListener("beforeunload", () => mo.disconnect(), { once: true });
  }

  window.addEventListener("beforeunload", () => clearInterval(urlPoll), { once: true });
})();

// --- Cleanup on unload

window.addEventListener("beforeunload", () => {
  removeSidebarListeners();
  window.removeEventListener("message", messageHandler);
});
