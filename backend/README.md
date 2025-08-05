# RizeOS Job Portal Backend

A **clean, scalable, and professional** Node.js backend for a Web3-enabled job portal with AI features.

## 🌟 Features

- **🔐 Authentication & Authorization** - JWT-based auth with role management
- **💼 Job Management** - Complete CRUD operations for job postings
- **🤖 AI Integration** - Skill extraction and job matching algorithms
- **⛓️ Blockchain Integration** - Solana payment system for job postings
- **📧 Email Notifications** - Automated email system for applications
- **📊 Analytics** - Comprehensive admin dashboard APIs
- **🔒 Security** - Rate limiting, input validation, and secure practices
- **📝 Clean Architecture** - Well-structured, maintainable codebase

## 🏗️ Architecture

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
└── database/        # Database migrations
```

## 🚀 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Blockchain**: Solana Web3.js
- **AI/ML**: OpenAI API + Custom NLP
- **Email**: Nodemailer
- **File Storage**: Cloudinary
- **Logging**: Winston
- **Testing**: Jest + Supertest

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Solana wallet (Phantom)
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-portal-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb job_portal_dev
   
   # Run migrations
   npm run db:migrate
   
   # Seed database (optional)
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_URL=postgresql://user:password@localhost:5432/job_portal_dev

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
ADMIN_WALLET_ADDRESS=your_admin_wallet_address
JOB_POSTING_FEE_SOL=0.01

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/me          # Get current user
POST /api/auth/refresh     # Refresh token
```

### Job Endpoints
```
GET    /api/jobs           # List all jobs
POST   /api/jobs           # Create new job (requires payment)
GET    /api/jobs/:id       # Get job details
PUT    /api/jobs/:id       # Update job
DELETE /api/jobs/:id       # Delete job
POST   /api/jobs/:id/apply # Apply to job
```

### User Profile Endpoints
```
GET    /api/users/profile/:id    # Get user profile
PUT    /api/users/profile        # Update profile
POST   /api/users/upload-avatar  # Upload avatar
```

### AI Features
```
POST /api/ai/extract-skills      # Extract skills from resume
POST /api/ai/job-match          # Calculate job match score
GET  /api/ai/recommended-jobs   # Get AI recommendations
```

### Payment Endpoints
```
POST /api/payments/verify-transaction  # Verify Solana transaction
GET  /api/payments/history            # Payment history
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure Details

### Controllers
Handle HTTP requests and responses, delegating business logic to services.

### Services
Contain business logic, database operations, and external API integrations.

### Models
Sequelize models defining database schema and relationships.

### Middleware
Custom middleware for authentication, logging, error handling, and validation.

### Utils
Helper functions, constants, and utility classes.

## 🔒 Security Features

- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Sanitize and validate all inputs
- **JWT Authentication** - Secure token-based auth
- **CORS Protection** - Configure allowed origins
- **Helmet.js** - Security headers
- **Password Hashing** - bcrypt with salt rounds
- **SQL Injection Prevention** - Sequelize ORM protection

## 📊 Monitoring & Logging

- **Winston Logger** - Structured logging with different levels
- **Request Logging** - HTTP request/response logging
- **Error Tracking** - Centralized error handling and logging
- **Performance Monitoring** - Response time tracking

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Configure CORS for production domain
5. Set up SSL certificates
6. Configure reverse proxy (nginx)

### Docker Deployment
```dockerfile
# Dockerfile included for containerization
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ by the RizeOS Team

---

**Ready to revolutionize job searching with Web3 and AI! 🚀**
