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

  if (message.action === "showLoading") {
    showLoadingTooltip(message.text);
  }

  if (message.action === "showResult") {
    showFloatingResult(message.result);
  }

  if (message.action === "showError") {
    showErrorTooltip(message.error);
  }

  return true; // Keep channel open for async response
});

// ── Floating Tooltips ──

function showLoadingTooltip(text) {
  // Remove any existing tooltip
  const existing = document.getElementById("trustlayer-tooltip");
  if (existing) existing.remove();

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
      width: 280px;
      border-left: 4px solid #6366f1;
      animation: trustlayer-slide 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <strong style="font-size: 13px; color: #888;">TrustLayer</strong>
        <span style="cursor: pointer; color: #666; font-size: 18px;" onclick="this.closest('#trustlayer-tooltip').remove()">✕</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <div class="trustlayer-spinner"></div>
        <div style="font-size: 15px; font-weight: 600; color: #fff;">
          Verifying Claim...
        </div>
      </div>
      <div style="font-size: 12px; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        "${text}"
      </div>
    </div>
    <style>
      @keyframes trustlayer-slide {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .trustlayer-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(99, 102, 241, 0.3);
        border-radius: 50%;
        border-top-color: #6366f1;
        animation: trustlayer-spin 1s linear infinite;
      }
      @keyframes trustlayer-spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;

  document.body.appendChild(tooltip);
}

