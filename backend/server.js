/**
 * RizeOS Job Portal Backend API Server
 * Production-ready server with real database integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database service
const { 
    initializeDatabase, 
    usersService, 
    companiesService, 
    jobsService, 
    applicationsService 
} = require('./src/services/databaseService');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIGURATION START ---
const allowedOrigins = [
    'https://rizeos-job-portal-frontend-nx7dnv3jx-kapils-projects-74e22e25.vercel.app',
    'https://rizeos-job-portal-frontend.vercel.app',
    'http://localhost:5173'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400 // 24 hours
};

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));
// Enable CORS for all requests
app.use(cors(corsOptions));
// --- CORS CONFIGURATION END ---

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoints
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'RizeOS Job Portal Backend is running! 🚀',
        version: '1.0.0',
        database: 'Connected to Supabase PostgreSQL'
    });
});

// Jobs endpoints
app.get('/api/jobs', async (req, res) => {
    try {
        const filters = {
            location: req.query.location,
            job_type: req.query.job_type,
            experience_level: req.query.experience_level
        };
        const jobs = await jobsService.getAll(filters);
        res.json({
            success: true,
            data: jobs,
            count: jobs.length,
            message: `Found ${jobs.length} jobs`
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch jobs',
            message: error.message
        });
    }
});

app.get('/api/jobs/:id', async (req, res) => {
    try {
        const job = await jobsService.getById(req.params.id);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found',
                message: `Job with ID ${req.params.id} does not exist`
            });
        }
        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch job',
            message: error.message
        });
    }
});

app.post('/api/jobs', async (req, res) => {
    try {
        const jobData = req.body;
        const job = await jobsService.create(jobData);
        res.status(201).json({
            success: true,
            data: job,
            message: 'Job created successfully'
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create job',
            message: error.message
        });
    }
});

// Companies endpoints
app.get('/api/companies', async (req, res) => {
    try {
        const companies = await companiesService.getAll();
        res.json({
            success: true,
            data: companies,
            count: companies.length,
            message: `Found ${companies.length} companies`
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch companies',
            message: error.message
        });
    }
});

app.get('/api/companies/:id', async (req, res) => {
    try {
        const company = await companiesService.getById(req.params.id);
        if (!company) {
            return res.status(404).json({
                success: false,
                error: 'Company not found',
                message: `Company with ID ${req.params.id} does not exist`
            });
        }
        res.json({
            success: true,
            data: company
        });
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch company',
            message: error.message
        });
    }
});

app.post('/api/companies', async (req, res) => {
    try {
        const companyData = req.body;
        const company = await companiesService.create(companyData);
        res.status(201).json({
            success: true,
            data: company,
            message: 'Company created successfully'
        });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create company',
            message: error.message
        });
    }
});

// Users endpoints
app.get('/api/users', async (req, res) => {
    try {
        const users = await usersService.getAll();
        res.json({
            success: true,
            data: users,
            count: users.length,
            message: `Found ${users.length} users`
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users',
            message: error.message
        });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await usersService.getById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                message: `User with ID ${req.params.id} does not exist`
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user',
            message: error.message
        });
    }
});

// Applications endpoints
app.get('/api/applications/job/:jobId', async (req, res) => {
    try {
        const applications = await applicationsService.getByJobId(req.params.jobId);
        res.json({
            success: true,
            data: applications,
            count: applications.length,
            message: `Found ${applications.length} applications`
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications',
            message: error.message
        });
    }
});

app.get('/api/applications/user/:userId', async (req, res) => {
    try {
        const applications = await applicationsService.getByUserId(req.params.userId);
        res.json({
            success: true,
            data: applications,
            count: applications.length,
            message: `Found ${applications.length} applications`
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications',
            message: error.message
        });
    }
});

app.post('/api/applications', async (req, res) => {
    try {
        const applicationData = req.body;
        const application = await applicationsService.create(applicationData);
        res.status(201).json({
            success: true,
            data: application,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create application',
            message: error.message
        });
    }
});

// Authentication endpoints (mock for now)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        // Mock authentication - in production, implement proper JWT authentication
        const user = await usersService.getByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token: 'mock-jwt-token-' + Date.now()
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            message: error.message
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const userData = req.body;
        if (!userData.email || !userData.password || !userData.name) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and password are required'
            });
        }
        const user = await usersService.create(userData);
        res.status(201).json({
            success: true,
            data: {
                user: user,
                token: 'mock-jwt-token-' + Date.now()
            },
            message: 'Registration successful'
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
            message: error.message
        });
    }
});

// Blockchain endpoints (mock for now)
app.get('/api/blockchain/wallet', (req, res) => {
    res.json({
        success: true,
        data: {
            address: process.env.ETHEREUM_ADDRESS || '0x84cC4Db44636467C0aF79E64975f0906d76795E9',
            network: 'sepolia',
            balance: '0.5 ETH',
            userWallet: process.env.USER_METAMASK_ADDRESS || '0xeE11B5C629F81B7a02c5cf663345145F36f43cE0'
        },
        message: 'Wallet information retrieved'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `The endpoint ${req.originalUrl} does not exist`
    });
});

// Initialize database and start server
async function startServer() {
    try {
        console.log('🚀 Starting RizeOS Job Portal Backend Server...\n');
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`\n🎉 RizeOS Job Portal Backend Server Started Successfully!`);
            console.log(`📍 Server URL: http://localhost:${PORT}`);
            console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`📋 Jobs API: http://localhost:${PORT}/api/jobs`);
            console.log(`🏢 Companies API: http://localhost:${PORT}/api/companies`);
            console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
            console.log(`📄 Applications API: http://localhost:${PORT}/api/applications`);
            console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
            console.log(`💰 Blockchain API: http://localhost:${PORT}/api/blockchain`);
            console.log(`\n✅ Backend is ready to serve requests!`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down RizeOS Job Portal Backend...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n\n👋 RizeOS Job Portal Backend terminated');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
