# RizeOS - AI-Powered Job Portal with Web3 Integration

## 🚀 Project Overview

RizeOS is a modern job portal that combines AI-powered job matching, Web3 wallet integration, and blockchain payments. Built with React, Node.js, and Supabase.

## ✨ Features

- **AI-Powered Job Matching**: Intelligent job recommendations based on skills and preferences
- **Web3 Wallet Integration**: MetaMask and Phantom wallet support
- **Blockchain Payments**: Secure payment processing on testnet
- **Real-time Chat**: Built-in messaging system
- **Advanced Search**: Filter jobs by location, salary, skills, and more
- **Admin Dashboard**: Complete management interface
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Radix UI Components
- React Router DOM
- Clerk Authentication

### Backend
- Node.js
- Express.js
- PostgreSQL (Supabase)
- JWT Authentication
- Web3.js

### AI/ML
- OpenAI API Integration
- Skill Extraction
- Job Matching Algorithms

### Blockchain
- MetaMask Integration
- Phantom Wallet Support
- Testnet Transactions

## 📁 Project Structure

```
RizeOS-Deploy/
├── frontend/          # React application
├── backend/           # Node.js API server
├── docs/             # Documentation
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- MetaMask or Phantom wallet

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kapilpalanisamy/RizeOS_Final.git
cd RizeOS_Final
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../backend
npm install
```

4. **Environment Setup**

Create `.env` files in both frontend and backend directories:

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
VITE_NETWORK_ID=5
VITE_NETWORK_NAME=Goerli Testnet
VITE_ENABLE_AI=true
VITE_ENABLE_WEB3=true
```

**Backend (.env)**
```env
DATABASE_URL=postgresql://postgres.ylikervxuyubfdomvnmz:Kapil944336@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ADMIN_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
PAYMENT_ENABLED=true
PLATFORM_FEE=0.01
```

5. **Start Development Servers**

**Backend (Terminal 1)**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2)**
```bash
cd frontend
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🌐 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy as a Web Service

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications` - Get user applications
- `GET /api/applications/:id` - Get application details

### Blockchain
- `POST /api/blockchain/wallet` - Connect wallet
- `POST /api/blockchain/payment` - Process payment

### AI
- `POST /api/ai/match` - AI job matching
- `POST /api/ai/extract-skills` - Extract skills from resume

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

## 📊 Database Schema

### Users Table
- id (UUID)
- email (VARCHAR)
- password_hash (VARCHAR)
- wallet_address (VARCHAR)
- profile_data (JSONB)

### Jobs Table
- id (UUID)
- title (VARCHAR)
- description (TEXT)
- company_id (UUID)
- salary_range (JSONB)
- requirements (JSONB)

### Applications Table
- id (UUID)
- user_id (UUID)
- job_id (UUID)
- status (ENUM)
- applied_at (TIMESTAMP)

## 🔐 Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- CORS Protection
- Rate Limiting
- Input Validation
- SQL Injection Prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Kapil Palanisamy**
- GitHub: [@kapilpalanisamy](https://github.com/kapilpalanisamy)
- LinkedIn: [Kapil Palanisamy](https://linkedin.com/in/kapilpalanisamy)

## 🙏 Acknowledgments

- OpenAI for AI integration
- Supabase for database hosting
- Vercel for frontend deployment
- Render for backend deployment
- MetaMask for wallet integration

---

**RizeOS** - Revolutionizing job portals with AI and Web3 technology! 🚀 