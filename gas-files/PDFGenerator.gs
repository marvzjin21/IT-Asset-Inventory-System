/**
 * PDF Generation Functions
 * Creates and stores PDF documents for accountability forms and disposal certificates
 */

/**
 * Generate accountability form PDF
 * @param {string} formId Accountability form ID
 * @return {Object} Result with PDF creation status
 */
function generateAccountabilityPDF(formId) {
  try {
    const accountabilityRecord = getRecord(CONFIG.SHEETS.ACCOUNTABILITY, 'Form ID', formId);
    if (!accountabilityRecord) {
      return {
        success: false,
        message: `Accountability form '${formId}' not found`
      };
    }

    const asset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', accountabilityRecord['Asset Tag']);
    if (!asset) {
      return {
        success: false,
        message: `Asset '${accountabilityRecord['Asset Tag']}' not found`
      };
    }

    // Create HTML content for the PDF
    const htmlContent = createAccountabilityFormHTML(accountabilityRecord, asset);

    // Create PDF from HTML
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'temp.html');
    const pdfBlob = Utilities.newBlob(
      DriveApp.createFile(blob).getBlob().getBytes(),
      'application/pdf',
      `Accountability_Form_${formId}.pdf`
    );

    // Save to Google Drive
    const folder = DriveApp.getFolderById(CONFIG.PDF_FOLDER_ID);
    const pdfFile = folder.createFile(pdfBlob);

    // Make file shareable
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Update accountability record with PDF info
    updateRecord(CONFIG.SHEETS.ACCOUNTABILITY, 'Form ID', formId, {
      'PDF Generated': 'Yes',
      'PDF URL': pdfFile.getUrl()
    });

    return {
      success: true,
      message: 'PDF generated successfully',
      pdfUrl: pdfFile.getUrl(),
      pdfId: pdfFile.getId()
    };

  } catch (error) {
    console.error('Error generating accountability PDF:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Generate disposal certificate PDF
 * @param {string} disposalId Disposal ID
 * @return {Object} Result with PDF creation status
 */
function generateDisposalPDF(disposalId) {
  try {
    const disposalRecord = getRecord(CONFIG.SHEETS.DISPOSAL, 'Disposal ID', disposalId);
    if (!disposalRecord) {
      return {
        success: false,
        message: `Disposal record '${disposalId}' not found`
      };
    }

    const asset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', disposalRecord['Asset Tag']);
    if (!asset) {
      return {
        success: false,
        message: `Asset '${disposalRecord['Asset Tag']}' not found`
      };
    }

    // Create HTML content for the PDF
    const htmlContent = createDisposalCertificateHTML(disposalRecord, asset);

    // Create PDF from HTML
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'temp.html');
    const pdfBlob = Utilities.newBlob(
      DriveApp.createFile(blob).getBlob().getBytes(),
      'application/pdf',
      `Disposal_Certificate_${disposalId}.pdf`
    );

    // Save to Google Drive
    const folder = DriveApp.getFolderById(CONFIG.PDF_FOLDER_ID);
    const pdfFile = folder.createFile(pdfBlob);

    // Make file shareable
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Update disposal record with PDF info
    updateRecord(CONFIG.SHEETS.DISPOSAL, 'Disposal ID', disposalId, {
      'PDF Generated': 'Yes',
      'PDF URL': pdfFile.getUrl()
    });

    return {
      success: true,
      message: 'Disposal certificate PDF generated successfully',
      pdfUrl: pdfFile.getUrl(),
      pdfId: pdfFile.getId()
    };

  } catch (error) {
    console.error('Error generating disposal PDF:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Generate asset return PDF
 * @param {string} formId Accountability form ID
 * @param {Object} returnData Return information
 * @return {Object} Result with PDF creation status
 */
function generateReturnPDF(formId, returnData) {
  try {
    const accountabilityRecord = getRecord(CONFIG.SHEETS.ACCOUNTABILITY, 'Form ID', formId);
    if (!accountabilityRecord) {
      return {
        success: false,
        message: `Accountability form '${formId}' not found`
      };
    }

    const asset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', accountabilityRecord['Asset Tag']);
    if (!asset) {
      return {
        success: false,
        message: `Asset '${accountabilityRecord['Asset Tag']}' not found`
      };
    }

    // Create HTML content for the return PDF
    const htmlContent = createAssetReturnHTML(accountabilityRecord, asset, returnData);

    // Create PDF from HTML
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'temp.html');
    const pdfBlob = Utilities.newBlob(
      DriveApp.createFile(blob).getBlob().getBytes(),
      'application/pdf',
      `Asset_Return_${formId}.pdf`
    );

    // Save to Google Drive
    const folder = DriveApp.getFolderById(CONFIG.PDF_FOLDER_ID);
    const pdfFile = folder.createFile(pdfBlob);

    // Make file shareable
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      message: 'Asset return PDF generated successfully',
      pdfUrl: pdfFile.getUrl(),
      pdfId: pdfFile.getId()
    };

  } catch (error) {
    console.error('Error generating return PDF:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Create HTML content for accountability form PDF
 * @param {Object} accountabilityRecord Accountability form data
 * @param {Object} asset Asset data
 * @return {string} HTML content
 */
function createAccountabilityFormHTML(accountabilityRecord, asset) {
  const currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM d, yyyy');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>IT Asset Accountability Form</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.4;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #4285f4;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #4285f4;
      margin-bottom: 5px;
    }
    .form-title {
      font-size: 18px;
      color: #666;
    }
    .section {
      margin-bottom: 25px;
      border: 1px solid #ddd;
      padding: 15px;
      background-color: #fafafa;
    }
    .section-title {
      font-weight: bold;
      font-size: 16px;
      color: #4285f4;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .field-row {
      display: flex;
      margin-bottom: 8px;
    }
    .field-label {
      font-weight: bold;
      width: 150px;
      display: inline-block;
    }
    .field-value {
      flex: 1;
      border-bottom: 1px dotted #ccc;
      padding-bottom: 2px;
    }
    .signature-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 45%;
      text-align: center;
      border: 1px solid #ddd;
      padding: 20px;
      background-color: white;
    }
    .signature-line {
      border-bottom: 1px solid #333;
      margin: 30px 0 10px 0;
      height: 50px;
      position: relative;
    }
    .signature-label {
      font-size: 12px;
      color: #666;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      background-color: #4285f4;
      color: white;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">IT Asset Management System</div>
    <div class="form-title">Asset Accountability Form</div>
    <div style="margin-top: 10px;">
      <span class="status-badge">Form ID: ${accountabilityRecord['Form ID']}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Asset Information</div>
    <div class="field-row">
      <span class="field-label">Asset Tag:</span>
      <span class="field-value">${asset['Asset Tag']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Serial Number:</span>
      <span class="field-value">${asset['Serial Number']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Category:</span>
      <span class="field-value">${asset['Category']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Brand & Model:</span>
      <span class="field-value">${asset['Brand']} ${asset['Model']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Condition:</span>
      <span class="field-value">${asset['Condition']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Description:</span>
      <span class="field-value">${asset['Description'] || 'N/A'}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Employee Information</div>
    <div class="field-row">
      <span class="field-label">Name:</span>
      <span class="field-value">${accountabilityRecord['Employee Name']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Email:</span>
      <span class="field-value">${accountabilityRecord['Employee Email']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Employee ID:</span>
      <span class="field-value">${accountabilityRecord['Employee ID']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Department:</span>
      <span class="field-value">${accountabilityRecord['Department'] || 'N/A'}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Position:</span>
      <span class="field-value">${accountabilityRecord['Position'] || 'N/A'}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Assignment Details</div>
    <div class="field-row">
      <span class="field-label">Assignment Date:</span>
      <span class="field-value">${Utilities.formatDate(new Date(accountabilityRecord['Assignment Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy')}</span>
    </div>
    <div class="field-row">
      <span class="field-label">IT Personnel:</span>
      <span class="field-value">${accountabilityRecord['IT Personnel']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">IT Email:</span>
      <span class="field-value">${accountabilityRecord['IT Email']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Status:</span>
      <span class="field-value">${accountabilityRecord['Status']}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Terms and Conditions</div>
    <p style="font-size: 14px; line-height: 1.6;">
      By signing below, I acknowledge that I have received the above-mentioned IT asset in good condition and agree to:
    </p>
    <ul style="font-size: 12px; margin-left: 20px;">
      <li>Take full responsibility for the proper care and security of this asset</li>
      <li>Use the asset solely for business purposes and in accordance with company policies</li>
      <li>Report any damage, loss, or theft immediately to the IT Department</li>
      <li>Return the asset in good working condition when requested or upon termination of employment</li>
      <li>Not install unauthorized software or make modifications without IT approval</li>
      <li>Ensure the asset is properly secured when not in use</li>
    </ul>
    ${accountabilityRecord['Notes'] ? `<p><strong>Additional Notes:</strong> ${accountabilityRecord['Notes']}</p>` : ''}
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div><strong>IT Personnel</strong></div>
      <div class="signature-line">${accountabilityRecord['IT Signature'] ? '✓ Digitally Signed' : ''}</div>
      <div class="signature-label">IT Staff Signature</div>
      <div style="margin-top: 10px;">
        <div><strong>Name:</strong> ${accountabilityRecord['IT Personnel']}</div>
        <div><strong>Date:</strong> ${Utilities.formatDate(new Date(accountabilityRecord['Assignment Date']), Session.getScriptTimeZone(), 'MM/dd/yyyy')}</div>
      </div>
    </div>

    <div class="signature-box">
      <div><strong>Employee</strong></div>
      <div class="signature-line">${accountabilityRecord['Employee Signature'] ? '✓ Digitally Signed' : ''}</div>
      <div class="signature-label">Employee Signature</div>
      <div style="margin-top: 10px;">
        <div><strong>Name:</strong> ${accountabilityRecord['Employee Name']}</div>
        <div><strong>Date:</strong> ${accountabilityRecord['Confirmation Date'] ?
          Utilities.formatDate(new Date(accountabilityRecord['Confirmation Date']), Session.getScriptTimeZone(), 'MM/dd/yyyy') :
          '_________________'}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This document was generated automatically by the IT Asset Management System on ${currentDate}</p>
    <p>Form ID: ${accountabilityRecord['Form ID']} | Asset Tag: ${asset['Asset Tag']}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Create HTML content for disposal certificate PDF
 * @param {Object} disposalRecord Disposal data
 * @param {Object} asset Asset data
 * @return {string} HTML content
 */
function createDisposalCertificateHTML(disposalRecord, asset) {
  const currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM d, yyyy');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Asset Disposal Certificate</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.4;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #d32f2f;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #d32f2f;
      margin-bottom: 5px;
    }
    .certificate-title {
      font-size: 20px;
      color: #666;
      font-weight: bold;
    }
    .section {
      margin-bottom: 25px;
      border: 1px solid #ddd;
      padding: 15px;
      background-color: #fafafa;
    }
    .section-title {
      font-weight: bold;
      font-size: 16px;
      color: #d32f2f;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .field-row {
      display: flex;
      margin-bottom: 8px;
    }
    .field-label {
      font-weight: bold;
      width: 180px;
      display: inline-block;
    }
    .field-value {
      flex: 1;
      border-bottom: 1px dotted #ccc;
      padding-bottom: 2px;
    }
    .signature-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 45%;
      text-align: center;
      border: 1px solid #ddd;
      padding: 20px;
      background-color: white;
    }
    .signature-line {
      border-bottom: 1px solid #333;
      margin: 30px 0 10px 0;
      height: 50px;
    }
    .signature-label {
      font-size: 12px;
      color: #666;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
    .certificate-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      background-color: #d32f2f;
      color: white;
    }
    .disposal-warning {
      background-color: #fff3e0;
      border: 2px solid #ff9800;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      text-align: center;
      font-weight: bold;
      color: #e65100;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">IT Asset Management System</div>
    <div class="certificate-title">ASSET DISPOSAL CERTIFICATE</div>
    <div style="margin-top: 15px;">
      <span class="certificate-badge">Certificate ID: ${disposalRecord['Disposal ID']}</span>
    </div>
  </div>

  <div class="disposal-warning">
    ⚠️ OFFICIAL DISPOSAL CERTIFICATE ⚠️<br>
    This asset has been permanently removed from inventory
  </div>

  <div class="section">
    <div class="section-title">Asset Information</div>
    <div class="field-row">
      <span class="field-label">Asset Tag:</span>
      <span class="field-value">${asset['Asset Tag']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Serial Number:</span>
      <span class="field-value">${asset['Serial Number']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Category:</span>
      <span class="field-value">${asset['Category']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Brand & Model:</span>
      <span class="field-value">${asset['Brand']} ${asset['Model']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Original Condition:</span>
      <span class="field-value">${asset['Condition']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Purchase Price:</span>
      <span class="field-value">$${asset['Purchase Price'] || '0.00'}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Date Received:</span>
      <span class="field-value">${asset['Date Received'] ?
        Utilities.formatDate(new Date(asset['Date Received']), Session.getScriptTimeZone(), 'MMMM d, yyyy') :
        'N/A'}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Disposal Information</div>
    <div class="field-row">
      <span class="field-label">Disposal Date:</span>
      <span class="field-value">${Utilities.formatDate(new Date(disposalRecord['Disposal Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy')}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Disposal Method:</span>
      <span class="field-value">${disposalRecord['Disposal Method']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Disposal Reason:</span>
      <span class="field-value">${disposalRecord['Disposal Reason']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Disposal Value:</span>
      <span class="field-value">$${disposalRecord['Disposal Value'] || '0.00'}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Disposal Location:</span>
      <span class="field-value">${disposalRecord['Disposal Location'] || 'N/A'}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Certificate Number:</span>
      <span class="field-value">${disposalRecord['Certificate Number'] || 'N/A'}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Authorization</div>
    <div class="field-row">
      <span class="field-label">IT Personnel:</span>
      <span class="field-value">${disposalRecord['IT Personnel']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">IT Email:</span>
      <span class="field-value">${disposalRecord['IT Email']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Approver Name:</span>
      <span class="field-value">${disposalRecord['Approver Name']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Approver Email:</span>
      <span class="field-value">${disposalRecord['Approver Email']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Approval Date:</span>
      <span class="field-value">${disposalRecord['Approval Date'] ?
        Utilities.formatDate(new Date(disposalRecord['Approval Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy') :
        'Pending'}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Status:</span>
      <span class="field-value">${disposalRecord['Status']}</span>
    </div>
  </div>

  ${disposalRecord['Notes'] ? `
  <div class="section">
    <div class="section-title">Additional Notes</div>
    <p style="font-size: 14px; line-height: 1.6;">${disposalRecord['Notes']}</p>
  </div>
  ` : ''}

  <div class="signature-section">
    <div class="signature-box">
      <div><strong>IT Personnel</strong></div>
      <div class="signature-line">${disposalRecord['IT Signature'] ? '✓ Digitally Signed' : ''}</div>
      <div class="signature-label">IT Staff Signature</div>
      <div style="margin-top: 10px;">
        <div><strong>Name:</strong> ${disposalRecord['IT Personnel']}</div>
        <div><strong>Date:</strong> ${Utilities.formatDate(new Date(disposalRecord['Disposal Date']), Session.getScriptTimeZone(), 'MM/dd/yyyy')}</div>
      </div>
    </div>

    <div class="signature-box">
      <div><strong>Approver</strong></div>
      <div class="signature-line">${disposalRecord['Approver Signature'] ? '✓ Digitally Signed' : ''}</div>
      <div class="signature-label">Approver Signature</div>
      <div style="margin-top: 10px;">
        <div><strong>Name:</strong> ${disposalRecord['Approver Name']}</div>
        <div><strong>Date:</strong> ${disposalRecord['Approval Date'] ?
          Utilities.formatDate(new Date(disposalRecord['Approval Date']), Session.getScriptTimeZone(), 'MM/dd/yyyy') :
          '_________________'}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This disposal certificate was generated automatically by the IT Asset Management System on ${currentDate}</p>
    <p>Certificate ID: ${disposalRecord['Disposal ID']} | Asset Tag: ${asset['Asset Tag']}</p>
    <p><strong>⚠️ WARNING:</strong> This asset has been permanently disposed and removed from inventory</p>
  </div>
</body>
</html>
  `;
}

/**
 * Create HTML content for asset return PDF
 * @param {Object} accountabilityRecord Accountability form data
 * @param {Object} asset Asset data
 * @param {Object} returnData Return information
 * @return {string} HTML content
 */
function createAssetReturnHTML(accountabilityRecord, asset, returnData) {
  const currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM d, yyyy');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Asset Return Receipt</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.4;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #388e3c;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #388e3c;
      margin-bottom: 5px;
    }
    .form-title {
      font-size: 18px;
      color: #666;
    }
    .section {
      margin-bottom: 25px;
      border: 1px solid #ddd;
      padding: 15px;
      background-color: #fafafa;
    }
    .section-title {
      font-weight: bold;
      font-size: 16px;
      color: #388e3c;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .field-row {
      display: flex;
      margin-bottom: 8px;
    }
    .field-label {
      font-weight: bold;
      width: 150px;
      display: inline-block;
    }
    .field-value {
      flex: 1;
      border-bottom: 1px dotted #ccc;
      padding-bottom: 2px;
    }
    .return-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      background-color: #388e3c;
      color: white;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">IT Asset Management System</div>
    <div class="form-title">Asset Return Receipt</div>
    <div style="margin-top: 10px;">
      <span class="return-badge">✓ ASSET RETURNED</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Asset Information</div>
    <div class="field-row">
      <span class="field-label">Asset Tag:</span>
      <span class="field-value">${asset['Asset Tag']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Serial Number:</span>
      <span class="field-value">${asset['Serial Number']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Category:</span>
      <span class="field-value">${asset['Category']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Brand & Model:</span>
      <span class="field-value">${asset['Brand']} ${asset['Model']}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Return Information</div>
    <div class="field-row">
      <span class="field-label">Returned By:</span>
      <span class="field-value">${accountabilityRecord['Employee Name']}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Return Date:</span>
      <span class="field-value">${accountabilityRecord['Return Date'] ?
        Utilities.formatDate(new Date(accountabilityRecord['Return Date']), Session.getScriptTimeZone(), 'MMMM d, yyyy') :
        currentDate}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Assignment Period:</span>
      <span class="field-value">${Utilities.formatDate(new Date(accountabilityRecord['Assignment Date']), Session.getScriptTimeZone(), 'MM/dd/yyyy')} - ${Utilities.formatDate(new Date(accountabilityRecord['Return Date'] || new Date()), Session.getScriptTimeZone(), 'MM/dd/yyyy')}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Return Condition:</span>
      <span class="field-value">${returnData['Condition'] || 'Not specified'}</span>
    </div>
    <div class="field-row">
      <span class="field-label">IT Personnel:</span>
      <span class="field-value">${returnData['IT Personnel'] || Session.getActiveUser().getEmail()}</span>
    </div>
  </div>

  <div class="footer">
    <p>This return receipt was generated automatically by the IT Asset Management System on ${currentDate}</p>
    <p>Original Form ID: ${accountabilityRecord['Form ID']} | Asset Tag: ${asset['Asset Tag']}</p>
  </div>
</body>
</html>
  `;
}