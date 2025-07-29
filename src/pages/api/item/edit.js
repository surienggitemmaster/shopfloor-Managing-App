import { getDriveService, uploadFile, downloadXLS, uploadxl, removeRowByProductId, deleteObject, modifyXlsx, mainFolder, xlsxFile, updateFile } from "@/utils/googleDrive";
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
    if (req.method == 'PUT') {
        const { folderName, productName, sellingPrice, presentStock } = req?.query
        const form = new IncomingForm();
        const uploadDir = path.join(process.cwd(), 'uploads');
        form.uploadDir = uploadDir;

        form.keepExtensions = true;

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const listResponse = await drive.files.list({
            q: `'${mainFolder}' in parents`,
            fields: 'files(id, name, mimeType)',
            pageSize: 1000,
        });

        let folderId;

        listResponse.data.files.map((file) => {
            if (file?.name === folderName) {
                folderId = file.id;
            }
        })

        const FileResponse = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name, mimeType)',
        });

        const filePath = path.join(process.cwd(), 'temp.xlsx');

        // Step 1: Download file from Google Drive
        await downloadXLS(xlsxFile, filePath);

        // Step 2: Modify the xlsx file
        await removeRowByProductId(filePath, folderName);

        await modifyXlsx(filePath, folderName, productName, sellingPrice, presentStock);

        // Step 3: Upload the modified file back to Google Drive
        const mimeType = 'application/vnd.google-apps.spreadsheet';
        await uploadxl(filePath, mimeType, xlsxFile);
        try {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.log(err)
                    res.status(500).json({ message: 'File upload failed' });
                    return;
                }
                for (const key in files) {
                    FileResponse.data.files.map((drivefile) => {
                        if ((drivefile?.name).split(".")[0] === `${key}`) {
                            deleteObject(drivefile?.id);
                        }
                    })
                    if (key === "Other") {
                        for (const index in files[key]) {
                            uploadFile(folderId, files[key][index]?.filepath, files[key]?.[index]?.mimetype, files[key]?.[index]?.originalFilename)
                        }
                    }
                    else if (files[key]?.[0]?.filepath) {
                        uploadFile(folderId, files[key][0]?.filepath, files[key]?.[0]?.mimetype, `${key}.${files[key]?.[0]?.originalFilename.split(".")[1]}`)
                    }

                }
                res.status(200).json({ message: 'File uploaded successfully' });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    else if (req.method === 'DELETE') {
        try {
            const { folderName } = req?.query;

            const listResponse = await drive.files.list({
                q: `'${mainFolder}' in parents`,
                fields: 'files(id, name, mimeType)',
            });

            let folderId;

            listResponse.data.files.map((file) => {
                if (file?.name === folderName) {
                    folderId = file.id;
                }
            })
            const filePath = path.join(process.cwd(), 'temp.xlsx');

            // Step 1: Download file from Google Drive
            await downloadXLS(xlsxFile, filePath);
            await removeRowByProductId(filePath, folderName);

            // Step 3: Upload the modified file back to Google Drive
            const mimeType = 'application/vnd.google-apps.spreadsheet';
            await uploadxl(filePath, mimeType, xlsxFile);

            // Update the existing file in Google Drive
            const deletefolder = await deleteObject(folderId);

            res.status(200).json({ message: 'File Deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}