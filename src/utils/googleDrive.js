import { google } from 'googleapis';
import fs from 'fs';
import XLSX from 'xlsx';

// Parse service account credentials from environment variable
let credentials;
try {
    if (!process.env.SERVICE_ACCOUNT) {
        throw new Error('SERVICE_ACCOUNT environment variable is not set');
    }
    
    // Debug: Log the first 100 characters of the environment variable
    console.log('SERVICE_ACCOUNT env var length:', process.env.SERVICE_ACCOUNT.length);
    console.log('SERVICE_ACCOUNT env var preview:', process.env.SERVICE_ACCOUNT.substring(0, 100));
    
    credentials = JSON.parse(process.env.SERVICE_ACCOUNT);
} catch (error) {
    console.error('Error parsing SERVICE_ACCOUNT environment variable:', error.message);
    console.error('SERVICE_ACCOUNT env var length:', process.env.SERVICE_ACCOUNT?.length || 0);
    console.error('SERVICE_ACCOUNT env var preview:', process.env.SERVICE_ACCOUNT?.substring(0, 200) || 'undefined');
    console.error('Make sure SERVICE_ACCOUNT is set with valid JSON service account credentials');
    throw new Error('Invalid SERVICE_ACCOUNT environment variable. Please check your configuration.');
}

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
    console.log("This is ----", fileId)
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
    const drive = await getDriveService();
    const dest = fs.createWriteStream(destination);
    const response = await downloadFile(fileId, "application/vnd.google-apps.spreadsheet");

    return new Promise((resolve, reject) => {
        // Pipe the response stream to the file
        response.pipe(dest);

        // Resolve the promise once the stream has ended
        dest.on('finish', () => {
            console.log('Download complete.');
            resolve(destination);
        });

        // Reject the promise on stream error
        dest.on('error', (err) => {
            console.error('Error writing to file.', err);
            reject(err);
        });
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
export const modifyXlsx = async (filePath, productId, productName, sellingPrice, presentStock, add = false) => {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const range = XLSX.utils.decode_range(sheet['!ref']);
    let productExists = false;

    // Iterate through each row to check if the productId already exists
    if (add === true) {
        for (let row = range.s.r; row <= range.e.r; row++) {
            const cell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })]; // Assuming productId is in the first column
            if (cell && cell.v === productId) {
                productExists = true;
                break;
            }
        }
    }

    if (productExists) {
        // Throw an error if the productId already exists
        throw new Error(`Product ID ${productId} already exists.`);
    } else {
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
    }
};