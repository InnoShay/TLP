// Application Config & Auth State
const API_BASE = "http://localhost:8001/api";
const state = {
    apiKeys: [],
    logs: [],
    token: localStorage.getItem('credify_token') || null,
    email: localStorage.getItem('credify_email') || null,
    role: localStorage.getItem('credify_role') || 'user'
};

// ── Routing & Auth Initialization ──

document.addEventListener('DOMContentLoaded', () => {
    // Check URL parameters for IBM App ID callback token
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const emailFromUrl = urlParams.get('email');
    const roleFromUrl = urlParams.get('role');
    
    if (tokenFromUrl) {
        state.token = tokenFromUrl;
        state.email = emailFromUrl;
        state.role = roleFromUrl || 'user';
        localStorage.setItem('credify_token', tokenFromUrl);
        localStorage.setItem('credify_email', emailFromUrl);
        localStorage.setItem('credify_role', state.role);
        // Clear token from URL for security
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Initial fetch if logged in
    if (state.token) {
        document.getElementById('view-auth').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        const roleBadge = state.role === 'admin' ? '<span style="background:var(--primary);color:white;padding:2px 6px;border-radius:4px;font-size:10px;margin-left:8px;">ADMIN</span>' : '';
        document.getElementById('user-email-display').innerHTML = (state.email || 'Developer') + roleBadge;
        initApp();
    } else {
        document.getElementById('view-auth').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }

    // Setup Navigation Listeners
    setupNavigation();

    // Setup Modals
    const keyModal = document.getElementById('key-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const btnCreateModalKey = document.getElementById('btn-create-key');
    const newKeyNameInput = document.getElementById('new-key-name');

    const btnGenerateKey = document.getElementById('btn-generate-key');
    if (btnGenerateKey) btnGenerateKey.onclick = () => {
        newKeyNameInput.value = '';
        keyModal.classList.add('active');
        newKeyNameInput.focus();
    };

    if (btnCloseModal) btnCloseModal.onclick = () => keyModal.classList.remove('active');
    if (btnCancelModal) btnCancelModal.onclick = () => keyModal.classList.remove('active');
    if (btnCreateModalKey) {
        btnCreateModalKey.onclick = () => {
            const name = newKeyNameInput.value.trim();
            if (name) {
                generateKey(name);
                keyModal.classList.remove('active');
            } else {
                showToast('Please enter a name for your key', true);
            }
        };
    }
});

function initApp() {
    fetchApiKeys();
    fetchLogs();
    setupDocsNav();
}

function setupDocsNav() {
    const docsNav = document.getElementById('docs-nav');
    if (!docsNav) return;

    docsNav.querySelectorAll('li[data-section]').forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            docsNav.querySelectorAll('li').forEach(l => l.classList.remove('active'));
            item.classList.add('active');

            // Scroll to section
            const sectionId = item.getAttribute('data-section');
            const target = document.getElementById(sectionId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function setupNavigation() {
    const defaultView = 'apikeys';

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.getAttribute('data-target');
            
            // RBAC: Restrict analytics and settings to admins only
            if ((view === 'analytics' || view === 'settings') && state.role !== 'admin') {
                showToast('Admin access required for this section', true);
                return;
            }
            
            switchView(view);

            // Update active state in sidebar
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    // Initial view rendering handles hash navigation
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
        switchView(hash);
        document.querySelectorAll('.nav-link').forEach(l => {
            if (l.getAttribute('data-target') === hash) l.classList.add('active');
            else l.classList.remove('active');
        });
    } else {
        switchView(defaultView);
        document.querySelectorAll('.nav-link').forEach(l => {
            if (l.getAttribute('data-target') === defaultView) l.classList.add('active');
            else l.classList.remove('active');
        });
    }
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add('active');
        window.location.hash = viewId;
        const navItem = document.querySelector(`.nav-link[data-target="${viewId}"]`);
        if (navItem) {
            document.getElementById('page-title').textContent = navItem.textContent;
        }
    }

    // Trigger view specific logic
    if (viewId === 'apikeys') fetchApiKeys();
    if (viewId === 'logs') fetchLogs();
    if (viewId === 'analytics') fetchAnalyticsData();
    if (viewId === 'overview') fetchAnalyticsData(); // Overview uses same data as analytics
    if (viewId === 'playground') updatePlaygroundSelectors();
}

// Helper: Toast
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + (isError ? 'error' : '');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Helper: Auth Headers
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
    };
}

