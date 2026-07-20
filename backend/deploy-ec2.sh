#!/bin/bash
# ==============================================================================
# AEGISCLOUD — AUTOMATED AWS EC2 BACKEND DEPLOYMENT SCRIPT
# Run this script on your AWS EC2 Ubuntu Instance to launch the REST API server!
# ==============================================================================

set -e

echo "🚀 Starting AegisCloud REST API Server Deployment on AWS EC2..."

# 1. Update system packages & install Python 3, pip & git
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv git

# 2. Set up virtual environment
echo "🐍 Setting up Python Virtual Environment..."
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
echo "📥 Installing Python dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

# 4. Create systemd background service
echo "⚙️ Creating Systemd Background Service (aegis-api)..."
sudo bash -c 'cat <<EOF > /etc/systemd/system/aegis-api.service
[Unit]
Description=AegisCloud REST API & Security Gateway Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory='$(pwd)'
ExecStart='$(pwd)'/venv/bin/python '$(pwd)'/server.py
Restart=always
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF'

# 5. Start and enable service
echo "🔄 Starting & Enabling AegisCloud API Service..."
sudo systemctl daemon-reload
sudo systemctl start aegis-api
sudo systemctl enable aegis-api

echo "=============================================================================="
echo "✅ AEGISCLOUD REST API SERVER IS LIVE ON AWS EC2!"
echo "🌐 API Endpoint: http://$(curl -s ifconfig.me):8080/api/v1/health"
echo "📄 Swagger API Docs: http://$(curl -s ifconfig.me):8080/docs"
echo "=============================================================================="
