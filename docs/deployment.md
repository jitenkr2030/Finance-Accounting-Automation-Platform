# Finance & Accounting Platform - Deployment Guide

## Table of Contents
1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Local Deployment](#local-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Database Setup](#database-setup)
8. [SSL Configuration](#ssl-configuration)
9. [Monitoring Setup](#monitoring-setup)
10. [Backup Strategy](#backup-strategy)
11. [Scaling](#scaling)
12. [Troubleshooting](#troubleshooting)

---

## Deployment Overview

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Load Balancer                         │
│                    (Nginx/Cloud LB)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼────┐ ┌────▼────┐
│  Web Server  │ │API Server│ │API Server│
│   (Nginx)    │ │ (Node.js)│ │ (Node.js)│
└───────▲──────┘ └────▲────┘ └────▲────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼────┐ ┌────▼────┐
│   MongoDB    │ │  Redis  │ │ File    │
│   Cluster    │ │  Cache  │ │ Storage │
└──────────────┘ └─────────┘ └─────────┘
```

### Deployment Options

#### 1. Local Development
- Docker Compose setup
- Single-node deployment
- For development and testing

#### 2. Production On-Premise
- Docker containers
- Separate database server
- Load balancer configuration

#### 3. Cloud Deployment
- AWS/GCP/Azure
- Managed database services
- Auto-scaling capabilities

---

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: 100 Mbps

#### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **Network**: 1 Gbps

### Software Dependencies

```bash
# Required software versions
Node.js >= 18.0.0
npm >= 9.0.0
MongoDB >= 6.0
Redis >= 6.0
Docker >= 20.0
Docker Compose >= 2.0
Nginx >= 1.20
Git >= 2.30
```

### Network Requirements

```bash
# Required ports
80   - HTTP traffic
443  - HTTPS traffic
3000 - Frontend (internal)
5000 - Backend API (internal)
27017 - MongoDB (internal)
6379 - Redis (internal)
```

---

## Environment Setup

### Development Environment

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/finance-platform.git
cd finance-platform
```

#### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Update configuration for development
cat > .env << 'EOF'
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/finance_platform_dev
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production

# Email (Development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# Features
ENABLE_AI_FEATURES=false
ENABLE_OCR_PROCESSING=false
ENABLE_BANK_SYNC=false
ENABLE_GST_FILING=false
EOF
```

#### 3. Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or install separately
npm install                    # Backend
cd client && npm install       # Frontend
```

### Production Environment

#### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Production Environment Configuration
```bash
# Create production environment file
sudo mkdir -p /opt/finance-platform
sudo chown $USER:$USER /opt/finance-platform

cat > /opt/finance-platform/.env << 'EOF'
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://username:password@mongo-server:27017/finance_platform
REDIS_URL=redis://redis-server:6379

# Security (Generate strong secrets)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
DATA_ENCRYPTION_KEY=$(openssl rand -base64 32)

# Email (Production SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@financeplatform.com

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=finance-platform-uploads

# Third-party APIs
OPENAI_API_KEY=your-openai-api-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-api-key

# Features
ENABLE_AI_FEATURES=true
ENABLE_OCR_PROCESSING=true
ENABLE_BANK_SYNC=true
ENABLE_GST_FILING=true
EOF
```

---

## Local Deployment

### Quick Start with Docker Compose

#### 1. Start All Services
```bash
# Start all services in detached mode
docker-compose up -d

# View running services
docker-compose ps

# View logs
docker-compose logs -f
```

#### 2. Initialize Database
```bash
# Run database migrations
docker-compose exec backend npm run migrate

# Seed with sample data
docker-compose exec backend npm run seed
```

#### 3. Access Application
```bash
# Frontend (Development)
open http://localhost:3000

# Backend API
curl http://localhost:5000/health

# API Documentation
open http://localhost:5000/api/docs
```

### Manual Local Setup

#### 1. Start MongoDB
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database
mongo
> use finance_platform_dev
> db.createUser({
    user: "finance_user",
    pwd: "secure_password",
    roles: [{ role: "readWrite", db: "finance_platform_dev" }]
  })
```

#### 2. Start Redis
```bash
# Install Redis
sudo apt install -y redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis connection
redis-cli ping
# Should return: PONG
```

#### 3. Start Backend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start in background
npm start &
```

#### 4. Start Frontend
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

---

## Docker Deployment

### Production Docker Setup

#### 1. Create Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: finance-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_DATABASE}
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
      - ./backups:/backups
    ports:
      - "127.0.0.1:27017:27017"
    networks:
      - finance-network
    command: mongod --auth

  redis:
    image: redis:7-alpine
    container_name: finance-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - finance-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: finance-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/${MONGO_DATABASE}?authSource=admin
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - mongodb
      - redis
    networks:
      - finance-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile.prod
    container_name: finance-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      NEXT_PUBLIC_API_URL: http://backend:5000/api
    depends_on:
      - backend
    networks:
      - finance-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: finance-nginx
    restart: unless-stopped
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
    networks:
      - finance-network

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local

networks:
  finance-network:
    driver: bridge
```

#### 2. Environment File for Production
```bash
# .env.prod
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=$(openssl rand -base64 24)
MONGO_DATABASE=finance_platform
REDIS_PASSWORD=$(openssl rand -base64 24)
JWT_SECRET=$(openssl rand -base64 64)
```

#### 3. Deploy Production Stack
```bash
# Build and start production stack
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Cloud Deployment

### AWS Deployment

#### 1. EC2 Setup
```bash
# Launch EC2 instance (t3.medium or larger)
# Ubuntu Server 20.04 LTS
# Security Group: Allow ports 22, 80, 443

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and reconnect for group changes to take effect
exit
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 2. RDS MongoDB Setup
```bash
# Create DocumentDB cluster (MongoDB-compatible)
# Or use MongoDB Atlas

# For DocumentDB:
# - Create cluster in same VPC as EC2
# - Enable access from EC2 security group
# - Create database and user

# Update MONGODB_URI in .env
MONGODB_URI=mongodb://username:password@your-docdb-cluster:27017/finance_platform?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
```

#### 3. ElastiCache Redis Setup
```bash
# Create ElastiCache Redis cluster
# - Node type: cache.t3.micro or larger
# - Same VPC as EC2
# - Enable access from EC2 security group

# Update REDIS_URL in .env
REDIS_URL=redis://your-redis-endpoint:6379
```

#### 4. S3 Storage Setup
```bash
# Create S3 bucket for file uploads
aws s3 mb s3://finance-platform-uploads

# Create IAM user with S3 access
aws iam create-user --user-name finance-platform

# Create access key
aws iam create-access-key --user-name finance-platform

# Update environment variables
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=finance-platform-uploads
```

#### 5. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-org/finance-platform.git
cd finance-platform

# Create production environment
cp .env.example .env.prod
# Edit .env.prod with AWS configuration

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Setup SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Google Cloud Platform

#### 1. Compute Engine Setup
```bash
# Create VM instance
gcloud compute instances create finance-platform \
    --zone=us-central1-a \
    --machine-type=e2-medium \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=20GB \
    --tags=http-server,https-server

# Create firewall rules
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --target-tags=http-server

gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --target-tags=https-server

gcloud compute firewall-rules create allow-ssh \
    --allow tcp:22 \
    --source-ranges 0.0.0.0/0
```

#### 2. Cloud SQL Setup
```bash
# Create Cloud SQL instance (MongoDB compatible with Atlas)
# Or use MongoDB Atlas

# For MongoDB Atlas:
# - Create cluster
# - Whitelist GCP VM IP
# - Create database user

# Update connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance_platform
```

#### 3. Memorystore Setup
```bash
# Create Memorystore Redis instance
gcloud redis instances create finance-redis \
    --size=1 \
    --region=us-central1 \
    --redis-version=redis_6_x \
    --tier=STANDARD_HA

# Update REDIS_URL
REDIS_URL=redis://your-redis-endpoint:6379
```

#### 4. Cloud Storage Setup
```bash
# Create Cloud Storage bucket
gsutil mb gs://finance-platform-uploads

# Create service account
gcloud iam service-accounts create finance-platform \
    --description="Finance Platform Service Account"

# Grant storage permissions
gsutil iam ch serviceAccount:finance-platform@$PROJECT_ID.iam.gserviceaccount.com:objectAdmin gs://finance-platform-uploads

# Create and download key
gcloud iam service-accounts keys create key.json \
    --iam-account=finance-platform@$PROJECT_ID.iam.gserviceaccount.com

# Update environment variables
GOOGLE_APPLICATION_CREDENTIALS=key.json
GCS_BUCKET=finance-platform-uploads
```

### Azure Deployment

#### 1. Virtual Machine Setup
```bash
# Create resource group
az group create --name finance-rg --location eastus

# Create VM
az vm create \
    --resource-group finance-rg \
    --name finance-vm \
    --image UbuntuLTS \
    --size Standard_B2s \
    --admin-username azureuser \
    --ssh-key-values ~/.ssh/id_rsa.pub

# Open ports
az vm open-port --resource-group finance-rg --name finance-vm --port 80 --port 443 --port 22
```

#### 2. Cosmos DB Setup
```bash
# Create Cosmos DB account (MongoDB API)
az cosmosdb create \
    --name finance-cosmosdb \
    --resource-group finance-rg \
    --capabilities EnableMongo \
    --locations regionName=eastus failoverPriority=0

# Create database and collection
az cosmosdb mongodb database create \
    --account-name finance-cosmosdb \
    --resource-group finance-rg \
    --name finance_platform

# Get connection string
az cosmosdb keys list \
    --name finance-cosmosdb \
    --resource-group finance-rg \
    --type connection-strings
```

#### 3. Azure Cache for Redis
```bash
# Create Redis cache
az redis create \
    --resource-group finance-rg \
    --name finance-redis \
    --location eastus \
    --sku Standard \
    --vm-size c0
```

#### 4. Blob Storage Setup
```bash
# Create storage account
az storage account create \
    --name financeplatform \
    --resource-group finance-rg \
    --location eastus \
    --sku Standard_LRS \
    --kind BlobStorage

# Create blob container
az storage container create \
    --account-name financeplatform \
    --name uploads \
    --public-access off

# Get connection string
az storage account show-connection-string \
    --name financeplatform \
    --resource-group finance-rg
```

---

## Database Setup

### MongoDB Production Setup

#### 1. Production MongoDB Configuration
```javascript
// mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

replication:
  replSetName: rs0
```

#### 2. Replica Set Configuration
```javascript
// Initialize replica set
rs.initiate({
   _id: "rs0",
   members: [
      { _id: 0, host: "mongo1.example.com:27017" },
      { _id: 1, host: "mongo2.example.com:27017" },
      { _id: 2, host: "mongo3.example.com:27017" }
   ]
});

// Add arbiter (optional)
rs.addArb("arbiter.example.com:27017");
```

#### 3. Database User Setup
```javascript
// Create application user
use admin

db.createUser({
  user: "finance_app",
  pwd: "secure_password",
  roles: [
    {
      role: "readWrite",
      db: "finance_platform"
    },
    {
      role: "dbAdmin",
      db: "finance_platform"
    }
  ]
});

// Create read-only user for reporting
db.createUser({
  user: "finance_readonly",
  pwd: "readonly_password",
  roles: [
    {
      role: "read",
      db: "finance_platform"
    }
  ]
});
```

#### 4. Index Creation
```javascript
// Create production indexes
use finance_platform

// Users collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ companyId: 1 });
db.users.createIndex({ role: 1 });

// Chart of accounts indexes
db.chartofaccounts.createIndex({ companyId: 1, accountCode: 1 }, { unique: true });
db.chartofaccounts.createIndex({ companyId: 1, accountType: 1 });
db.chartofaccounts.createIndex({ companyId: 1, isActive: 1 });

// Journal entries indexes
db.journalentries.createIndex({ companyId: 1, entryNumber: 1 }, { unique: true });
db.journalentries.createIndex({ companyId: 1, entryDate: -1 });
db.journalentries.createIndex({ companyId: 1, status: 1 });
db.journalentries.createIndex({ "lineItems.accountId": 1 });

// Invoices indexes
db.invoices.createIndex({ companyId: 1, invoiceNumber: 1 }, { unique: true });
db.invoices.createIndex({ companyId: 1, invoiceDate: -1 });
db.invoices.createIndex({ companyId: 1, customerId: 1 });
db.invoices.createIndex({ companyId: 1, status: 1 });

// Text indexes for search
db.invoices.createIndex({
  customerName: "text",
  invoiceNumber: "text",
  "items.productName": "text"
});

db.expenses.createIndex({
  description: "text",
  vendorName: "text",
  category: "text"
});
```

---

## SSL Configuration

### Nginx SSL Setup

#### 1. SSL Certificate Generation
```bash
# Using Let's Encrypt (Certbot)
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal setup
sudo crontab -e
# Add line: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 2. Nginx Configuration
```nginx
# /etc/nginx/sites-available/finance-platform
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:;";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend (Next.js)
    location / {
        proxy_pass http://frontend:3000;
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

    # Backend API
    location /api/ {
        proxy_pass http://backend:5000/api/;
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

    # Health check endpoint
    location /health {
        proxy_pass http://backend:5000/health;
        access_log off;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~* \.(env|log|conf)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Logging
    access_log /var/log/nginx/finance-platform.access.log;
    error_log /var/log/nginx/finance-platform.error.log;
}
```

#### 3. SSL Testing
```bash
# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep "Not After"

# Test SSL rating
curl -I https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

---

## Monitoring Setup

### Application Monitoring

#### 1. Winston Logging Configuration
```javascript
// utils/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'finance-platform' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

#### 2. Health Check Endpoint
```javascript
// routes/health.js
const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');

const router = express.Router();

router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown'
    }
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      health.checks.database = 'ok';
    } else {
      health.checks.database = 'error';
      health.status = 'degraded';
    }

    // Check Redis connection
    const redisClient = redis.createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    await redisClient.ping();
    health.checks.redis = 'ok';
    await redisClient.quit();

  } catch (error) {
    health.checks.database = 'error';
    health.checks.redis = 'error';
    health.status = 'degraded';
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
  };

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

### Error Tracking with Sentry

#### 1. Sentry Configuration
```javascript
// middleware/sentry.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter out health check errors in production
    if (event.request?.url?.includes('/health')) {
      return null;
    }
    return event;
  }
});

module.exports = Sentry;
```

#### 2. Error Handling Middleware
```javascript
// middleware/errorHandler.js
const Sentry = require('./sentry');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Send to Sentry
  Sentry.captureException(err, {
    tags: {
      url: req.url,
      method: req.method
    },
    extra: {
      body: req.body,
      query: req.query,
      params: req.params
    }
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      }
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid ID format'
      }
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: `${field} already exists`
      }
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    }
  });
};

