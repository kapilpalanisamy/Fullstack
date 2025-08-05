// Test Authentication Endpoints
const API_BASE = 'http://localhost:5000';

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints...\n');
  
  try {
    // Test Registration
    console.log('1️⃣ Testing Registration...');
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        role: 'candidate'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration Response:', registerData);
    
    // Test Login
    console.log('\n2️⃣ Testing Login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    // Test Backend Connection Test
    console.log('\n3️⃣ Testing Backend Health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('Health Response:', healthData);
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuth();
