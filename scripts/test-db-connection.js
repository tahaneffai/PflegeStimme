/**
 * Test database connection and diagnose issues
 * Run: node scripts/test-db-connection.js
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('Testing database connection...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    // Test 1: Check if we can connect
    console.log('1. Testing connection...');
    await prisma.$connect();
    console.log('   ✅ Connected successfully\n');

    // Test 2: Check if tables exist
    console.log('2. Checking tables...');
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `;
    console.log(`   ✅ Found ${tables.length} tables:`, tables.map(t => t.name).join(', '));
    console.log('');

    // Test 3: Try a simple query
    console.log('3. Testing query...');
    const count = await prisma.anonymousVoice.count();
    console.log(`   ✅ Query successful. Found ${count} voices\n`);

    // Test 4: Check admin config
    console.log('4. Checking admin config...');
    const adminConfig = await prisma.adminConfig.findUnique({
      where: { id: 'singleton' },
    });
    if (adminConfig) {
      console.log('   ✅ Admin config exists\n');
    } else {
      console.log('   ⚠️  Admin config not found (will be created on first login)\n');
    }

    console.log('✅ All tests passed! Database is working correctly.');
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    console.error('   Full error:', error);
    
    if (error.code === 'P1001') {
      console.error('\n💡 Solution: Database file might not exist. Run: npx prisma db push');
    } else if (error.code === 'P1008') {
      console.error('\n💡 Solution: Database is locked. Close any DB viewers and restart dev server.');
    } else if (error.message?.includes('no such table')) {
      console.error('\n💡 Solution: Run migrations: npx prisma migrate dev');
    } else if (error.message?.includes('PrismaClient')) {
      console.error('\n💡 Solution: Generate Prisma client: npx prisma generate');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

