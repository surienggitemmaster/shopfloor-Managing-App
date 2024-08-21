import { getDriveService, uploadFile, downloadXLS, uploadxl, modifyXlsx, xlsxFile, mainFolder } from "../../../utils/googledrive";
import { IncomingForm } from 'formidable';
import path from 'path';
import fs from 'fs';

// Disable the default body parser
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    const drive = await getDriveService()

    if (req.method == 'POST') {
        const { folderName, productName, sellingPrice, presentStock } = req?.query
        const form = new IncomingForm();
        const uploadDir = path.join(process.cwd(), 'uploads');
        form.uploadDir = uploadDir;

        form.keepExtensions = true;

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(process.cwd(), 'temp.xlsx');

        // Step 1: Download file from Google Drive
        await downloadXLS(xlsxFile, filePath);

        // Step 2: Modify the xlsx file
        await modifyXlsx(filePath, folderName, productName, sellingPrice, presentStock);

        // Step 3: Upload the modified file back to Google Drive
        const mimeType = 'application/vnd.google-apps.spreadsheet';
        await uploadxl(filePath, mimeType, xlsxFile);
        try {
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [mainFolder],
            };
            const file = await drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.log(err)
                    res.status(500).json({ message: 'File upload failed' });
                    return;
                }
                for (const key in files) {
                    if (files[key]?.[0]?.filepath) {
                        uploadFile(file.data.id, files[key][0]?.filepath, files[key]?.[0]?.mimetype, `${key.toUpperCase()}.pdf`)
                    }
                }
                res.status(200).json({ message: 'File uploaded successfully' });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}