module.exports = errorHandler;
```

### Performance Monitoring

#### 1. Request Performance Middleware
```javascript
// middleware/performance.js
const promClient = require('prom-client');

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'finance_platform_' });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const performanceMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });

  next();
};

module.exports = { performanceMiddleware, httpRequestDuration };
```

#### 2. Metrics Endpoint
```javascript
// routes/metrics.js
const express = require('express');
const promClient = require('prom-client');
const router = express.Router();

router.get('/', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
});

module.exports = router;
```

---

## Backup Strategy

### Database Backup

#### 1. Automated MongoDB Backup Script
```bash
#!/bin/bash
# backup-mongodb.sh

set -e

# Configuration
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DATABASE="finance_platform"
BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/finance_platform_$TIMESTAMP"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --host $MONGO_HOST --port $MONGO_PORT \
    --db $MONGO_DATABASE \
    --out $BACKUP_FILE

# Compress backup
tar -czf "$BACKUP_FILE.tar.gz" -C $BACKUP_DIR "finance_platform_$TIMESTAMP"
rm -rf $BACKUP_FILE

# Remove old backups (keep last 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# Upload to S3 (optional)
if [ "$ENABLE_S3_BACKUP" = "true" ]; then
    aws s3 cp "$BACKUP_FILE.tar.gz" "s3://finance-platform-backups/mongodb/"
