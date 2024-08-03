import { google } from 'googleapis';

export const getDriveService = (accessToken) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.drive({ version: 'v3', auth });
};

export const listFiles = async (accessToken) => {
    const drive = getDriveService(accessToken);
    const res = await drive.files.list();
    return res.data.files;
};

export const uploadFile = async (accessToken, file) => {
    const drive = getDriveService(accessToken);
    const res = await drive.files.create({
        resource: { name: file.name },
        media: { mimeType: file.type, body: file.stream },
        fields: 'id'
    });
    return res.data;
};

export const deleteFile = async (accessToken, fileId) => {
    const drive = getDriveService(accessToken);
    await drive.files.delete({ fileId });
};
