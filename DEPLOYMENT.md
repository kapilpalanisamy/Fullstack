# RizeOS Deployment Guide

## 🚀 Deployment Strategy

### Frontend: Vercel
- **Platform**: Vercel
- **Framework**: Vite + React
- **Domain**: Custom domain available
- **Auto-deploy**: On push to main branch

### Backend: Render
- **Platform**: Render
- **Service**: Web Service
- **Database**: Supabase (PostgreSQL)
- **Auto-deploy**: On push to main branch

## 📋 Pre-Deployment Checklist

### ✅ Repository Setup
- [ ] GitHub repository created
- [ ] Code pushed to repository
- [ ] README.md updated
- [ ] .gitignore configured
- [ ] License file added

### ✅ Environment Variables
- [ ] Frontend environment variables ready
- [ ] Backend environment variables ready
- [ ] Database connection string ready
- [ ] API keys secured

### ✅ Code Quality
- [ ] No console.log statements in production
- [ ] Error handling implemented
- [ ] Security headers configured
- [ ] CORS properly configured

## 🌐 Frontend Deployment (Vercel)

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository: `kapilpalanisamy/RizeOS_Final`

### Step 2: Configure Project
1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 3: Environment Variables
Add these environment variables in Vercel dashboard:

```
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
VITE_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
VITE_NETWORK_ID=5
VITE_NETWORK_NAME=Goerli Testnet
VITE_ENABLE_AI=true
VITE_ENABLE_WEB3=true
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at: `https://your-app.vercel.app`

## 🔧 Backend Deployment (Render)

### Step 1: Connect to Render
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository

### Step 2: Configure Service
1. **Name**: `rizeos-backend`
2. **Root Directory**: `backend`
3. **Environment**: `Node`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`

### Step 3: Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.ylikervxuyubfdomvnmz:Kapil944336@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=https://your-frontend-url.vercel.app
ADMIN_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
PAYMENT_ENABLED=true
PLATFORM_FEE=0.01
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Your API will be live at: `https://your-backend.onrender.com`

## 🔗 Post-Deployment

### Update Frontend API URL
After backend deployment, update the frontend environment variable:
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

### Test Deployment
1. **Frontend**: Visit your Vercel URL
2. **Backend**: Test health endpoint
3. **Database**: Verify connections
4. **Wallet**: Test MetaMask integration

## 📊 Monitoring

### Vercel Analytics
- Page views
- Performance metrics
- Error tracking

### Render Monitoring
- Response times
- Error logs
- Resource usage

## 🔐 Security Checklist

### Frontend Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] No sensitive data in client code

### Backend Security
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] JWT tokens secured

## 🚨 Troubleshooting

### Common Issues

#### Frontend Build Fails
```bash
# Check for missing dependencies
npm install
# Clear cache
npm run build --force
```

#### Backend Deployment Fails
```bash
# Check logs in Render dashboard
# Verify environment variables
# Test locally first
```

#### Database Connection Issues
- Verify DATABASE_URL format
- Check Supabase connection
- Test connection locally

#### CORS Errors
- Update CORS_ORIGIN in backend
- Ensure frontend URL is correct
- Check browser console for errors

## 📈 Performance Optimization

### Frontend
- Enable Vercel Edge Functions
- Optimize images
- Enable compression
- Use CDN for static assets

### Backend
- Enable caching
- Optimize database queries
- Use connection pooling
- Monitor response times

## 🔄 Continuous Deployment

### Automatic Deployments
- Push to main branch triggers deployment
- Preview deployments for pull requests
- Rollback capability available

### Manual Deployments
```bash
# Trigger manual deployment
git push origin main
```

## 📞 Support

### Vercel Support
- Documentation: [vercel.com/docs](https://vercel.com/docs)
- Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

### Render Support
- Documentation: [render.com/docs](https://render.com/docs)
- Community: [community.render.com](https://community.render.com)

---

**Deployment Status**: ✅ Ready for deployment
**Last Updated**: August 2025
**Version**: 1.0.0 