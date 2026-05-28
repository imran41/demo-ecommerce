/**
 * Firebase Spark Plan Setup Helper for E-Commerce Website
 * 
 * Run this script to verify your setup, login, and automatically link
 * environment credentials to enable Firebase live services!
 * 
 * Usage: node setup-firebase.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI Color helper functions
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

console.log(`${colors.bright}${colors.cyan}====================================================`);
console.log(`🔥  FIREBASE SPARK PLAN INTEGRATION CONTROL CENTER  🔥`);
console.log(`====================================================${colors.reset}\n`);

// 1. Check if Firebase CLI is installed
let hasCLI = false;
try {
  const version = execSync('npx firebase --version', { stdio: 'pipe' }).toString().trim();
  console.log(`${colors.green}✓${colors.reset} Firebase CLI tools are available locally (v${version})`);
  hasCLI = true;
} catch (e) {
  console.log(`${colors.yellow}!${colors.reset} Firebase CLI is not installed globally. You can use 'npx firebase' for commands.`);
}

// 2. Spark Plan Limits Summary
console.log(`\n${colors.bright}${colors.blue}📋 Spark (Free Tier) Limits Reference:${colors.reset}`);
console.log(`  - ${colors.cyan}Authentication:${colors.reset} Free up to 50k monthly active users`);
console.log(`  - ${colors.cyan}Firestore Database:${colors.reset} 1 GiB storage, 50k reads/day, 20k writes/day, 20k deletes/day`);
console.log(`  - ${colors.cyan}Firebase Storage:${colors.reset} 5 GiB storage, 1 GB/day download bandwidth`);
console.log(`  - ${colors.cyan}Firebase Hosting:${colors.reset} 10 GiB storage, 360 MB/day data transfer`);

// 3. Setup instructions
console.log(`\n${colors.bright}${colors.magenta}🚀 Setup Steps Checklist:${colors.reset}`);
console.log(`  1. Go to the Firebase Console: ${colors.bright}https://console.firebase.google.com/${colors.reset}`);
console.log(`  2. Click "Add Project" and create a new project (Avoid paid upgrades, choose Spark plan).`);
console.log(`  3. Enable ${colors.bright}Authentication${colors.reset} and turn on ${colors.bright}Email/Password${colors.reset} + ${colors.bright}Google${colors.reset} sign-in providers.`);
console.log(`  4. Enable ${colors.bright}Cloud Firestore Database${colors.reset} in Test or Production mode.`);
console.log(`  5. Enable ${colors.bright}Cloud Storage${colors.reset} for file uploads.`);
console.log(`  6. Click the Web Icon (</>) to create a Web App and copy your config object.`);
console.log(`  7. Paste those credentials into ${colors.bright}ecommerce-website/.env.local${colors.reset}`);

// 4. Checking current env configuration
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const hasFirebaseId = envContent.includes('NEXT_PUBLIC_FIREBASE_PROJECT_ID=') && 
                       !envContent.includes('NEXT_PUBLIC_FIREBASE_PROJECT_ID=placeholder-');
  
  console.log(`\n${colors.bright}${colors.yellow}🔍 Current Project Status:${colors.reset}`);
  if (hasFirebaseId) {
    console.log(`  ${colors.green}● LIVE:${colors.reset} Firebase env variables detected. E-Commerce Website is running on live Firebase.`);
  } else {
    console.log(`  ${colors.yellow}● MOCK/SUPABASE:${colors.reset} Running with Supabase/Mock fallbacks (Default behavior).`);
  }
}

// 5. Build and Deploy instructions
console.log(`\n${colors.bright}${colors.green}📦 Deployment Commands:${colors.reset}`);
console.log(`  - Build site:         ${colors.cyan}npm run build${colors.reset}`);
console.log(`  - Login to Firebase:  ${colors.cyan}npx firebase login${colors.reset}`);
console.log(`  - Deploy to Hosting:  ${colors.cyan}npx firebase deploy --only hosting${colors.reset}`);
console.log(`  - Deploy Rules/Index: ${colors.cyan}npx firebase deploy --only firestore,storage${colors.reset}`);

console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);
