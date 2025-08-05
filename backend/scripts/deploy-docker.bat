@echo off
REM RizeOS Job Portal - Windows Docker Deployment Script

echo 🚀 Deploying RizeOS Job Portal with Docker...

REM Build the Docker image
echo 📦 Building Docker image...
docker build -t rize-job-portal-backend .

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Start the services
echo 🔄 Starting services with Docker Compose...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak > nul

REM Check container status
echo 📊 Container Status:
docker-compose ps

REM Check application health
echo 🏥 Checking application health...
curl -f http://localhost:3000/health

REM Show logs
echo 📋 Recent logs:
docker-compose logs --tail=20

echo ✅ Deployment complete!
echo 🌐 Backend API: http://localhost:3000
echo 📊 Health Check: http://localhost:3000/health
echo 📁 View logs: docker-compose logs -f
echo 🛑 Stop services: docker-compose down

pause
