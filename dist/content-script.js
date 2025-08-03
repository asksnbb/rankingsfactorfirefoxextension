// content-script.js

// Optional: avoid injecting into iframes (uncomment if desired)
// if (window.top !== window) { return; }

let sidebar;
let lastAnalysisResult = null;
let pendingVitals = null;

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
    safeSendMessage({ action: "clearBadge" });
    return;
  }

  const analyzer = new SEOAnalyzer();
  const result = analyzer.analyzeCurrentPage();
  lastAnalysisResult = result;

  const score = result.seoScore;
  const color = analyzer.getScoreColor(score);

  safeSendMessage({
    action: "setBadge",
    score: String(score),
    color,
    result,
  });

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


function safeSendMessage(msg) {
  try {
    // Prevent sending if the extension was reloaded/unavailable
    if (!chrome?.runtime?.id) return;

    // Safe sendMessage with silent failure
    chrome.runtime.sendMessage(msg, () => {
      if (chrome.runtime.lastError) {
        console.warn("Message failed (likely invalid context):", chrome.runtime.lastError.message);
      }
    });
  } catch (err) {
    console.warn("Extension context invalidated:", err);
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
      right: -500px !important;
      width: 490px !important;
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
    // ✅ Now safe to send user data
    sendUserDataToIframe();
    // Check Core web vitals 
    trySendingVitalsToSidebar();
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
    chrome.runtime.sendMessage({ action: "clearBadge" }).catch(() => { });
    return;
  }
  if (typeof SEOAnalyzer === "undefined") {
    console.error("❌ SEOAnalyzer class not found.");
    chrome.runtime.sendMessage({ action: "clearBadge" }).catch(() => { });
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



function collectWebVitals() {
  let lcpValue = 0;
  let clsValue = 0;
  let fcpValue = 0;
  let fidValue = 0;
  let ttfb = 0;
  let domLoad = 0;
  let pageLoad = 0;
  let requestDuration = 0;

  // Disconnect old observers if needed
  let lcpObserver, clsObserver, fcpObserver, fidObserver;

  // LCP
  lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      lcpValue = lastEntry.renderTime || lastEntry.loadTime || lcpValue;
    }
  });
  lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

  // CLS
  clsObserver = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }
  });
  clsObserver.observe({ type: "layout-shift", buffered: true });

  // FCP
  fcpObserver = new PerformanceObserver((entryList) => {
    const fcpEntry = entryList.getEntries().find(e => e.name === "first-contentful-paint");
    if (fcpEntry) {
      fcpValue = fcpEntry.startTime;
    }
  });
  fcpObserver.observe({ type: "paint", buffered: true });

  // FID
  fidObserver = new PerformanceObserver((entryList) => {
    const firstInput = entryList.getEntries()[0];
    if (firstInput) {
      fidValue = firstInput.processingStart - firstInput.startTime;
    }
  });
  fidObserver.observe({ type: "first-input", buffered: true });

  // Navigation timings (you can still use this immediately)
  const [navEntry] = performance.getEntriesByType("navigation");
  if (navEntry) {
    ttfb = navEntry.responseStart - navEntry.requestStart;
    domLoad = navEntry.domContentLoadedEventEnd;
    pageLoad = navEntry.loadEventEnd;
    requestDuration = navEntry.responseEnd - navEntry.requestStart;
  }

  // Slight delay to let observers record data
  setTimeout(() => {
    lcpObserver.disconnect();
    clsObserver.disconnect();
    fcpObserver.disconnect();
    fidObserver.disconnect();

    const metrics = {
      LCP: Math.round(lcpValue),
      CLS: parseFloat(clsValue.toFixed(3)),
      FCP: Math.round(fcpValue),
      FID: Math.round(fidValue),
      TTFB: Math.round(ttfb),
      DOMLoad: Math.round(domLoad),
      PageLoad: Math.round(pageLoad),
      RequestDuration: Math.round(requestDuration),
    };

    // console.log("✅ Web Vitals ready:", metrics);
    pendingVitals = metrics;
    trySendingVitalsToSidebar();
  }, 2000); // Allow new route time to stabilize
}


function trySendingVitalsToSidebar() {
  const interval = setInterval(() => {
    if (sidebar && sidebar.contentWindow && pendingVitals) {
      sidebar.contentWindow.postMessage({
        action: 'webVitals',
        data: pendingVitals,
      }, EXT_ORIGIN); // Or EXT_ORIGIN if restricted
      // console.log("📤 Sent vitals to sidebar:", pendingVitals);
      pendingVitals = null;
      clearInterval(interval);
    }
  }, 300); // Retry every 300ms
}

collectWebVitals();


function reCollectVitalsOnRouteChange() {
  let lastHref = location.href;

  const observer = new MutationObserver(() => {
    const currentHref = location.href;
    if (currentHref !== lastHref) {
      lastHref = currentHref;
      // console.log("[Vitals] Route changed → Recollecting vitals...");
      setTimeout(() => {
        collectWebVitals(); // Trigger again after route change
      }, 1000);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}


reCollectVitalsOnRouteChange();

window.addEventListener('popstate', reCollectVitalsOnRouteChange);

function sendUserDataToIframe() {
  chrome.storage.local.get(['userdata', 'loggedIn'], (result) => {
    if (!sidebar || !sidebar.contentWindow) {
      return;
    }
    if (result.loggedIn && result.userdata) {
      sidebar.contentWindow.postMessage({
        action: 'userDataUpdated',
        data: result.userdata
      }, EXT_ORIGIN);  // ✅ Use specific origin
    } else {
      sidebar.contentWindow.postMessage({
        action: 'userLoggedOut'
      }, EXT_ORIGIN);
    }
  });
}

// Listen for iframe requesting user data
window.addEventListener('message', (event) => {
  if (event.origin !== EXT_ORIGIN) return;  // ✅ Security check
  if (!event.data || typeof event.data !== 'object') return;

  if (event.data.action === 'requestUserData') {
    sendUserDataToIframe();
  }
});

// Listen for updates from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sidebar || !sidebar.contentWindow) {
    return;
  }

  if (message.action === 'userDataUpdated') {
    sidebar.contentWindow.postMessage({ action: 'userDataUpdated', data: message.userdata }, EXT_ORIGIN);
  }

  if (message.action === 'userLoggedOut') {
    sidebar.contentWindow.postMessage({ action: 'userLoggedOut' }, EXT_ORIGIN);
  }
});