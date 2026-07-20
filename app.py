from flask import Flask, jsonify, request, session
from flask_cors import CORS
import random

app = Flask(__name__)

# REPLACE THIS URL with your actual GitHub Pages deployment URL
CORS(app, supports_credentials=True, origins=["https://your-github-username.github.io"])

app.secret_key = 'super_secure_bank_operational_encryption_token_key'

# LIVE RUNTIME DATABASE STRUCTURE
daily_metrics = {
    "fraudBlockedCount": 42,
    "mitigatedExposureAmount": 184200.00
}

fraud_cases_list = [
    {
        "id": "INC-9941",
        "name": "Marcus Aurelius",
        "account": "Savings Account (••4902)",
        "amount": "$4,520.00",
        "riskPercent": 94,
        "vector": "Session Hijacking (Token Cloning)",
        "location": "Frankfurt, DE (IP: 194.22.109.4)",
        "device": "Chrome v122 (Linux x86_64)",
        "description": "Automated engine flags suspicious activity: a duplicate bearer key token signature was cloned out of market hours."
    },
    {
        "id": "INC-9942",
        "name": "Eleanor Vance",
        "account": "Checking Account (••1185)",
        "amount": "$12,800.00",
        "riskPercent": 88,
        "vector": "Credential Stuffing Attack",
        "location": "Ashburn, US (IP: 52.9.241.88)",
        "device": "Python-Requests Script Context",
        "description": "Multiple authentication requests structural mismatch occurred within 40 seconds. Credentials match external dark-web distributions."
    }
]

@app.route('/api/auth/login', methods=['POST'])
def secure_login():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email.endswith('@apexbank.com'):
        return jsonify({"error": "Access Violation: Target email domain must belong to @apexbank.com."}), 403
    
    if len(password) < 4:
        return jsonify({"error": "Authentication Refused: Invalid password credentials."}), 401
    
    role = "Admin" if email == "admin@apexbank.com" else "Officer"
    
    session['user_email'] = email
    session['user_role'] = role
    return jsonify({"success": True, "email": email, "role": role})

@app.route('/api/auth/logout', methods=['POST'])
def secure_logout():
    session.clear()
    return jsonify({"success": True})

@app.route('/api/dashboard/data', methods=['GET'])
def get_dashboard_data():
    return jsonify({
        "metrics": daily_metrics,
        "cases": fraud_cases_list
    })

@app.route('/api/cases/resolve', methods=['POST'])
def resolve_incident():
    data = request.json or {}
    case_id = data.get('caseId')
    is_fraud = data.get('isFraud', False)
    
    global fraud_cases_list
    target_case = next((c for c in fraud_cases_list if c['id'] == case_id), None)
    
    if not target_case:
        return jsonify({"error": "Case entry token not found."}), 404
        
    if is_fraud:
        daily_metrics['fraudBlockedCount'] += 1
        raw_amount = float(target_case['amount'].replace('$', '').replace(',', ''))
        daily_metrics['mitigatedExposureAmount'] += raw_amount
        
    fraud_cases_list = [c for c in fraud_cases_list if c['id'] != case_id]
    return jsonify({"success": True, "metrics": daily_metrics})

@app.route('/api/cases/simulate', methods=['POST'])
def simulate_threat():
    vectors = [
        {"title": "Simulated SIM Swap Anomaly", "desc": "Mobile network handshake identifier routing changed profile registers rapidly out-of-zone.", "loc": "Chicago, US", "dev": "Carrier API Hook"},
        {"title": "Malicious APK Overlay Spyware", "desc": "A side-loaded android application package structure was identified running structural process memory injection windows.", "loc": "Mumbai, IN", "dev": "Mobile App Webview"}
    ]
    
    choice = random.choice(vectors)
    random_id = f"INC-{random.randint(9944, 10500)}"
    
    new_case = {
        "id": random_id,
        "name": "Chloe Bennett",
        "account": "Savings Account (••2231)",
        "amount": f"${random.uniform(1200, 25000):,.2f}",
        "riskPercent": random.randint(72, 99),
        "vector": choice['title'],
        "location": choice['loc'],
        "device": choice['dev'],
        "description": choice['desc']
    }
    
    fraud_cases_list.insert(0, new_case)
    return jsonify({"success": True, "cases": fraud_cases_list})