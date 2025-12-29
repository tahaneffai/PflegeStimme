/**
 * Test admin login
 */
const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12345678';

async function testLogin() {
  console.log('\n=== Testing Admin Login ===\n');
  console.log('BASE_URL:', BASE_URL);
  console.log('Testing with password:', ADMIN_PASSWORD);
  console.log('');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: ADMIN_PASSWORD,
      }),
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));

    if (response.status === 200 && data.ok) {
      console.log('\n✅ Login successful!');
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        console.log('✅ Session cookie set:', setCookie.substring(0, 50) + '...');
      } else {
        console.log('⚠️  No session cookie set!');
      }
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.error?.message || data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

testLogin().catch(console.error);

