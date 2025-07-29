import { google } from 'googleapis';
import XLSX from 'xlsx';

// Improved error handling for service account credentials from environment variable
let credentials;
try {
    const serviceAccountData = process.env.SERVICE_ACCOUNT;

    if (!serviceAccountData) {
        throw new Error('SERVICE_ACCOUNT environment variable is not set');
    }

    credentials = JSON.parse(serviceAccountData);

    // Validate required fields
    if (!credentials.client_email || !credentials.private_key || !credentials.project_id) {
        throw new Error('Missing required service account fields in SERVICE_ACCOUNT environment variable');
    }
} catch (error) {
    console.error('Error parsing service account credentials from environment variable:', error.message);
    throw new Error('Failed to load service account credentials from SERVICE_ACCOUNT environment variable');
}

// Create auth client with improved configuration and JWT handling
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
    // Add timeout and retry configuration
    timeout: 30000,
});

// Enhanced authentication with JWT signature handling
export const createAuthenticatedClient = async () => {
    try {
        console.log('🔐 Attempting to create authenticated client...');
        console.log('📧 Service Account Email:', credentials.client_email);
        console.log('🆔 Project ID:', credentials.project_id);

        const authClient = await auth.getClient();
        console.log('✅ Successfully created auth client');

        // Set up automatic token refresh
        authClient.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
                console.log('🔄 Token refreshed successfully');
            }
        });

        return authClient;
    } catch (error) {
        console.error('❌ Error creating authenticated client:', error.message);
        console.error('🔍 Error details:', {
            name: error.name,
            code: error.code,
            status: error.status,
            message: error.message,
            stack: error.stack
        });

        // Handle specific JWT signature errors
        if (error.message.includes('invalid_grant') || error.message.includes('Invalid JWT Signature')) {
            console.error('🚨 JWT Signature error detected. Attempting to resolve...');

            // Try to create a new auth client with fresh credentials
            try {
                console.log('🔄 Attempting retry with fresh credentials...');
                const freshAuth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/drive'],
                    timeout: 60000, // Longer timeout for retry
                });

                const freshClient = await freshAuth.getClient();
                console.log('✅ Successfully created fresh authenticated client');
                return freshClient;
            } catch (retryError) {
                console.error('❌ Retry failed:', retryError.message);
                console.error('🔍 Retry error details:', {
                    name: retryError.name,
                    code: retryError.code,
                    status: retryError.status,
                    message: retryError.message
                });
                throw new Error(`Authentication failed after retry: ${retryError.message}`);
            }
        }

        throw error;
    }
};

// Test authentication function with detailed error reporting
export const testAuth = async () => {
    try {
        console.log('🧪 Testing Google authentication...');
        console.log('🔐 Using SERVICE_ACCOUNT environment variable');
        console.log('📧 Service Account Email:', credentials.client_email);
        console.log('🆔 Project ID:', credentials.project_id);

        const authClient = await createAuthenticatedClient();
        const projectId = await authClient.getProjectId();
        console.log('✅ Authentication successful. Project ID:', projectId);
        return true;
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        console.error('🔍 Full error details:', {
            name: error.name,
            code: error.code,
            status: error.status,
            message: error.message,
            stack: error.stack
        });

        // Provide specific guidance based on error type
        if (error.message.includes('invalid_grant')) {
            console.error('🚨 This usually means:');
            console.error('   1. Service account key has expired');
            console.error('   2. System clock is not synchronized');
            console.error('   3. Service account key is corrupted');
            console.error('   4. Service account has been deleted or disabled');
            console.error('   5. The key has been revoked');
        } else if (error.message.includes('SERVICE_ACCOUNT environment variable is not set')) {
            console.error('🔧 Environment variable error - check if SERVICE_ACCOUNT is set');
        } else if (error.message.includes('Unexpected token')) {
            console.error('📄 JSON parsing error - check SERVICE_ACCOUNT environment variable format');
        }

        return false;
    }
};

export const mainFolder = "1QRte-54NhRbh_SCtofIor6ccBA_8aVYT"
export const xlsxFile = "1aPun_wNfE1s8E3BHzwq9WImBVvKdxHgcdxYiO-0-sNk"

// Updated service account email
export const SERVICE_ACCOUNT_EMAIL = "shop-manager-account@php-drive-api-433107.iam.gserviceaccount.com"

export const getDriveService = async () => {
    try {
        console.log('🔐 Creating Drive service...');
        const authClient = await auth.getClient();
        console.log('✅ Auth client created successfully');

        return google.drive({ version: 'v3', auth: authClient });
    } catch (error) {
        console.error('❌ Error getting Drive service:', error.message);
        console.error('🔍 Error details:', {
            name: error.name,
            code: error.code,
            status: error.status,
            message: error.message
        });
        throw error;
    }
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
    try {
        const drive = await getDriveService();
        let response;

        if (mimeType.startsWith('application/vnd.google-apps')) {
            const exportMimeType = mimeType === 'application/vnd.google-apps.spreadsheet' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
            response = await drive.files.export({ fileId, mimeType: exportMimeType }, { responseType: 'stream' });
        } else {
            response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
        }

        return response.data;
    } catch (error) {
        console.error('Error downloading file:', error.message);

        // Handle specific JWT signature errors
        if (error.message.includes('invalid_grant') || error.message.includes('Invalid JWT Signature')) {
            console.error('JWT Signature error detected. This could be due to:');
            console.error('1. Expired service account key');
            console.error('2. Clock skew between server and Google');
            console.error('3. Corrupted service account credentials');
            throw new Error('Authentication failed: Invalid JWT signature. Please check your service account configuration.');
        }

        throw error;
    }
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
    const fs = await import('fs');
    const path = await import('path');

    console.log(folderId, filePath, mimeType, newFileName);
    const fileMetadata = {
        name: newFileName || path.default.basename(filePath),
        parents: [folderId],
    };

    const media = {
        mimeType: mimeType,
        body: fs.default.createReadStream(filePath),
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
    const fs = await import('fs');

    const media = {
        mimeType: mimeType,
        body: fs.default.createReadStream(filePath),
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
    const fs = await import('fs');
    const drive = await getDriveService();
    const dest = fs.default.createWriteStream(destination);
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
    const fs = await import('fs');
    const drive = await getDriveService()
    const media = {
        mimeType: mimeType,
        body: fs.default.createReadStream(filePath),
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