import { getDriveService, uploadFile, downloadFile } from "../../../utils/googledrive";
import { IncomingForm } from 'formidable';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
// Disable the default body parser
export const config = {
    api: {
        bodyParser: false,
    },
};

// Function to download file from Google Drive
const downloadXLS = async (fileId, destination) => {
    const drive = await getDriveService()
    const dest = fs.createWriteStream(destination);
    const response = await downloadFile("12q5sIXMZbnYivXmMLfIspb73_i0MuDFsY_gMRty4QRI", "application/vnd.google-apps.spreadsheet")

    return new Promise((resolve, reject) => {
        response
            .on('end', () => resolve(destination))
            .on('error', reject)
            .pipe(dest);
    });
};

// Function to upload file to Google Drive
const uploadxl = async (filePath, mimeType, fileId) => {
    const drive = await getDriveService()
    const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
    };

    const response = await drive.files.update({
        fileId: fileId,
        media: media,
        fields: 'id',
    });

    return response.data.id;
};

// Function to modify the xlsx file
const modifyXlsx = async (filePath, productId, productName, sellingPrice, presentStock) => {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const range = XLSX.utils.decode_range(sheet['!ref']);
    const lastRow = range.e.r; // Last row index (0-based)

    // Add a new row of data
    const newRow = [productId, productName, sellingPrice, presentStock];
    const newRowIndex = lastRow + 1;

    // Create a new row and shift the previous range
    newRow.forEach((value, i) => {
        sheet[XLSX.utils.encode_cell({ r: newRowIndex, c: i })] = { v: value };
    });

    // Update the range to include the new row
    range.e.r = newRowIndex;
    sheet['!ref'] = XLSX.utils.encode_range(range);

    XLSX.writeFile(workbook, filePath);
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
        await downloadXLS("12q5sIXMZbnYivXmMLfIspb73_i0MuDFsY_gMRty4QRI", filePath);

        // Step 2: Modify the xlsx file
        await modifyXlsx(filePath, folderName, productName, sellingPrice, presentStock);

        // Step 3: Upload the modified file back to Google Drive
        const mimeType = 'application/vnd.google-apps.spreadsheet';
        await uploadxl(filePath, mimeType, "12q5sIXMZbnYivXmMLfIspb73_i0MuDFsY_gMRty4QRI");
        try {
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: ['1_R8sr35A2NHxLo-x9saCnMZqPS3iDVQn'],
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
                        uploadFile(file.data.id, files[key][0]?.filepath, "application/pdf", `${key.toUpperCase()}.pdf`)
                    }
                }
                res.status(200).json({ message: 'File uploaded successfully' });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}