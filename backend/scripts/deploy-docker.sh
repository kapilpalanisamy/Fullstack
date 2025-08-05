#!/bin/bash
# RizeOS Job Portal Docker Deployment

echo "🐳 Building Docker image..."
docker build -t rizeos/job-portal-backend .

echo "🚀 Starting container..."
docker run -d \
  --name job-portal-backend \
  -p 5000:5000 \
  --env-file .env \
  rizeos/job-portal-backend

echo "✅ Backend deployed at http://localhost:5000"
echo "📊 Check logs: docker logs job-portal-backend"
