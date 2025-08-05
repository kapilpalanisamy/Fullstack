#!/usr/bin/env node

/**
 * RizeOS Job Portal Deployment Setup
 * Automated deployment preparation script
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 RizeOS Job Portal - Deployment Setup\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Please run this script from the backend directory.');
  process.exit(1);
}

// Read package.json to verify it's the backend
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'job-portal-backend') {
  console.error('❌ This script should be run from the job-portal-backend directory.');
  process.exit(1);
}

console.log('✅ Verified backend directory');

// Check Node.js version
const nodeVersion = process.version;
const requiredNodeVersion = packageJson.engines?.node || '>=16.0.0';
console.log(`✅ Node.js version: ${nodeVersion}`);

// Deployment checklist
const deploymentChecklist = [
  {
    name: 'Environment Variables',
    check: () => {
      const envPath = path.join(process.cwd(), '.env');
      if (!fs.existsSync(envPath)) {
        return { status: 'warning', message: '.env file not found' };
      }
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = [
        'NODE_ENV',
        'PORT',
        'DB_URL',
        'JWT_SECRET',
        'SOLANA_RPC_URL',
        'ADMIN_WALLET_ADDRESS'
      ];
      
      const missingVars = requiredVars.filter(varName => 
        !envContent.includes(varName + '=')
      );
      
      if (missingVars.length > 0) {
        return { 
          status: 'error', 
          message: `Missing variables: ${missingVars.join(', ')}` 
        };
      }
      
      return { status: 'success', message: 'All required variables present' };
    }
  },
  {
    name: 'Dependencies',
    check: () => {
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        return { status: 'error', message: 'node_modules not found. Run npm install' };
      }
      
      // Check critical dependencies
      const criticalDeps = ['express', 'sequelize', 'jsonwebtoken', '@solana/web3.js', 'openai'];
      const missingDeps = criticalDeps.filter(dep => 
        !fs.existsSync(path.join(nodeModulesPath, dep))
      );
      
      if (missingDeps.length > 0) {
        return { 
          status: 'error', 
          message: `Missing dependencies: ${missingDeps.join(', ')}` 
        };
      }
      
      return { status: 'success', message: 'All dependencies installed' };
    }
  },
  {
    name: 'Database Models',
    check: () => {
      const modelsDir = path.join(process.cwd(), 'src', 'models');
      if (!fs.existsSync(modelsDir)) {
        return { status: 'error', message: 'Models directory not found' };
      }
      
      const requiredModels = ['User.js', 'Company.js', 'Job.js', 'Application.js', 'PaymentTransaction.js'];
      const missingModels = requiredModels.filter(model => 
        !fs.existsSync(path.join(modelsDir, model))
      );
      
      if (missingModels.length > 0) {
        return { 
          status: 'error', 
          message: `Missing models: ${missingModels.join(', ')}` 
        };
      }
      
      return { status: 'success', message: 'All models present' };
    }
  },
  {
    name: 'API Routes',
    check: () => {
      const routesDir = path.join(process.cwd(), 'src', 'routes');
      if (!fs.existsSync(routesDir)) {
        return { status: 'error', message: 'Routes directory not found' };
      }
      
      const requiredRoutes = ['auth.js', 'jobs.js', 'users.js', 'companies.js', 'applications.js', 'wallets.js', 'payments.js', 'ai.js'];
      const missingRoutes = requiredRoutes.filter(route => 
        !fs.existsSync(path.join(routesDir, route))
      );
      
      if (missingRoutes.length > 0) {
        return { 
          status: 'warning', 
          message: `Missing routes: ${missingRoutes.join(', ')}` 
        };
      }
      
      return { status: 'success', message: 'All API routes present' };
    }
  },
  {
    name: 'Controllers',
    check: () => {
      const controllersDir = path.join(process.cwd(), 'src', 'controllers');
      if (!fs.existsSync(controllersDir)) {
        return { status: 'error', message: 'Controllers directory not found' };
      }
      
      const requiredControllers = [
        'authController.js', 
        'jobController.js', 
        'userController.js', 
        'companyController.js',
        'applicationController.js',
        'walletController.js',
        'paymentController.js',
        'aiController.js'
      ];
      
      const missingControllers = requiredControllers.filter(controller => 
        !fs.existsSync(path.join(controllersDir, controller))
      );
      
      if (missingControllers.length > 0) {
        return { 
          status: 'warning', 
          message: `Missing controllers: ${missingControllers.join(', ')}` 
        };
      }
      
      return { status: 'success', message: 'All controllers present' };
    }
  },
  {
    name: 'Services',
    check: () => {
      const servicesDir = path.join(process.cwd(), 'src', 'services');
      if (!fs.existsSync(servicesDir)) {
        return { status: 'error', message: 'Services directory not found' };
      }
      
      const requiredServices = [
        'authService.js',
        'jobService.js', 
        'aiService.js',
        'solanaService.js',
        'paymentService.js'
      ];
      
      const missingServices = requiredServices.filter(service => 
        !fs.existsSync(path.join(servicesDir, service))
      );
      
      if (missingServices.length > 0) {
        return { 
          status: 'warning', 
          message: `Missing services: ${missingServices.join(', ')}` 
        };
      }
      
      return { status: 'success', message: 'All services present' };
    }
  },
  {
    name: 'Configuration',
    check: () => {
      const configDir = path.join(process.cwd(), 'src', 'config');
      if (!fs.existsSync(configDir)) {
        return { status: 'error', message: 'Config directory not found' };
      }
      
      const requiredConfigs = ['config.js', 'database.js', 'logger.js'];
      const missingConfigs = requiredConfigs.filter(config => 
        !fs.existsSync(path.join(configDir, config))
      );
      
      if (missingConfigs.length > 0) {
        return { 
          status: 'error', 
          message: `Missing configs: ${missingConfigs.join(', ')}` 
        };
      }
      
      return { status: 'success', message: 'All configurations present' };
    }
  }
];

console.log('📋 Running Deployment Checklist...\n');

let hasErrors = false;
let hasWarnings = false;

deploymentChecklist.forEach((item, index) => {
  const result = item.check();
  const statusEmoji = {
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  console.log(`${index + 1}. ${item.name}: ${statusEmoji[result.status]} ${result.message}`);
  
  if (result.status === 'error') hasErrors = true;
  if (result.status === 'warning') hasWarnings = true;
});

console.log('\n🎯 Deployment Status Summary:');

if (hasErrors) {
  console.log('❌ Deployment NOT ready - Critical issues found');
  console.log('   Please fix the errors above before deploying');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Deployment ready with warnings');
  console.log('   Some optional components are missing but deployment is possible');
} else {
  console.log('✅ Deployment READY - All checks passed!');
}

console.log('\n📋 Deployment Instructions:');
console.log('');
console.log('1. 🗄️  Database Setup:');
console.log('   - Set up PostgreSQL database');
console.log('   - Update DB_URL in .env file');
console.log('   - Run: npm run db:migrate');
console.log('');
console.log('2. 🔐 Environment Variables:');
console.log('   - Review .env file for production values');
console.log('   - Set NODE_ENV=production');
console.log('   - Configure real API keys (OpenAI, Solana)');
console.log('');
console.log('3. 🚀 Deployment Options:');
console.log('   Local: npm start');
console.log('   Docker: docker build -t job-portal-backend .');
console.log('   Heroku: git push heroku main');
console.log('   Vercel: vercel --prod');
console.log('   AWS: Use Elastic Beanstalk or EC2');
console.log('');
console.log('4. 🔧 Post-Deployment:');
console.log('   - Test API endpoints');
console.log('   - Verify database connections');
console.log('   - Check blockchain integration');
console.log('   - Test AI features');
console.log('');
console.log('📝 API Endpoints Available:');
console.log('   GET  /health                 - Health check');
console.log('   POST /api/v1/auth/register   - User registration');
console.log('   POST /api/v1/auth/login      - User login');
console.log('   GET  /api/v1/jobs           - List jobs');
console.log('   POST /api/v1/jobs           - Create job');
console.log('   GET  /api/v1/companies      - List companies');
console.log('   POST /api/v1/wallets/connect - Connect wallet');
console.log('   POST /api/v1/payments/create - Create payment');
console.log('   POST /api/v1/ai/extract-skills - Extract skills');
console.log('   GET  /api/v1/ai/job-recommendations - Get recommendations');
console.log('');
console.log('🎉 RizeOS Job Portal Backend Ready for Production!');

// Optional: Create deployment scripts
const scriptsDir = path.join(process.cwd(), 'scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir);
}

// Create Docker deployment script
const dockerScript = `#!/bin/bash
# RizeOS Job Portal Docker Deployment

echo "🐳 Building Docker image..."
docker build -t rizeos/job-portal-backend .

echo "🚀 Starting container..."
docker run -d \\
  --name job-portal-backend \\
  -p 5000:5000 \\
  --env-file .env \\
  rizeos/job-portal-backend

echo "✅ Backend deployed at http://localhost:5000"
echo "📊 Check logs: docker logs job-portal-backend"
`;

fs.writeFileSync(path.join(scriptsDir, 'deploy-docker.sh'), dockerScript);
fs.chmodSync(path.join(scriptsDir, 'deploy-docker.sh'), '755');

console.log('\n📝 Deployment scripts created in ./scripts/');
console.log('   - deploy-docker.sh: Docker deployment');
console.log('\n🎯 Next: Set up your database and deploy!');
