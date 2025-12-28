// Script to ensure admin config exists in database
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function ensureAdminConfig() {
  try {
    console.log('Checking admin config...');
    
    // Check if admin config exists
    const existing = await prisma.adminConfig.findUnique({
      where: { id: 'singleton' },
    });

    if (existing) {
      console.log('✅ Admin config already exists');
      console.log('Testing password 12345678...');
      const isValid = await bcrypt.compare('12345678', existing.passwordHash);
      if (isValid) {
        console.log('✅ Password 12345678 works correctly');
      } else {
        console.log('⚠️ Password 12345678 does not match, updating...');
        const newHash = await bcrypt.hash('12345678', 10);
        await prisma.adminConfig.update({
          where: { id: 'singleton' },
          data: { passwordHash: newHash },
        });
        console.log('✅ Password hash updated');
      }
    } else {
      console.log('Creating admin config...');
      const passwordHash = await bcrypt.hash('12345678', 10);
      await prisma.adminConfig.create({
        data: {
          id: 'singleton',
          passwordHash,
        },
      });
      console.log('✅ Admin config created with password: 12345678');
    }

    console.log('\n📝 Admin Passwords:');
    console.log('  - Taha2005 (fallback, always works)');
    console.log('  - 12345678 (stored in database)');
    console.log('\n✅ Admin config is ready!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

ensureAdminConfig();

