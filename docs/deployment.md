# Deployment Guide

## Overview

This guide covers deploying the AI Chatbot Svelte application to various platforms. The application is optimized for **Vercel** deployment but can be deployed to other platforms with configuration adjustments.

## Vercel Deployment (Recommended)

### Prerequisites
- Vercel account
- GitHub/GitLab repository
- Required API keys (xAI, Groq)

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot-svelte)

### Manual Deployment

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Link Project
```bash
vercel link
```

#### 3. Set Environment Variables
```bash
vercel env add POSTGRES_URL
vercel env add XAI_API_KEY  
vercel env add GROQ_API_KEY
vercel env add PUBLIC_ALLOW_ANONYMOUS_CHATS
```

Or via Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Add required variables for Production, Preview, and Development

#### 4. Deploy
```bash
vercel --prod
```

### Vercel Configuration

#### Project Settings
```json
{
  "framework": "sveltekit",
  "buildCommand": "pnpm build",
  "outputDirectory": "build",
  "installCommand": "pnpm install",
  "nodeVersion": "18.x"
}
```

#### Custom Domain Setup
```bash
# Add custom domain
vercel domains add yourdomain.com

# Configure DNS
# Add CNAME record: www -> cname.vercel-dns.com
# Add A record: @ -> 76.76.19.61
```

## Database Setup

### Vercel Postgres (Recommended)
```bash
# Create database via Vercel CLI
vercel storage add postgres

# Or via Dashboard:
# 1. Go to Storage tab in project
# 2. Create → Postgres Database
# 3. Copy connection string to POSTGRES_URL
```

#### Database Migration
```bash
# Pull environment variables
vercel env pull

# Run migrations
pnpm db:migrate
```

### Alternative: Neon Database
```bash
# 1. Create account at neon.tech
# 2. Create new database
# 3. Copy connection string
# 4. Set POSTGRES_URL in Vercel environment variables
```

## Environment Variables

### Required Production Variables
```bash
# Database
POSTGRES_URL=postgresql://user:pass@host:port/db?sslmode=require

# AI Providers  
XAI_API_KEY=xai-your-production-key
GROQ_API_KEY=gsk_your-groq-production-key

# Features
PUBLIC_ALLOW_ANONYMOUS_CHATS=false  # Typically false in production
```

### Optional Variables
```bash
# Analytics
VERCEL_ANALYTICS_ID=your-analytics-id

# Monitoring
SENTRY_DSN=your-sentry-dsn

# Custom
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Other Platform Deployments

### Netlify

#### Configuration
```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"
  PNPM_VERSION = "8"

[[plugins]]
  package = "@netlify/plugin-functions"

[functions]
  directory = "build/server"
```

#### Adapter Configuration
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-netlify';

export default {
  kit: {
    adapter: adapter({
      edge: false,
      split: false
    })
  }
};
```

### Railway

#### Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

#### Configuration
```toml
# railway.toml
[build]
  builder = "NIXPACKS"

[deploy]
  healthcheckPath = "/"
  healthcheckTimeout = 100
  restartPolicyType = "ON_FAILURE"
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app

# Copy built application
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml .

RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - POSTGRES_URL=postgresql://user:password@db:5432/ai_chatbot
      - XAI_API_KEY=${XAI_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=ai_chatbot
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### VPS/Self-hosted

#### Server Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ or similar
- **Node.js**: v18+
- **PostgreSQL**: v14+

#### Setup Script
```bash
#!/bin/bash
# deploy.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Setup database
sudo -u postgres createuser --interactive chatbot
sudo -u postgres createdb ai_chatbot

# Clone and build application
git clone https://github.com/your-org/ai-chatbot-svelte.git
cd ai-chatbot-svelte
pnpm install
pnpm build

# Setup environment
cp .env.example .env.local
# Edit .env.local with production values

# Run migrations
pnpm db:migrate

# Setup PM2 for process management
npm install -g pm2
pm2 start build/index.js --name "ai-chatbot"
pm2 startup
pm2 save
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/ai-chatbot
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Production Optimizations

### Performance
```javascript
// svelte.config.js
export default {
  kit: {
    adapter: adapter(),
    prerender: {
      crawl: true,
      entries: ['/', '/auth/login']
    },
    csp: {
      directives: {
        'script-src': ['self', 'unsafe-inline'],
        'style-src': ['self', 'unsafe-inline']
      }
    }
  }
};
```

### Security Headers
```javascript
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
};
```

### Monitoring Setup

#### Error Tracking with Sentry
```bash
pnpm add @sentry/sveltekit
```

```javascript
// src/hooks.client.ts
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN,
  environment: import.meta.env.MODE
});
```

#### Analytics
```javascript
// src/app.html
<!-- Vercel Analytics -->
<script defer src="/_vercel/insights/script.js"></script>

<!-- Or Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## CI/CD Setup

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm check
      - run: pnpm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment Checks
```bash
# Pre-deployment checklist
pnpm lint      # Code quality
pnpm check     # Type checking  
pnpm test      # Unit tests
pnpm build     # Production build
```

## Post-Deployment

### Health Checks
```javascript
// src/routes/health/+server.ts
export async function GET() {
  try {
    // Check database connection
    await db.select().from(user).limit(1);
    
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Monitoring URLs
- **Health Check**: `https://yourdomain.com/health`
- **API Status**: `https://yourdomain.com/api/health`

### Backup Strategy
```bash
# Database backups (for self-hosted)
# Daily backup script
pg_dump $POSTGRES_URL > backup_$(date +%Y%m%d).sql

# Upload to cloud storage
aws s3 cp backup_$(date +%Y%m%d).sql s3://your-backup-bucket/
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .svelte-kit build
pnpm install
pnpm build
```

#### Database Connection Issues
```bash
# Check connection string format
# Ensure SSL is required for cloud databases
POSTGRES_URL=postgresql://user:pass@host:port/db?sslmode=require
```

#### Environment Variable Issues
```bash
# Verify variables are set
vercel env ls

# Test locally with production variables
vercel env pull .env.local
pnpm build
```

### Performance Issues
- Monitor bundle size with `pnpm build --analyze`
- Use Vercel Analytics for real-time metrics
- Implement proper error boundaries
- Monitor database query performance

### Security Checklist
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Error messages don't leak sensitive data
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Security headers configured 