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
    // console.warn("Failed to toggleSidebar:", e);
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

    // console.log("✅ Badge set:", { tabId, score: scoreText });
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
    // Confirm the tab exists before messaging
    const tab = await chrome.tabs.get(tabId);
    if (!tab || tab.status === "unloaded") {
      // console.warn("🟡 Tab is not ready:", tabId);
      return;
    }

    await chrome.tabs.sendMessage(tabId, { action: "requestSeoBadge" });
  } catch (e) {
    // console.warn("❌ requestBadgeForTab failed:", e.message);
    applyBadge(tabId, ""); // Clear badge just in case
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
// chrome.tabs.onRemoved.addListener((tabId) => {
//   applyBadge(tabId, "");
// });



async function fetchUser({ force = false } = {}) {
  const { userdata, loggedIn, lastFetched } = await new Promise((resolve) => {
    chrome.storage.local.get(['userdata', 'loggedIn', 'lastFetched'], resolve);
  });

  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;

  if (!force && loggedIn && lastFetched && (now - lastFetched < FIVE_MINUTES)) {
    console.log("⚡ Using cached user data");
    return;
  }

  // console.log("🔄 Fetching fresh user data...");
  try {
    const response = await fetch('http://localhost:8000/users/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      chrome.storage.local.set({
        userdata: data,
        loggedIn: true,
        lastFetched: now
      });
      console.log("✅ User logged in:", data);
      notifyTabsUserDataUpdated(data);
    } else if (response.status === 401) {
      chrome.storage.local.remove(['userdata', 'lastFetched']);
      chrome.storage.local.set({ loggedIn: false });
      notifyTabsUserLoggedOut();
    }
  } catch (error) {
    console.error("Fetch User API Error:", error);
  }
}

function notifyTabsUserDataUpdated(data) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'userDataUpdated', userdata: data }, (response) => {
          if (chrome.runtime.lastError) {
            // Gracefully handle the error
            // console.warn(`Tab ${tab.id} has no receiver: ${chrome.runtime.lastError.message}`);
          }
        });
      }
    });
  }); 
}

function notifyTabsUserLoggedOut() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'userLoggedOut' }, (response) => {
          if (chrome.runtime.lastError) {
            // console.warn(`Tab ${tab.id} has no receiver: ${chrome.runtime.lastError.message}`);
          }
        });
      }
    });
  });
}


chrome.runtime.onStartup.addListener(() => fetchUser({ force: true }));
chrome.runtime.onInstalled.addListener(() => fetchUser({ force: true }));