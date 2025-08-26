# GitHub Setup Guide

Follow these steps to push your GameConnect project to GitHub and deploy it on your Hostinger VPS.

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `gameconnect`
   - **Description**: `A comprehensive gaming portal platform with content management, blog system, and ad management`
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 2: Push Code to GitHub

Open your terminal in the project directory and run these commands:

```bash
# Check current status
git status

# Add all files to staging
git add .

# Commit the changes
git commit -m "Initial commit: Complete GameConnect platform with admin dashboard, blog system, and ad management"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/gameconnect.git

# Push to GitHub
git push -u origin main
```

If you get an authentication error, you'll need to:
1. Generate a Personal Access Token at GitHub.com → Settings → Developer settings → Personal access tokens
2. Use the token as your password when prompted

## Step 3: Clone on Your Hostinger VPS

Once the code is on GitHub, follow these steps on your VPS:

### A. Connect to Your VPS
```bash
ssh root@your-vps-ip
```

### B. Run the Automated Setup
```bash
# Clone the repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/gameconnect.git
cd gameconnect

# Make setup script executable
chmod +x setup.sh

# Run the automated setup (this will install everything)
./setup.sh
```

The setup script will:
- Install Node.js, PostgreSQL, Nginx, and PM2
- Set up the database
- Configure the application
- Start all services
- Configure the firewall

### C. Manual Setup (Alternative)

If you prefer manual setup, follow these commands:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install tools
apt install git nginx ufw -y

# Install PM2
npm install -g pm2

# Set up database
sudo -u postgres psql << EOF
CREATE DATABASE gameconnect;
CREATE USER gameconnect_user WITH PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE gameconnect TO gameconnect_user;
ALTER USER gameconnect_user CREATEDB;
EOF

# Navigate to app directory
cd /var/www/gameconnect

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
nano .env.local
```

Add to `.env.local`:
```env
DATABASE_URL=postgresql://gameconnect_user:YourSecurePassword123!@localhost:5432/gameconnect
SESSION_SECRET=your_very_long_random_secret_key_minimum_32_characters
NODE_ENV=production
PORT=5000
```

```bash
# Build application
npm run build

# Set up database
npm run db:push

# Set permissions
chown -R www-data:www-data /var/www/gameconnect
chmod -R 755 /var/www/gameconnect
mkdir -p /var/www/gameconnect/uploads
chown -R www-data:www-data /var/www/gameconnect/uploads

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
nano /etc/nginx/sites-available/gameconnect
```

Add Nginx configuration:
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

```bash
# Enable site
ln -s /etc/nginx/sites-available/gameconnect /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Configure firewall
ufw enable
ufw allow ssh
ufw allow 80
ufw allow 443
```

## Step 4: Access Your Application

1. Find your server IP: `curl ifconfig.me`
2. Open browser and go to: `http://your-server-ip`
3. Admin panel: `http://your-server-ip/admin`
4. Default login: `admin` / `admin123`

## Step 5: Secure Your Installation

### Change Default Password
1. Login to admin panel
2. Go to User Management
3. Change admin password immediately

### Set Up SSL (Optional but Recommended)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 6: Configure Your Site

### Basic Settings
1. Go to `/admin/settings`
2. Update site title and description
3. Add your logo and favicon
4. Configure email settings (if using SendGrid)

### Add Content
1. **Games**: Add games through `/admin/games`
2. **Blog**: Create blog posts at `/admin/blog`
3. **Team**: Add team members at `/admin/team`
4. **Ads**: Set up advertisements in the Ad Manager section

## Maintenance Commands

### Check Status
```bash
pm2 status                    # Check application
systemctl status nginx        # Check web server
systemctl status postgresql   # Check database
```

### View Logs
```bash
pm2 logs gameconnect         # Application logs
tail -f /var/log/nginx/error.log  # Nginx errors
```

### Restart Services
```bash
pm2 restart gameconnect      # Restart app
systemctl restart nginx     # Restart web server
```

### Update Application
```bash
cd /var/www/gameconnect
git pull origin main
npm install
npm run build
pm2 restart gameconnect
```

### Backup Database
```bash
sudo -u postgres pg_dump gameconnect > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Troubleshooting

### Common Issues

**502 Bad Gateway**
```bash
pm2 status
pm2 restart gameconnect
systemctl restart nginx
```

**Database Connection Error**
```bash
systemctl status postgresql
sudo -u postgres psql gameconnect -c "SELECT version();"
```

**Permission Issues**
```bash
chown -R www-data:www-data /var/www/gameconnect
chmod -R 755 /var/www/gameconnect
```

## Support

If you need help:
1. Check the logs: `pm2 logs gameconnect`
2. Review Nginx logs: `tail -f /var/log/nginx/error.log`
3. Ensure all services are running: `pm2 status`
4. Check firewall: `ufw status`

Your GameConnect platform should now be successfully deployed and running on your Hostinger VPS!

## Repository Structure

```
gameconnect/
├── client/                 # Frontend React application
├── server/                 # Backend Express application
├── shared/                 # Shared types and schemas
├── uploads/               # User uploaded files
├── README.md             # Main documentation
├── DEPLOYMENT.md         # Detailed deployment guide
├── GITHUB_SETUP.md       # This file
├── .env.example          # Environment variables template
├── ecosystem.config.js   # PM2 configuration
├── setup.sh             # Automated setup script
└── package.json         # Dependencies and scripts
```

## Next Steps

After successful deployment:
1. Configure your domain name (if you have one)
2. Set up SSL certificate
3. Configure email service (SendGrid)
4. Set up social login (Google, Facebook)
5. Add your games and content
6. Customize the design and branding
7. Set up regular backups

Congratulations! Your GameConnect platform is now live!