import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';

const keyFilePath = path.join(process.cwd(), 'service-account.json');
const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
});

export const mainFolder = "1QRte-54NhRbh_SCtofIor6ccBA_8aVYT"
export const xlsxFile = "1aPun_wNfE1s8E3BHzwq9WImBVvKdxHgcdxYiO-0-sNk"

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

export const removeRowByProductId = async (filePath, productId) => {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const productIdIndex = sheetData[0].indexOf('PRODUCT_ID');

    if (productIdIndex === -1) {
        throw new Error('productId column not found');
    }

    // Filter out the row where productId equals the specified value
    const filteredData = sheetData.filter(row => row[productIdIndex] !== productId);

    // Clear the sheet and write the filtered data back to it
    const newSheet = XLSX.utils.aoa_to_sheet(filteredData);
    workbook.Sheets[workbook.SheetNames[0]] = newSheet;

    XLSX.writeFile(workbook, filePath);
};

// Function to download file from Google Drive
export const downloadXLS = async (fileId, destination) => {
    const drive = await getDriveService()
    const dest = fs.createWriteStream(destination);
    const response = await downloadFile(fileId, "application/vnd.google-apps.spreadsheet")

    return new Promise((resolve, reject) => {
        response
            .on('end', () => resolve(destination))
            .on('error', reject)
            .pipe(dest);
    });
};

// Function to upload file to Google Drive
export const uploadxl = async (filePath, mimeType, fileId) => {
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
export const modifyXlsx = async (filePath, productId, productName, sellingPrice, presentStock) => {
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