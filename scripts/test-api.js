/**
 * Test API endpoints
 */
const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testCommentsAPI() {
  console.log('\n=== Testing Comments API ===\n');

  // Test POST comment
  try {
    console.log('1. Testing POST /api/comments...');
    const postResponse = await fetch(`${BASE_URL}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'This is a test comment with more than 5 characters',
      }),
    });
    const postData = await postResponse.json();
    console.log('   Status:', postResponse.status);
    console.log('   Response:', JSON.stringify(postData, null, 2));
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }

  // Test GET comments
  try {
    console.log('\n2. Testing GET /api/comments...');
    const getResponse = await fetch(`${BASE_URL}/api/comments?page=1&size=3`);
    const getData = await getResponse.json();
    console.log('   Status:', getResponse.status);
    console.log('   Response:', JSON.stringify(getData, null, 2));
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
}

async function testAdminAPI() {
  console.log('\n=== Testing Admin API ===\n');

  // Test admin login
  try {
    console.log('1. Testing POST /api/admin/login...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: process.env.ADMIN_PASSWORD || '12345678',
      }),
    });
    const loginData = await loginResponse.json();
    console.log('   Status:', loginResponse.status);
    console.log('   Response:', JSON.stringify(loginData, null, 2));
    console.log('   Cookies:', loginResponse.headers.get('set-cookie'));
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
}

async function main() {
  console.log('Testing API endpoints...\n');
  console.log('BASE_URL:', BASE_URL);
  console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '***set***' : 'NOT SET');

  await testCommentsAPI();
  await testAdminAPI();
}

main().catch(console.error);



