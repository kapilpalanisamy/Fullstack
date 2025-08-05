# 🚀 Netlify Deployment Guide for RizeOS

## **Quick Deploy Steps:**

### **1. Frontend Deployment (Netlify)**
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "New site from Git"
4. Choose your GitHub repository: `https://github.com/kapilpalanisamy/RizeOS_Final.git`
5. Set build settings:
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Publish directory:** `frontend/dist`
6. Add environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   VITE_WALLET_ADDRESS=your-wallet-address
   VITE_NETWORK_ID=11155111
   VITE_NETWORK_NAME=Sepolia
   VITE_ENABLE_AI=true
   VITE_ENABLE_WEB3=true
   ```

### **2. Backend Deployment (Render)**
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** rizeos-backend
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres.ylikervxuyubfdomvnmz:Kapil944336@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   JWT_SECRET=your-secret-key
   CORS_ORIGIN=https://your-netlify-app.netlify.app
   ADMIN_WALLET_ADDRESS=your-admin-wallet
   PAYMENT_ENABLED=true
   PLATFORM_FEE=0.01
   ```

### **3. Update Frontend API URL**
After backend is deployed, update the `VITE_API_BASE_URL` in Netlify with your Render backend URL.

## **Why Netlify?**
✅ **Pros:**
- Easy deployment from GitHub
- Automatic builds on push
- Free SSL certificates
- Great performance
- Easy environment variable management
- Custom domains support

❌ **Cons:**
- Limited server-side functionality
- Need separate backend hosting

## **Alternative: Vercel**
If you prefer Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure similar settings

## **Next Steps:**
1. Deploy backend first (Render)
2. Deploy frontend (Netlify)
3. Update environment variables
4. Test the complete application

---
**Ready to deploy? Let me know which platform you prefer!** 