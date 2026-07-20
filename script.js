const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. STRICT CORS CONFIGURATION (MUST BE FIRST)
// ==========================================
// Because your frontend uses `credentials: 'include'`, we MUST specify the
// exact origin domain. Wildcards (*) will fail when credentials are true.
const corsOptions = {
    origin: 'https://krutikawarke2005-rgb.github.io', 
    credentials: true, // Crucial to accept incoming cross-origin sessions/cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 // Safeguard for older browsers / preflights
};

// Apply CORS options globally across all routing pipelines
app.use(cors(corsOptions));

// Explicitly handle browser CORS preflight OPTIONS requests across all paths
app.options('*', cors(corsOptions));


// ==========================================
// 2. STANDARD MIDDLEWARE
// ==========================================
app.use(express.json()); // Parses application/json incoming payloads


// ==========================================
// 3. MOCK DATABASE SEED DATA
// ==========================================
let clientCasesList = [
    {
        id: "CASE-9901",
        name: "John Doe",
        account: "XXXX-XXXX-1234",
        device: "iPhone 15 Pro",
        location: "New York, USA",
        amount: "$4,500",
        riskPercent: 92,
        description: "Multiple high-velocity transactions detected outside habitual spending parameters."
    }
];

let metricsData = {
    fraudBlockedCount: 14,
    mitigatedExposureAmount: 124500
};


// ==========================================
// 4. API ROUTING ENDPOINTS
// ==========================================

// --- AUTH ROUTING ---
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing authentication fields." });
    }

    // Replace with real database lookup or JWT creation logic as required
    if (email === "admin@securebank.com") {
        return res.json({ 
            email: email, 
            role: "Admin" 
        });
    }

    res.json({ 
        email: email, 
        role: "Staff" 
    });
});

app.post('/auth/logout', (req, res) => {
    // Session termination/cookie clearance routine should go here if relevant
    res.json({ success: true, message: "Session signed out securely." });
});


// --- DASHBOARD DATA ROUTING ---
app.get('/dashboard/data', (req, res) => {
    res.json({
        metrics: metricsData,
        cases: clientCasesList,
        auditLogs: [
            "⚙️ SYSTEM BOOTSTRAP: Secure gateway firewall handshakes online.",
            "🤖 ANOMALY ENGINE: Behavioral analysis model metrics synced normally.",
            "🛡️ ACCESS LOG: User authentication validated successfully."
        ]
    });
});


// --- CASE RESOLUTION ROUTING ---
app.post('/cases/resolve', (req, res) => {
    const { caseId, isFraud } = req.body;
    
    // Filter and pull item matching incoming requirement
    clientCasesList = clientCasesList.filter(c => c.id !== caseId);
    
    if (isFraud) {
        metricsData.fraudBlockedCount += 1;
    }

    res.json({ success: true, message: "Case updated successfully." });
});


// --- SIMULATED EMERGENCY DATA ROUTING ---
app.post('/cases/simulate', (req, res) => {
    const randomId = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase = {
        id: randomId,
        name: "Jane Smith",
        account: "XXXX-XXXX-5678",
        device: "Samsung S24 Ultra",
        location: "London, UK",
        amount: "$12,800",
        riskPercent: Math.floor(40 + Math.random() * 55),
        description: "Simulated anomaly transaction flag triggered via remote endpoint."
    };

    clientCasesList.unshift(newCase);
    res.json({ success: true, case: newCase });
});


// ==========================================
// 5. SERVER INITIALIZATION
// ==========================================
app.listen(PORT, () => {
    console.log(`Backend server successfully initialized on port ${PORT}`);
});
