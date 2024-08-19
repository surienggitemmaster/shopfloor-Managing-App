import { updateFile, deleteObject } from "../../../utils/googledrive";
import path from 'path';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        try {
            const { fileId, filePath, mimeType } = req.body;

            // Update the existing file in Google Drive
            const updatedFileId = await updateFile(fileId, path.join(process.cwd(), filePath), mimeType);

            res.status(200).json({ message: 'File updated successfully', fileId: updatedFileId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    else if (req.method === 'DELETE') {
        try {
            const { fileId } = req?.query;
            // Update the existing file in Google Drive
            const deletefolder = await deleteObject(fileId);

            res.status(200).json({ message: 'File updated successfully', sad: deletefolder, fileId: fileId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}