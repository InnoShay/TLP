/**
 * TrustLayer Popup Logic
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
    showError(error.message || "Cannot reach TrustLayer server. Is the backend running?");
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

  // ── Update Score Gauge ──
  const circumference = 2 * Math.PI * 52; // 327
  const offset = circumference - (score / 100) * circumference;
  const gaugeFill = document.getElementById("gauge-fill");
  gaugeFill.style.strokeDashoffset = offset;
  gaugeFill.style.stroke = getScoreColor(classification);

  // Animate score counter
  animateCounter("score-value", score, "%");

  // ── Classification Badge ──
  const badge = document.getElementById("classification-badge");
  const classMap = {
    "Verified": { text: "✅ Verified", class: "verified" },
    "Likely True": { text: "🔵 Likely True", class: "likely-true" },
    "Uncertain": { text: "🟡 Uncertain", class: "uncertain" },
    "Likely False": { text: "🟠 Likely False", class: "likely-false" },
    "False": { text: "🔴 False", class: "false" },
  };
  const config = classMap[classification] || classMap["Uncertain"];
  badge.textContent = config.text;
  badge.className = `classification-badge ${config.class}`;

  // ── Confidence Bar ──
  document.getElementById("confidence-fill").style.width = `${confidence}%`;
  document.getElementById("confidence-value").textContent = `${confidence}%`;

  // ── Stats ──
  const evidences = result.evidences || [];
  const supporting = evidences.filter((e) => e.stance === "supports").length;
  const contradicting = evidences.filter((e) => e.stance === "contradicts").length;
  const neutral = evidences.filter((e) => e.stance === "neutral").length;

  document.getElementById("support-count").textContent = supporting;
  document.getElementById("contradict-count").textContent = contradicting;
  document.getElementById("neutral-count").textContent = neutral;

  // ── Evidence Cards ──
  const evidenceList = document.getElementById("evidence-list");
  evidenceList.innerHTML = "";

  evidences.forEach((ev) => {
    const card = document.createElement("div");
    card.className = `evidence-card ${ev.stance}`;
    card.innerHTML = `
      <div class="evidence-header">
        <span class="evidence-source">${escapeHtml(ev.source_name)}</span>
        <span class="evidence-stance ${ev.stance}">${ev.stance}</span>
      </div>
      <div class="evidence-content">${escapeHtml(ev.content)}</div>
      ${ev.url ? `<a href="${ev.url}" target="_blank" class="evidence-url">${ev.url}</a>` : ""}
    `;
    evidenceList.appendChild(card);
  });
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
    
    if (evidences.length === 0) {
        sidebarContent.innerHTML = "<p style='color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;'>No sources found.</p>";
        return;
    }

    evidences.forEach((ev) => {
        if (!ev.url) return; // Only show sources with URLs in the sidebar
        
        const card = document.createElement("div");
        card.className = "sidebar-source-card";
        card.innerHTML = `
            <div class="sidebar-source-name">${escapeHtml(ev.source_name)}</div>
            <div class="sidebar-source-type">${ev.source_type.replace('_', ' ')}</div>
            <a href="${ev.url}" target="_blank" class="sidebar-link">Open Original Source ↗</a>
        `;
        sidebarContent.appendChild(card);
    });
};
