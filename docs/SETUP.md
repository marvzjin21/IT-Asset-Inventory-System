# IT Asset Inventory System - Setup Guide

This guide will walk you through setting up the complete IT Asset Inventory System using Google Apps Script.

## Prerequisites

- Google Account with access to:
  - Google Apps Script (script.google.com)
  - Google Sheets
  - Google Drive
- Basic understanding of Google Workspace tools

## Step-by-Step Setup

### Step 1: Create Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Rename the project to "IT Asset Inventory System"

### Step 2: Create Google Sheets Database

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Rename it to "IT Asset Inventory Database"
4. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

### Step 3: Create Google Drive Folder for PDFs

1. Go to [drive.google.com](https://drive.google.com)
2. Create a new folder called "IT Asset Management PDFs"
3. Right-click the folder and select "Get link"
4. Copy the folder ID from the URL (the long string after `/folders/`)
   - Example: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

### Step 4: Upload Code Files to Google Apps Script

Copy and paste each file from the `gas-files/` directory into your Google Apps Script project:

1. **Config.gs** - Update the configuration values:
   ```javascript
   SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', // Replace with your spreadsheet ID
   PDF_FOLDER_ID: 'YOUR_PDF_FOLDER_ID_HERE',   // Replace with your folder ID
   ```

2. **Schema.gs** - Database schema definitions (no changes needed)

3. **Code.gs** - Main application code (no changes needed)

4. **Database.gs** - Database operations (no changes needed)

5. **InventoryManager.gs** - Asset inventory management (no changes needed)

6. **AccountabilityForm.gs** - Accountability form system (no changes needed)

7. **AssetDisposal.gs** - Asset disposal management (no changes needed)

8. **Dashboard.gs** - Dashboard and analytics (no changes needed)

9. **PDFGenerator.gs** - PDF generation (no changes needed)

10. **EmailService.gs** - Email notifications (no changes needed)

11. **Utils.gs** - Utility functions (no changes needed)

### Step 5: Upload HTML Files

In the Google Apps Script editor, create HTML files by clicking the "+" button and selecting "HTML file":

1. **Index.html** - Main dashboard interface
2. **Styles.html** - CSS styling
3. **Inventory.html** - Inventory management (you'll need to create this)
4. **Accountability.html** - Accountability forms (you'll need to create this)
5. **Disposal.html** - Asset disposal (you'll need to create this)
6. **Reports.html** - Reports and analytics (you'll need to create this)

### Step 6: Initialize the System

1. In the Google Apps Script editor, select the `initializeSystem` function
2. Click the "Run" button
3. Authorize the script when prompted (this gives it access to Sheets and Drive)
4. Check the execution log for any errors

### Step 7: Deploy as Web App

1. Click "Deploy" > "New deployment"
2. Choose "Web app" as the type
3. Set the following options:
   - **Execute as:** Me
   - **Who has access:** Anyone with the link (or restrict as needed)
4. Click "Deploy"
5. Copy the web app URL provided

### Step 8: Configure Email Settings (Optional)

1. Open your Google Sheets database
2. Go to the "Settings" sheet
3. Update the `SYSTEM_ADMIN_EMAIL` setting with your email address
4. Configure other email-related settings as needed

### Step 9: Test the System

1. Open the web app URL in your browser
2. Test adding a new asset
3. Test creating an accountability form
4. Verify that emails are being sent (check spam folder)
5. Test PDF generation

## Configuration Options

### Email Settings

In the Settings sheet of your database, you can configure:

- `SYSTEM_ADMIN_EMAIL` - Email address for system notifications
- `AUTO_EMAIL_NOTIFICATIONS` - Enable/disable automatic emails (TRUE/FALSE)
- `PDF_GENERATION_ENABLED` - Enable/disable PDF generation (TRUE/FALSE)

### Asset Tag Configuration

In `Config.gs`, you can customize:

- `ASSET_TAG.PREFIX` - Prefix for asset tags (default: "IT-")
- `ASSET_TAG.STARTING_NUMBER` - Starting number for asset tags
- `ASSET_TAG.PADDING` - Number of digits in the tag number

### Categories and Options

Customize the following arrays in `Config.gs`:

- `CONDITIONS` - Asset condition options
- `CATEGORIES` - Asset category options
- `STATUSES` - Asset status options
- `DISPOSAL_METHODS` - Disposal method options
- `LOCATIONS` - Location options

## Troubleshooting

### Common Issues

1. **"Spreadsheet not found" error:**
   - Verify the SPREADSHEET_ID in Config.gs is correct
   - Make sure the spreadsheet is accessible by your account

2. **"Folder not found" error:**
   - Verify the PDF_FOLDER_ID in Config.gs is correct
   - Make sure the folder exists and is accessible

3. **Emails not sending:**
   - Check if the script has Gmail permissions
   - Verify email addresses are correct
   - Check spam folders

4. **PDF generation fails:**
   - Make sure the Google Drive folder exists
   - Verify folder permissions

### Script Permissions

The script requires the following permissions:

- **Google Sheets:** Read and write access to your spreadsheets
- **Google Drive:** Create and manage files in your Drive
- **Gmail:** Send emails on your behalf
- **Script Service:** Access to web app functionality

### Performance Considerations

- The system can handle hundreds of assets efficiently
- For very large inventories (1000+ assets), consider:
  - Implementing data pagination
  - Using caching for frequently accessed data
  - Splitting data across multiple sheets

## Security Best Practices

1. **Access Control:**
   - Restrict web app access to your organization
   - Use "Anyone within your organization" instead of "Anyone with the link"

2. **Data Protection:**
   - Regularly backup your database spreadsheet
   - Monitor the audit log for suspicious activities
   - Review user permissions periodically

3. **Email Security:**
   - Use corporate email addresses only
   - Configure spam filters to whitelist system emails
   - Monitor bounced emails

## Backup and Recovery

### Manual Backup

1. Go to your Google Sheets database
2. File > Make a copy
3. Store the copy in a secure location

### Automated Backup

The system includes a `backupDatabase()` function that you can:

1. Run manually when needed
2. Set up as a time-driven trigger for automatic backups
3. Call from the dashboard interface

### Recovery Process

1. Restore the backup spreadsheet
2. Update the SPREADSHEET_ID in Config.gs
3. Redeploy the web app
4. Test system functionality

## Support

For technical support or questions:

1. Check the troubleshooting section above
2. Review the system logs in Google Apps Script
3. Consult the API documentation in API_DOCS.md
4. Contact your system administrator

## Next Steps

After setup is complete:

1. Read the USER_GUIDE.md for operational instructions
2. Train your team on using the system
3. Customize the interface as needed
4. Set up regular backup procedures
5. Monitor system usage and performance