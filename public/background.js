// background.js

// --- Helper to set/clear the badge per-tab
function applyBadge(tabId, text = "", color = [0, 0, 0, 0]) {
  if (!tabId) return;
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color });
}

// Toggle sidebar when the toolbar icon is clicked
// (Ensure you DON'T have "default_popup" in manifest, or this won't fire)
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { action: "toggleSidebar" });
  } catch (e) {
    // No content script here (e.g., chrome:// or unmatched site)
    console.warn("Failed to toggleSidebar:", e);
  }
});

// Handle messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== "object") return;

  if (message.action === "setBadge") {
    const tabId = sender.tab?.id;
    if (!tabId) {
      sendResponse?.({ success: false, error: "No sender.tab.id" });
      return; // sync response
    }

    const scoreText =
      typeof message.score === "string" ? message.score : String(message.score ?? "");
    const color = message.color ?? [0, 0, 0, 255];

    applyBadge(tabId, scoreText, color);

    console.log("✅ Badge set:", { tabId, score: scoreText });
    sendResponse?.({ success: true });
    return; // sync response
  }

  if (message.action === "clearBadge") {
    const tabId = sender.tab?.id;
    if (tabId) applyBadge(tabId, "");
    sendResponse?.({ success: true });
    return; // sync response
  }
});

// --- Ask active tab to provide (or recompute) its badge on tab/window changes
async function requestBadgeForTab(tabId) {
  if (!tabId) return;
  try {
    await chrome.tabs.sendMessage(tabId, { action: "requestSeoBadge" });
  } catch (e) {
    // No content script in this tab; clear the badge to avoid stale values
    applyBadge(tabId, "");
  }
}

// Debounce per tab to avoid spamming during rapid SPA transitions/HMR
const debounceTimers = new Map();
function requestBadgeForTabDebounced(tabId, delay = 200) {
  if (!tabId) return;
  clearTimeout(debounceTimers.get(tabId));
  const t = setTimeout(() => {
    debounceTimers.delete(tabId);
    requestBadgeForTab(tabId);
  }, delay);
  debounceTimers.set(tabId, t);
}

// On tab switch
chrome.tabs.onActivated.addListener(({ tabId }) => {
  requestBadgeForTab(tabId);
});

// When a tab finishes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    requestBadgeForTab(tabId);
  }
});

// When switching windows
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  const [activeTab] = await chrome.tabs.query({ active: true, windowId });
  if (activeTab?.id) requestBadgeForTab(activeTab.id);
});

// SPA/Next.js navigations: react to pushState/replaceState route changes
// Requires "webNavigation" permission in manifest
chrome.webNavigation.onHistoryStateUpdated.addListener(
  ({ tabId, frameId }) => {
    if (frameId !== 0) return; // only top frame
    requestBadgeForTabDebounced(tabId);
  },
  { url: [{ schemes: ["http", "https"] }] }
);

// Some apps use assignments that trigger onCommitted without full reload
chrome.webNavigation.onCommitted.addListener(
  ({ tabId, frameId, transitionType }) => {
    if (frameId !== 0) return;
    if (transitionType === "auto_subframe") return;
    requestBadgeForTabDebounced(tabId);
  },
  { url: [{ schemes: ["http", "https"] }] }
);

// Optional: clear badge when tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  applyBadge(tabId, "");
});

// Optional: initialize (blank) badge on install/update
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background installed/updated.");
});
