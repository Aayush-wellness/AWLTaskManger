// Debug script to test login endpoint
const https = require('https');

const DEPLOYMENT_URL = 'https://employeetask-gules.vercel.app';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, DEPLOYMENT_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function debugLogin() {
  console.log('🔍 Debugging login issues...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await makeRequest('/api/health');
    console.log(`Status: ${health.status}`);
    console.log('Response:', JSON.stringify(health.data, null, 2));
    console.log('---\n');

    // Test 2: Debug endpoint
    console.log('2. Testing debug endpoint...');
    const debug = await makeRequest('/api/debug/login', 'POST', { 
      email: 'test@example.com' 
    });
    console.log(`Status: ${debug.status}`);
    console.log('Response:', JSON.stringify(debug.data, null, 2));
    console.log('---\n');

    // Test 3: Actual login attempt
    console.log('3. Testing actual login...');
    const login = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@example.com',
      password: 'password123'
    });
    console.log(`Status: ${login.status}`);
    console.log('Response:', JSON.stringify(login.data, null, 2));
    console.log('---\n');

    // Analysis
    console.log('📊 ANALYSIS:');
    if (health.data.mongoConnection !== 'Connected') {
      console.log('❌ MongoDB is not connected - check MONGODB_URI');
    }
    if (health.data.jwtSecret === 'Not Set') {
      console.log('❌ JWT_SECRET is not set in Vercel environment variables');
    }
    if (health.data.mongoConnection === 'Connected' && health.data.jwtSecret === 'Set') {
      console.log('✅ Basic configuration looks good');
      console.log('💡 The issue might be with user data or password hashing');
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
  }
}

debugLogin();