fi

echo "Backup completed: $BACKUP_FILE.tar.gz"
```

#### 2. Restore Script
```bash
#!/bin/bash
# restore-mongodb.sh

set -e

# Configuration
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DATABASE="finance_platform"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

# Extract backup
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Restore database
mongorestore --host $MONGO_HOST --port $MONGO_PORT \
    --db $MONGO_DATABASE \
    "$TEMP_DIR/finance_platform_$TIMESTAMP"

# Cleanup
rm -rf "$TEMP_DIR"

echo "Restore completed from: $BACKUP_FILE"
```

#### 3. Cron Schedule for Backups
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/finance-platform/scripts/backup-mongodb.sh

# Weekly backup retention cleanup
0 3 * * 0 find /backups/mongodb -name "*.tar.gz" -mtime +90 -delete
```

### File Storage Backup

#### 1. Application Data Backup
```bash
#!/bin/bash
# backup-application.sh

set -e

# Configuration
APP_DATA_DIR="/opt/finance-platform"
BACKUP_DIR="/backups/application"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/application_data_$TIMESTAMP.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application data
tar -czf $BACKUP_FILE \
    -C $APP_DATA_DIR \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='logs' \
    uploads/ \
    .env* \
    docker-compose*.yml \
    Dockerfile*

# Upload to cloud storage (optional)
if [ "$ENABLE_S3_BACKUP" = "true" ]; then
    aws s3 cp $BACKUP_FILE "s3://finance-platform-backups/application/"
fi

echo "Application backup completed: $BACKUP_FILE"
```

