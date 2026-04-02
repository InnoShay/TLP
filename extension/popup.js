/**
 * Credify-TLP Popup Logic
 * Handles verification flow, UI updates, and result rendering.
 */

const API_BASE = "http://localhost:8000";

// ── DOM Elements ──
const claimInput = document.getElementById("claim-input");
const verifyBtn = document.getElementById("verify-btn");
const btnText = document.querySelector(".btn-text");
const btnLoading = document.querySelector(".btn-loading");
const resultSection = document.getElementById("result-section");
const errorSection = document.getElementById("error-section");
const retryBtn = document.getElementById("retry-btn");

// ── Initialize ──
document.addEventListener("DOMContentLoaded", async () => {
  // Pre-fill with selected text from the active page
  try {
    const data = await chrome.storage.local.get(["selectedText"]);
    if (data.selectedText) {
      claimInput.value = data.selectedText;
    }
  } catch (e) {
    console.log("No stored selection");
  }

  // Load last result if exists
  try {
    const data = await chrome.storage.local.get(["lastResult"]);
    if (data.lastResult) {
      displayResult(data.lastResult);
    }
  } catch (e) {
    console.log("No stored result");
  }
});

// ── Verify Button Click ──
verifyBtn.addEventListener("click", () => handleVerify());
retryBtn.addEventListener("click", () => handleVerify());

// ── Enter key to verify ──
claimInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleVerify();
  }
});

