import { getDriveService } from "@/utils/googledrive";

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
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
