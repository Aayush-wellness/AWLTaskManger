// Test script to verify deployment
const https = require('https');

const DEPLOYMENT_URL = 'https://your-app-name.vercel.app'; // Replace with your actual URL

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const url = `${DEPLOYMENT_URL}${path}`;
    console.log(`Testing: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data.substring(0, 200)}...`);
        console.log('---');
        resolve({ status: res.statusCode, data });
      });
    }).on('error', (err) => {
      console.error(`Error testing ${url}:`, err.message);
      reject(err);
    });
  });
}

async function runTests() {
  console.log('Testing deployment endpoints...\n');
  
  try {
    // Test health endpoint
    await testEndpoint('/api/health');
    
    // Test main app
    await testEndpoint('/');
    
    // Test a specific route
    await testEndpoint('/login');
    
    console.log('Tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();