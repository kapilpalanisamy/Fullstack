# Database Setup Script for RizeOS Job Portal
# Run this script to set up your PostgreSQL database

Write-Host "🚀 Setting up RizeOS Job Portal Database..." -ForegroundColor Green

# Check if PostgreSQL is installed
$pgVersion = pg_config --version 2>$null
if (-not $pgVersion) {
    Write-Host "❌ PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL first: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found PostgreSQL: $pgVersion" -ForegroundColor Green

# Database configuration
$DB_NAME = "rize_job_portal"
$DB_USER = "postgres"
$DB_HOST = "localhost"
$DB_PORT = "5432"

Write-Host "📊 Creating database: $DB_NAME" -ForegroundColor Cyan

# Create database
try {
    createdb -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME
    Write-Host "✅ Database '$DB_NAME' created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database might already exist or connection failed" -ForegroundColor Yellow
    Write-Host "Continuing with setup..." -ForegroundColor Yellow
}

# Test connection
Write-Host "🔌 Testing database connection..." -ForegroundColor Cyan
try {
    psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -c "SELECT version();" -q
    Write-Host "✅ Database connection successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
    Write-Host "Please check your PostgreSQL installation and credentials" -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Database setup complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your .env file with database credentials" -ForegroundColor White
Write-Host "2. Run: npm run db:migrate" -ForegroundColor White
Write-Host "3. Run: npm start" -ForegroundColor White
