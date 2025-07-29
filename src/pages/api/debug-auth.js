import fs from 'fs';
import path from 'path';

export default async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const keyFilePath = path.join(process.cwd(), 'service.json');

        // Check if service.json exists
        if (!fs.existsSync(keyFilePath)) {
            return res.status(500).json({
                error: 'service.json not found',
                path: keyFilePath
            });
        }

        // Read and parse the service account key
        const serviceAccountData = fs.readFileSync(keyFilePath, 'utf8');
        const credentials = JSON.parse(serviceAccountData);

        return res.status(200).json({
            success: true,
            serviceAccount: {
                email: credentials.client_email,
                projectId: credentials.project_id,
                keyId: credentials.private_key_id,
                hasPrivateKey: !!credentials.private_key,
                privateKeyLength: credentials.private_key ? credentials.private_key.length : 0
            },
            filePath: keyFilePath,
            fileExists: true
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Error reading service account',
            message: error.message,
            stack: error.stack
        });
    }
}; 