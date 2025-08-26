#!/bin/bash

# GameConnect Setup Script for Hostinger VPS
# This script automates the deployment process

set -e

echo "🎮 GameConnect Setup Script"
echo "=========================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# Variables
APP_DIR="/var/www/gameconnect"
DB_NAME="gameconnect"
DB_USER="gameconnect_user"

echo "📦 Updating system packages..."
apt update && apt upgrade -y

echo "📥 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

echo "🐘 Installing PostgreSQL..."
apt install postgresql postgresql-contrib -y

echo "🔧 Installing additional tools..."
apt install git nginx ufw -y

echo "📊 Installing PM2..."
npm install -g pm2

echo "🗄️ Setting up database..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD 'GameConnect2024!';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
EOF

echo "📁 Setting up application directory..."
if [ ! -d "$APP_DIR" ]; then
    mkdir -p $APP_DIR
fi

echo "📦 Installing application dependencies..."
cd $APP_DIR
npm install

echo "⚙️ Setting up environment..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "DATABASE_URL=postgresql://$DB_USER:GameConnect2024!@localhost:5432/$DB_NAME" >> .env.local
    echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env.local
    echo "NODE_ENV=production" >> .env.local
    echo "PORT=5000" >> .env.local
fi

echo "🏗️ Building application..."
npm run build

echo "🗄️ Setting up database schema..."
npm run db:push

echo "🔒 Setting up firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443

echo "📁 Setting file permissions..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
mkdir -p $APP_DIR/uploads
chown -R www-data:www-data $APP_DIR/uploads

echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/gameconnect << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /var/www/gameconnect/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /uploads {
        root /var/www/gameconnect;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/gameconnect /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "✅ Setup complete!"
echo ""
echo "🎉 GameConnect is now running!"
echo "📍 Access your site at: http://$(curl -s ifconfig.me)"
echo "🔑 Admin panel: http://$(curl -s ifconfig.me)/admin"
echo "👤 Default login: admin / admin123"
echo ""
echo "⚠️  IMPORTANT: Change the default admin password immediately!"
echo ""
echo "📋 Useful commands:"
echo "   pm2 status          - Check application status"
echo "   pm2 logs gameconnect - View application logs"
echo "   pm2 restart gameconnect - Restart application"
echo "   systemctl status nginx - Check web server status"
echo ""
echo "📖 For SSL setup, run: certbot --nginx -d yourdomain.com"