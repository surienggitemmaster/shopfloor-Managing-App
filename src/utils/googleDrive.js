import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const keyFilePath = path.join(process.cwd(), 'service-account.json');
const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
});


export const getDriveService = async () => {
    return google.drive({ version: 'v3', auth });
};

export const listFiles = async () => {
    const drive = await getDriveService();
    const res = await drive.files.list();
    return res.data.files;
};

export const uploadFile = async (file) => {
    const drive = await getDriveService();
    const res = await drive.files.create({
        resource: { name: file.originalname },
        media: { mimeType: file.mimetype, body: file.buffer },
        fields: 'id',
    });
    return res.data;
};

export const deleteFile = async (fileId) => {
    const drive = await getDriveService();
    await drive.files.delete({ fileId });
};

export const downloadFile = async (fileId, mimeType) => {
    const drive = await getDriveService();
    let response;

    if (mimeType.startsWith('application/vnd.google-apps')) {
        const exportMimeType = mimeType === 'application/vnd.google-apps.spreadsheet' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
        response = await drive.files.export({ fileId, mimeType: exportMimeType }, { responseType: 'stream' });
    } else {
        response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    }

    return response.data;
};
