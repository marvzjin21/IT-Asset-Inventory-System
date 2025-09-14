/**
 * Configuration file for IT Asset Inventory System
 * Update these values according to your Google Drive and Sheets setup
 */

// Google Sheets Configuration
const CONFIG = {
  // Replace with your Google Sheets ID (found in the URL)
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

  // Sheet names - these will be created automatically
  SHEETS: {
    ASSETS: 'Assets',
    ACCOUNTABILITY: 'Accountability',
    DISPOSAL: 'Disposal',
    EMPLOYEES: 'Employees',
    AUDIT_LOG: 'AuditLog',
    SETTINGS: 'Settings'
  },

  // Google Drive folder for storing PDFs
  // Replace with your Google Drive folder ID
  PDF_FOLDER_ID: 'YOUR_PDF_FOLDER_ID_HERE',

  // Email settings
  EMAIL: {
    FROM_NAME: 'IT Asset Management System',
    SIGNATURE: 'Best regards,\nIT Department'
  },

  // Asset tag configuration
  ASSET_TAG: {
    PREFIX: 'IT-',
    STARTING_NUMBER: 1000,
    PADDING: 4 // Will generate IT-1000, IT-1001, etc.
  },

  // Asset conditions
  CONDITIONS: [
    'Brand New',
    'Excellent',
    'Good',
    'Fair',
    'Poor',
    'Needs Repair',
    'Obsolete'
  ],

  // Asset categories
  CATEGORIES: [
    'Desktop Computer',
    'Laptop',
    'Monitor',
    'Printer',
    'Scanner',
    'Router',
    'Switch',
    'Phone',
    'Tablet',
    'Projector',
    'Keyboard',
    'Mouse',
    'Headset',
    'Webcam',
    'External Hard Drive',
    'USB Drive',
    'Cable',
    'Docking Station',
    'UPS',
    'Server',
    'Other'
  ],

  // Asset statuses
  STATUSES: [
    'Available',
    'Assigned',
    'Under Maintenance',
    'Reserved',
    'Disposed',
    'Lost/Stolen'
  ],

  // Disposal methods
  DISPOSAL_METHODS: [
    'Sold',
    'Donated',
    'Recycled',
    'Destroyed',
    'Returned to Vendor',
    'Trade-in',
    'Scrapped'
  ],

  // Locations
  LOCATIONS: [
    'Main Office',
    'Branch Office',
    'Warehouse',
    'Remote Work',
    'IT Department',
    'HR Department',
    'Finance Department',
    'Marketing Department',
    'Sales Department',
    'Customer Service',
    'Executive Office'
  ]
};

/**
 * Get configuration value
 * @param {string} key Configuration key
 * @return {any} Configuration value
 */
function getConfig(key) {
  return CONFIG[key];
}

/**
 * Update configuration value
 * @param {string} key Configuration key
 * @param {any} value New value
 */
function setConfig(key, value) {
  CONFIG[key] = value;
}

/**
 * Initialize system settings
 */
function initializeSettings() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  try {
    let settingsSheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
    if (!settingsSheet) {
      settingsSheet = ss.insertSheet(CONFIG.SHEETS.SETTINGS);
    }

    // Set up settings sheet headers
    const headers = [['Setting', 'Value', 'Description']];
    settingsSheet.getRange(1, 1, 1, 3).setValues(headers);

    // Initialize default settings
    const defaultSettings = [
      ['NEXT_ASSET_TAG', CONFIG.ASSET_TAG.STARTING_NUMBER, 'Next asset tag number to assign'],
      ['SYSTEM_ADMIN_EMAIL', '', 'System administrator email'],
      ['AUTO_EMAIL_NOTIFICATIONS', 'TRUE', 'Send automatic email notifications'],
      ['PDF_GENERATION_ENABLED', 'TRUE', 'Enable PDF generation for forms'],
      ['AUDIT_LOGGING_ENABLED', 'TRUE', 'Enable audit logging for all actions']
    ];

    // Check if settings already exist
    const existingData = settingsSheet.getDataRange().getValues();
    if (existingData.length <= 1) {
      settingsSheet.getRange(2, 1, defaultSettings.length, 3).setValues(defaultSettings);
    }

    console.log('Settings initialized successfully');
  } catch (error) {
    console.error('Error initializing settings:', error);
    throw error;
  }
}