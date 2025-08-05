/**
 * Simple Test Server 
 * Basic server to test if Express is working
 */

const express = require('express');
const app = express();
const port = 5001;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test server is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Test server health check',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on port ${port}`);
  console.log(`🔗 Test endpoint: http://localhost:${port}/test`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});

module.exports = app;
