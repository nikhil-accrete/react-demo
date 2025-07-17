# Complete React Deployment Guide

## 🎯 Overview

This guide will help you deploy a complete react application with:
- **Frontend**: React application  
- **Server**: AWS Ubuntu EC2 instance
- **Web Server**: Nginx reverse proxy
- **CI/CD**: GitHub Actions for automated deployment

## 📋 Prerequisites

- ✅ AWS EC2 Ubuntu instance running
- ✅ GitHub account
- ✅ Local development environment with Node.js
- ✅ SSH access to your server

## 🚀 Part 1: Local Development Setup

### 1.1 Create React Frontend Project

**Create React app:**
```bash
npx create-react-app react-frontend
cd react-frontend
```

**Install additional dependencies:**
```bash
npm install axios react-router-dom
```

**Create `.env` file:**
```bash
REACT_APP_ENV=development
REACT_APP_API_BASE_URL=http://localhost:8000/api
```
**Create components (Dashboard, TodoList, UserList)**

### 1.2 Test Local Setup

**Start React app:**
```bash
cd react-frontend
npm start
# Should run on http://localhost:3000
```

**Test integration** - React app should successfully connect to API.

## 🚀 Part 2: Prepare for Deployment

### 2.1 Create GitHub Repositories

**For React Frontend:**
```bash
cd react-frontend
git init
git add .
git commit -m "Initial commit - React Frontend"
git branch -M main
git remote add origin https://github.com/yourusername/react-frontend.git
git push -u origin main
```

### 2.2 Create Production Environment Files

**For React - `.env.production`:**
```bash
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
```

### 2.3 Add .gitignore Files

**React `.gitignore`:**
```
node_modules/
/build
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
.DS_Store
```

## 🚀 Part 3: Server Setup

### 3.1 Connect to Your AWS Server

```bash
ssh ubuntu@YOUR_SERVER_IP
```

### 3.2 Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22 (Update version if required)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Start and enable services
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.3 Set Up Project Directories

```bash
# Create project directories
sudo mkdir -p /var/www/html
sudo chown -R ubuntu:ubuntu /var/www/html

# Clone your repositories
cd /var/www/html
git clone https://github.com/yourusername/react-frontend.git
```

### 3.4 Set Up React Frontend

```bash
cd /var/www/html/react-frontend

# Set Permission
sudo chown -R ubuntu:ubuntu /var/www/html/react-frontend

# Install dependencies
npm install

# Create production environment file
sudo nano .env.production
# Add:
# REACT_APP_ENV=production
# GENERATE_SOURCEMAP=false

# Build for production
npm run build

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/react-frontend/build
sudo chmod -R 755 /var/www/html/react-frontend/build
```

## 🚀 Part 4: Configure Nginx

### 4.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/fullstack-app
```

**Add this configuration (replace YOUR_SERVER_IP with your actual IP):**
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Serve React app (static files)
    location / {
        root /var/www/html/react-frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests to Node.js (For backend only)
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml;
}
```

### 4.2 Enable the Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/fullstack-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🚀 Part 5: Update AWS Security Group

1. **Go to AWS Console → EC2 → Security Groups**
2. **Find your instance's security group**
3. **Edit Inbound Rules**
4. **Add these rules:**
   - **Type**: HTTP, **Port**: 80, **Source**: 0.0.0.0/0
   - **Type**: HTTPS, **Port**: 443, **Source**: 0.0.0.0/0
   - **Type**: SSH, **Port**: 22, **Source**: 0.0.0.0/0

## 🚀 Part 6: Set Up SSH Keys for CI/CD

### 6.1 Generate SSH Keys (Local Machine)

```bash
# Generate SSH keys
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Display public key (copy this)
cat ~/.ssh/id_rsa.pub

# Display private key (copy this for GitHub secrets)
cat ~/.ssh/id_rsa
```

### 6.2 Add Public Key to AWS Server

```bash
# SSH to server
ssh ubuntu@YOUR_SERVER_IP

# Add your public key
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key here, save and exit

# Set permissions
chmod 600 ~/.ssh/authorized_keys
```

## 🚀 Part 7: Create GitHub Actions Workflows

### 7.1 React Frontend Deployment

**Create `.github/workflows/deploy-frontend.yml` in your React repository:**

```yaml
name: Deploy React Frontend

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Deploy to AWS Server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            echo "🚀 Starting Frontend deployment..."
            
            cd /var/www/html/react-frontend
            sudo chown -R ubuntu:ubuntu /var/www/html/react-frontend
            git pull origin main
            npm ci
            npm run build
            sudo chown -R www-data:www-data /var/www/html/react-frontend/build
            sudo chmod -R 755 /var/www/html/react-frontend/build
            sudo systemctl reload nginx
            
            echo "✅ Frontend deployment successful!"
            echo "🌐 Visit: http://YOUR_SERVER_IP"
```

## 🚀 Part 8: Configure GitHub Secrets

**For both repositories, add these secrets:**
**Repository → Settings → Secrets and variables → Actions**

| Secret Name | Value |
|-------------|-------|
| `SERVER_HOST` | Your server IP address |
| `SERVER_USER` | `ubuntu` |
| `SERVER_SSH_KEY` | Your private SSH key content |

## 🚀 Part 9: Test Your Deployment

### 9.1 Test Full Application

1. **Visit** `http://YOUR_SERVER_IP` in your browser
2. **Check** if React app loads
3. **Test** API functionality (todos, users, stats)
4. **Verify** all features work

### 9.2 Test CI/CD Pipeline

1. **Make a small change** to your code
2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. **Watch GitHub Actions** deploy automatically
4. **Verify** changes appear on your live site

### Common Issues and Solutions

**1. React app shows 502 error:**
```bash
# Check Nginx configuration
sudo nginx -t
sudo systemctl restart nginx
```

**2. CI/CD fails:**
- Verify GitHub secrets are correct
- Check SSH key permissions
- Ensure server is accessible

**3. Permission errors:**
```bash
# Fix ownership
sudo chown -R ubuntu:ubuntu /var/www/html
sudo chown -R ubuntu:ubuntu /var/www/html/react-demo
sudo chown -R www-data:www-data /var/www/html/react-frontend/build
```

## 🎯 What You Now Have

✅ **Complete react application**
✅ **Production-ready server setup**
✅ **Automated CI/CD pipeline**
✅ **Nginx reverse proxy with caching**
✅ **Security headers and optimization**

## 🔧 Troubleshooting

1. **Set up SSL/HTTPS** with Let's Encrypt
2. **Configure custom domain** instead of IP
3. **Add database** (MongoDB/PostgreSQL)
4. **Set up monitoring** and alerting
5. **Add comprehensive logging**
6. **Implement authentication**
7. **Add automated backups**

Your fullstack application is now live and automatically deployable! 🎉

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all steps were followed correctly
3. Check server logs for detailed error messages
4. Ensure all dependencies are properly installed

Happy deploying! 🚀