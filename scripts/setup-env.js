/**
 * Setup script to create .env.local file if it doesn't exist
 * Run: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

// Default environment variables
const defaultEnv = {
  DATABASE_URL: 'file:./prisma/dev.db',
  ADMIN_PASSWORD: '12345678',
  ADMIN_SECRET: 'change-this-to-a-random-secret-in-production',
};

function setupEnv() {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local already exists');
    return;
  }

  // Check if .env.example exists and use it as template
  let envContent = '';
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf-8');
  } else {
    // Create default .env.local content
    envContent = Object.entries(defaultEnv)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');
  }

  // Write .env.local
  fs.writeFileSync(envPath, envContent + '\n', 'utf-8');
  console.log('✅ Created .env.local file');
  console.log('📝 Please review and update the values in .env.local if needed');
}

setupEnv();

