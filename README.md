<div align="center">

# 🛡️ AegisCloud
### Cloud-Native Security Incident Management Platform

*A cloud computing group project built on AWS — eu-north-1*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-FF9900?style=flat&logo=amazon-dynamodb)](https://aws.amazon.com/dynamodb/)
[![AWS S3](https://img.shields.io/badge/AWS-S3-FF9900?style=flat&logo=amazon-s3)](https://aws.amazon.com/s3/)
[![AWS EC2](https://img.shields.io/badge/AWS-EC2-FF9900?style=flat&logo=amazon-ec2)](https://aws.amazon.com/ec2/)

</div>

---

## 📌 Project Overview

**AegisCloud** is a full-stack, cloud-hosted **Security Incident Management Platform (CSIMP)** designed for enterprise Security Operations Centres (SOC). It enables security teams to report, triage, manage, and respond to cybersecurity incidents in real time.

This project was developed as a group coursework submission demonstrating the practical application of core AWS cloud services within a production-grade, multi-tenant SaaS web application.

---

## 🏗️ Architecture Overview

```
                       AWS Cloud (eu-north-1)
                       
         ┌─────────────────────────────────────┐
         │          EC2 (t2.micro)             │
         │                                     │
Internet ──▶  Nginx (Port 80)                  │
         │     ├── /         → React SPA       │
         │     └── /api/*    → Node.js :8080   │
         │                                     │
         │  PM2 (Process Manager)              │
         └──────────────┬──────────────────────┘
                        │ AWS SDK (IAM Role — no keys!)
         ┌──────────────┼──────────────────────────┐
         │              │                          │
         ▼              ▼                          ▼
      Amazon S3     Amazon DynamoDB          CloudWatch
  (Evidence Vault)  (All App Data)       (Logs & Metrics)
```

---

## ☁️ AWS Services Used

| Service | Purpose | Free Tier |
|---|---|---|
| **Amazon EC2** | Hosts the Nginx web server, React frontend, and Node.js backend | 750 hrs/month (t2.micro) |
| **Amazon DynamoDB** | NoSQL database storing Users, Orgs, Incidents, Invites, OTP sessions | 25 GB + 25 RCU/WCU |
| **Amazon S3** | Encrypted evidence file vault for uploaded incident attachments | 5 GB storage |
| **IAM** | Roles and policies granting EC2 scoped access to DynamoDB & S3 | Free |
| **CloudWatch** | Application logs, Nginx access logs, and performance metrics | 10 custom metrics free |
| **Security Groups** | Virtual firewall — only ports 80 (HTTP) and 22 (SSH) open | Free |

---

## ✨ Key Features

### 🔐 Multi-Tenant Authentication
- Organisation registration with **email domain verification** (real email via Resend)
- Admin-driven **team member invitations** with 24-hour expiry links
- Two-Factor Authentication via **email OTP** (6-digit code, 10-minute window)
- "Trust this device for 30 days" session management
- Role-based access control: **Super Admin**, **Admin**, **Analyst**, **Viewer**, **Employee**

### 📋 Incident Management
- Create, assign, escalate and close security incidents
- Priority levels: **Critical**, **High**, **Medium**, **Low**
- Full incident history, audit trail and status tracking
- Tag-based categorisation (Malware, Phishing, Ransomware, DDoS, etc.)

### 📁 S3 Evidence Vault
- Drag-and-drop file upload directly into incident tickets
- Files uploaded securely via **Pre-signed S3 URLs** (browser → S3, no server bottleneck)
- Supports screenshots, log files, PCAPs, PDFs, EML email exports

### 🛡️ Security Console
- WAF rules management view
- SOAR playbook automation library
- Threat intelligence feeds

### 📊 Analytics Dashboard
- Real-time incident metrics and trend charts
- AWS architecture visualiser panel
- Analyst workload distribution view

---

## 🗂️ Project Structure

```
aegiscloud/
├── src/                        # React frontend (Vite)
│   ├── components/             # All UI page and component files
│   ├── lib/                    # Types, store, mock data, API helpers
│   ├── App.tsx                 # Root app router
│   ├── main.tsx                # Vite entry point
│   └── index.css               # Global design system styles
│
├── backend/                    # Node.js Express API server
│   ├── server.js               # All API routes (auth, incidents, invites, S3)
│   ├── db.js                   # AWS DynamoDB client & CRUD helpers
│   ├── .env.example            # Environment variable template
│   └── package.json
│
├── deploy/                     # EC2 Deployment configs
│   ├── nginx.conf              # Nginx reverse proxy configuration
│   ├── ecosystem.config.js     # PM2 process manager configuration
│   └── deploy.sh               # Automated EC2 setup script
│
├── EC2_DEPLOYMENT_GUIDE.md     # Step-by-step deployment instructions
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 20+
- AWS CLI configured (`aws configure`)
- A [Resend](https://resend.com) account for email delivery

### 1. Clone & Install
```bash
git clone https://github.com/cloudcomputinggroup2/aegiscloud.git
cd aegiscloud

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Configure Environment
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and fill in:
- `RESEND_API_KEY` — from your Resend dashboard
- `JWT_SECRET` — generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `AWS_REGION` and `AWS_S3_EVIDENCE_BUCKET` — your provisioned bucket name

### 3. Run the App
```bash
# Terminal 1 — Backend
cd backend && node server.js

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🖥️ EC2 Deployment

See the full **[EC2_DEPLOYMENT_GUIDE.md](./EC2_DEPLOYMENT_GUIDE.md)** for detailed steps.

**Quick summary — once SSH'd into the EC2 instance:**
```bash
git clone https://github.com/cloudcomputinggroup2/aegiscloud.git
cd aegiscloud
cp backend/.env.example backend/.env
nano backend/.env          # Fill in your real secrets
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```
Your app will be live at `http://<your-ec2-ip>` automatically.

> **Note:** On EC2, never put AWS credentials in `.env`. Instead, attach an **IAM Role** with DynamoDB and S3 permissions to the EC2 instance — the AWS SDK will pick it up automatically.

---

## 🔑 DynamoDB Tables Provisioned

| Table Name | Primary Key | Purpose |
|---|---|---|
| `AegisCloud_Users` | `email` | All user accounts |
| `AegisCloud_Orgs` | `orgId` | Registered organisations |
| `AegisCloud_Incidents` | `incidentId` | Security incident records |
| `AegisCloud_Invites` | `token` | Team invite tokens |
| `AegisCloud_Tokens` | `token` | Email verification tokens |
| `AegisCloud_OtpSessions` | `sessionId` | 2FA OTP sessions |

---

## 👥 Group Members

> *(Add your group members' names here)*

---

## 📄 License

This project is submitted as academic coursework. All rights reserved.
