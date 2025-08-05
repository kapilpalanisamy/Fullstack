# 🚀 RizeOS Job Portal - Complete Deployment Guide

## 📋 Quick Start Deployment

### 1. Prerequisites Check
- ✅ Node.js (v18+) installed
- ✅ PostgreSQL database running
- ✅ Git repository cloned
- ✅ Environment variables configured

### 2. Automated Setup
```bash
# Run complete database setup
npm run db:setup

# Check deployment readiness
npm run deploy:check

# Start development server
npm run dev
```

## 🐳 Docker Deployment (Recommended)

### Option 1: Docker Compose (Full Stack)
```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Docker Build Only
```bash
# Build backend image
docker build -t rize-job-portal-backend .

# Run backend container
docker run -p 3000:3000 --env-file .env rize-job-portal-backend
```

### Windows Users
```cmd
# Use the Windows batch script
scripts\deploy-docker.bat
```

## 🌐 Cloud Deployment Options

### Heroku Deployment
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create rize-job-portal-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DB_URL=your-database-url
heroku config:set JWT_SECRET=your-jwt-secret
# ... (add all environment variables)

# Deploy
git push heroku main

# Run migrations
heroku run npm run db:migrate

# Open application
heroku open
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### AWS Deployment
```bash
# Using AWS Elastic Beanstalk
eb init
eb create production
eb deploy
```

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with one click

## 🗄️ Database Setup Guide

### Local PostgreSQL Setup

#### Windows
1. Download PostgreSQL from official website
2. Install with default settings
3. Set password for postgres user
4. Start PostgreSQL service

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Linux
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Database Configuration
```bash
# Create database
createdb rize_job_portal

# Or use our automated script
npm run db:setup
```

### Production Database Options
- **AWS RDS**: Managed PostgreSQL service
- **Heroku Postgres**: Add-on for Heroku apps  
- **DigitalOcean Managed Database**: Scalable PostgreSQL
- **Google Cloud SQL**: Google's managed database service

## ⚙️ Environment Configuration

### Development (.env)
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rize_job_portal
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your-development-secret-key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# Blockchain (Solana)
SOLANA_NETWORK=devnet
SOLANA_ADMIN_WALLET=your-development-wallet

# AI Integration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Security
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Production (.env.production)
```env
NODE_ENV=production
PORT=3000

# Database (Use production database URL)
DB_URL=postgresql://user:password@host:port/database

# Authentication (Use strong secrets)
JWT_SECRET=your-super-secure-production-secret
JWT_EXPIRE=24h
BCRYPT_ROUNDS=12

# Blockchain (Use mainnet for production)
SOLANA_NETWORK=mainnet-beta
SOLANA_ADMIN_WALLET=your-production-wallet

# External APIs (Production keys)
OPENAI_API_KEY=your-production-openai-key
CLOUDINARY_CLOUD_NAME=your-production-cloud

# Security (Production domains)
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50

# Monitoring
LOG_LEVEL=error
ENABLE_LOGGING=true
```

## 🔧 Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All tests passing
- [ ] Code linted and formatted
- [ ] No console.log statements in production
- [ ] Error handling implemented
- [ ] Input validation in place

### ✅ Security
- [ ] Environment variables secured
- [ ] JWT secrets are strong and unique
- [ ] Database credentials protected
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled (Helmet)

### ✅ Database
- [ ] Database created and accessible
- [ ] Migrations run successfully
- [ ] Seeders executed (if needed)
- [ ] Database backups configured
- [ ] Connection pooling set up

### ✅ External Services
- [ ] OpenAI API key valid and working
- [ ] Cloudinary credentials configured
- [ ] Email service (SMTP) working
- [ ] Solana wallet configured
- [ ] All API endpoints tested

### ✅ Performance
- [ ] Compression enabled
- [ ] Logging configured
- [ ] Memory usage optimized
- [ ] Database queries optimized
- [ ] Caching implemented where needed

## 🧪 Testing Deployment

### Health Check
```bash
curl http://localhost:3000/health
```

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-01T10:00:00.000Z",
  "service": "RizeOS Job Portal Backend",
  "version": "1.0.0"
}
```

### API Testing
```bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User","role":"jobseeker"}'

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test jobs endpoint
curl http://localhost:3000/api/jobs
```

