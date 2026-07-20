#!/bin/bash
set -e

echo "🚀 Starting AegisCloud EC2 Deployment..."

# 1. Update and install dependencies
echo "📦 Installing system dependencies (Nginx, Node.js, PM2)..."
sudo apt-get update
sudo apt-get install -y nginx curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# 2. Build Frontend
echo "🏗️ Building Frontend (Vite/React)..."
npm install
npm run build

# 3. Setup Nginx
echo "🌐 Configuring Nginx Reverse Proxy..."
sudo mkdir -p /var/www/aegiscloud
sudo cp -r dist/* /var/www/aegiscloud/
sudo cp deploy/nginx.conf /etc/nginx/sites-available/aegiscloud
sudo ln -sf /etc/nginx/sites-available/aegiscloud /etc/nginx/sites-enabled/
# Remove default nginx welcome page
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

# 4. Setup Backend
echo "⚙️ Configuring Backend (Node.js/PM2)..."
cd backend
npm install
cd ..

# 5. Start with PM2
echo "🚀 Starting server with PM2..."
pm2 start deploy/ecosystem.config.js
pm2 save
# Optional: Setup PM2 to start on boot
echo "To make PM2 start on boot, run: pm2 startup"

echo "✅ Deployment Complete! AegisCloud is now serving on port 80."
