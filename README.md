# GameConnect - Gaming Portal Platform

A comprehensive gaming portal platform with content management, blog system, ad management, and user authentication. Built with React, Node.js, Express, and PostgreSQL.

## Features

- 🎮 Game hosting and management with external API integration
- 📝 Full-featured blog system with rich text editor
- 🏠 Dynamic homepage content management
- 👥 Team management and user authentication
- 📊 Analytics and performance tracking
- 💰 Comprehensive ad management system (Home Ads, Games Ads, Blog Ads)
- 🔧 Admin dashboard with role-based access control
- 📱 Responsive design with dark/light mode support
- 🔍 SEO optimization with sitemaps and meta management

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Wouter (routing)
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI, shadcn/ui
- **Rich Text**: TinyMCE
- **Authentication**: Passport.js with local and OAuth strategies
- **File Upload**: Multer with image processing

## Prerequisites

Before installing, make sure you have:

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Git
- A VPS server (Hostinger VPS or similar)

## Installation Guide for Hostinger VPS

### Step 1: Connect to Your VPS

```bash
# Connect via SSH (replace with your VPS IP and credentials)
ssh root@your-vps-ip
```

### Step 2: Update System and Install Dependencies

```bash
# Update system packages
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install Git and other tools
apt install git nginx ufw -y

# Verify installations
node --version
npm --version
psql --version
```

### Step 3: Set Up PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, create database and user
CREATE DATABASE gameconnect;
CREATE USER gameconnect_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE gameconnect TO gameconnect_user;
\q
```

### Step 4: Clone the Repository

```bash
# Navigate to web directory
cd /var/www

# Clone the repository
git clone https://github.com/YOUR_USERNAME/gameconnect.git
cd gameconnect

# Install dependencies
npm install
```

### Step 5: Environment Configuration

```bash
# Copy environment file
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

Add these environment variables to `.env.local`:

```env
# Database Configuration
DATABASE_URL=postgresql://gameconnect_user:your_secure_password@localhost:5432/gameconnect

# Session Secret (generate a random string)
SESSION_SECRET=your_very_long_random_secret_key_here

# Server Configuration
NODE_ENV=production
PORT=5000

# GameMonetize API (optional - for external games)
GAMEMONETIZE_API_KEY=your_api_key_here

# SendGrid (optional - for emails)
SENDGRID_API_KEY=your_sendgrid_api_key

# OAuth (optional - for social login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# OpenAI (optional - for AI features)
OPENAI_API_KEY=your_openai_api_key
```

### Step 6: Database Setup

```bash
# Run database migrations
npm run db:push

# Seed the database with initial data
npm run db:seed
```

### Step 7: Build the Application

```bash
# Build the frontend
npm run build

# The built files will be in the dist/ directory
```

### Step 8: Set Up Nginx Reverse Proxy

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/gameconnect
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Serve static files
    location / {
        root /var/www/gameconnect/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js
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

    # Handle uploaded files
    location /uploads {
        root /var/www/gameconnect;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/gameconnect /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 9: Set Up PM2 for Process Management

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this configuration:

```javascript
module.exports = {
  apps: [{
    name: 'gameconnect',
    script: 'server/index.js',
    cwd: '/var/www/gameconnect',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/gameconnect/error.log',
    out_file: '/var/log/gameconnect/out.log',
    log_file: '/var/log/gameconnect/combined.log',
    time: true
  }]
};
```

```bash
# Create log directory
mkdir -p /var/log/gameconnect

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the instructions shown
```

### Step 10: Configure Firewall

```bash
# Enable UFW
ufw enable

# Allow SSH (important!)
ufw allow ssh

# Allow HTTP and HTTPS
ufw allow 80
ufw allow 443

# Check status
ufw status
```

### Step 11: SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up auto-renewal
crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Local Development Setup

For local development on your computer:

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/gameconnect.git
cd gameconnect
npm install
```

### 2. Set Up Local Database

```bash
# Install PostgreSQL locally
# On Ubuntu/Debian:
sudo apt install postgresql postgresql-contrib

# On macOS with Homebrew:
brew install postgresql

# Create database
sudo -u postgres createdb gameconnect
```

### 3. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your local database URL
```

### 4. Run Development Server

```bash
# Run database migrations
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Admin Access

After installation, you can access the admin panel:

1. Go to `http://your-domain.com/admin`
2. Default credentials:
   - Username: `admin`
   - Password: `admin123`

**⚠️ Important: Change the default admin password immediately after first login!**

## API Documentation

### Authentication Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Game Management
- `GET /api/games` - List all games
- `POST /api/games` - Create new game
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game

### Blog Management
- `GET /api/blog` - List blog posts
- `POST /api/blog` - Create blog post
- `PUT /api/blog/:id` - Update blog post
- `DELETE /api/blog/:id` - Delete blog post

### Ad Management
- `GET /api/home-ads` - List home ads
- `GET /api/games-ads` - List game ads
- `GET /api/blog-ads` - List blog ads
- `POST /api/*/ads` - Create new ad
- `PUT /api/*/ads/:id` - Update ad
- `DELETE /api/*/ads/:id` - Delete ad

## Maintenance and Monitoring

### Check Application Status

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs gameconnect

# Restart application
pm2 restart gameconnect

# Check Nginx status
systemctl status nginx

# Check database status
systemctl status postgresql
```

### Backup Database

```bash
# Create backup
sudo -u postgres pg_dump gameconnect > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
sudo -u postgres psql gameconnect < backup_file.sql
```

### Update Application

```bash
cd /var/www/gameconnect

# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations if any
npm run db:push

# Rebuild application
npm run build

# Restart PM2
pm2 restart gameconnect
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL status
   systemctl status postgresql
   
   # Check database URL in .env.local
   cat .env.local | grep DATABASE_URL
   ```

2. **Application Won't Start**
   ```bash
   # Check PM2 logs
   pm2 logs gameconnect
   
   # Check port availability
   netstat -tlnp | grep 5000
   ```

3. **Nginx 502 Bad Gateway**
   ```bash
   # Check if Node.js app is running
   pm2 status
   
   # Check Nginx error logs
   tail -f /var/log/nginx/error.log
   ```

4. **File Upload Issues**
   ```bash
   # Check uploads directory permissions
   ls -la /var/www/gameconnect/uploads
   
   # Fix permissions if needed
   chown -R www-data:www-data /var/www/gameconnect/uploads
   chmod -R 755 /var/www/gameconnect/uploads
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues during installation or deployment:

1. Check the troubleshooting section above
2. Review the application logs: `pm2 logs gameconnect`
3. Check Nginx logs: `tail -f /var/log/nginx/error.log`
4. Create an issue on GitHub with detailed error information

## Security Notes

- Always use strong passwords for database and admin accounts
- Keep your system updated: `apt update && apt upgrade`
- Regularly backup your database
- Monitor your server resources and logs
- Use HTTPS in production (SSL certificate)
- Keep Node.js and npm packages updated

---

Made with ❤️ for the gaming community