#!/usr/bin/env node

/**
 * RizeOS Job Portal - Online Services Setup Wizard
 * This script helps you configure all online services step by step
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class OnlineSetupWizard {
  constructor() {
    this.config = {};
    this.envFile = '.env';
  }

  async start() {
    console.log('🌐 RizeOS Job Portal - Online Services Setup Wizard');
    console.log('='.repeat(60));
    console.log('This wizard will help you configure all online services.');
    console.log('Have the following ready:');
    console.log('• Supabase account and database');
    console.log('• OpenAI API key');
    console.log('• Phantom wallet private key');
    console.log('• Gmail app password');
    console.log('• Cloudinary credentials');
    console.log('='.repeat(60));
    console.log('');

    try {
      await this.setupDatabase();
      await this.setupOpenAI();
      await this.setupSolana();
      await this.setupEmail();
      await this.setupCloudinary();
      await this.setupSecurity();
      await this.saveConfiguration();
      await this.testConnections();
      
      console.log('\n🎉 Setup Complete!');
      console.log('Next steps:');
      console.log('1. npm run db:migrate');
      console.log('2. npm run db:seed');
      console.log('3. npm run dev');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
    } finally {
      rl.close();
    }
  }

  async question(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  }

  async setupDatabase() {
    console.log('\n📊 Database Configuration (Supabase)');
    console.log('-'.repeat(40));
    
    const dbHost = await this.question('Database Host (e.g., db.xxx.supabase.co): ');
    const dbPassword = await this.question('Database Password: ');
    
    this.config.DB_HOST = dbHost;
    this.config.DB_PORT = '5432';
    this.config.DB_NAME = 'postgres';
    this.config.DB_USER = 'postgres';
    this.config.DB_PASSWORD = dbPassword;
    this.config.DB_URL = `postgresql://postgres:${dbPassword}@${dbHost}:5432/postgres`;
    
    console.log('✅ Database configuration saved');
  }

  async setupOpenAI() {
    console.log('\n🤖 OpenAI Configuration');
    console.log('-'.repeat(40));
    
    const enableAI = await this.question('Enable AI features? (y/N): ');
    
    if (enableAI.toLowerCase() === 'y') {
      const apiKey = await this.question('OpenAI API Key (sk-proj-...): ');
      
      this.config.OPENAI_API_KEY = apiKey;
      this.config.OPENAI_MODEL = 'gpt-3.5-turbo';
      this.config.AI_ENABLED = 'true';
      this.config.AI_FALLBACK_ENABLED = 'true';
      
      console.log('✅ OpenAI configuration saved');
    } else {
      this.config.AI_ENABLED = 'false';
      console.log('⏭️  AI features disabled');
    }
  }

  async setupSolana() {
    console.log('\n💳 Solana Blockchain Configuration');
    console.log('-'.repeat(40));
    
    const enableBlockchain = await this.question('Enable blockchain features? (y/N): ');
    
    if (enableBlockchain.toLowerCase() === 'y') {
      const adminWallet = await this.question('Admin Wallet Private Key: ');
      
      this.config.SOLANA_NETWORK = 'devnet';
      this.config.SOLANA_RPC_URL = 'https://api.devnet.solana.com';
      this.config.SOLANA_ADMIN_WALLET = adminWallet;
      this.config.BLOCKCHAIN_ENABLED = 'true';
      
      console.log('✅ Solana configuration saved');
    } else {
      this.config.BLOCKCHAIN_ENABLED = 'false';
      console.log('⏭️  Blockchain features disabled');
    }
  }

  async setupEmail() {
    console.log('\n📧 Email Service Configuration');
    console.log('-'.repeat(40));
    
    const emailUser = await this.question('Gmail address: ');
    const emailPass = await this.question('Gmail app password (16 chars): ');
    
    this.config.EMAIL_SERVICE = 'gmail';
    this.config.EMAIL_HOST = 'smtp.gmail.com';
    this.config.EMAIL_PORT = '587';
    this.config.EMAIL_USER = emailUser;
    this.config.EMAIL_PASS = emailPass;
    this.config.EMAIL_FROM = `"RizeOS Job Portal" <${emailUser}>`;
    this.config.EMAIL_ENABLED = 'true';
    
    console.log('✅ Email configuration saved');
  }

  async setupCloudinary() {
    console.log('\n📁 File Upload Service (Cloudinary)');
    console.log('-'.repeat(40));
    
    const enableUpload = await this.question('Enable file uploads? (y/N): ');
    
    if (enableUpload.toLowerCase() === 'y') {
      const cloudName = await this.question('Cloudinary Cloud Name: ');
      const apiKey = await this.question('Cloudinary API Key: ');
      const apiSecret = await this.question('Cloudinary API Secret: ');
      
      this.config.CLOUDINARY_CLOUD_NAME = cloudName;
      this.config.CLOUDINARY_API_KEY = apiKey;
      this.config.CLOUDINARY_API_SECRET = apiSecret;
      this.config.FILE_UPLOAD_ENABLED = 'true';
      
      console.log('✅ Cloudinary configuration saved');
    } else {
      this.config.FILE_UPLOAD_ENABLED = 'false';
      console.log('⏭️  File uploads disabled');
    }
  }

  async setupSecurity() {
    console.log('\n🔐 Security Configuration');
    console.log('-'.repeat(40));
    
    const frontendUrl = await this.question('Frontend URL (e.g., https://your-app.vercel.app): ');
    
    // Generate secure JWT secrets
    this.config.JWT_SECRET = this.generateSecret(32);
    this.config.JWT_REFRESH_SECRET = this.generateSecret(32);
    this.config.JWT_EXPIRES_IN = '24h';
    this.config.JWT_REFRESH_EXPIRES_IN = '7d';
    
    this.config.CORS_ORIGIN = frontendUrl;
    this.config.RATE_LIMIT_WINDOW = '15';
    this.config.RATE_LIMIT_MAX = '100';
    
    console.log('✅ Security configuration generated');
  }

  generateSecret(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async saveConfiguration() {
    console.log('\n💾 Saving Configuration');
    console.log('-'.repeat(40));
    
    // Add default values
    this.config.NODE_ENV = 'production';
    this.config.PORT = '3000';
    this.config.API_VERSION = 'v1';
    this.config.BCRYPT_ROUNDS = '12';
    this.config.LOG_LEVEL = 'info';
    this.config.ENABLE_LOGGING = 'true';
    
    // Create .env content
    let envContent = '# RizeOS Job Portal - Generated Configuration\n';
    envContent += `# Generated on: ${new Date().toISOString()}\n\n`;
    
    for (const [key, value] of Object.entries(this.config)) {
      envContent += `${key}=${value}\n`;
    }
    
    // Backup existing .env
    if (fs.existsSync(this.envFile)) {
      fs.copyFileSync(this.envFile, `${this.envFile}.backup`);
      console.log('📦 Existing .env backed up to .env.backup');
    }
    
    // Write new .env
    fs.writeFileSync(this.envFile, envContent);
    console.log('✅ Configuration saved to .env');
  }

  async testConnections() {
    console.log('\n🧪 Testing Connections');
    console.log('-'.repeat(40));
    
    // Test database connection
    if (this.config.DB_URL) {
      try {
        const { Client } = require('pg');
        const client = new Client({ connectionString: this.config.DB_URL });
        await client.connect();
        await client.query('SELECT NOW()');
        await client.end();
        console.log('✅ Database connection successful');
      } catch (error) {
        console.log('❌ Database connection failed:', error.message);
      }
    }
    
    // Test OpenAI
    if (this.config.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${this.config.OPENAI_API_KEY}` }
        });
        if (response.ok) {
          console.log('✅ OpenAI API connection successful');
        } else {
          console.log('❌ OpenAI API connection failed');
        }
      } catch (error) {
        console.log('❌ OpenAI API test failed:', error.message);
      }
    }
    
    console.log('\n🎯 Connection tests completed');
  }
}

// Run the wizard
if (require.main === module) {
  const wizard = new OnlineSetupWizard();
  wizard.start().catch(console.error);
}

module.exports = OnlineSetupWizard;

/**
 * 🎯 QUICK ONLINE SETUP GUIDE
 * 
 * After you've set up all the online services above, run:
 * 
 * ```bash
 * npm run setup:online
 * ```
 * 
 * This interactive wizard will:
 * ✅ Guide you through configuration
 * ✅ Generate secure secrets
 * ✅ Create your .env file
 * ✅ Test all connections
 * ✅ Prepare for deployment
 * 
 * 🚀 DEPLOYMENT OPTIONS:
 * 
 * 1. Vercel (Recommended):
 *    npm i -g vercel && vercel --prod
 * 
 * 2. Railway:
 *    Connect GitHub at railway.app
 * 
 * 3. Render:
 *    Connect repo at render.com
 * 
 * 🧪 TEST ENDPOINTS:
 * 
 * - Health: GET /health
 * - Register: POST /api/auth/register
 * - Jobs: GET /api/jobs
 * - AI Skills: POST /api/ai/extract-skills
 * 
 * 📚 WHAT YOU'LL HAVE:
 * 
 * ✅ Cloud PostgreSQL database
 * ✅ AI-powered job matching
 * ✅ Blockchain payments (Solana)  
 * ✅ Email notifications
 * ✅ File upload system
 * ✅ Production-ready API
 * ✅ Complete documentation
 * 
 * 🎉 Ready to impress employers with your full-stack skills!
 */
