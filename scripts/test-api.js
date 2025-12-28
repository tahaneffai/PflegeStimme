/**
 * Quick sanity check script to test /api/voices endpoint
 * Run: node scripts/test-api.js
 */

async function testVoicesAPI() {
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  
  console.log('Testing /api/voices endpoint...\n');
  
  try {
    const response = await fetch(`${baseUrl}/api/voices?page=1&size=5&sort=newest`);
    
    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    // Validate response structure
    const requiredFields = ['ok', 'data'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
      console.log('Response:', JSON.stringify(data, null, 2));
      return;
    }
    
    if (data.ok) {
      console.log('✅ API Response OK');
      console.log(`   Items: ${data.data?.items?.length || 0}`);
      console.log(`   Total: ${data.data?.total || 0}`);
      if (data.degraded) {
        console.log('   ⚠️  Degraded mode (database issues)');
      }
    } else {
      console.log('⚠️  API returned error:', data.error?.message || data.error);
      if (data.degraded) {
        console.log('   Database is in degraded state');
      }
    }
    
    console.log('\n✅ Response structure is valid');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Make sure the dev server is running: npm run dev');
  }
}

testVoicesAPI();