### Database Connection Test
```bash
# Using our deployment check
npm run deploy:check

# Manual database test
node -e "
const { Client } = require('pg');
const client = new Client(process.env.DB_URL || {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});
client.connect().then(() => {
  console.log('✅ Database connected successfully');
  return client.query('SELECT NOW()');
}).then(result => {
  console.log('⏰ Database time:', result.rows[0].now);
  client.end();
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
});
"
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL service
sudo service postgresql status

# Check connection parameters
psql -h localhost -U postgres -d rize_job_portal -c "SELECT version();"

# Reset database
npm run db:reset
```

#### Environment Variable Issues
```bash
# Check all environment variables
node -e "console.log(process.env)" | grep -E "(DB_|JWT_|OPENAI_)"

# Validate required variables
npm run deploy:check
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm start
```

#### Permission Errors
```bash
# Fix file permissions
chmod +x scripts/deploy-docker.sh

# Fix node_modules permissions
sudo chown -R $(whoami) node_modules
```

### Production Issues

#### 500 Internal Server Error
1. Check server logs: `docker-compose logs`
2. Verify environment variables
3. Check database connectivity
4. Validate external API keys

#### Database Migration Failures
```bash
# Rollback last migration
npm run db:migrate:undo

# Run specific migration
npx sequelize-cli db:migrate --to 20241201000001-create-users.js

# Reset and remigrate
npm run db:reset
```

#### Memory Issues
1. Increase container memory limits
2. Optimize database queries
3. Implement connection pooling
4. Add caching layer

## 📊 Monitoring & Maintenance

### Health Monitoring
- Set up health check endpoints
- Monitor response times
- Track error rates
- Monitor database performance

### Logging
- Centralized logging with Winston
- Log rotation and archival
- Error tracking and alerting
- Performance monitoring

### Backup Strategy
- Automated database backups
- Environment variable backups
- Code repository backups
- Recovery testing

### Security Updates
- Regular dependency updates
- Security patch management
- Access log monitoring
- Vulnerability scanning

## 🎯 Production Optimization

### Performance Tuning
```javascript
// Add to server.js for production
if (process.env.NODE_ENV === 'production') {
  app.use(compression());
  app.use(helmet());
}
```

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
```

### Caching
```javascript
// Redis caching for frequently accessed data
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
```

## 📝 Deployment Checklist Summary

1. **Environment Setup** ✅
   - [ ] Production environment variables configured
   - [ ] Database connection tested
   - [ ] External API keys validated

2. **Security Configuration** ✅
   - [ ] Strong JWT secrets
   - [ ] CORS properly configured
   - [ ] Rate limiting enabled
   - [ ] Security headers active

3. **Database Preparation** ✅
   - [ ] Production database created
   - [ ] Migrations executed
   - [ ] Backup strategy in place

4. **Application Testing** ✅
   - [ ] All API endpoints working
   - [ ] Authentication flow tested
   - [ ] File upload functional
   - [ ] Email notifications working

5. **Deployment Execution** ✅
   - [ ] Docker containers running
   - [ ] Health checks passing
   - [ ] Logs configured
   - [ ] Monitoring active

6. **Post-Deployment Verification** ✅
   - [ ] Frontend-backend integration tested
   - [ ] Performance benchmarks met
   - [ ] Error handling verified
   - [ ] Documentation updated

---

## 🆘 Getting Help

### Quick Commands Reference
```bash
# Check deployment status
npm run deploy:check

# Setup database
npm run db:setup

# Start development
npm run dev

# Docker deployment
docker-compose up -d

# View logs
docker-compose logs -f

# Health check
curl http://localhost:3000/health
```

### Support Resources
- **Documentation**: Check README.md and API docs
- **Logs**: Check `logs/` directory or Docker logs
- **Health Check**: Use `/health` endpoint
- **Database**: Run `npm run deploy:check` for connection status

### Emergency Procedures
1. **Service Down**: Restart containers with `docker-compose restart`
2. **Database Issues**: Run `npm run db:reset` (development only)
3. **Memory Issues**: Restart services and check resource usage
4. **Security Breach**: Rotate all secrets and redeploy

---

**🎉 RizeOS Job Portal Backend - Ready for Production!**

*Built with enterprise-grade architecture and best practices* 🚀