### Backup Verification

#### 1. Backup Testing Script
```bash
#!/bin/bash
# test-backup.sh

set -e

BACKUP_FILE=$1
TEST_DB="finance_platform_test_$(date +%s)"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

# Create test database
mongod --eval "db.adminCommand({ setParameter: 1, internalDisableNonMemberInSet: true })"

# Restore to test database
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Modify database name in dump
find "$TEMP_DIR" -name "*.bson" -exec bash -c 'mv "$1" "${1//finance_platform_*/'"$TEST_DB"'}"' _ {} \;

# Restore test database
mongorestore --db $TEST_DB "$TEMP_DIR"

# Verify data
DOC_COUNT=$(mongo $TEST_DB --eval "db.getCollectionNames().reduce((sum, name) => sum + db[name].count(), 0)" --quiet)
echo "Restored $DOC_COUNT documents"

# Cleanup
rm -rf "$TEMP_DIR"
mongo $TEST_DB --eval "db.dropDatabase()"

echo "Backup verification completed successfully"
```

---

## Scaling

### Horizontal Scaling

#### 1. Load Balancer Configuration
```nginx
# /etc/nginx/conf.d/finance-platform-upstream.conf
upstream finance_backend {
    least_conn;
    server backend1:5000 max_fails=3 fail_timeout=30s;
    server backend2:5000 max_fails=3 fail_timeout=30s;
    server backend3:5000 max_fails=3 fail_timeout=30s;
}

upstream finance_frontend {
    least_conn;
    server frontend1:3000 max_fails=3 fail_timeout=30s;
    server frontend2:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location /api/ {
        proxy_pass http://finance_backend/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://finance_frontend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 2. Docker Swarm Setup
```bash
# Initialize Docker Swarm
docker swarm init

