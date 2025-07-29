import { downloadFile } from '@/utils/googleDrive';
import XLSX from 'xlsx';

export default async (req, res) => {
    const { fileId, mimeType } = req?.query;

    if (!fileId || !mimeType) {
        return res.status(400).json({ error: 'fileId and mimeType are required' });
    }

    try {
        console.log('Attempting to download file:', fileId);
        const fileStream = await downloadFile(fileId, mimeType);

        const buffers = [];
        fileStream.on('data', (data) => buffers.push(data));
        fileStream.on('end', () => {
            try {
                const buffer = Buffer.concat(buffers);
                const workbook = XLSX.read(buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                res.status(200).json(jsonData);
            } catch (parseError) {
                console.error('Error parsing XLSX file:', parseError);
                res.status(500).json({ error: 'Failed to parse XLSX file', details: parseError.message });
            }
        });

        fileStream.on('error', (streamError) => {
            console.error('Stream error:', streamError);
            res.status(500).json({ error: 'File stream error', details: streamError.message });
        });

    } catch (error) {
        console.error('Error in xlsrecord API:', error);

        // Handle specific authentication errors
        if (error.message.includes('Invalid JWT signature') || error.message.includes('invalid_grant')) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Google service account authentication error. Please check your credentials.',
                details: error.message
            });
        }

        res.status(500).json({
            error: 'Failed to process file',
            message: error.message,
            details: error.stack
        });
    }
};
