import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const keyFilePath = path.join(process.cwd(), 'service-account.json');
const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

const FOLDER_ID = '1_R8sr35A2NHxLo-x9saCnMZqPS3iDVQn'; // Replace with your folder ID

export default async function handler(req, res) {
    const { method, body } = req;

    try {
        switch (method) {
            case 'GET':
                const listResponse = await drive.files.list({
                    q: `'${FOLDER_ID}' in parents`,
                    fields: 'files(id, name, mimeType)',
                });
                res.status(200).json(listResponse.data.files);
                break;
            case 'POST':
                const createResponse = await drive.files.create({
                    requestBody: {
                        name: body.name,
                        parents: [FOLDER_ID],
                    },
                    media: {
                        mimeType: 'application/json',
                        body: JSON.stringify(body.data),
                    },
                });
                res.status(201).json(createResponse.data);
                break;
            case 'PUT':
                const updateResponse = await drive.files.update({
                    fileId: body.id,
                    media: {
                        mimeType: 'application/json',
                        body: JSON.stringify(body.data),
                    },
                });
                res.status(200).json(updateResponse.data);
                break;
            case 'DELETE':
                await drive.files.delete({
                    fileId: body.id,
                });
                res.status(204).end();
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
