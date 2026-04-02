/**
 * Credify-TLP Content Script
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
      top: 24px;
      right: 24px;
      z-index: 2147483647;
      background: #ffffff;
      color: #0f172a;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      width: 340px;
      border-left: 4px solid #2563eb;
      animation: trustlayer-slide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <strong style="font-size: 12px; font-weight: 600; color: #64748b;">CREDIFY</strong>
        <span style="cursor: pointer; color: #94a3b8; font-size: 16px;" onclick="this.closest('#trustlayer-tooltip').remove()">✕</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <div class="trustlayer-spinner"></div>
        <div style="font-size: 14px; font-weight: 600; color: #0f172a;">
          Verifying Claim...
        </div>
      </div>
      <div style="font-size: 13px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-style: italic;">
        "${text}"
      </div>
    </div>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      @keyframes trustlayer-slide {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .trustlayer-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #e2e8f0;
        border-radius: 50%;
        border-top-color: #2563eb;
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
      top: 24px;
      right: 24px;
      z-index: 2147483647;
      background: #ffffff;
      color: #0f172a;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      width: 340px;
      border-left: 4px solid #991b1b;
      animation: trustlayer-slide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <strong style="font-size: 12px; font-weight: 600; color: #64748b;">CREDIFY</strong>
        <span style="cursor: pointer; color: #94a3b8; font-size: 16px;" onclick="this.closest('#trustlayer-tooltip').remove()">✕</span>
      </div>
      <div style="font-size: 14px; font-weight: 600; color: #991b1b; margin-bottom: 4px;">
        Verification Failed
      </div>
      <div style="font-size: 13px; color: #64748b;">
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
      background: rgba(15, 23, 42, 0.4);
      z-index: 2147483646; opacity: 0; pointer-events: none;
      transition: opacity 0.2s ease;
    "></div>
    <div id="trustlayer-global-sidebar" style="
      position: fixed; top: 0; right: -400px; width: 400px; height: 100vh;
      background: #ffffff; z-index: 2147483647;
      box-shadow: -4px 0 24px rgba(0,0,0,0.08);
      border-left: 1px solid #e2e8f0;
      display: flex; flex-direction: column;
      transition: right 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow: hidden;
    ">
      <!-- Header -->
      <div style="padding: 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #ffffff;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div>
            <h2 style="margin: 0; color: #0f172a; font-size: 14px; font-weight: 600;">Credify Analysis</h2>
          </div>
        </div>
        <button id="tl-close-sidebar" style="
          background: none; border: none; color: #64748b; font-size: 16px;
          cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;
        " onmouseover="this.style.color='#0f172a';" onmouseout="this.style.color='#64748b';">✕</button>
      </div>

      <!-- Stats Summary -->
      <div id="tl-sidebar-stats" style="padding: 16px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <!-- Injected via JS -->
      </div>

      <!-- Scrollable Content -->
      <div id="tl-sidebar-content" style="
        flex: 1; overflow-y: auto; padding: 24px;
        background: #ffffff;
      ">
        <!-- Sources injected here -->
      </div>
    </div>
    <style>
      #tl-sidebar-content::-webkit-scrollbar { width: 6px; }
      #tl-sidebar-content::-webkit-scrollbar-track { background: transparent; }
      #tl-sidebar-content::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
      #tl-sidebar-content::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
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
    "Verified": { bg: "#dcfce7", text: "#166534" },
    "Likely True": { bg: "#f1f5f9", text: "#2563eb" },
    "Uncertain": { bg: "#fef3c7", text: "#b45309" },
    "Likely False": { bg: "#ffedd5", text: "#c2410c" },
    "False": { bg: "#fee2e2", text: "#991b1b" },
    "Not Verifiable": { bg: "#f1f5f9", text: "#475569" },
  };
  const config = colors[result.classification] || colors["Uncertain"];

  stats.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="font-size: 13px; font-weight: 500; color: #64748b; margin-bottom: 8px;">Credibility Breakdown</div>
      <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px;">
        <span style="font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1;">${score}%</span>
        <span style="font-size: 12px; padding: 4px 10px; border-radius: 4px; background: ${config.bg}; color: ${config.text}; font-weight: 600;">${result.classification}</span>
      </div>
      <div style="display: flex; gap: 2px; height: 8px; border-radius: 4px; overflow: hidden;">
        <!-- Distribution bar segments could be dynamically calculated, using static representation for now per API structure -->
        <div style="flex: ${result.evidences?.filter(e=>e.stance==='supports').length||0}; background: #166534;"></div>
        <div style="flex: ${result.evidences?.filter(e=>e.stance==='neutral').length||0}; background: #cbd5e1;"></div>
        <div style="flex: ${result.evidences?.filter(e=>e.stance==='contradicts').length||0}; background: #991b1b;"></div>
      </div>
    </div>
    
    <!-- Explanations / Transparency -->
    <div style="font-size: 13px; color: #0f172a; font-weight: 600; margin-bottom: 4px;">Why this result?</div>
    <ul style="margin: 0; padding-left: 16px; font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 16px;">
      <li>Based on cross-source consensus analysis.</li>
      <li>Confidence is derived from weighted source reliability.</li>
    </ul>
  `;

  // Populate Sources
  const evidences = result.evidences || [];
  if (evidences.length === 0) {
    content.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #64748b;">
        <div style="font-size: 14px; font-weight: 500; color: #0f172a; margin-bottom: 8px;">No Evidence Found</div>
        <div style="font-size: 13px; line-height: 1.5;">We couldn't find verifiable data for this claim in our trusted databases.</div>
      </div>
    `;
  } else {
    content.innerHTML = evidences.map((ev, index) => {
        let stanceBg = ev.stance === 'supports' ? '#dcfce7' : ev.stance === 'contradicts' ? '#fee2e2' : '#f1f5f9';
        let stanceColor = ev.stance === 'supports' ? '#166534' : ev.stance === 'contradicts' ? '#991b1b' : '#475569';
        let stanceTag = ev.stance.charAt(0).toUpperCase() + ev.stance.slice(1);

        return `
      <div style="
        background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; 
        padding: 16px; margin-bottom: 16px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
          <div style="color: #0f172a; font-weight: 600; font-size: 13px;">${ev.source_name}</div>
          <div style="background: ${stanceBg}; color: ${stanceColor};
               padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">
            ${stanceTag}
          </div>
        </div>
        
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase;">
            ${ev.source_type.replace('_', ' ')}
        </div>
        
        <div style="color: #475569; font-size: 13px; line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-style: italic;">
          "${ev.content}"
        </div>
        
        ${ev.url ? `<a href="${ev.url}" target="_blank" style="color: #2563eb; text-decoration: none; font-size: 12px; font-weight: 500;">View Details →</a>` : ''}
      </div>
    `}).join('');
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

function showFloatingResult(result) {
  const existing = document.getElementById("trustlayer-tooltip");
  if (existing) existing.remove();

  const classification = result.classification;
  const score = Math.round(result.truth_score * 100);

  const colors = {
    "Verified": { bg: "#dcfce7", text: "#166534", main: "#166534" },
    "Likely True": { bg: "#f1f5f9", text: "#2563eb", main: "#2563eb" },
    "Uncertain": { bg: "#fef3c7", text: "#b45309", main: "#b45309" },
    "Likely False": { bg: "#ffedd5", text: "#c2410c", main: "#c2410c" },
    "False": { bg: "#fee2e2", text: "#991b1b", main: "#991b1b" },
    "Not Verifiable": { bg: "#f1f5f9", text: "#475569", main: "#475569" },
  };

  const config = colors[classification] || colors["Uncertain"];

  // Store result globally so the button can access it
  window.__tl_last_result = result;

  const tooltip = document.createElement("div");
  tooltip.id = "trustlayer-tooltip";
  tooltip.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 2147483647;
    background: #ffffff;
    color: #0f172a;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 13px;
    width: 340px;
    border: 1px solid #e2e8f0;
    border-left: 4px solid ${config.main};
    animation: trustlayer-slide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  tooltip.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <strong style="font-size: 12px; color: #64748b; font-weight: 600;">
        CREDIFY
      </strong>
      <span id="tl-tooltip-close" style="cursor: pointer; color: #94a3b8; font-size: 16px; transition: color 0.15s;">✕</span>
    </div>
    <div style="font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 6px; display: flex; align-items: baseline; gap: 8px;">
      ${score}%
      <span style="font-size: 12px; background: ${config.bg}; color: ${config.text}; padding: 2px 8px; border-radius: 4px; font-weight: 500;">
        ${classification}
      </span>
    </div>
    <div style="font-size: 13px; color: #475569; display: flex; align-items: center; justify-content: space-between;">
      <span>Confidence: ${Math.round(result.confidence * 100)}%</span>
      ${result.evidences?.length > 0 ? `
        <button id="tl-show-sources-btn" style="
          background: #ffffff; border: 1px solid #e2e8f0; color: #2563eb; 
          padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
        ">
          View Details
        </button>
      ` : ''}
    </div>
    <div style="
      margin-top: 16px;
      background: #f1f5f9;
      border-radius: 3px;
      overflow: hidden;
      height: 4px;
    ">
      <div style="
        height: 100%;
        width: ${score}%;
        background: ${config.main};
        border-radius: 3px;
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
      showBtn.style.background = '#f8fafc';
    });
    showBtn.addEventListener("mouseout", () => {
      showBtn.style.background = '#ffffff';
    });
  }
}
