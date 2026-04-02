// Application Config & Auth State
const API_BASE = "http://localhost:8000/api";
const state = {
    apiKeys: [],
    logs: [],
    token: localStorage.getItem('credify_token') || null,
    email: localStorage.getItem('credify_email') || null
};

// ── Routing & Auth Initialization ──

document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch if logged in
    if(state.token) {
        document.getElementById('view-auth').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        document.getElementById('user-email-display').textContent = state.email || 'Developer';
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
}

function setupNavigation() {
    const defaultView = 'apikeys';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.getAttribute('data-target');
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
            if(l.getAttribute('data-target') === hash) l.classList.add('active');
            else l.classList.remove('active');
        });
    } else {
        switchView(defaultView);
        document.querySelectorAll('.nav-link').forEach(l => {
            if(l.getAttribute('data-target') === defaultView) l.classList.add('active');
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
const authForm = document.getElementById('auth-form');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const authModeToggle = document.getElementById('auth-mode-toggle');
const authSubmitBtn = document.getElementById('auth-submit-btn');
let isLoginMode = true;

authModeToggle.onclick = () => {
    isLoginMode = !isLoginMode;
    authModeToggle.textContent = isLoginMode ? 'Need an account? Register' : 'Have an account? Login';
    authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Register';
    document.getElementById('auth-title').textContent = isLoginMode ? 'Login' : 'Register';
};

authForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = authEmailInput.value;
    const password = authPasswordInput.value;

    if (!email || !password) {
        showToast('Please enter both email and password', true);
        return;
    }

    try {
        let res;
        if (isLoginMode) {
            const formData = new URLSearchParams();
            formData.append('username', email); // OAuth2 expects username
            formData.append('password', password);
            res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: formData
            });
        } else {
            res = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });
        }
        
        const data = await res.json();

        if (res.ok) {
            state.token = data.access_token;
            state.email = email;
            localStorage.setItem('credify_token', data.access_token);
            localStorage.setItem('credify_email', email);
            document.getElementById('view-auth').style.display = 'none';
            document.getElementById('app').style.display = 'flex';
            document.getElementById('user-email-display').textContent = state.email;
            showToast(isLoginMode ? 'Logged in successfully!' : 'Registration successful! Please login.');
            initApp();
        } else {
            let errorMsg = 'Authentication failed';
            if (data.detail) {
                if (typeof data.detail === 'string') {
                    errorMsg = data.detail;
                } else if (Array.isArray(data.detail)) {
                    errorMsg = data.detail.map(err => err.msg).join(', ');
                }
            } else if (data.message) {
                errorMsg = data.message;
            }
            showToast(errorMsg, true);
        }
    } catch (e) {
        console.error(e);
        showToast('Network error or server unavailable', true);
    }
};

function logout() {
    state.token = null;
    state.email = null;
    localStorage.removeItem('credify_token');
    localStorage.removeItem('credify_email');
    document.getElementById('view-auth').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    document.getElementById('user-email-display').textContent = '';
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
        const res = await fetch(`${API_BASE}/auth/keys`, {headers: authHeaders()});
        if(!res.ok) {
            if(res.status === 401) logout();
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
        if(res.ok) {
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
        if(res.ok) {
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
    if(!confirm("Are you sure? Old key will stop working immediately.")) return;
    try {
        const res = await fetch(`${API_BASE}/auth/keys/${id}/regenerate`, {
            method: 'POST',
            headers: authHeaders()
        });
        if(res.ok) {
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
    if(!tbody) return;
    
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
    if(state.apiKeys.length > 0) {
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
    
    if(!claim) {
        showToast('Please enter a claim to verify', true);
        return;
    }
    
    if(!keyId) {
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

    try {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${selectedKey.key}`
            },
            body: JSON.stringify({text: claim})
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
        
        if(!res.ok) throw data;

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
                <span class="stance" style="color: ${s.stance === 'supports' ? 'var(--success)' : s.stance==='contradicts' ? 'var(--error)' : 'var(--slate-500)'}">${s.stance}</span>
            </li>
        `).join('') || '<li>No sources available</li>';

        document.getElementById('resp-json').textContent = JSON.stringify(data, null, 2);

        showToast(`Analysis completed successfully (${Math.round(latency)}ms)`);
        
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
        showToast('Verification request failed', true);
    } finally {
        btn.disabled = false;
    }
}

// ── Logs & Analytics ──

async function fetchLogs() {
    try {
        const res = await fetch(`${API_BASE}/auth/logs`, {headers: authHeaders()});
        if(res.ok) {
            state.logs = await res.json();
            renderLogs();
            fetchAnalyticsData(); // Update analytics when logs are fetched
        } else {
            if(res.status === 401) logout();
            const errorData = await res.json();
            console.error("Failed to fetch logs:", errorData);
        }
    } catch(e) { console.error(e); }
}

function renderLogs() {
    const tbody = document.getElementById('logs-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    if(state.logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:40px;color:var(--text-muted)">No logs found. Make a request in the Playground.</td></tr>`;
        return;
    }
    
    state.logs.forEach(log => {
        let badgeClass = 'badge-success';
        if(log.status === 'Likely False' || log.status === 'False') badgeClass = 'badge-error';
        if(log.status === 'Uncertain' || log.status === 'Not Verifiable') badgeClass = 'badge-neutral';
        
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
        if(l.status === 'Verified' || l.status === 'Likely True') successCount++;
        latSum += l.latency;
    });
    
    const rate = total > 0 ? Math.round((successCount/total)*100) : 0;
    const avgLat = total > 0 ? Math.round(latSum/total) : 0;
    
    const anaReqs = document.getElementById('ana-total');
    const anaRate = document.getElementById('ana-rate');
    const anaLat = document.getElementById('ana-latency');
    
    if(anaReqs) anaReqs.textContent = total;
    if(anaRate) anaRate.textContent = rate + '%';
    if(anaLat) anaLat.textContent = avgLat + 'ms';

    renderAnalyticsTable();
}

function renderAnalyticsTable() {
    const tbody = document.getElementById('analytics-keys-tbody');
    if(!tbody) return;
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
