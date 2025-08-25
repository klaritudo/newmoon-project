#!/bin/bash

# 도메인 접근 자동 설정 스크립트
# 새 도메인 추가 시 자동으로 개발 환경 설정

DOMAIN=$1
IP="220.95.232.167"

if [ -z "$DOMAIN" ]; then
    echo "Usage: ./setup-domain-access.sh <domain>"
    echo "Example: ./setup-domain-access.sh test.qnuta.com"
    exit 1
fi

echo "Setting up domain: $DOMAIN"

# 1. /etc/hosts에 추가 (개발 환경용)
echo "Adding to /etc/hosts..."
echo "$IP $DOMAIN" | sudo tee -a /etc/hosts

# 2. Nginx 설정 생성 (있다면)
if [ -d "/etc/nginx/sites-available" ]; then
    echo "Creating Nginx config..."
    cat > /tmp/nginx-$DOMAIN.conf <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    sudo mv /tmp/nginx-$DOMAIN.conf /etc/nginx/sites-available/$DOMAIN
    sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
fi

# 3. Vite 설정 업데이트
echo "Updating Vite config..."
# vite.config.js에 도메인 추가 로직

echo "Domain $DOMAIN setup complete!"
echo "Note: For Cloudflare domains, you may need to:"
echo "1. Enable Development Mode in Cloudflare"
echo "2. Add Page Rule for $DOMAIN"
echo "3. Or set DNS to 'DNS only' mode"