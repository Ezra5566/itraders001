# ITraders Store - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)

## Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or Atlas)
- Git repository
- Cloud accounts (optional but recommended):
  - MongoDB Atlas (free tier available)
  - Cloudinary (for image hosting)
  - Stripe (for payments)
  - Render/Railway/Vercel (for hosting)

## Local Development

### 1. Clone Repository
```bash
git clone <repository-url>
cd itraders001
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run seed  # Seed database with sample data
npm run dev   # Start development server
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev   # Start development server
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Production Deployment

### Option 1: Render.com (Recommended)

#### Backend Deployment
1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: itraders-api
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18.x
5. Add Environment Variables from `.env`
6. Click "Create Web Service"

#### Frontend Deployment (Vercel)
1. Create account at [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api
   ```
6. Click "Deploy"

### Option 2: Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy backend
railway login
cd backend
railway init
railway up

# Deploy frontend to Vercel as above
```

### Option 3: VPS (DigitalOcean/AWS/Linode)

```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Clone and setup
git clone <repository-url>
cd itraders001/backend
npm install
npm run build

# Start with PM2
pm2 start src/server.js --name itraders-api
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/itraders
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create account at [mongodb.com](https://mongodb.com)
2. Create new cluster (M0 free tier available)
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Replace in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/itraders_store
   ```
6. Whitelist your IP address in Network Access

### Local MongoDB

```bash
# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verify
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

## Environment Variables

### Backend (.env)
```env
# Required
MONGODB_URI=mongodb://localhost:27017/itraders_store
JWT_SECRET=generate_strong_random_string_here
PORT=5000

# Optional but recommended
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_live_your_live_key
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

## Post-Deployment

### 1. Initial Setup

```bash
# SSH into server
cd itraders001/backend
npm run seed  # Creates admin user and sample data
```

### 2. Admin Login
- URL: https://your-domain.com/admin
- Email: `admin@itraders.store`
- Password: `admin123`
- **Important**: Change password immediately after first login

### 3. SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 4. Domain Configuration

Update DNS records:
- Type: A
- Name: @ (root) or subdomain
- Value: Your server IP address

### 5. Monitoring

```bash
# View logs
pm2 logs itraders-api

# Monitor resources
pm2 monit

# Restart after updates
pm2 restart itraders-api
```

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Check connection string format
# Ensure IP is whitelisted in Atlas
```

**CORS Errors**
```javascript
// Update backend/src/server.js cors options
app.use(cors({
  origin: ['https://your-domain.com', 'https://www.your-domain.com'],
  credentials: true
}));
```

**Build Failures**
```bash
# Clear cache and rebuild
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS
- [ ] Set up MongoDB authentication
- [ ] Configure rate limiting
- [ ] Hide sensitive error messages in production
- [ ] Regular security updates: `npm audit fix`

## Scaling Considerations

1. **Database**: Upgrade MongoDB Atlas tier
2. **CDN**: Use Cloudflare for static assets
3. **Caching**: Implement Redis for session/cache
4. **Load Balancing**: Use Nginx or AWS ALB
5. **Monitoring**: Set up Sentry for error tracking

## Support

For deployment issues:
- Check logs: `pm2 logs` or Render/Railway dashboard
- Review environment variables
- Verify MongoDB connection
- Check firewall settings

---

Last Updated: February 2025
