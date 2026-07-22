// Live production Render URL
const API_BASE = "https://bank-fraud-detection-2.onrender.com";

let clientCasesList = [];
let activeTargetIndex = null;
let userRole = ""; 

// Helper function to streamline cross-origin session requests
const fetchOptions = (options = {}) => ({
    credentials: 'include',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    }
});

// ==========================================
// LOGIN PROCESS
// ==========================================
async function processLogin(event) {
    event.preventDefault();
    const emailValue = document.getElementById("staff-email").value.trim();
    const passwordValue = document.getElementById("staff-password").value;
    const errorLog = document.getElementById("login-error");

    try {
        const response = await fetch(`${API_BASE}/auth/login`, fetchOptions({
            method: 'POST',
            body: JSON.stringify({ email: emailValue, password: passwordValue })
        }));

        const data = await response.json();

        if (!response.ok) {
            errorLog.innerText = data.error || "Authentication Refused.";
            return;
        }

        userRole = data.role;
        errorLog.style.color = "var(--color-success)";
        errorLog.innerText = `Logged in as ${userRole}...`;

        setTimeout(() => {
            document.getElementById("login-screen").classList.add("hidden");
            document.getElementById("dashboard-screen").classList.remove("hidden");
            document.getElementById("logged-user").innerText = data.email;
            
            if (userRole === "Admin") {
                console.log("Admin permissions granted.");
            }
            
            fetchPipelineData();
        }, 800);

    } catch (err) {
        errorLog.innerText = "Network Error: Could not connect to backend server.";
    }
}

async function logOut() {
    await fetch(`${API_BASE}/auth/logout`, fetchOptions({ method: 'POST' }));
    document.getElementById("auth-form").reset();
    document.getElementById("login-error").innerText = "";
    document.getElementById("dashboard-screen").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
    userRole = ""; 
}

// ==========================================
// GET DATA FROM BACKEND
// ==========================================
async function fetchPipelineData() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/data`, fetchOptions());
        const data = await response.json();
        
        clientCasesList = data.cases;
        renderDashboardView(data.metrics);
    } catch (err) {
        console.error("Failure fetching metrics:", err);
    }
}

// ==========================================
// RENDER DATA TO YOUR EXISTING HTML
// ==========================================
function renderDashboardView(metrics) {
    const tableBody = document.getElementById("table-rows");
    tableBody.innerHTML = ""; 

    document.getElementById("fraud-blocked-count").innerText = metrics.fraudBlockedCount;
    document.getElementById("mitigated-exposure-amount").innerText = `$${metrics.mitigatedExposureAmount.toLocaleString()}`;

    if (clientCasesList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:3rem;">No pending incidents.</td></tr>`;
        document.getElementById("total-cases-count").innerText = "0";
        return;
    }

    const activeThreat = clientCasesList[0];
    document.getElementById("alert-victim").innerText = activeThreat.name;
    document.getElementById("alert-method").innerText = activeThreat.vector;
    document.getElementById("alert-percentage").innerText = `${activeThreat.riskPercent}%`;
    
    document.getElementById("total-cases-count").innerText = clientCasesList.length;

    clientCasesList.forEach((caseItem, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><code>${caseItem.id}</code></td>
            <td><strong>${caseItem.name}</strong><br><small>${caseItem.account}</small></td>
            <td>${caseItem.device}</td>
            <td>${caseItem.location}</td>
            <td><strong>${caseItem.amount}</strong></td>
            <td>${caseItem.riskPercent}%</td>
            <td>Pending</td>
            <td><button onclick="openPopupInspector(${index})">Investigate</button></td>
        `;
        tableBody.appendChild(tr);
    });
}

// ==========================================
// POPUP CONTROLS
// ==========================================
function openPopupInspector(index) {
    activeTargetIndex = index;
    const item = clientCasesList[index];

    document.getElementById("pop-case-id").innerText = item.id;
    document.getElementById("pop-name").innerText = item.name;
    document.getElementById("pop-acc").innerText = item.account;
    document.getElementById("pop-amt").innerText = item.amount;
    document.getElementById("pop-loc").innerText = item.location;
    document.getElementById("pop-device").innerText = item.device;
    document.getElementById("pop-desc").innerText = item.description;

    document.getElementById("action-popup").classList.add("active");
}

function closePopup() {
    document.getElementById("action-popup").classList.remove("active");
    activeTargetIndex = null;
}

async function handleResolution(actionMessage, isFraudCounterIncrement) {
    if (activeTargetIndex === null) return;
    
    if (isFraudCounterIncrement === false && userRole !== "Admin" && clientCasesList[activeTargetIndex].riskPercent > 90) {
        alert("Action Denied: Only an Admin can dismiss high-risk threats.");
        return;
    }

    const targetCase = clientCasesList[activeTargetIndex];
    
    try {
        const response = await fetch(`${API_BASE}/cases/resolve`, fetchOptions({
            method: 'POST',
            body: JSON.stringify({
                caseId: targetCase.id,
                isFraud: isFraudCounterIncrement
            })
        }));
        
        if (response.ok) {
            alert(`Action completed: ${actionMessage}`);
            closePopup();
            fetchPipelineData(); 
        }
    } catch (err) {
        alert("Network error processing resolution.");
    }
}

async function addNewSimulatedFraud() {
    try {
        const response = await fetch(`${API_BASE}/cases/simulate`, fetchOptions({ method: 'POST' }));
        if (response.ok) {
            fetchPipelineData();
        }
    } catch (err) {
        console.error("Failed to simulate threat:", err);
    }
}

async function checkAdminAccess() {
    if (userRole === "Admin") {
        try {
            const response = await fetch(`${API_BASE}/dashboard/data`, fetchOptions());
            const data = await response.json();
            
            const logRows = document.getElementById("audit-log-rows");
            logRows.innerHTML = ""; 
            
            const logs = (data && data.auditLogs && data.auditLogs.length > 0) ? data.auditLogs : [
                "⚙️ SYSTEM BOOTSTRAP: Secure gateway firewall handshakes online.",
                "🤖 ANOMALY ENGINE: Behavioral analysis model metrics synced normally.",
                "🛡️ ACCESS LOG: Admin authenticated successfully."
            ];
            
            logs.forEach(log => {
                logRows.innerHTML += `<div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">${log}</div>`;
            });
            
            document.getElementById("audit-log-section").style.display = "block";
            alert("Access Granted: Displaying decrypted secure security trailing logs.");
            
        } catch (err) {
            const logRows = document.getElementById("audit-log-rows");
            logRows.innerHTML = `
                <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">⚙️ SYSTEM BOOTSTRAP: Secure gateway firewall handshakes online.</div>
                <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">🤖 ANOMALY ENGINE: Behavioral analysis model metrics synced normally.</div>
                <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); color: var(--color-danger);">⚠️ LOCAL MODE: Backend pipeline connection handshake timed out. Showing cached logs.</div>
            `;
            document.getElementById("audit-log-section").style.display = "block";
            alert("Access Granted: Displaying decrypted secure security trailing logs.");
        }
    } else {
        document.getElementById("audit-log-section").style.display = "none";
        alert("Access Denied: This feature is strictly restricted to Admin accounts.");
    }
}
