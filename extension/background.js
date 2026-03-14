/**
 * TrustLayer Background Service Worker
 * Handles context menu and API communication.
 */

const API_BASE = "http://localhost:8000";

// ── Create context menu on install ──
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "trustlayer-verify",
    title: "🔍 Verify with TrustLayer",
    contexts: ["selection"],
  });
  console.log("TrustLayer: Context menu created");
});

// ── Handle context menu click ──
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "trustlayer-verify" && info.selectionText) {
    console.log("TrustLayer: Verifying:", info.selectionText);

    // Show loading state immediately
    chrome.tabs.sendMessage(tab.id, {
      action: "showLoading",
      text: info.selectionText
    });

    try {
      const result = await verifyText(info.selectionText, info.pageUrl);

      // Store result for popup
      chrome.storage.local.set({ lastResult: result });

      // Show floating tooltip on the page
      chrome.tabs.sendMessage(tab.id, {
        action: "showResult",
        result: result,
      });
    } catch (error) {
      console.error("TrustLayer verification failed:", error);
      chrome.tabs.sendMessage(tab.id, {
        action: "showError",
        error: error.message
      });
    }
  }
});

// ── Handle messages from popup ──
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "verify") {
    verifyText(message.text, message.url)
      .then((result) => {
        chrome.storage.local.set({ lastResult: result });
        sendResponse({ success: true, result: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async
  }
});

// ── API Call ──
async function verifyText(text, url = "") {
  const response = await fetch(`${API_BASE}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text, url: url || "" }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}
