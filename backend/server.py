import os
import time
from typing import List, Optional
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel

app = FastAPI(
    title="AegisCloud REST API & Security Gateway",
    description="CSBC 252 Capstone Project Production Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# PYDANTIC DATA MODELS
# ------------------------------------------------------------------------------

class IncidentPayload(BaseModel):
    title: str
    category: str
    severity: str
    description: str
    affectedSystems: Optional[List[str]] = ["Corporate Network"]

class WebhookPayload(BaseModel):
    playbookName: str
    incidentId: str
    executedAt: str
    status: str
    actionsCompleted: Optional[str] = "All Actions Completed"

# ------------------------------------------------------------------------------
# MOCK IN-MEMORY DATABASE (DynamoDB Simulation)
# ------------------------------------------------------------------------------

incidents_db = [
    {
        "id": "INC-2026-0841",
        "title": "Phishing Attempt impersonating HR Portal",
        "category": "Phishing",
        "severity": "HIGH",
        "status": "OPEN",
        "createdAt": "2026-07-18T22:00:00Z"
    },
    {
        "id": "INC-2026-0912",
        "title": "Anomalous S3 API Token Exfiltration",
        "category": "Unauthorized Access",
        "severity": "CRITICAL",
        "status": "INVESTIGATING",
        "createdAt": "2026-07-18T23:15:00Z"
    }
]

audit_logs_db = []

# ------------------------------------------------------------------------------
# REST API ENDPOINTS (/api/v1)
# ------------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "service": "AegisCloud REST API Backend",
        "status": "ONLINE",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "AegisCloud REST API",
        "timestamp": time.time(),
        "uptimeSeconds": time.process_time()
    }

@app.get("/api/v1/incidents")
def get_incidents(authorization: Optional[str] = Header(None)):
    return {
        "status": "SUCCESS",
        "count": len(incidents_db),
        "incidents": incidents_db
    }

@app.post("/api/v1/incidents")
def create_incident(payload: IncidentPayload):
    new_id = f"INC-2026-0{int(time.time()) % 10000}"
    new_inc = {
        "id": new_id,
        "title": payload.title,
        "category": payload.category,
        "severity": payload.severity,
        "description": payload.description,
        "status": "OPEN",
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    incidents_db.insert(0, new_inc)
    return {
        "status": "SUCCESS",
        "message": "Incident logged to DynamoDB",
        "incidentId": new_id,
        "data": new_inc
    }

# ------------------------------------------------------------------------------
# SOAR AUDIT WEBHOOK DISPATCHER (/api/v1/webhooks/audit-stream)
# ------------------------------------------------------------------------------

@app.post("/api/v1/webhooks/audit-stream")
def soar_audit_webhook(payload: WebhookPayload):
    webhook_event = {
        "id": f"wh-{int(time.time())}",
        "playbookName": payload.playbookName,
        "incidentId": payload.incidentId,
        "executedAt": payload.executedAt,
        "status": payload.status,
        "receivedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    audit_logs_db.insert(0, webhook_event)
    print(f"⚡ [SOAR WEBHOOK RECEIVED]: {payload.playbookName} for {payload.incidentId}")
    return {
        "status": "RECEIVED",
        "webhookId": webhook_event["id"],
        "message": "Audit event successfully ingested into CloudWatch SIEM stream"
    }

# ------------------------------------------------------------------------------
# SAML 2.0 SINGLE SIGN-ON GATEWAY (/saml2)
# ------------------------------------------------------------------------------

@app.get("/saml2")
def saml_sso_gateway(redirect_uri: str = "http://localhost:3000/#/incidents"):
    """
    SAML 2.0 Identity Provider Single Sign-On Gateway
    """
    return HTMLResponse(content=f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>AegisCloud SAML 2.0 SSO Gateway</title>
            <style>
                body {{ background-color: #0d1017; color: #f8fafc; font-family: sans-serif; text-align: center; padding-top: 100px; }}
                .card {{ background: #151924; border: 1px solid #272f45; border-radius: 8px; max-width: 400px; margin: 0 auto; padding: 30px; }}
                .spinner {{ border: 4px solid #272f45; border-top: 4px solid #f38020; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }}
                @keyframes spin {{ 0% {{ transform: rotate(0deg); }} 100% {{ transform: rotate(360deg); }} }}
            </style>
        </head>
        <body onload="setTimeout(function(){{ document.forms[0].submit(); }}, 1200)">
            <div class="card">
                <h2 style="color: #f38020;">AegisCloud Identity Gateway</h2>
                <div class="spinner"></div>
                <p>Authenticating Corporate SAML 2.0 Assertion...</p>
                <form method="GET" action="{redirect_uri}">
                    <input type="hidden" name="saml_auth" value="success"/>
                </form>
            </div>
        </body>
        </html>
    """)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    print(f"🚀 AegisCloud REST API Server starting on http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
