/**
 * Test database connection
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const prisma = new PrismaClient({
  log: ['error', 'warn', 'info'],
});

async function testConnection() {
  console.log('\n=== Testing Database Connection ===\n');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in environment');
    return;
  }

  // Mask password in URL for display
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log('DATABASE_URL:', maskedUrl);
  console.log('');

  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database query successful');
    console.log('PostgreSQL version:', result[0]?.version || 'Unknown');
    
    // Check if Comment table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'Comment'
    `;
    
    if (tables && tables.length > 0) {
      console.log('✅ Comment table exists');
    } else {
      console.log('⚠️  Comment table does not exist - you may need to run migrations');
    }
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 This means:');
      console.error('   - The username or password is incorrect');
      console.error('   - The database user does not exist');
      console.error('   - The password in DATABASE_URL is wrong');
      console.error('\n📋 How to fix:');
      console.error('   1. Check your PostgreSQL username and password');
      console.error('   2. Update DATABASE_URL in .env.local');
      console.error('   3. Format: postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME');
    } else if (error.message.includes('does not exist')) {
      console.error('\n💡 This means:');
      console.error('   - The database does not exist');
      console.error('\n📋 How to fix:');
      console.error('   1. Create the database: CREATE DATABASE your_database_name;');
      console.error('   2. Update DATABASE_URL in .env.local');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('connection')) {
      console.error('\n💡 This means:');
      console.error('   - PostgreSQL server is not running');
      console.error('\n📋 How to fix:');
      console.error('   1. Start PostgreSQL service');
      console.error('   2. On Windows: Check Services or use pg_ctl');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error);

