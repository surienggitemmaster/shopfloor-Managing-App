#!/usr/bin/env node

/**
 * Direct Service Account Key Test
 * 
 * This script tests the service account key directly without Next.js
 */

const fs = require('fs');
const path = require('path');

// Import googleapis
const { google } = require('googleapis');

console.log('🔧 Direct Service Account Key Test');
console.log('==================================\n');

const keyFilePath = path.join(process.cwd(), 'service.json');

// Check if service.json exists
if (!fs.existsSync(keyFilePath)) {
    console.log('❌ service.json not found!');
    process.exit(1);
}

console.log('✅ service.json found');

try {
    // Read and parse the service account key
    const serviceAccountData = fs.readFileSync(keyFilePath, 'utf8');
    const credentials = JSON.parse(serviceAccountData);

    console.log('✅ JSON parsing successful');
    console.log(`📧 Service Account Email: ${credentials.client_email}`);
    console.log(`🆔 Project ID: ${credentials.project_id}`);
    console.log(`🔑 Key ID: ${credentials.private_key_id}`);

    // Validate required fields
    const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !credentials[field]);

    if (missingFields.length > 0) {
        console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
        process.exit(1);
    }

    console.log('✅ All required fields present');

    // Test private key format
    if (!credentials.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
        console.log('❌ Private key format appears incorrect');
        process.exit(1);
    }

    console.log('✅ Private key format appears correct');

    // Create auth client
    console.log('\n🔐 Testing Google authentication...');

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive'],
        timeout: 30000,
    });

    auth.getClient()
        .then(async (authClient) => {
            console.log('✅ Successfully created auth client');

            try {
                // Test Drive API access directly
                console.log('\n📁 Testing Drive API access...');
                const drive = google.drive({ version: 'v3', auth: authClient });

                const files = await drive.files.list({ pageSize: 1 });
                console.log('✅ Drive API access successful');
                console.log(`📊 Found ${files.data.files.length} files`);

                console.log('\n🎉 All tests passed! Your service account key is working correctly.');

            } catch (error) {
                console.error('❌ Error during API test:', error.message);
                console.error('🔍 Error details:', {
                    name: error.name,
                    code: error.code,
                    status: error.status
                });
            }
        })
        .catch((error) => {
            console.error('❌ Authentication failed:', error.message);
            console.error('🔍 Error details:', {
                name: error.name,
                code: error.code,
                status: error.status,
                message: error.message
            });

            if (error.message.includes('invalid_grant')) {
                console.log('\n🚨 This is a JWT signature error. Common causes:');
                console.log('   1. Service account key has expired');
                console.log('   2. Key has been revoked');
                console.log('   3. Service account has been deleted');
                console.log('   4. System clock is not synchronized');
                console.log('\n💡 Solution: Regenerate the service account key');
            }
        });

} catch (error) {
    console.error('❌ Error reading or parsing service.json:', error.message);
    process.exit(1);
} 