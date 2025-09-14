/**
 * Email Service Functions
 * Handles all email notifications for the asset management system
 */

/**
 * Send accountability form email to employee
 * @param {string} formId Accountability form ID
 * @param {Object} accountabilityData Accountability form data
 * @param {Object} assetData Asset information
 * @param {boolean} isReminder Whether this is a reminder email
 * @return {Object} Email sending result
 */
function sendAccountabilityEmail(formId, accountabilityData, assetData, isReminder = false) {
  try {
    const subject = isReminder ?
      `REMINDER: Please confirm receipt of IT Asset ${assetData['Asset Tag']}` :
      `Action Required: Confirm receipt of IT Asset ${assetData['Asset Tag']}`;

    const confirmationUrl = `${ScriptApp.getService().getUrl()}?page=accountability&action=confirm&formId=${formId}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4285f4; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .asset-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4285f4; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
    .warning { background-color: #fff3e0; border: 1px solid #ff9800; padding: 10px; margin: 10px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isReminder ? '🔔 REMINDER' : '📱'} IT Asset Assignment</h1>
      <p>Asset Accountability Form</p>
    </div>

    <div class="content">
      ${isReminder ? `
      <div class="warning">
        <strong>⚠️ This is a reminder:</strong> You have not yet confirmed receipt of the asset assigned to you.
      </div>
      ` : ''}

      <p>Dear <strong>${accountabilityData['Employee Name']}</strong>,</p>

      <p>An IT asset has been assigned to you. Please review the details below and confirm receipt by clicking the confirmation button.</p>

      <div class="asset-details">
        <h3>📋 Asset Details</h3>
        <p><strong>Asset Tag:</strong> ${assetData['Asset Tag']}</p>
        <p><strong>Serial Number:</strong> ${assetData['Serial Number']}</p>
        <p><strong>Category:</strong> ${assetData['Category']}</p>
        <p><strong>Brand & Model:</strong> ${assetData['Brand']} ${assetData['Model']}</p>
        <p><strong>Condition:</strong> ${assetData['Condition']}</p>
        <p><strong>Description:</strong> ${assetData['Description'] || 'N/A'}</p>
        <p><strong>Assignment Date:</strong> ${Utilities.formatDate(new Date(accountabilityData['Assignment Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy')}</p>
        <p><strong>IT Personnel:</strong> ${accountabilityData['IT Personnel']}</p>
      </div>

      <div class="asset-details">
        <h3>📝 Your Responsibilities</h3>
        <ul>
          <li>Take proper care of the assigned asset</li>
          <li>Use it only for business purposes</li>
          <li>Report any damage or issues immediately</li>
          <li>Return the asset when requested or upon leaving the company</li>
          <li>Keep the asset secure at all times</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${confirmationUrl}" class="button">✅ CONFIRM RECEIPT</a>
      </div>

      <p><strong>Important:</strong> You must confirm receipt of this asset within 3 business days. Failure to do so may result in follow-up from the IT department.</p>

      <p>If you have any questions or concerns, please contact the IT department at ${accountabilityData['IT Email']}.</p>

      <p>Form ID: <strong>${formId}</strong></p>
    </div>

    <div class="footer">
      <p>This email was sent automatically by the IT Asset Management System</p>
      <p>Please do not reply to this email</p>
    </div>
  </div>
</body>
</html>
    `;

    const textBody = `
IT Asset Assignment - Action Required

Dear ${accountabilityData['Employee Name']},

${isReminder ? 'REMINDER: ' : ''}An IT asset has been assigned to you. Please confirm receipt.

Asset Details:
- Asset Tag: ${assetData['Asset Tag']}
- Serial Number: ${assetData['Serial Number']}
- Category: ${assetData['Category']}
- Brand & Model: ${assetData['Brand']} ${assetData['Model']}
- Condition: ${assetData['Condition']}
- Assignment Date: ${Utilities.formatDate(new Date(accountabilityData['Assignment Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy')}
- IT Personnel: ${accountabilityData['IT Personnel']}

To confirm receipt, visit: ${confirmationUrl}

Form ID: ${formId}

Questions? Contact: ${accountabilityData['IT Email']}

---
This email was sent automatically by the IT Asset Management System.
    `;

    MailApp.sendEmail({
      to: accountabilityData['Employee Email'],
      cc: accountabilityData['IT Email'],
      subject: subject,
      htmlBody: htmlBody,
      body: textBody,
      name: CONFIG.EMAIL.FROM_NAME
    });

    return {
      success: true,
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('Error sending accountability email:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Send disposal approval request email
 * @param {string} disposalId Disposal ID
 * @param {Object} disposalData Disposal information
 * @param {Object} assetData Asset information
 * @param {boolean} isReminder Whether this is a reminder email
 * @return {Object} Email sending result
 */
function sendDisposalApprovalEmail(disposalId, disposalData, assetData, isReminder = false) {
  try {
    const subject = isReminder ?
      `REMINDER: Approval Required for Asset Disposal ${assetData['Asset Tag']}` :
      `Approval Required: Asset Disposal Request ${assetData['Asset Tag']}`;

    const approvalUrl = `${ScriptApp.getService().getUrl()}?page=disposal&action=approve&disposalId=${disposalId}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .asset-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #d32f2f; }
    .button-approve { display: inline-block; padding: 12px 24px; background-color: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .button-reject { display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
    .warning { background-color: #ffebee; border: 1px solid #d32f2f; padding: 10px; margin: 10px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isReminder ? '🔔 REMINDER' : '🗑️'} Asset Disposal Approval</h1>
      <p>Approval Required</p>
    </div>

    <div class="content">
      ${isReminder ? `
      <div class="warning">
        <strong>⚠️ This is a reminder:</strong> The disposal request below is still pending your approval.
      </div>
      ` : ''}

      <p>Dear <strong>${disposalData['Approver Name']}</strong>,</p>

      <p>A request has been submitted to dispose of an IT asset. Please review the details and provide your approval or rejection.</p>

      <div class="asset-details">
        <h3>🖥️ Asset Details</h3>
        <p><strong>Asset Tag:</strong> ${assetData['Asset Tag']}</p>
        <p><strong>Serial Number:</strong> ${assetData['Serial Number']}</p>
        <p><strong>Category:</strong> ${assetData['Category']}</p>
        <p><strong>Brand & Model:</strong> ${assetData['Brand']} ${assetData['Model']}</p>
        <p><strong>Current Condition:</strong> ${assetData['Condition']}</p>
        <p><strong>Purchase Price:</strong> $${assetData['Purchase Price'] || '0.00'}</p>
        <p><strong>Date Received:</strong> ${assetData['Date Received'] ?
          Utilities.formatDate(new Date(assetData['Date Received']), Session.getScriptTimeZone(), 'MMMM d, yyyy') :
          'N/A'}</p>
      </div>

      <div class="asset-details">
        <h3>🗑️ Disposal Details</h3>
        <p><strong>Disposal Method:</strong> ${disposalData['Disposal Method']}</p>
        <p><strong>Disposal Date:</strong> ${Utilities.formatDate(new Date(disposalData['Disposal Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy')}</p>
        <p><strong>Reason:</strong> ${disposalData['Disposal Reason']}</p>
        <p><strong>Estimated Value:</strong> $${disposalData['Disposal Value'] || '0.00'}</p>
        <p><strong>Location:</strong> ${disposalData['Disposal Location'] || 'N/A'}</p>
        <p><strong>Certificate Number:</strong> ${disposalData['Certificate Number'] || 'N/A'}</p>
        <p><strong>Requested By:</strong> ${disposalData['IT Personnel']}</p>
        <p><strong>Request Date:</strong> ${Utilities.formatDate(new Date(disposalData['Created Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy')}</p>
      </div>

      ${disposalData['Notes'] ? `
      <div class="asset-details">
        <h3>📝 Additional Notes</h3>
        <p>${disposalData['Notes']}</p>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 20px 0;">
        <a href="${approvalUrl}&action=approve" class="button-approve">✅ APPROVE DISPOSAL</a>
        <a href="${approvalUrl}&action=reject" class="button-reject">❌ REJECT DISPOSAL</a>
      </div>

      <p><strong>Please review carefully:</strong> Once approved, this asset will be permanently removed from inventory and cannot be recovered.</p>

      <p>Disposal ID: <strong>${disposalId}</strong></p>
    </div>

    <div class="footer">
      <p>This email was sent automatically by the IT Asset Management System</p>
      <p>Please do not reply to this email</p>
    </div>
  </div>
</body>
</html>
    `;

    const textBody = `
Asset Disposal Approval Required

Dear ${disposalData['Approver Name']},

${isReminder ? 'REMINDER: ' : ''}A request has been submitted to dispose of an IT asset.

Asset Details:
- Asset Tag: ${assetData['Asset Tag']}
- Serial Number: ${assetData['Serial Number']}
- Category: ${assetData['Category']}
- Brand & Model: ${assetData['Brand']} ${assetData['Model']}
- Current Condition: ${assetData['Condition']}

Disposal Details:
- Method: ${disposalData['Disposal Method']}
- Date: ${Utilities.formatDate(new Date(disposalData['Disposal Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy')}
- Reason: ${disposalData['Disposal Reason']}
- Value: $${disposalData['Disposal Value'] || '0.00'}
- Requested By: ${disposalData['IT Personnel']}

To approve or reject: ${approvalUrl}

Disposal ID: ${disposalId}

---
This email was sent automatically by the IT Asset Management System.
    `;

    MailApp.sendEmail({
      to: disposalData['Approver Email'],
      cc: disposalData['IT Email'],
      subject: subject,
      htmlBody: htmlBody,
      body: textBody,
      name: CONFIG.EMAIL.FROM_NAME
    });

    return {
      success: true,
      message: 'Disposal approval email sent successfully'
    };

  } catch (error) {
    console.error('Error sending disposal approval email:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Send notification when accountability form is completed
 * @param {string} formId Form ID
 * @param {Object} accountabilityData Accountability data
 * @return {Object} Result
 */
function sendAccountabilityCompletionNotification(formId, accountabilityData) {
  try {
    const subject = `Asset Assignment Confirmed: ${accountabilityData['Asset Tag']} - ${accountabilityData['Employee Name']}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4caf50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4caf50; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Asset Assignment Confirmed</h1>
    </div>

    <div class="content">
      <p>The employee has confirmed receipt of the assigned asset.</p>

      <div class="details">
        <h3>Assignment Details</h3>
        <p><strong>Asset Tag:</strong> ${accountabilityData['Asset Tag']}</p>
        <p><strong>Employee:</strong> ${accountabilityData['Employee Name']}</p>
        <p><strong>Email:</strong> ${accountabilityData['Employee Email']}</p>
        <p><strong>Confirmed On:</strong> ${Utilities.formatDate(new Date(accountabilityData['Confirmation Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy HH:mm')}</p>
        <p><strong>Form ID:</strong> ${formId}</p>
      </div>

      <p>A PDF document has been generated and stored in Google Drive for your records.</p>
    </div>
  </div>
</body>
</html>
    `;

    MailApp.sendEmail({
      to: accountabilityData['IT Email'],
      subject: subject,
      htmlBody: htmlBody,
      name: CONFIG.EMAIL.FROM_NAME
    });

    return { success: true };

  } catch (error) {
    console.error('Error sending completion notification:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Send disposal status notification
 * @param {string} disposalId Disposal ID
 * @param {Object} disposalData Disposal data
 * @param {boolean} approved Whether disposal was approved
 * @return {Object} Result
 */
function sendDisposalStatusNotification(disposalId, disposalData, approved) {
  try {
    const subject = `Disposal Request ${approved ? 'Approved' : 'Rejected'}: ${disposalData['Asset Tag']}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${approved ? '#4caf50' : '#f44336'}; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid ${approved ? '#4caf50' : '#f44336'}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${approved ? '✅' : '❌'} Disposal ${approved ? 'Approved' : 'Rejected'}</h1>
    </div>

    <div class="content">
      <p>Your disposal request has been <strong>${approved ? 'approved' : 'rejected'}</strong>.</p>

      <div class="details">
        <h3>Disposal Details</h3>
        <p><strong>Asset Tag:</strong> ${disposalData['Asset Tag']}</p>
        <p><strong>Disposal Method:</strong> ${disposalData['Disposal Method']}</p>
        <p><strong>Approver:</strong> ${disposalData['Approver Name']}</p>
        <p><strong>Decision Date:</strong> ${Utilities.formatDate(new Date(disposalData['Approval Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy')}</p>
        <p><strong>Disposal ID:</strong> ${disposalId}</p>
      </div>

      ${approved ? `
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>The asset has been marked as disposed in the system</li>
        <li>A disposal certificate has been generated</li>
        <li>Please proceed with the disposal according to your plan</li>
      </ul>
      ` : `
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>The asset remains in the inventory</li>
        <li>You may submit a new disposal request if needed</li>
        <li>Contact the approver if you need clarification</li>
      </ul>
      `}
    </div>
  </div>
</body>
</html>
    `;

    MailApp.sendEmail({
      to: disposalData['IT Email'],
      subject: subject,
      htmlBody: htmlBody,
      name: CONFIG.EMAIL.FROM_NAME
    });

    return { success: true };

  } catch (error) {
    console.error('Error sending disposal status notification:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Send general asset notification
 * @param {string} notificationType Type of notification
 * @param {Object} assetData Asset data
 * @return {Object} Result
 */
function sendAssetNotification(notificationType, assetData) {
  try {
    // Get system admin email from settings
    const adminEmail = getSetting('SYSTEM_ADMIN_EMAIL');
    if (!adminEmail) {
      return { success: false, message: 'No admin email configured' };
    }

    let subject, htmlBody;

    switch (notificationType) {
      case 'ASSET_ADDED':
        subject = `New Asset Added: ${assetData['Asset Tag']}`;
        htmlBody = createAssetNotificationHTML('Asset Added', assetData, 'A new asset has been added to the inventory.');
        break;

      case 'ASSET_UPDATED':
        subject = `Asset Updated: ${assetData['Asset Tag']}`;
        htmlBody = createAssetNotificationHTML('Asset Updated', assetData, 'An asset has been updated in the inventory.');
        break;

      case 'ASSET_DELETED':
        subject = `Asset Deleted: ${assetData['Asset Tag']}`;
        htmlBody = createAssetNotificationHTML('Asset Deleted', assetData, 'An asset has been deleted from the inventory.');
        break;

      case 'ASSET_ASSIGNED':
        subject = `Asset Assigned: ${assetData['Asset Tag']}`;
        htmlBody = createAssetNotificationHTML('Asset Assigned', assetData, `Asset has been assigned to ${assetData['employee'] ? assetData['employee']['Full Name'] : 'an employee'}.`);
        break;

      case 'ASSET_RETURNED':
        subject = `Asset Returned: ${assetData['Asset Tag']}`;
        htmlBody = createAssetNotificationHTML('Asset Returned', assetData, 'An asset has been returned and is now available.');
        break;

      default:
        return { success: false, message: 'Unknown notification type' };
    }

    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlBody: htmlBody,
      name: CONFIG.EMAIL.FROM_NAME
    });

    return { success: true };

  } catch (error) {
    console.error('Error sending asset notification:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Create HTML for asset notifications
 * @param {string} title Notification title
 * @param {Object} assetData Asset data
 * @param {string} message Notification message
 * @return {string} HTML content
 */
function createAssetNotificationHTML(title, assetData, message) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4285f4; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4285f4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 ${title}</h1>
    </div>

    <div class="content">
      <p>${message}</p>

      <div class="details">
        <h3>Asset Details</h3>
        <p><strong>Asset Tag:</strong> ${assetData['Asset Tag']}</p>
        <p><strong>Serial Number:</strong> ${assetData['Serial Number'] || 'N/A'}</p>
        <p><strong>Category:</strong> ${assetData['Category'] || 'N/A'}</p>
        <p><strong>Brand & Model:</strong> ${assetData['Brand']} ${assetData['Model']}</p>
        <p><strong>Status:</strong> ${assetData['Status'] || 'N/A'}</p>
        <p><strong>Action By:</strong> ${Session.getActiveUser().getEmail()}</p>
        <p><strong>Timestamp:</strong> ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM d, yyyy HH:mm:ss')}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Get setting value from settings sheet
 * @param {string} settingName Setting name
 * @return {string|null} Setting value
 */
function getSetting(settingName) {
  try {
    const settings = getAllRecords(CONFIG.SHEETS.SETTINGS);
    const setting = settings.find(s => s['Setting'] === settingName);
    return setting ? setting['Value'] : null;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
}