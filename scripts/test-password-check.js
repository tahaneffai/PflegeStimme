/**
 * Test password check logic
 */
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

// Simulate the password check
function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return '12345678';
  }
  // Remove quotes and trim whitespace
  const cleaned = password.replace(/^["']|["']$/g, '').trim();
  return cleaned;
}

function checkPassword(inputPassword) {
  const adminPassword = getAdminPassword();
  const trimmedInput = inputPassword.trim();
  const trimmedAdmin = adminPassword.trim();
  
  console.log('\n=== Password Check Test ===\n');
  console.log('Input password:', `"${trimmedInput}"`);
  console.log('Input length:', trimmedInput.length);
  console.log('Admin password from env:', `"${trimmedAdmin}"`);
  console.log('Admin password length:', trimmedAdmin.length);
  console.log('Match:', trimmedInput === trimmedAdmin);
  console.log('Character codes:');
  console.log('  Input:', Array.from(trimmedInput).map(c => c.charCodeAt(0)).join(','));
  console.log('  Admin:', Array.from(trimmedAdmin).map(c => c.charCodeAt(0)).join(','));
  
  return trimmedInput === trimmedAdmin;
}

// Test with the expected password
const testPassword = '12345678';
const result = checkPassword(testPassword);

console.log('\n=== Result ===');
console.log(result ? '✅ Password check PASSED' : '❌ Password check FAILED');



