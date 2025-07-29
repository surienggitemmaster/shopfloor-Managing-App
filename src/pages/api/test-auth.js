import { testAuth, getDriveService } from '@/utils/googleDrive';

export default async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Testing Google authentication...');

        // Test basic authentication
        const authResult = await testAuth();

        if (!authResult) {
            return res.status(500).json({
                error: 'Authentication failed',
                details: 'Google service account authentication failed'
            });
        }

        // Test Drive service
        const drive = await getDriveService();
        const files = await drive.files.list({ pageSize: 1 });

        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            projectId: files.data.files.length > 0 ? 'Drive access confirmed' : 'No files found'
        });

    } catch (error) {
        console.error('Authentication test failed:', error);

        return res.status(500).json({
            error: 'Authentication test failed',
            message: error.message,
            details: error.stack
        });
    }
}; 