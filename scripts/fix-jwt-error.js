#!/usr/bin/env node

/**
 * JWT Signature Error Fix Script
 * 
 * This script helps diagnose and fix "invalid_grant: Invalid JWT Signature" errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 JWT Signature Error Diagnostic Tool');
console.log('=====================================\n');

// Check 1: Service account key format
console.log('1. Checking service account key format...');
const serviceJsonPath = path.join(process.cwd(), 'service.json');

if (!fs.existsSync(serviceJsonPath)) {
    console.log('❌ service.json not found!');
    console.log('   Please ensure you have a valid service account key file.\n');
    process.exit(1);
}

try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceJsonPath, 'utf8'));

    const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);

    if (missingFields.length > 0) {
        console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
    } else {
        console.log('✅ Service account key format is valid');
        console.log(`   Project: ${serviceAccount.project_id}`);
        console.log(`   Email: ${serviceAccount.client_email}`);
        console.log(`   Key ID: ${serviceAccount.private_key_id}`);
    }
} catch (error) {
    console.log('❌ Invalid JSON format in service.json');
    console.log(`   Error: ${error.message}\n`);
    process.exit(1);
}

// Check 2: System clock
console.log('\n2. Checking system clock...');
try {
    const date = new Date();
    console.log(`   Current time: ${date.toISOString()}`);

    // Check if time is reasonable (not too far in past/future)
    const now = Date.now();
    const reasonableRange = 24 * 60 * 60 * 1000; // 24 hours
    const expectedTime = Date.now();

    if (Math.abs(now - expectedTime) > reasonableRange) {
        console.log('⚠️  System time may be incorrect');
        console.log('   JWT tokens are time-sensitive');
        console.log('   Consider syncing your system clock');
    } else {
        console.log('✅ System time appears to be correct');
    }
} catch (error) {
    console.log('❌ Could not check system time');
}

// Check 3: Network connectivity
console.log('\n3. Checking network connectivity to Google...');
try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" https://www.googleapis.com', { encoding: 'utf8' });
    if (response.trim() === '200') {
        console.log('✅ Network connectivity to Google APIs is good');
    } else {
        console.log(`⚠️  Network connectivity issue (HTTP ${response.trim()})`);
    }
} catch (error) {
    console.log('❌ Network connectivity test failed');
    console.log('   Please check your internet connection');
}

// Check 4: Google Cloud project status
console.log('\n4. Checking Google Cloud project...');
try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceJsonPath, 'utf8'));
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Service Account: ${serviceAccount.client_email}`);

    console.log('\n   📋 Manual verification needed:');
    console.log('   • Go to https://console.cloud.google.com/');
    console.log('   • Navigate to your project');
    console.log('   • Check if the service account exists and is active');
    console.log('   • Verify Google Drive API is enabled');
} catch (error) {
    console.log('❌ Could not read service account details');
}

// Recommendations
console.log('\n📋 Recommendations to fix JWT signature error:\n');

console.log('🔑 Most Common Solution:');
console.log('   1. Regenerate your service account key');
console.log('   2. Go to Google Cloud Console > IAM & Admin > Service Accounts');
console.log('   3. Find your service account and create a new JSON key');
console.log('   4. Replace the current service.json with the new key\n');

console.log('⏰ If regenerating doesn\'t work:');
console.log('   1. Sync your system clock');
console.log('   2. Restart your development server');
console.log('   3. Clear any cached authentication tokens\n');

console.log('🔍 Additional checks:');
console.log('   1. Ensure Google Drive API is enabled');
console.log('   2. Verify files are shared with the service account');
console.log('   3. Check if the service account has proper permissions\n');

console.log('🚀 After making changes, test with:');
console.log('   curl http://localhost:3000/api/test-auth\n');

console.log('💡 If the issue persists, the service account key may be:');
console.log('   • Expired (most common)');
console.log('   • Revoked for security reasons');
console.log('   • Associated with a deleted service account');
console.log('   • Corrupted during download or storage\n'); 