import { downloadFile } from '@/utils/googledrive';
import XLSX from 'xlsx';

export default async (req, res) => {

    const { fileId, mimeType } = req?.query
    try {
        const fileStream = await downloadFile(fileId, mimeType);
        const buffers = [];
        fileStream.on('data', (data) => buffers.push(data));
        fileStream.on('end', () => {
            const buffer = Buffer.concat(buffers);
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            res.status(200).json(jsonData);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
