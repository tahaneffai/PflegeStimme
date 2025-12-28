// Script to reset admin password in database
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || `file:${dbPath}`,
    },
  },
});

async function resetAdminPassword() {
  try {
    const newPassword = '12345678';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Try to update existing record, or create if it doesn't exist
    try {
      const existing = await prisma.adminConfig.findUnique({
        where: { id: 'singleton' },
      });

      if (existing) {
        await prisma.adminConfig.update({
          where: { id: 'singleton' },
          data: { passwordHash },
        });
        console.log('✅ Admin password updated successfully!');
      } else {
        await prisma.adminConfig.create({
          data: {
            id: 'singleton',
            passwordHash,
          },
        });
        console.log('✅ Admin password created successfully!');
      }
    } catch (error) {
      // If update fails, try create
      try {
        await prisma.adminConfig.create({
          data: {
            id: 'singleton',
            passwordHash,
          },
        });
        console.log('✅ Admin password created successfully!');
      } catch (createError) {
        throw createError;
      }
    }

    console.log('\n📝 Admin Passwords:');
    console.log('  - 12345678 (stored in database, can be changed by admin)');
    console.log('  - Taha2005 (fallback password, always works, cannot be changed)');
    console.log('\n✅ You can now login with either password!');
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    console.error('\n💡 Make sure the database is initialized. Run:');
    console.error('   npx prisma migrate dev');
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();

