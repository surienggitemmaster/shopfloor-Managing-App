# Google Authentication Troubleshooting Guide

## "invalid_grant: Invalid JWT Signature" Error

This error typically occurs due to issues with Google Service Account authentication. Here are the steps to resolve it:

### 1. Test Authentication

First, test your authentication by visiting:

```
http://localhost:3000/api/test-auth
```

This will help identify if the issue is with:

- Service account credentials
- Network connectivity
- Permission settings

### 2. Common Solutions

#### A. Regenerate Service Account Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Find your service account: `php-drive-api-433107@php-drive-api-433107.iam.gserviceaccount.com`
4. Click on the service account
5. Go to "Keys" tab
6. Delete the existing key
7. Create a new JSON key
8. Replace the `service.json` file with the new key

#### B. Check Service Account Permissions

1. Ensure the service account has the "Drive API" enabled
2. Verify the service account has access to the specific Google Drive files
3. Check if the files are shared with the service account email

#### C. Verify File Sharing

Make sure your Google Drive files are accessible to the service account:

1. Open the Google Drive file
2. Click "Share"
3. Add the service account email: `php-drive-api-433107@php-drive-api-433107.iam.gserviceaccount.com`
4. Give it "Viewer" or "Editor" permissions

#### D. Check System Clock

JWT tokens are time-sensitive. Ensure your server's clock is synchronized:

```bash
# On macOS/Linux
sudo ntpdate -s time.nist.gov
```

#### E. Environment Variables

Make sure your environment variables are properly set:

```bash
# Add to your .env.local file
GOOGLE_APPLICATION_CREDENTIALS=./service.json
```

### 3. Debugging Steps

#### Step 1: Check Service Account Key Format

The `service.json` should contain:

- `type`: "service_account"
- `project_id`: Your project ID
- `private_key_id`: A valid key ID
- `private_key`: A properly formatted private key
- `client_email`: Your service account email
- `client_id`: A valid client ID

#### Step 2: Verify Google APIs

Ensure these APIs are enabled in your Google Cloud project:

- Google Drive API
- Google Sheets API (if using spreadsheets)

#### Step 3: Check Network Connectivity

Test if your server can reach Google's servers:

```bash
curl -I https://www.googleapis.com
```

### 4. Alternative Solutions

#### Option A: Use OAuth 2.0 Instead

If service account continues to fail, consider switching to OAuth 2.0:

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Implement OAuth flow in your application
3. Store and refresh access tokens

#### Option B: Use API Key (Limited)

For read-only operations, you might be able to use an API key:

```javascript
const drive = google.drive({
  version: "v3",
  auth: "YOUR_API_KEY",
});
```

### 5. Testing Your Fix

After implementing any changes:

1. Restart your development server:

```bash
npm run dev
```

2. Test the authentication:

```
http://localhost:3000/api/test-auth
```

3. Test the file download:

```
http://localhost:3000/api/xlsrecord?fileId=YOUR_FILE_ID&mimeType=application/vnd.google-apps.spreadsheet
```

### 6. Common Error Messages and Solutions

| Error Message    | Likely Cause        | Solution                        |
| ---------------- | ------------------- | ------------------------------- |
| "invalid_grant"  | Expired/Invalid key | Regenerate service account key  |
| "access_denied"  | File not shared     | Share file with service account |
| "not_found"      | File doesn't exist  | Check file ID                   |
| "quota_exceeded" | API limits reached  | Wait or upgrade quota           |

### 7. Logs and Debugging

Check your server logs for detailed error messages. The improved error handling will now provide more specific information about what's failing.

If you continue to have issues, please share:

1. The exact error message from the logs
2. The response from `/api/test-auth`
3. Whether the files are properly shared with the service account
