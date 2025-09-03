# Deployment Guide - University Course Management Backend

This guide provides comprehensive instructions for deploying the University Course Management System backend to various platforms.

## 🚀 Deployment Options

### 1. Railway (Recommended for Students)

Railway offers free hosting with automatic deployments from GitHub.

#### Prerequisites
- GitHub account with your backend repository
- Railway account (free tier available)

#### Steps

1. **Prepare Your Repository**
```bash
# Ensure your backend code is in the root or backend/ folder
# Make sure package.json is properly configured
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

2. **Deploy to Railway**
- Visit [railway.app](https://railway.app)
- Sign up/login with GitHub
- Click "New Project" → "Deploy from GitHub repo"
- Select your repository
- Railway will automatically detect Node.js and deploy

3. **Configure Environment Variables**
In Railway dashboard:
- Go to your project → Variables tab
- Add the following variables:
```
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://your-frontend-domain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/university_course_management
```

4. **Set up MongoDB Atlas**
- Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
- Create new cluster (free tier available)
- Create database user
- Whitelist IP addresses (0.0.0.0/0 for development)
- Get connection string and add to Railway environment variables

5. **Seed Database**
```bash
# After deployment, run seed script via Railway CLI or manually
railway run npm run seed
```

#### Railway Configuration
Create `railway.toml` in your backend root:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### 2. Render

Render provides free hosting with automatic SSL and custom domains.

#### Steps

1. **Prepare Repository**
```bash
# Ensure package.json has correct start script
# "start": "node server.js"
```

2. **Deploy to Render**
- Visit [render.com](https://render.com)
- Sign up/login with GitHub
- Click "New" → "Web Service"
- Connect your GitHub repository
- Configure:
  - **Name**: university-course-api
  - **Environment**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`

3. **Environment Variables**
Add in Render dashboard:
```
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/university_course_management
FRONTEND_URL=https://your-frontend-domain.com
```

4. **Custom Domain (Optional)**
- Add custom domain in Render dashboard
- Configure DNS records as instructed

### 3. Heroku

Traditional platform with extensive documentation and add-ons.

#### Prerequisites
- Heroku CLI installed
- Heroku account

#### Steps

1. **Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Download from heroku.com/cli
```

2. **Login and Create App**
```bash
heroku login
heroku create university-course-api
```

3. **Configure Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_super_secret_jwt_key_here
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/university_course_management
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
```

4. **Deploy**
```bash
git push heroku main
```

5. **Seed Database**
```bash
heroku run npm run seed
```

### 4. DigitalOcean App Platform

Professional hosting with scalable infrastructure.

#### Steps

1. **Create App**
- Visit [cloud.digitalocean.com](https://cloud.digitalocean.com)
- Go to Apps → Create App
- Connect GitHub repository

2. **Configure App**
- **Name**: university-course-api
- **Source**: Your GitHub repository
- **Branch**: main
- **Autodeploy**: Enable

3. **Environment Variables**
Add in DigitalOcean dashboard:
```
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/university_course_management
```

4. **App Spec Configuration**
Create `.do/app.yaml`:
```yaml
name: university-course-api
services:
- name: api
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
    deploy_on_push: true
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your_jwt_secret
    type: SECRET
  - key: MONGODB_URI
    value: your_mongodb_uri
    type: SECRET
  http_port: 5000
  health_check:
    http_path: /api/health
```

## 🐳 Docker Deployment

### Local Docker Setup

1. **Build and Run**
```bash
# Build the image
docker build -t university-backend .

# Run with environment file
docker run -p 5000:5000 --env-file .env university-backend
```

2. **Docker Compose (Full Stack)**
```bash
# Start all services (MongoDB + Backend + Mongo Express)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Production Docker

1. **Multi-stage Dockerfile**
```dockerfile
# Production optimized Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
CMD ["npm", "start"]
```

2. **Deploy to Container Registry**
```bash
# Build for production
docker build -t university-backend:latest .

# Tag for registry
docker tag university-backend:latest your-registry/university-backend:latest

# Push to registry
docker push your-registry/university-backend:latest
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**
- Visit [mongodb.com/atlas](https://mongodb.com/atlas)
- Sign up for free account
- Verify email address

2. **Create Cluster**
- Choose "Build a Database"
- Select "Shared" (free tier)
- Choose cloud provider and region
- Create cluster (takes 1-3 minutes)

3. **Configure Access**
- **Database Access**: Create database user
  - Username: `university_admin`
  - Password: Generate secure password
  - Database User Privileges: Read and write to any database

- **Network Access**: Add IP addresses
  - For development: Add `0.0.0.0/0` (allow from anywhere)
  - For production: Add specific IP addresses

4. **Get Connection String**
- Click "Connect" → "Connect your application"
- Copy connection string
- Replace `<password>` with your database user password
- Replace `<dbname>` with `university_course_management`

### Local MongoDB

1. **Install MongoDB**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Windows
# Download from mongodb.com/try/download/community
```

2. **Start MongoDB**
```bash
# macOS/Linux
sudo systemctl start mongod

# Or run directly
mongod --dbpath /path/to/data/directory
```

3. **Verify Connection**
```bash
mongosh
# Should connect to MongoDB shell
```

## 🔧 Environment Configuration

### Development Environment
Create `.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/university_course_management

# JWT
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Environment
```env
# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/university_course_management

# JWT (Use strong secret)
JWT_SECRET=super_long_random_string_for_production_use_at_least_32_characters
JWT_EXPIRES_IN=1h

# Server
PORT=5000
NODE_ENV=production

# CORS (Your frontend domain)
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting (Stricter for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

## 🔍 Health Monitoring

### Health Check Endpoint
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "success",
  "message": "University Course Management API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

### Docker Health Check
The Dockerfile includes a health check that runs every 30 seconds:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
```

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string format
# mongodb://localhost:27017/database_name (local)
# mongodb+srv://user:pass@cluster.mongodb.net/database_name (Atlas)
```

2. **JWT Token Issues**
```bash
# Ensure JWT_SECRET is set and consistent
echo $JWT_SECRET

# Check token expiration
# Tokens expire based on JWT_EXPIRES_IN setting
```

3. **CORS Errors**
```bash
# Ensure FRONTEND_URL matches your frontend domain
# Check CORS configuration in server.js
```

4. **Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

### Debugging

1. **Enable Debug Logging**
```bash
DEBUG=* npm run dev
```

2. **Check Database Connection**
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/university_course_management"
```

3. **Validate Environment Variables**
```bash
# Check all environment variables
printenv | grep -E "(MONGODB|JWT|PORT)"
```

## 📊 Performance Optimization

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling for concurrent requests
- Query optimization with aggregation pipelines
- Data validation at schema level

### API Optimization
- Pagination for large datasets
- Field selection to reduce payload size
- Caching headers for static content
- Compression middleware for responses

### Security Optimization
- Rate limiting to prevent abuse
- Input sanitization and validation
- Secure headers with Helmet.js
- HTTPS enforcement in production

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm test
    - name: Deploy to Railway
      uses: railway-app/railway-deploy@v1
      with:
        railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 📝 Maintenance

### Database Backup
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/university_course_management" --out=backup/

# Restore backup
mongorestore --uri="mongodb://localhost:27017/university_course_management" backup/university_course_management/
```

### Log Management
```bash
# View application logs
tail -f logs/app.log

# Rotate logs (production)
logrotate /etc/logrotate.d/university-backend
```

### Updates
```bash
# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

This deployment guide ensures your University Course Management System backend can be successfully deployed to any major cloud platform with proper security, monitoring, and maintenance procedures.