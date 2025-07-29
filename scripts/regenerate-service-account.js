#!/usr/bin/env node

/**
 * Service Account Key Regeneration Guide
 * 
 * This script helps you regenerate your Google Service Account key
 * to fix the "invalid_grant: Invalid JWT Signature" error.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Google Service Account Key Regeneration Guide');
console.log('===============================================\n');

console.log('The "invalid_grant: Invalid JWT Signature" error typically occurs when:');
console.log('1. Your service account key has expired');
console.log('2. The key has been compromised and revoked');
console.log('3. The service account has been deleted or disabled');
console.log('4. There are clock synchronization issues\n');

console.log('📋 Steps to regenerate your service account key:\n');

console.log('1. Go to Google Cloud Console:');
console.log('   https://console.cloud.google.com/\n');

console.log('2. Navigate to your project: php-drive-api-433107\n');

console.log('3. Go to "IAM & Admin" > "Service Accounts"\n');

console.log('4. Find your service account:');
console.log('   php-drive-api-433107@php-drive-api-433107.iam.gserviceaccount.com\n');

console.log('5. Click on the service account name\n');

console.log('6. Go to the "Keys" tab\n');

console.log('7. Delete the existing key (if present)\n');

console.log('8. Click "Add Key" > "Create new key"\n');

console.log('9. Choose "JSON" format\n');

console.log('10. Click "Create"\n');

console.log('11. The new key file will download automatically\n');

console.log('12. Replace your current service.json with the new file\n');

console.log('13. Restart your development server\n');

console.log('\n🔍 Additional Checks:\n');

console.log('• Ensure Google Drive API is enabled in your project');
console.log('• Verify your Google Drive files are shared with the service account');
console.log('• Check that your system clock is synchronized');

console.log('\n📞 If you need help with any of these steps, please let me know!\n');

// Check if service.json exists
const serviceJsonPath = path.join(process.cwd(), 'service.json');
if (fs.existsSync(serviceJsonPath)) {
    console.log('✅ Current service.json found');

    try {
        const currentKey = JSON.parse(fs.readFileSync(serviceJsonPath, 'utf8'));
        console.log(`📧 Service Account Email: ${currentKey.client_email}`);
        console.log(`🆔 Project ID: ${currentKey.project_id}`);
        console.log(`🔑 Key ID: ${currentKey.private_key_id}`);
    } catch (error) {
        console.log('❌ Error reading current service.json:', error.message);
    }
} else {
    console.log('❌ No service.json found in current directory');
}

console.log('\n🚀 After regenerating the key, test it with:');
console.log('   curl http://localhost:3000/api/test-auth\n'); 