// ── Auth Feature ──
const btnIbmLogin = document.getElementById('btn-ibm-login');

if (btnIbmLogin) {
    btnIbmLogin.onclick = () => {
        // Redirect to backend IBM App ID login endpoint
        window.location.href = `${API_BASE}/auth/appid/login`;
    };
}

function logout() {
    state.token = null;
    state.email = null;
    localStorage.removeItem('credify_token');
    localStorage.removeItem('credify_email');
    localStorage.removeItem('credify_role');
    document.getElementById('view-auth').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    document.getElementById('user-email-display').innerHTML = '';
    showToast('Logged out');
    // Clear state data
    state.apiKeys = [];
    state.logs = [];
    // Reset views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-auth').classList.add('active');
}

// ── API Key Management ──

async function fetchApiKeys() {
    try {
        const res = await fetch(`${API_BASE}/auth/keys`, { headers: authHeaders() });
        if (!res.ok) {
            if (res.status === 401) logout();
            throw new Error("Failed to fetch keys");
        }
        state.apiKeys = await res.json();
        renderApiKeys();
        updatePlaygroundSelectors();
    } catch (e) {
        console.error(e);
    }
}
// ── API Key Management ──

async function generateKey(name) {
    try {
        const res = await fetch(`${API_BASE}/auth/keys?name=${encodeURIComponent(name)}`, {
            method: 'POST',
            headers: authHeaders()
        });
        if (res.ok) {
            await fetchApiKeys();
            showToast('API Key generated successfully');
        } else {
            const errorData = await res.json();
            showToast(errorData.message || 'Error generating key', true);
        }
    } catch (e) {
        showToast('Error generating key', true);
    }
}

