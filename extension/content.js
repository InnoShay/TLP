/**
 * TrustLayer Content Script
 * Detects text selection on any webpage and communicates with the background worker.
 */

const API_BASE = "http://localhost:8000";

// ── Listen for text selection ──
document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 10) {
    // Store the selected text for the popup to access
    chrome.storage.local.set({
      selectedText: selectedText,
      pageUrl: window.location.href,
      pageTitle: document.title,
    });
  }
});

// ── Listen for messages from background/popup ──
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSelectedText") {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({
      text: selectedText,
      url: window.location.href,
    });
  }

  if (message.action === "showResult") {
    showFloatingResult(message.result);
  }

  return true; // Keep channel open for async response
});


// ── Floating Result Tooltip ──
function showFloatingResult(result) {
  // Remove any existing tooltip
  const existing = document.getElementById("trustlayer-tooltip");
  if (existing) existing.remove();

  const classification = result.classification;
  const score = Math.round(result.truth_score * 100);

  const colors = {
    "Verified": { bg: "#059669", text: "✅ Verified" },
    "Likely True": { bg: "#3b82f6", text: "🔵 Likely True" },
    "Uncertain": { bg: "#f59e0b", text: "🟡 Uncertain" },
    "Likely False": { bg: "#f97316", text: "🟠 Likely False" },
    "False": { bg: "#dc2626", text: "🔴 False" },
  };

  const config = colors[classification] || colors["Uncertain"];

  const tooltip = document.createElement("div");
  tooltip.id = "trustlayer-tooltip";
  tooltip.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      background: #1a1a2e;
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      max-width: 320px;
      border-left: 4px solid ${config.bg};
      animation: trustlayer-slide 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <strong style="font-size: 13px; color: #888;">TrustLayer</strong>
        <span style="cursor: pointer; color: #666; font-size: 18px;" onclick="this.closest('#trustlayer-tooltip').remove()">✕</span>
      </div>
      <div style="font-size: 18px; font-weight: 700; color: ${config.bg}; margin-bottom: 4px;">
        ${config.text} — ${score}%
      </div>
      <div style="font-size: 12px; color: #aaa;">
        Confidence: ${Math.round(result.confidence * 100)}% · ${result.evidences?.length || 0} sources analyzed
      </div>
      <div style="
        margin-top: 10px;
        background: #2a2a3e;
        border-radius: 8px;
        overflow: hidden;
        height: 6px;
      ">
        <div style="
          height: 100%;
          width: ${score}%;
          background: ${config.bg};
          border-radius: 8px;
          transition: width 0.5s ease;
        "></div>
      </div>
    </div>
    <style>
      @keyframes trustlayer-slide {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;

  document.body.appendChild(tooltip);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    const el = document.getElementById("trustlayer-tooltip");
    if (el) el.remove();
  }, 10000);
}
