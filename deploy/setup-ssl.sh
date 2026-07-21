#!/bin/bash
set -e

DOMAIN="aegiscloud.hackura.app"
EMAIL="admin@hackura.app"

echo "Installing Certbot..."
sudo apt-get update -y
sudo apt-get install -y certbot python3-certbot-nginx

# Step 1: Deploy the clean HTTP-only nginx config first
echo "Deploying HTTP-only Nginx config..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/aegiscloud
sudo ln -sf /etc/nginx/sites-available/aegiscloud /etc/nginx/sites-enabled/aegiscloud
sudo rm -f /etc/nginx/sites-enabled/default

# Step 2: Test and start Nginx cleanly
echo "Starting Nginx..."
sudo nginx -t
sudo systemctl restart nginx

# Step 3: Now let certbot obtain the cert and rewrite the config automatically
echo "Obtaining SSL certificate for $DOMAIN..."
sudo certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --domains "$DOMAIN" \
  --redirect

# Step 4: Final reload
echo "Reloading Nginx with HTTPS..."
sudo nginx -t
sudo systemctl reload nginx

# Step 5: Auto-renewal cron
echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

echo ""
echo "SSL setup complete!"
echo "Your app is live at: https://$DOMAIN"