async function deleteKey(id) {
    try {
        const res = await fetch(`${API_BASE}/auth/keys/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (res.ok) {
            await fetchApiKeys();
            showToast('API Key deleted');
        } else {
            const errorData = await res.json();
            showToast(errorData.message || 'Error deleting key', true);
        }
    } catch (e) {
        console.error(e);
    }
}

async function regenerateKey(id) {
    if (!confirm("Are you sure? Old key will stop working immediately.")) return;
    try {
        const res = await fetch(`${API_BASE}/auth/keys/${id}/regenerate`, {
            method: 'POST',
            headers: authHeaders()
        });
        if (res.ok) {
            await fetchApiKeys();
            showToast('API Key regenerated securely');
        } else {
            const errorData = await res.json();
            showToast(errorData.message || 'Error regenerating key', true);
        }
    } catch (e) {
        console.error(e);
    }
}

function renderApiKeys() {
    const tbody = document.getElementById('api-keys-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (state.apiKeys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:40px;color:var(--text-muted)">No API keys found. Generate one to get started.</td></tr>';
        return;
    }

    state.apiKeys.forEach(k => {
        const masked = k.key.substring(0, 12) + '••••••••••••••••';
        const date = new Date(k.created_at).toLocaleDateString();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-medium">${k.name}</td>
            <td class="code-font">${masked}</td>
            <td>${date}</td>
            <td>${k.usage} reqs</td>
            <td class="text-right">
                <button class="btn btn-secondary btn-sm" onclick="copyToClipboard('${k.key}')">Copy</button>
                <button class="btn btn-secondary btn-sm" onclick="regenerateKey('${k.id}')">Regenerate</button>
                <button class="btn btn-danger btn-sm" onclick="deleteKey('${k.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
}

// ── Feature: Playground (Simulated Backend verification) ──
const pgKeySelect = document.getElementById('pg-api-key');
const pgClaimInput = document.getElementById('pg-claim');
const pgCurlClaim = document.getElementById('pg-curl-claim');
const pgCurlKey = document.getElementById('pg-curl-key');
const btnAnalyze = document.getElementById('btn-analyze-claim');

function updatePlaygroundSelectors() {
    pgKeySelect.innerHTML = state.apiKeys.map(k => `<option value="${k.id}">${k.name} (${k.key.substring(0, 12)}...)</option>`).join('');
    if (state.apiKeys.length > 0) {
        pgKeySelect.value = state.apiKeys[0].id;
        pgCurlKey.textContent = state.apiKeys[0].key;
    } else {
        pgCurlKey.textContent = 'YOUR_API_KEY';
    }
}

pgKeySelect.onchange = (e) => {
    const selectedKey = state.apiKeys.find(k => k.id === e.target.value);
    pgCurlKey.textContent = selectedKey ? selectedKey.key : 'YOUR_API_KEY';
};
pgClaimInput.oninput = (e) => pgCurlClaim.textContent = e.target.value || "...";

btnAnalyze.onclick = simulatePlaygroundRequest;

async function simulatePlaygroundRequest() {
    const btn = document.getElementById('btn-analyze-claim');
    const claim = pgClaimInput.value.trim();
    const keyId = pgKeySelect.value;

    if (!claim) {
        showToast('Please enter a claim to verify', true);
        return;
    }

    if (!keyId) {
        showToast('No API key selected. Please create one.', true);
        return;
    }

    const selectedKey = state.apiKeys.find(k => k.id === keyId);
    if (!selectedKey) {
        showToast('Selected API key not found.', true);
        return;
    }

    // UI Loading state
    document.getElementById('pg-empty').style.display = 'none';
    document.getElementById('pg-response').style.display = 'none';
    document.getElementById('pg-loading').style.display = 'flex';
    btn.disabled = true;

    // Reset NLU Panel
    document.getElementById('nlu-section').style.display = 'none';
    document.getElementById('nlu-sentiment').textContent = "Loading...";
    document.getElementById('nlu-emotion').textContent = "Loading...";
    document.getElementById('nlu-keywords').textContent = "Loading...";
    document.getElementById('nlu-entities').textContent = "Loading...";

    // Fire non-blocking NLU request
    const nluPromise = fetch(`${API_BASE}/nlu/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: claim })
    }).then(res => res.json()).catch(err => null);

    // Make window.nluPromise accessible to the rest of the function since it's global inside this scope isn't needed, but I'll define it as a global or just keep it in scope.
    // Wait, the later part is in the same async function. Let me attach it to the window just to be completely safe or declare it in scope. It's in the same scope, but let's just make sure it's accessible.
    window._currentNluPromise = nluPromise;

    try {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${selectedKey.key}`
            },
            body: JSON.stringify({ text: claim })
        });
        const latency = performance.now() - start;
        let data;
        try {
            data = await res.json();
        } catch (parseError) {
            // Handle non-JSON response (e.g. 500 HTML error)
            const text = await res.text();
            throw new Error(text.slice(0, 100) || `Server error: ${res.status}`);
        }

        if (!res.ok) throw data;

        // Update UI with response
        document.getElementById('pg-loading').style.display = 'none';
        document.getElementById('pg-response').style.display = 'flex';

        const score = data.truth_score || 0;
        document.getElementById('resp-score').textContent = score.toFixed(2);

        const status = data.classification || 'Uncertain';
        const stNode = document.getElementById('resp-status');

        // Map classification to CSS class
        let statusClass = 'status-uncertain';
        if (status === 'Verified' || status === 'Likely True') statusClass = 'status-verified';
        if (status === 'False' || status === 'Likely False') statusClass = 'status-false';

        stNode.className = 'resp-status ' + statusClass;
        stNode.textContent = status;

        document.getElementById('resp-reason').textContent = data.reasoning || 'No reasoning provided.';

        const evidences = data.evidences || [];
        document.getElementById('resp-sources').innerHTML = evidences.map(s => `
            <li>
                <span class="name">${s.source_name}</span>
                <span class="stance" style="color: ${s.stance === 'supports' ? 'var(--success)' : s.stance === 'contradicts' ? 'var(--error)' : 'var(--slate-500)'}">${s.stance}</span>
            </li>
        `).join('') || '<li>No sources available</li>';

        document.getElementById('resp-json').textContent = JSON.stringify(data, null, 2);

        document.getElementById('btn-speak-reasoning').style.display = 'inline-block';
        showToast(`Analysis completed successfully (${Math.round(latency)}ms)`);

        // Update NLU UI asynchronously when the promise resolves
        nluPromise.then(nluData => {
            if (nluData && nluData.insights) {
                document.getElementById('nlu-section').style.display = 'block';
                const i = nluData.insights;
                
                // Format Sentiment
                const sentScore = i.sentiment?.score || 0;
                let sentLabel = "😐 Neutral";
                if (sentScore > 0.25) sentLabel = "🟢 Positive";
                if (sentScore < -0.25) sentLabel = "🔴 Negative";
                document.getElementById('nlu-sentiment').textContent = `${sentLabel} (${sentScore.toFixed(2)})`;
                
                // Format Emotion
                if (i.emotion && Object.keys(i.emotion).length > 0) {
                    const topEmotion = Object.keys(i.emotion).reduce((a, b) => i.emotion[a] > i.emotion[b] ? a : b);
                    document.getElementById('nlu-emotion').textContent = `${topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1)} (${(i.emotion[topEmotion] * 100).toFixed(0)}%)`;
                } else {
                    document.getElementById('nlu-emotion').textContent = "N/A";
                }
                
                // Format Keywords and Entities
                document.getElementById('nlu-keywords').textContent = i.keywords && i.keywords.length ? i.keywords.join(", ") : "None";
                document.getElementById('nlu-entities').innerHTML = i.entities && i.entities.length 
                    ? i.entities.map(e => `<span style="background:#e2e8f0;padding:2px 4px;border-radius:4px;">${e.text}</span>`).join(" ") 
                    : "None";
            }
        });

        // Refresh logs and key usage silently
        fetchLogs();
        fetchApiKeys(); // To update usage count
    } catch (e) {
        document.getElementById('pg-loading').style.display = 'none';
        document.getElementById('pg-response').style.display = 'flex'; // Show response area for error
        document.getElementById('resp-json').textContent = JSON.stringify(e, null, 2);
        document.getElementById('resp-score').textContent = 'N/A';
        document.getElementById('resp-status').textContent = 'Error';
        document.getElementById('resp-status').className = 'resp-status status-error';
        document.getElementById('resp-reason').textContent = e.message || 'An unexpected error occurred.';
        document.getElementById('resp-sources').innerHTML = '';
        document.getElementById('btn-speak-reasoning').style.display = 'none';
        showToast('Verification request failed', true);
    } finally {
        btn.disabled = false;
    }
}

// ── Logs & Analytics ──

async function fetchLogs() {
    try {
        const res = await fetch(`${API_BASE}/auth/logs`, { headers: authHeaders() });
        if (res.ok) {
            state.logs = await res.json();
            renderLogs();
            fetchAnalyticsData(); // Update analytics when logs are fetched
        } else {
            if (res.status === 401) logout();
            const errorData = await res.json();
            console.error("Failed to fetch logs:", errorData);
        }
    } catch (e) { console.error(e); }
}

function renderLogs() {
    const tbody = document.getElementById('logs-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (state.logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:40px;color:var(--text-muted)">No logs found. Make a request in the Playground.</td></tr>`;
        return;
    }

    state.logs.forEach(log => {
        let badgeClass = 'badge-success';
        if (log.status === 'Likely False' || log.status === 'False') badgeClass = 'badge-error';
        if (log.status === 'Uncertain' || log.status === 'Not Verifiable') badgeClass = 'badge-neutral';

        const date = new Date(log.timestamp);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${date.toLocaleString()}</td>
            <td class="font-medium truncate" style="max-width:300px">${log.claim}</td>
            <td><span class="badge ${badgeClass}">${log.status}</span></td>
            <td>${log.score.toFixed(2)}</td>
            <td class="code-font">${log.latency}ms</td>
        `;
        tbody.appendChild(tr);
    });
}

function fetchAnalyticsData() {
    // Relying on locally cached logs from fetchLogs for simple aggregations
    // as it mirrors what Overview used to do.
    const total = state.logs.length;
    let successCount = 0;
    let latSum = 0;

    state.logs.forEach(l => {
        if (l.status === 'Verified' || l.status === 'Likely True') successCount++;
        latSum += l.latency;
    });

    const rate = total > 0 ? Math.round((successCount / total) * 100) : 0;
    const avgLat = total > 0 ? Math.round(latSum / total) : 0;

    const anaReqs = document.getElementById('ana-total');
    const anaRate = document.getElementById('ana-rate');
    const anaLat = document.getElementById('ana-latency');

    if (anaReqs) anaReqs.textContent = total;
    if (anaRate) anaRate.textContent = rate + '%';
    if (anaLat) anaLat.textContent = avgLat + 'ms';

    renderAnalyticsTable();
}

function renderAnalyticsTable() {
    const tbody = document.getElementById('analytics-keys-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    state.apiKeys.forEach(k => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-medium">${k.name}</td>
            <td>${k.usage}</td>
            <td>${k.usage > 0 ? 'Today' : 'Never'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ── Speech-to-Text (STT) Logic ──
const btnMic = document.getElementById('btn-mic');
let mediaRecorder;
let audioChunks = [];

if (btnMic) {
    btnMic.addEventListener('mousedown', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Let the browser choose its preferred audio format (Safari=mp4, Chrome=webm)
            mediaRecorder = new MediaRecorder(stream);
            const actualMimeType = mediaRecorder.mimeType || 'audio/webm';
            
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            
            mediaRecorder.onstop = async () => {
                btnMic.innerHTML = '⏳';
                const audioBlob = new Blob(audioChunks, { type: actualMimeType });
                audioChunks = []; // reset
                
                // Send to backend
                const formData = new FormData();
                formData.append('audio', audioBlob, 'speech.audio');
                formData.append('mime_type', actualMimeType);
                
                try {
                    const res = await fetch(`${API_BASE}/speech/stt`, {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    if (data.text) {
                        document.getElementById('pg-claim').value = data.text;
                        const claimCurl = document.getElementById('pg-curl-claim');
                        if(claimCurl) claimCurl.textContent = data.text;
                    } else if (!res.ok) {
                        console.error('STT Error:', data);
                        showToast('Speech recognition failed on server', true);
                    }
                } catch (err) {
                    showToast('Failed to transcribe audio', true);
                } finally {
                    btnMic.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>';
                }
            };
            
            audioChunks = [];
            mediaRecorder.start();
            btnMic.textContent = '🔴'; // Indicate recording
        } catch (err) {
            console.error('Mic error:', err);
            showToast('Microphone error or unsupported', true);
        }
    });

    // Stop recording when mouse is released
    btnMic.addEventListener('mouseup', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            // Stop all audio tracks to free the mic
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    });
}

// ── Text-to-Speech (TTS) Logic ──
const btnSpeak = document.getElementById('btn-speak-reasoning');

const speakerSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';

if (btnSpeak) {
    btnSpeak.onclick = async () => {
        const text = document.getElementById('resp-reason').textContent;
        if (!text || text === '...') return;
        
        btnSpeak.innerHTML = speakerSvg + ' Loading...';
        btnSpeak.disabled = true;

        const formData = new FormData();
        formData.append('text', text);

        try {
            const res = await fetch(`${API_BASE}/speech/tts`, {
                method: 'POST',
                body: formData
            });
            
            if (!res.ok) throw new Error("TTS failed");

            // Convert binary response to an audio URL and play it
            const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                btnSpeak.innerHTML = speakerSvg + ' Play Audio';
                btnSpeak.disabled = false;
            };
            
            audio.play();
            btnSpeak.innerHTML = speakerSvg + ' Playing...';
        } catch (err) {
            showToast('Failed to load audio', true);
            btnSpeak.innerHTML = speakerSvg + ' Play Audio';
            btnSpeak.disabled = false;
        }
    };
}
