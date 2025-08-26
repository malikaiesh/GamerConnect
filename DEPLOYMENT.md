# Deployment Guide - Hostinger VPS

This guide will walk you through deploying GameConnect on a Hostinger VPS step by step.

## Pre-deployment Checklist

- [ ] Hostinger VPS server ready
- [ ] Domain name configured (optional)
- [ ] SSH access credentials
- [ ] Basic understanding of command line

## Step-by-Step Deployment

### 1. Initial Server Setup

**Connect to your VPS:**
```bash
ssh root@your-server-ip
# Enter your password when prompted
```

**Update the system:**
```bash
apt update && apt upgrade -y
```

### 2. Install Required Software

**Install Node.js 18:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

**Install PostgreSQL:**
```bash
apt install postgresql postgresql-contrib -y
```

**Install additional tools:**
```bash
apt install git nginx ufw -y
```

**Verify installations:**
```bash
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
psql --version  # Should show PostgreSQL 14+
```

### 3. Database Setup

**Configure PostgreSQL:**
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE gameconnect;
CREATE USER gameconnect_user WITH PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE gameconnect TO gameconnect_user;
ALTER USER gameconnect_user CREATEDB;
\q
```

### 4. Application Setup

**Clone the repository:**
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/gameconnect.git
cd gameconnect
```

**Install dependencies:**
```bash
npm install
```

**Configure environment:**
```bash
cp .env.example .env.local
nano .env.local
```

**Update .env.local with your settings:**
```env
DATABASE_URL=postgresql://gameconnect_user:YourSecurePassword123!@localhost:5432/gameconnect
SESSION_SECRET=your_very_long_random_secret_key_minimum_32_characters
NODE_ENV=production
PORT=5000
```

**Set up database:**
```bash
npm run db:push
```

**Build the application:**
```bash
npm run build
```

### 5. Process Management with PM2

**Install PM2:**
```bash
npm install -g pm2
```

**Start the application:**
```bash
pm2 start ecosystem.config.js
```

**Configure PM2 for auto-start:**
```bash
pm2 save
pm2 startup
# Follow the instructions shown
```

### 6. Web Server Configuration

**Create Nginx configuration:**
```bash
nano /etc/nginx/sites-available/gameconnect
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
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
```

**Enable the site:**
```bash
ln -s /etc/nginx/sites-available/gameconnect /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 7. Security Configuration

**Configure firewall:**
```bash
ufw enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw status
```

**Set proper file permissions:**
```bash
chown -R www-data:www-data /var/www/gameconnect
chmod -R 755 /var/www/gameconnect
mkdir -p /var/www/gameconnect/uploads
chown -R www-data:www-data /var/www/gameconnect/uploads
```

### 8. SSL Certificate (Recommended)

**Install Certbot:**
```bash
apt install certbot python3-certbot-nginx -y
```

**Get SSL certificate:**
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

**Set up auto-renewal:**
```bash
crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Verification Steps

### 1. Check Application Status
```bash
pm2 status        # Should show 'online'
pm2 logs gameconnect  # Check for any errors
```

### 2. Check Web Server
```bash
systemctl status nginx  # Should be active
curl -I http://localhost  # Should return 200 OK
```

### 3. Check Database
```bash
sudo -u postgres psql gameconnect -c "\dt"  # Should show tables
```

### 4. Test Website
- Open your domain in a browser
- Check if homepage loads
- Try accessing `/admin` page
- Test login with default credentials (admin/admin123)

## Post-Deployment Tasks

### 1. Change Default Admin Password
- Login to `/admin`
- Go to User Management
- Change admin password

### 2. Configure Application Settings
- Set site title and description
- Upload logo and favicon
- Configure email settings (if using SendGrid)

### 3. Set Up Monitoring
```bash
# Create log monitoring script
nano /usr/local/bin/gameconnect-monitor.sh
```

```bash
#!/bin/bash
LOG_FILE="/var/log/gameconnect/combined.log"
ERROR_COUNT=$(tail -n 100 $LOG_FILE | grep -i error | wc -l)

if [ $ERROR_COUNT -gt 10 ]; then
    echo "High error count detected: $ERROR_COUNT errors in last 100 lines"
    # Add notification logic here
fi
```

```bash
chmod +x /usr/local/bin/gameconnect-monitor.sh
# Add to crontab for periodic checks
```

## Maintenance Commands

### Application Management
```bash
# Restart application
pm2 restart gameconnect

# View logs
pm2 logs gameconnect

# Monitor resources
pm2 monit
```

### Database Backup
```bash
# Create backup
sudo -u postgres pg_dump gameconnect > /backups/gameconnect_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
nano /usr/local/bin/backup-gameconnect.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups"
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump gameconnect > $BACKUP_DIR/gameconnect_$(date +%Y%m%d_%H%M%S).sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "gameconnect_*.sql" -mtime +7 -delete
```

### Updates
```bash
cd /var/www/gameconnect
git pull origin main
npm install
npm run build
pm2 restart gameconnect
```

## Troubleshooting Common Issues

### Issue: 502 Bad Gateway
**Solution:**
```bash
pm2 status  # Check if app is running
pm2 restart gameconnect
systemctl restart nginx
```

### Issue: Database Connection Error
**Solution:**
```bash
systemctl status postgresql
sudo -u postgres psql gameconnect -c "SELECT version();"
# Check .env.local database URL
```

### Issue: Permission Denied on File Uploads
**Solution:**
```bash
chown -R www-data:www-data /var/www/gameconnect/uploads
chmod -R 755 /var/www/gameconnect/uploads
```

### Issue: High Memory Usage
**Solution:**
```bash
# Check memory usage
free -h
pm2 monit

# Adjust PM2 memory limit in ecosystem.config.js
max_memory_restart: '512M'  # Reduce if needed
```

## Performance Optimization

### 1. Enable Gzip Compression
Add to Nginx configuration:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 2. Set Up Caching
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Database Optimization
```sql
-- Run in PostgreSQL
VACUUM ANALYZE;
REINDEX DATABASE gameconnect;
```

## Security Best Practices

1. **Regular Updates:**
   ```bash
   apt update && apt upgrade -y
   npm audit fix
   ```

2. **Monitor Logs:**
   ```bash
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   pm2 logs gameconnect
   ```

3. **Backup Strategy:**
   - Daily database backups
   - Weekly full server backups
   - Test restore procedures

4. **Security Headers:**
   Add to Nginx configuration:
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-Content-Type-Options "nosniff";
   add_header X-XSS-Protection "1; mode=block";
   ```

Your GameConnect application should now be successfully deployed and running on your Hostinger VPS!