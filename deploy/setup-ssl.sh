#!/bin/bash
set -e

DOMAIN="aegiscloud.hackura.app"
EMAIL="admin@hackura.app"

echo "Installing Certbot..."
sudo apt-get update -y
sudo apt-get install -y certbot python3-certbot-nginx

echo "Obtaining SSL certificate for $DOMAIN..."
sudo certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email $EMAIL \
  --domains $DOMAIN \
  --redirect

echo "Testing Nginx config..."
sudo nginx -t
sudo systemctl reload nginx

echo "Setting up auto-renewal cron..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

echo "SSL setup complete! Your app is now at https://$DOMAIN"
