# AegisCloud — AWS EC2 Backend Deployment Guide

This directory contains the production REST API backend files for **AegisCloud Security Incident Management Platform** to fulfill your **CSBC 252 Capstone Project** requirements.

---

## 📁 Directory Structure
* `server.py`: **Python (FastAPI)** REST API Server (`/api/v1/incidents`, `/api/v1/health`, `/v1/webhooks`, `/saml2`).
* `server.js`: **Node.js (Express)** alternative REST API Server.
* `requirements.txt`: Python dependencies manifest (`fastapi`, `uvicorn`, `pydantic`).
* `package.json`: Node.js dependencies manifest (`express`, `cors`).
* `Dockerfile`: Container definition for AWS App Runner or Docker deployment.
* `deploy-ec2.sh`: One-click automated shell script to deploy and daemonize the server on an AWS EC2 Ubuntu instance.

---

## 🚀 Step-by-Step AWS EC2 Deployment

### Step 1: Launch your AWS EC2 Instance
1. In the AWS Management Console, navigate to **EC2** and click **Launch Instance**.
2. Select **Ubuntu 22.04 LTS (Free Tier Eligible)**.
3. Select Instance Type: `t2.micro` or `t3.micro` (Free Tier).
4. Under **Network Settings (Security Group)**, add the following Inbound Rules:
   - **HTTP**: Port `80` (Source: `0.0.0.0/0`)
   - **HTTPS**: Port `443` (Source: `0.0.0.0/0`)
   - **Custom TCP**: Port `8080` (Source: `0.0.0.0/0`) — *REST API Port*
   - **SSH**: Port `22` (Source: My IP)

---

### Step 2: Upload or Clone the Backend to EC2
SSH into your EC2 instance:
```bash
ssh -i "your-key.pem" ubuntu@ec2-YOUR-PUBLIC-IP.compute-1.amazonaws.com
```

Clone your repository or upload the `backend/` directory, then navigate inside:
```bash
cd backend
```

---

### Step 3: Run One-Click Automated Deployment
Make the deployment script executable and run it:
```bash
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

The script will automatically:
1. Install Python 3, pip, and virtualenv.
2. Install all required dependencies from `requirements.txt`.
3. Create a background `systemd` service (`aegis-api.service`) so the server stays online 24/7 even if you close SSH!

---

### Step 4: Verify Deployment & Update Frontend `.env`
1. Test your live endpoint in your browser:
   `http://YOUR-EC2-PUBLIC-IP:8080/api/v1/health`
2. View interactive Swagger API Docs:
   `http://YOUR-EC2-PUBLIC-IP:8080/docs`
3. Update your AegisCloud frontend `.env` file:
   ```bash
   VITE_API_BASE_URL="http://YOUR-EC2-PUBLIC-IP:8080/api/v1"
   VITE_SOAR_AUDIT_WEBHOOK_URL="http://YOUR-EC2-PUBLIC-IP:8080/api/v1/webhooks/audit-stream"
   ```
