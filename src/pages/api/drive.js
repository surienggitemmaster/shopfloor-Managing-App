import { getDriveService } from "../../utils/googledrive";

export default async function handler(req, res) {
    const drive = await getDriveService()
    const { method, body } = req;
    const { folderId } = req?.query
    try {
        switch (method) {
            case 'GET':
                const listResponse = await drive.files.list({
                    q: `'${folderId}' in parents`,
                    fields: 'files(id, name, mimeType)',
                });

                res.status(200).json(listResponse.data.files);
                break;
            case 'POST':
                const createResponse = await drive.files.create({
                    requestBody: {
                        name: body.name,
                        parents: [folderId],
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
