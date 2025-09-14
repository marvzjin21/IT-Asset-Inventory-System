/**
 * Database Schema Definitions for IT Asset Inventory System
 * Defines the structure of each Google Sheets tab
 */

const SCHEMA = {
  // Assets sheet structure
  ASSETS: {
    COLUMNS: [
      'Asset Tag',           // A - Auto-generated (IT-1000, IT-1001, etc.)
      'Serial Number',       // B - Unique identifier
      'Category',           // C - Asset category (Desktop, Laptop, etc.)
      'Brand',              // D - Manufacturer brand
      'Model',              // E - Model name/number
      'Description',        // F - Additional description
      'Condition',          // G - Asset condition (Brand New, Good, etc.)
      'Status',             // H - Current status (Available, Assigned, etc.)
      'Date Received',      // I - When company received the asset
      'Purchase Price',     // J - Original purchase price
      'Warranty Expiry',    // K - Warranty expiration date
      'Location',           // L - Current location
      'Assigned To',        // M - Current user (Employee ID)
      'Assignment Date',    // N - Date assigned to current user
      'IT Personnel',       // O - IT staff responsible
      'Notes',              // P - Additional notes
      'Created Date',       // Q - Record creation date
      'Created By',         // R - Who created the record
      'Last Modified',      // S - Last modification date
      'Modified By'         // T - Who last modified the record
    ],
    START_ROW: 2
  },

  // Accountability tracking sheet
  ACCOUNTABILITY: {
    COLUMNS: [
      'Form ID',            // A - Unique form identifier
      'Asset Tag',          // B - Asset being assigned
      'Employee Name',      // C - Full name of employee
      'Employee Email',     // D - Employee email address
      'Employee ID',        // E - Employee identification number
      'Department',         // F - Employee department
      'Position',           // G - Employee job position
      'Assignment Date',    // H - Date of assignment
      'IT Personnel',       // I - IT staff handling assignment
      'IT Email',           // J - IT staff email
      'IT Signature',       // K - IT staff signature (base64)
      'Employee Confirmed', // L - Employee confirmation status
      'Employee Signature', // M - Employee signature (base64)
      'Confirmation Date',  // N - Date employee confirmed
      'PDF Generated',      // O - PDF generation status
      'PDF URL',            // P - Google Drive PDF link
      'Status',             // Q - Form status (Pending, Completed, etc.)
      'Notes',              // R - Additional notes
      'Created Date',       // S - Form creation date
      'Email Sent',         // T - Email notification status
      'Return Date'         // U - Asset return date (if applicable)
    ],
    START_ROW: 2
  },

  // Asset disposal tracking
  DISPOSAL: {
    COLUMNS: [
      'Disposal ID',        // A - Unique disposal identifier
      'Asset Tag',          // B - Asset being disposed
      'Disposal Method',    // C - Method of disposal
      'Disposal Date',      // D - Date of disposal
      'Disposal Reason',    // E - Reason for disposal
      'IT Personnel',       // F - IT staff handling disposal
      'IT Email',           // G - IT staff email
      'IT Signature',       // H - IT staff signature
      'Approver Name',      // I - Person approving disposal
      'Approver Email',     // J - Approver email
      'Approver Signature', // K - Approver signature
      'Approval Date',      // L - Date of approval
      'Disposal Value',     // M - Disposal/salvage value
      'Disposal Location',  // N - Where disposal took place
      'Certificate Number', // O - Disposal certificate number
      'PDF Generated',      // P - PDF generation status
      'PDF URL',            // Q - Google Drive PDF link
      'Status',             // R - Disposal status
      'Notes',              // S - Additional notes
      'Created Date',       // T - Record creation date
      'Email Sent'          // U - Email notification status
    ],
    START_ROW: 2
  },

  // Employee directory
  EMPLOYEES: {
    COLUMNS: [
      'Employee ID',        // A - Unique employee identifier
      'Full Name',          // B - Employee full name
      'Email',              // C - Employee email
      'Department',         // D - Employee department
      'Position',           // E - Job position
      'Manager',            // F - Direct manager
      'Phone',              // G - Phone number
      'Location',           // H - Work location
      'Start Date',         // I - Employment start date
      'Status',             // J - Employment status (Active, Inactive)
      'Assets Assigned',    // K - Number of assets assigned
      'Last Updated'        // L - Last record update
    ],
    START_ROW: 2
  },

  // Audit log for tracking all system changes
  AUDIT_LOG: {
    COLUMNS: [
      'Timestamp',          // A - When action occurred
      'User Email',         // B - Who performed the action
      'Action Type',        // C - Type of action (Create, Update, Delete, etc.)
      'Entity Type',        // D - What was changed (Asset, Employee, etc.)
      'Entity ID',          // E - ID of the entity changed
      'Old Value',          // F - Previous value (JSON string)
      'New Value',          // G - New value (JSON string)
      'IP Address',         // H - User IP address
      'Session ID',         // I - User session identifier
      'Details'             // J - Additional details about the change
    ],
    START_ROW: 2
  },

  // System settings
  SETTINGS: {
    COLUMNS: [
      'Setting',            // A - Setting name
      'Value',              // B - Setting value
      'Description',        // C - Setting description
      'Last Updated',       // D - When setting was last changed
      'Updated By'          // E - Who updated the setting
    ],
    START_ROW: 2
  }
};

/**
 * Initialize all database sheets with proper headers
 */
function initializeDatabase() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

    // Initialize each sheet
    Object.keys(SCHEMA).forEach(sheetName => {
      const sheetConfig = SCHEMA[sheetName];
      const actualSheetName = CONFIG.SHEETS[sheetName];

      let sheet = ss.getSheetByName(actualSheetName);
      if (!sheet) {
        sheet = ss.insertSheet(actualSheetName);
        console.log(`Created sheet: ${actualSheetName}`);
      }

      // Set headers
      const headers = [sheetConfig.COLUMNS];
      sheet.getRange(1, 1, 1, sheetConfig.COLUMNS.length).setValues(headers);

      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, sheetConfig.COLUMNS.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');

      // Auto-resize columns
      sheet.autoResizeColumns(1, sheetConfig.COLUMNS.length);

      // Freeze header row
      sheet.setFrozenRows(1);

      console.log(`Initialized sheet: ${actualSheetName}`);
    });

    // Initialize settings with default values
    initializeSettings();

    console.log('Database initialization completed successfully');
    return true;

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get column index by name for a specific sheet
 * @param {string} sheetName Sheet name from SCHEMA
 * @param {string} columnName Column name
 * @return {number} Column index (1-based)
 */
function getColumnIndex(sheetName, columnName) {
  const columns = SCHEMA[sheetName].COLUMNS;
  const index = columns.indexOf(columnName);
  return index >= 0 ? index + 1 : -1;
}

/**
 * Get all column names for a sheet
 * @param {string} sheetName Sheet name from SCHEMA
 * @return {Array} Array of column names
 */
function getColumnNames(sheetName) {
  return SCHEMA[sheetName].COLUMNS;
}

/**
 * Validate data against schema
 * @param {string} sheetName Sheet name
 * @param {Object} data Data to validate
 * @return {Object} Validation result
 */
function validateData(sheetName, data) {
  const schema = SCHEMA[sheetName];
  const result = {
    valid: true,
    errors: []
  };

  // Check if all required fields are present
  const requiredFields = schema.COLUMNS;
  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === '') {
      // Skip auto-generated fields
      if (!['Created Date', 'Last Modified', 'Asset Tag'].includes(field)) {
        result.errors.push(`Missing required field: ${field}`);
        result.valid = false;
      }
    }
  });

  return result;
}