# Create overlay network
docker network create --driver overlay finance-network

# Deploy stack
docker stack deploy -c docker-compose.swarm.yml finance-platform

# Scale services
docker service scale finance-platform_backend=5
docker service scale finance-platform_frontend=3

# Monitor services
docker service ls
docker service ps finance-platform_backend
```

#### 3. Kubernetes Deployment
```yaml
# k8s/finance-platform.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: finance-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: finance-backend
  template:
    metadata:
      labels:
        app: finance-backend
    spec:
      containers:
      - name: backend
        image: finance-platform/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: finance-secrets
              key: mongodb-uri
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: finance-backend-service
spec:
  selector:
    app: finance-backend
  ports:
  - port: 5000
    targetPort: 5000
  type: ClusterIP
```

### Vertical Scaling

#### 1. Resource Allocation
```yaml
# docker-compose.scaled.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  frontend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  mongodb:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

#### 2. Auto-scaling Configuration
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: finance-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: finance-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo --host localhost:27017

# Check authentication
mongo --host localhost:27017 --authenticationDatabase admin -u admin -p

# Test from application
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Connection error:', err));
"
```

#### 2. Redis Connection Issues
```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Monitor Redis in real-time
redis-cli monitor
```

#### 3. Application Not Starting
```bash
# Check application logs
docker-compose logs backend
docker-compose logs frontend