async function handleVerify() {
  const text = claimInput.value.trim();
  if (!text || text.length < 5) {
    claimInput.style.borderColor = "#dc2626";
    setTimeout(() => (claimInput.style.borderColor = ""), 1500);
    return;
  }

  setLoading(true);
  hideError();

  try {
    const response = await fetch(`${API_BASE}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const result = await response.json();
    chrome.storage.local.set({ lastResult: result });
    displayResult(result);
  } catch (error) {
    console.error("Verification failed:", error);
    showError(error.message || "Cannot reach Credify server. Is the backend running?");
  } finally {
    setLoading(false);
  }
}

// ── Display Result ──
function displayResult(result) {
  resultSection.style.display = "block";
  errorSection.style.display = "none";

  const score = Math.round(result.truth_score * 100);
  const confidence = Math.round(result.confidence * 100);
  const classification = result.classification;

  // ── Update Claim Display ──
  document.getElementById("analyzed-claim").textContent = `"${claimInput.value.trim()}"`;

  // ── Update Horizontal Score Bar ──
  const scoreBar = document.getElementById("score-bar");
  scoreBar.style.width = `${score}%`;
  scoreBar.style.backgroundColor = getScoreColor(classification);

  // Animate score counter
  animateCounter("score-value", score, "%");

  // ── Classification Badge ──
  const badge = document.getElementById("classification-badge");
  const classMap = {
    "Verified": { text: "Verified", class: "verified" },
    "Likely True": { text: "Likely True", class: "likely-true" },
    "Uncertain": { text: "Uncertain", class: "uncertain" },
    "Likely False": { text: "Likely False", class: "likely-false" },
    "False": { text: "False", class: "false" },
  };
  const config = classMap[classification] || classMap["Uncertain"];
  badge.textContent = config.text;
  badge.className = `classification-badge ${config.class}`;

  // ── Confidence Bar ──
  document.getElementById("confidence-value").textContent = `${confidence}%`;

  // ── Source List (Popup View) ──
  const evidences = result.evidences || [];
  const evidenceList = document.getElementById("evidence-list");
  evidenceList.innerHTML = "";

  if (evidences.length === 0) {
    evidenceList.innerHTML = `<div style="font-size: 13px; color: var(--slate-500); padding: 8px 0;">No verified sources found.</div>`;
  } else {
    // Show top 3 in popup
    evidences.slice(0, 3).forEach((ev) => {
      const isSupport = ev.stance === "supports";
      const isContradict = ev.stance === "contradicts";
      
      let icon = "➖";
      if (isSupport) icon = "✅";
      if (isContradict) icon = "❌";

      const weightLabel = ev.weight > 0.8 ? "High Auth" : ev.weight > 0.5 ? "Med Auth" : "Low Auth";

      const item = document.createElement("div");
      item.className = "source-item";
      item.innerHTML = `
        <div class="source-name">
          <span class="source-icon">${icon}</span>
          ${escapeHtml(ev.source_name)}
        </div>
        <div class="source-weight">${weightLabel}</div>
      `;
      evidenceList.appendChild(item);
    });
    
    if (evidences.length > 3) {
      const more = document.createElement("div");
      more.style.fontSize = "11px";
      more.style.color = "var(--slate-500)";
      more.style.paddingTop = "8px";
      more.style.textAlign = "center";
      more.textContent = `+${evidences.length - 3} more sources...`;
      evidenceList.appendChild(more);
    }
  }
}

// ── Helpers ──
function setLoading(loading) {
  verifyBtn.disabled = loading;
  btnText.style.display = loading ? "none" : "inline";
  btnLoading.style.display = loading ? "inline" : "none";
}

function showError(message) {
  resultSection.style.display = "none";
  errorSection.style.display = "block";
  document.getElementById("error-message").textContent = message;
}

function hideError() {
  errorSection.style.display = "none";
}

function getScoreColor(classification) {
  const colors = {
    "Verified": "#059669",
    "Likely True": "#3b82f6",
    "Uncertain": "#f59e0b",
    "Likely False": "#f97316",
    "False": "#dc2626",
  };
  return colors[classification] || "#6366f1";
}

function animateCounter(elementId, target, suffix = "") {
  const el = document.getElementById(elementId);
  let current = 0;
  const step = Math.max(1, Math.floor(target / 30));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current + suffix;
  }, 20);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ── Sidebar Logic ──
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const toggleSidebarBtn = document.getElementById("toggle-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
const sidebarContent = document.getElementById("sidebar-content");

toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
});

function closeSidebar() {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
}

closeSidebarBtn.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

// Override displayResult to also populate sidebar
const originalDisplayResult = displayResult;
displayResult = function(result) {
    originalDisplayResult(result);
    // Populate Sidebar
    sidebarContent.innerHTML = "";
    const evidences = result.evidences || [];
    
    // Technical Transparency Section
    const transparency = document.createElement("div");
    transparency.style.fontSize = "11px";
    transparency.style.color = "var(--slate-500)";
    transparency.style.marginBottom = "24px";
    transparency.style.lineHeight = "1.5";
    transparency.innerHTML = "Based on strict cross-source consensus analysis.<br>Confidence is derived from weighted source reliability.";
    sidebarContent.appendChild(transparency);

    if (evidences.length === 0) {
        sidebarContent.innerHTML += "<p style='color: var(--slate-500); font-size: 13px; text-align: center; margin-top: 20px;'>No sources found to populate analysis.</p>";
        return;
    }

    // Add Reason section
    const isFalse = result.classification === "False" || result.classification === "Likely False";
    const reasonHeader = document.createElement("h3");
    reasonHeader.style.fontSize = "13px";
    reasonHeader.style.fontWeight = "600";
    reasonHeader.style.color = "var(--slate-900)";
    reasonHeader.style.marginBottom = "12px";
    reasonHeader.textContent = "Source Analysis Breakdown";
    sidebarContent.appendChild(reasonHeader);

    evidences.forEach((ev) => {
        const card = document.createElement("div");
        card.className = "analysis-card";
        
        let linkHtml = ev.url ? `<a href="${ev.url}" target="_blank" class="analysis-link">View Source →</a>` : "";
        let stanceTag = ev.stance.charAt(0).toUpperCase() + ev.stance.slice(1);

        card.innerHTML = `
            <div class="analysis-source">
                <span>${escapeHtml(ev.source_name)}</span>
                <span class="analysis-tag ${ev.stance}">${stanceTag}</span>
            </div>
            <div style="font-size: 11px; color: var(--slate-400); margin-bottom: 8px; text-transform: uppercase;">
                ${ev.source_type.replace('_', ' ')}
            </div>
            <div class="analysis-snippet">"${escapeHtml(ev.content)}"</div>
            ${linkHtml}
        `;
        sidebarContent.appendChild(card);
    });
};