function showErrorTooltip(errorMsg) {
  // Remove any existing tooltip
  const existing = document.getElementById("trustlayer-tooltip");
  if (existing) existing.remove();

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
      width: 280px;
      border-left: 4px solid #dc2626;
      animation: trustlayer-slide 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <strong style="font-size: 13px; color: #888;">TrustLayer</strong>
        <span style="cursor: pointer; color: #666; font-size: 18px;" onclick="this.closest('#trustlayer-tooltip').remove()">✕</span>
      </div>
      <div style="font-size: 15px; font-weight: 600; color: #dc2626; margin-bottom: 4px;">
        Verification Failed
      </div>
      <div style="font-size: 12px; color: #aaa;">
        ${errorMsg}
      </div>
    </div>
  `;

  document.body.appendChild(tooltip);

  setTimeout(() => {
    const el = document.getElementById("trustlayer-tooltip");
    if (el) el.remove();
  }, 5000);
}
// ── Global Sidebar Injection ──
function injectSidebar() {
  if (document.getElementById("trustlayer-global-sidebar")) return;

  const sidebarHtml = `
    <div id="trustlayer-sidebar-overlay" style="
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
      z-index: 2147483646; opacity: 0; pointer-events: none;
      transition: opacity 0.3s ease;
    "></div>
    <div id="trustlayer-global-sidebar" style="
      position: fixed; top: 0; right: -450px; width: 400px; height: 100vh;
      background: #0f111a; z-index: 2147483647;
      box-shadow: -10px 0 30px rgba(0,0,0,0.5);
      border-left: 1px solid #2a2b36;
      display: flex; flex-direction: column;
      transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
    ">
      <!-- Header -->
      <div style="padding: 24px; border-bottom: 1px solid #1f212d; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #161824, #0f111a);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 18px;">T</div>
          <div>
            <h2 style="margin: 0; color: white; font-size: 18px; font-weight: 600; letter-spacing: -0.5px;">TrustLayer Analysis</h2>
            <div style="color: #8b949e; font-size: 13px;">Evidence & Sources</div>
          </div>
        </div>
        <button id="tl-close-sidebar" style="
          background: none; border: none; color: #8b949e; font-size: 24px;
          cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s;
        " onmouseover="this.style.color='white'; this.style.background='#1f212d'" onmouseout="this.style.color='#8b949e'; this.style.background='none'">✕</button>
      </div>

      <!-- Stats Summary -->
      <div id="tl-sidebar-stats" style="padding: 20px 24px; background: #161824; border-bottom: 1px solid #1f212d; display: flex; gap: 16px;">
        <!-- Injected via JS -->
      </div>

      <!-- Scrollable Content -->
      <div id="tl-sidebar-content" style="
        flex: 1; overflow-y: auto; padding: 24px;
      ">
        <!-- Sources injected here -->
      </div>
    </div>
    <style>
      #tl-sidebar-content::-webkit-scrollbar { width: 6px; }
      #tl-sidebar-content::-webkit-scrollbar-track { background: transparent; }
      #tl-sidebar-content::-webkit-scrollbar-thumb { background: #2a2b36; border-radius: 4px; }
      #tl-sidebar-content::-webkit-scrollbar-thumb:hover { background: #4b5563; }
    </style>
  `;
  document.body.insertAdjacentHTML("beforeend", sidebarHtml);

  document.getElementById("tl-close-sidebar").addEventListener("click", hideSidebar);
  document.getElementById("trustlayer-sidebar-overlay").addEventListener("click", hideSidebar);
}

function showSidebar(result) {
  injectSidebar();
  
  const sidebar = document.getElementById("trustlayer-global-sidebar");
  const overlay = document.getElementById("trustlayer-sidebar-overlay");
  const content = document.getElementById("tl-sidebar-content");
  const stats = document.getElementById("tl-sidebar-stats");

  // Populate Stats
  const score = Math.round(result.truth_score * 100);
  const colors = {
    "Verified": { bg: "rgba(5, 150, 105, 0.1)", text: "#10b981", icon: "✅" },
    "Likely True": { bg: "rgba(59, 130, 246, 0.1)", text: "#60a5fa", icon: "🔵" },
    "Uncertain": { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", icon: "🟡" },
    "Likely False": { bg: "rgba(249, 115, 22, 0.1)", text: "#fb923c", icon: "🟠" },
    "False": { bg: "rgba(220, 38, 38, 0.1)", text: "#ef4444", icon: "🔴" },
    "Not Verifiable": { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", icon: "⚪" },
  };
  const config = colors[result.classification] || colors["Uncertain"];

  stats.innerHTML = `
    <div style="flex: 1; background: ${config.bg}; border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; text-align: center;">
      <div style="font-size: 28px; font-weight: 700; color: ${config.text}; margin-bottom: 4px;">${score}%</div>
      <div style="font-size: 12px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px;">Truth Score</div>
    </div>
    <div style="flex: 1; background: #1f212d; border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; text-align: center;">
      <div style="font-size: 28px; font-weight: 700; color: white; margin-bottom: 4px;">${result.evidences?.length || 0}</div>
      <div style="font-size: 12px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px;">Sources</div>
    </div>
  `;

  // Populate Sources
  const evidences = result.evidences || [];
  if (evidences.length === 0) {
    content.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #8b949e;">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">🔍</div>
        <div style="font-size: 16px; font-weight: 500; color: #e5e7eb; margin-bottom: 8px;">No Evidence Found</div>
        <div style="font-size: 14px; line-height: 1.5;">We couldn't find verifable data for this claim in our trusted databases.</div>
      </div>
    `;
  } else {
    const typeIcons = {
      'wikipedia': '📚', 'government': '🏛️', 'scientific_journal': '🔬', 
      'news_agency': '📰', 'fact_check': '☑️', 'web_search': '🌐'
    };
    
    content.innerHTML = evidences.map((ev, index) => `
      <div style="
        background: #161824; border: 1px solid #2a2b36; border-radius: 12px; 
        padding: 20px; margin-bottom: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: tl-slide-up 0.4s ease backwards;
        animation-delay: ${index * 0.05}s;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 6px; background: #1f212d; display: flex; align-items: center; justify-content: center; font-size: 14px;">
              ${typeIcons[ev.source_type] || '🌐'}
            </div>
            <div>
              <div style="color: #e5e7eb; font-weight: 600; font-size: 14px;">${ev.source_name}</div>
              <div style="color: #8b949e; font-size: 11px; text-transform: capitalize;">${ev.source_type.replace('_', ' ')}</div>
            </div>
          </div>
          <div style="background: ${ev.stance === 'supports' ? 'rgba(5, 150, 105, 0.1)' : ev.stance === 'contradicts' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(245, 158, 11, 0.1)'}; 
               color: ${ev.stance === 'supports' ? '#10b981' : ev.stance === 'contradicts' ? '#ef4444' : '#fbbf24'};
               padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
            ${ev.stance}
          </div>
        </div>
        
        <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px; position: relative;">
          "${ev.content}"
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1f212d; padding-top: 12px;">
          <div style="color: #8b949e; font-size: 12px; display: flex; align-items: center; gap: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Weight: ${(ev.weight * 100).toFixed(0)}%
          </div>
          ${ev.url ? `<a href="${ev.url}" target="_blank" style="color: #6366f1; text-decoration: none; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 4px; transition: color 0.2s;" onmouseover="this.style.color='#8b5cf6'" onmouseout="this.style.color='#6366f1'">Read Original <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Animate in
  setTimeout(() => {
    sidebar.style.right = "0";
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
  }, 10);
}

function hideSidebar() {
  const sidebar = document.getElementById("trustlayer-global-sidebar");
  const overlay = document.getElementById("trustlayer-sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.style.right = "-450px";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
  }
}

// ── Modify Tooltip to open Sidebar ──
function showFloatingResult(result) {
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
    "Not Verifiable": { bg: "#64748b", text: "⚪ Not Verifiable" },
  };

  const config = colors[classification] || colors["Uncertain"];

  // Store result globally so the button can access it
  window.__tl_last_result = result;

  const tooltip = document.createElement("div");
  tooltip.id = "trustlayer-tooltip";
  tooltip.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    background: #1a1a2e;
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    width: 300px;
    border-left: 4px solid ${config.bg};
    animation: trustlayer-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  tooltip.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <strong style="font-size: 13px; color: #888; display: flex; align-items: center; gap: 6px;">
        <div style="width: 16px; height: 16px; border-radius: 4px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 10px;">T</div>
        TrustLayer
      </strong>
      <span id="tl-tooltip-close" style="cursor: pointer; color: #666; font-size: 18px; transition: color 0.2s;">✕</span>
    </div>
    <div style="font-size: 20px; font-weight: 700; color: ${config.bg}; margin-bottom: 6px; letter-spacing: -0.5px;">
      ${config.text} — ${score}%
    </div>
    <div style="font-size: 13px; color: #94a3b8; display: flex; align-items: center; justify-content: space-between;">
      <span>Confidence: ${Math.round(result.confidence * 100)}% · ${result.evidences?.length || 0} sources</span>
      ${result.evidences?.length > 0 ? `
        <button id="tl-show-sources-btn" style="
          background: rgba(99, 102, 241, 0.15); border: none; color: #818cf8; 
          padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        ">
          Show Sources
        </button>
      ` : ''}
    </div>
    <div style="
      margin-top: 14px;
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
        transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      "></div>
    </div>
  `;

  document.body.appendChild(tooltip);

  // Use event listeners instead of inline onclick for security and scope access
  document.getElementById("tl-tooltip-close")?.addEventListener("click", () => tooltip.remove());
  const showBtn = document.getElementById("tl-show-sources-btn");
  if (showBtn) {
    showBtn.addEventListener("click", () => showSidebar(result));
    showBtn.addEventListener("mouseover", () => {
      showBtn.style.background = 'rgba(99, 102, 241, 0.25)';
      showBtn.style.color = '#a5b4fc';
    });
    showBtn.addEventListener("mouseout", () => {
      showBtn.style.background = 'rgba(99, 102, 241, 0.15)';
      showBtn.style.color = '#818cf8';
    });
  }
}
