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


export const deleteObject = async (fileId) => {
    const drive = await getDriveService();
    const response = await drive.files.delete({
        fileId: fileId,
    });
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


export const createFolder = async (folderName) => {
    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [FOLDER_ID],
    };
    const drive = await getDriveService();

    try {
        const file = await drive.files.create({
            resource: fileMetadata,
            fields: 'id',
        });
        console.log('Folder ID:', file.data.id);
        return file.data.id;
    } catch (error) {
        console.error('Error creating folder:', error);
        throw error;
    }
};

export const uploadFile = async (folderId, filePath, mimeType, newFileName) => {

    console.log(folderId, filePath, mimeType, newFileName);
    const fileMetadata = {
        name: newFileName || path.basename(filePath),
        parents: [folderId],
    };

    const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
    };
    const drive = await getDriveService();

    try {
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
        console.log('File ID:', file.data.id);
        return file.data.id;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const updateFile = async (fileId, filePath, mimeType) => {
    const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
    };
    const drive = await getDriveService();

    try {
        const file = await drive.files.update({
            fileId: fileId,
            media: media,
            fields: 'id',
        });

        console.log('Updated File ID:', file.data.id);
        return file.data.id;
    } catch (error) {
        console.error('Error updating file:', error);
        throw error;
    }
};

