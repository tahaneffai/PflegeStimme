/**
 * Diagnose common issues
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

const prisma = new PrismaClient();

async function diagnose() {
  console.log('\n=== DIAGNOSIS REPORT ===\n');

  // 1. Check environment variables
  console.log('1. Environment Variables:');
  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasAdminPassword = !!process.env.ADMIN_PASSWORD;
  const hasSessionSecret = !!process.env.ADMIN_SESSION_SECRET;
  
  console.log(`   DATABASE_URL: ${hasDbUrl ? '✅ Set' : '❌ MISSING'}`);
  console.log(`   ADMIN_PASSWORD: ${hasAdminPassword ? '✅ Set' : '❌ MISSING'}`);
  console.log(`   ADMIN_SESSION_SECRET: ${hasSessionSecret ? '✅ Set' : '❌ MISSING'}`);
  
  if (!hasSessionSecret) {
    console.log('   ⚠️  ADMIN_SESSION_SECRET not set - admin login may not work!');
  }

  // 2. Test database connection
  console.log('\n2. Database Connection:');
  try {
    await prisma.$connect();
    console.log('   ✅ Connected to database');
    
    // Check if Comment table exists and has status column
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Comment' AND column_name = 'status'
      `;
      if (result && result.length > 0) {
        console.log('   ✅ Comment.status column exists');
      } else {
        console.log('   ❌ Comment.status column MISSING - migration not applied!');
      }
    } catch (error) {
      console.log('   ⚠️  Could not check schema:', error.message);
    }
    
    // Try to create a test comment
    try {
      const testComment = await prisma.comment.create({
        data: {
          content: 'Test comment for diagnosis',
          status: 'PENDING',
        },
      });
      console.log('   ✅ Can create comments');
      
      // Clean up
      await prisma.comment.delete({ where: { id: testComment.id } });
    } catch (error) {
      console.log('   ❌ Cannot create comments:', error.message);
      if (error.message.includes('status')) {
        console.log('      → The status column or enum might be missing');
      }
    }
    
  } catch (error) {
    console.log('   ❌ Cannot connect to database:', error.message);
    if (error.message.includes('P1001')) {
      console.log('      → Check DATABASE_URL and ensure PostgreSQL is running');
    }
  }

  // 3. Check Prisma client
  console.log('\n3. Prisma Client:');
  try {
    const commentCount = await prisma.comment.count();
    console.log(`   ✅ Prisma client working (${commentCount} comments in database)`);
  } catch (error) {
    console.log('   ❌ Prisma client error:', error.message);
  }

  console.log('\n=== END OF DIAGNOSIS ===\n');
  
  await prisma.$disconnect();
}

diagnose().catch(console.error);

