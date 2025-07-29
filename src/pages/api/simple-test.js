import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

export default async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('🧪 Starting simple authentication test...');

        // Read service account key
        const keyFilePath = path.join(process.cwd(), 'service.json');
        const serviceAccountData = fs.readFileSync(keyFilePath, 'utf8');
        const credentials = JSON.parse(serviceAccountData);

        console.log('📧 Service Account Email:', credentials.client_email);

        // Create auth client
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });

        console.log('🔐 Creating auth client...');
        const authClient = await auth.getClient();
        console.log('✅ Auth client created');

        // Create Drive service
        console.log('📁 Creating Drive service...');
        const drive = google.drive({ version: 'v3', auth: authClient });
        console.log('✅ Drive service created');

        // Test Drive API
        console.log('🔍 Testing Drive API...');
        const files = await drive.files.list({ pageSize: 1 });
        console.log('✅ Drive API test successful');

        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            filesFound: files.data.files.length,
            serviceAccount: credentials.client_email
        });

    } catch (error) {
        console.error('❌ Simple test failed:', error.message);
        console.error('🔍 Error details:', {
            name: error.name,
            code: error.code,
            status: error.status,
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            error: 'Simple test failed',
            message: error.message,
            details: {
                name: error.name,
                code: error.code,
                status: error.status
            }
        });
    }
}; 