# Check system resources
free -h
df -h
top

# Check port availability
netstat -tlnp | grep :5000
netstat -tlnp | grep :3000

# Check environment variables
docker-compose exec backend env | grep NODE_ENV
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check Nginx configuration
sudo nginx -t
```

#### 5. Performance Issues
```bash
# Check database performance
mongo --eval "db.stats()"

# Monitor slow queries
mongo --eval "db.setProfilingLevel(2)"
mongo --eval "db.system.profile.find().sort({ts:-1}).limit(5)"

# Check application metrics
curl http://localhost:5000/metrics

# Monitor resource usage
htop
iotop
```

### Log Analysis

#### 1. Centralized Logging
```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

#### 2. Log Analysis Commands
```bash
# Search for errors in logs
grep -i error /var/log/nginx/finance-platform.error.log

# Count HTTP status codes
awk '{print $9}' /var/log/nginx/finance-platform.access.log | sort | uniq -c

# Find slow requests
awk '$10 > 5 {print $4, $7, $10}' /var/log/nginx/finance-platform.access.log

# Monitor log files in real-time
tail -f /var/log/nginx/finance-platform.access.log | grep -E '(4[0-9]{2}|5[0-9]{2})'
```

### Health Checks

#### 1. Application Health Check
```bash
#!/bin/bash
# health-check.sh

# Check if services are responding
check_service() {
    local service_name=$1
    local url=$2
    
    if curl -f -s -o /dev/null "$url"; then
        echo "✅ $service_name is healthy"
        return 0
    else
        echo "❌ $service_name is unhealthy"
        return 1
    fi
}

# Check all services
check_service "Backend API" "http://localhost:5000/health"
check_service "Frontend App" "http://localhost:3000"
check_service "Nginx" "http://localhost"

# Check database
if mongo --eval "db.adminCommand('ping')" --quiet; then
    echo "✅ MongoDB is healthy"
else
    echo "❌ MongoDB is unhealthy"
fi

# Check Redis
if redis-cli ping | grep -q PONG; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis is unhealthy"
fi
```

#### 2. Automated Health Monitoring
```bash
# Add to crontab for monitoring
crontab -e

# Check every 5 minutes
*/5 * * * * /opt/finance-platform/scripts/health-check.sh >> /var/log/health-check.log 2>&1

# Alert on failures
0 * * * * grep -q "❌" /var/log/health-check.log && mail -s "Finance Platform Alert" admin@yourcompany.com < /var/log/health-check.log
```

---

*This deployment guide provides comprehensive instructions for deploying the Finance & Accounting Platform in various environments. For additional support, refer to the troubleshooting section or contact the development team.*