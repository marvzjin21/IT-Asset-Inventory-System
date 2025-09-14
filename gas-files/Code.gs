/**
 * Main Google Apps Script file for IT Asset Inventory System
 * This file contains the primary web app functions and initialization
 */

/**
 * Web app entry point - serves the main HTML interface
 * @param {Object} e Event parameter containing query parameters
 * @return {HtmlOutput} HTML content to display
 */
function doGet(e) {
  try {
    // Get the page parameter, default to 'dashboard'
    const page = e.parameter.page || 'dashboard';

    let htmlFile;
    let title;

    // Route to appropriate page
    switch (page.toLowerCase()) {
      case 'inventory':
        htmlFile = 'Inventory';
        title = 'Asset Inventory Management';
        break;
      case 'accountability':
        htmlFile = 'Accountability';
        title = 'Asset Accountability Form';
        break;
      case 'disposal':
        htmlFile = 'Disposal';
        title = 'Asset Disposal Management';
        break;
      case 'reports':
        htmlFile = 'Reports';
        title = 'Reports & Analytics';
        break;
      default:
        htmlFile = 'Index';
        title = 'IT Asset Management Dashboard';
    }

    // Create HTML output
    const html = HtmlService.createTemplateFromFile(htmlFile);

    // Pass configuration and user data to the template
    html.config = CONFIG;
    html.userEmail = Session.getActiveUser().getEmail();
    html.userName = getUserName();

    return html.evaluate()
      .setTitle(title)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');

  } catch (error) {
    console.error('Error in doGet:', error);
    return HtmlService.createHtmlOutput(
      '<h3>Error loading application</h3>' +
      '<p>Please contact your system administrator.</p>' +
      '<p>Error: ' + error.toString() + '</p>'
    );
  }
}

/**
 * Handle POST requests for form submissions
 * @param {Object} e Event parameter containing POST data
 * @return {Object} JSON response
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    const data = JSON.parse(e.parameter.data || '{}');

    console.log(`Processing POST request: ${action}`);

    let response;

    switch (action) {
      case 'addAsset':
        response = addAsset(data);
        break;
      case 'updateAsset':
        response = updateAsset(data);
        break;
      case 'deleteAsset':
        response = deleteAsset(data.assetTag);
        break;
      case 'submitAccountabilityForm':
        response = submitAccountabilityForm(data);
        break;
      case 'submitDisposalForm':
        response = submitDisposalForm(data);
        break;
      case 'approveDisposal':
        response = approveDisposal(data);
        break;
      default:
        response = {
          success: false,
          message: `Unknown action: ${action}`
        };
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Include HTML files for modular structure
 * @param {string} filename Name of the HTML file to include
 * @return {string} HTML content
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    console.error(`Error including file ${filename}:`, error);
    return `<!-- Error loading ${filename} -->`;
  }
}

/**
 * Initialize the entire system
 * This function should be run once to set up the database and configuration
 */
function initializeSystem() {
  try {
    console.log('Starting system initialization...');

    // Check if spreadsheet ID is configured
    if (CONFIG.SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
      throw new Error('Please update the SPREADSHEET_ID in Config.gs before initializing the system');
    }

    // Initialize database structure
    initializeDatabase();

    // Create sample data (optional - comment out in production)
    // createSampleData();

    console.log('System initialization completed successfully');
    return {
      success: true,
      message: 'System initialized successfully'
    };

  } catch (error) {
    console.error('Error initializing system:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get current user's name
 * @return {string} User's display name
 */
function getUserName() {
  try {
    const user = Session.getActiveUser();
    return user.getUsername() || user.getEmail();
  } catch (error) {
    console.error('Error getting user name:', error);
    return 'Unknown User';
  }
}

/**
 * Test function to verify system setup
 * @return {Object} Test results
 */
function testSystemSetup() {
  const tests = {
    configLoaded: false,
    spreadsheetsAccess: false,
    driveAccess: false,
    emailAccess: false
  };

  try {
    // Test configuration
    if (CONFIG && CONFIG.SPREADSHEET_ID) {
      tests.configLoaded = true;
    }

    // Test Sheets access
    if (CONFIG.SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE') {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      if (ss) {
        tests.spreadsheetsAccess = true;
      }
    }

    // Test Drive access
    if (CONFIG.PDF_FOLDER_ID !== 'YOUR_PDF_FOLDER_ID_HERE') {
      const folder = DriveApp.getFolderById(CONFIG.PDF_FOLDER_ID);
      if (folder) {
        tests.driveAccess = true;
      }
    }

    // Test email access
    const user = Session.getActiveUser();
    if (user && user.getEmail()) {
      tests.emailAccess = true;
    }

  } catch (error) {
    console.error('Error in system test:', error);
  }

  return tests;
}

/**
 * Create sample data for testing (optional)
 * Comment out or remove in production
 */
function createSampleData() {
  try {
    console.log('Creating sample data...');

    // Sample assets
    const sampleAssets = [
      {
        'Serial Number': 'SNK001',
        'Category': 'Laptop',
        'Brand': 'Dell',
        'Model': 'Latitude 7420',
        'Description': 'Business laptop for development work',
        'Condition': 'Brand New',
        'Date Received': new Date('2024-01-15'),
        'Purchase Price': 1200,
        'Warranty Expiry': new Date('2027-01-15'),
        'Location': 'IT Department'
      },
      {
        'Serial Number': 'SNK002',
        'Category': 'Desktop Computer',
        'Brand': 'HP',
        'Model': 'EliteDesk 800',
        'Description': 'Desktop workstation',
        'Condition': 'Good',
        'Date Received': new Date('2023-12-01'),
        'Purchase Price': 800,
        'Warranty Expiry': new Date('2026-12-01'),
        'Location': 'Main Office'
      }
    ];

    // Add sample assets
    sampleAssets.forEach(asset => {
      addAsset(asset);
    });

    // Sample employees
    const sampleEmployees = [
      {
        'Employee ID': 'EMP001',
        'Full Name': 'John Doe',
        'Email': 'john.doe@company.com',
        'Department': 'IT',
        'Position': 'Software Developer'
      },
      {
        'Employee ID': 'EMP002',
        'Full Name': 'Jane Smith',
        'Email': 'jane.smith@company.com',
        'Department': 'HR',
        'Position': 'HR Manager'
      }
    ];

    // Add sample employees
    sampleEmployees.forEach(employee => {
      addEmployee(employee);
    });

    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

/**
 * Get system statistics for dashboard
 * @return {Object} System statistics
 */
function getSystemStats() {
  try {
    const stats = {
      totalAssets: 0,
      availableAssets: 0,
      assignedAssets: 0,
      disposedAssets: 0,
      totalEmployees: 0,
      pendingAccountability: 0,
      pendingDisposals: 0,
      lastUpdated: new Date()
    };

    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

    // Assets statistics
    const assetsSheet = ss.getSheetByName(CONFIG.SHEETS.ASSETS);
    if (assetsSheet) {
      const assetData = assetsSheet.getDataRange().getValues();
      stats.totalAssets = Math.max(0, assetData.length - 1); // Exclude header

      // Count by status
      const statusCol = getColumnIndex('ASSETS', 'Status') - 1;
      for (let i = 1; i < assetData.length; i++) {
        const status = assetData[i][statusCol];
        switch (status) {
          case 'Available':
            stats.availableAssets++;
            break;
          case 'Assigned':
            stats.assignedAssets++;
            break;
          case 'Disposed':
            stats.disposedAssets++;
            break;
        }
      }
    }

    // Employee statistics
    const employeesSheet = ss.getSheetByName(CONFIG.SHEETS.EMPLOYEES);
    if (employeesSheet) {
      const employeeData = employeesSheet.getDataRange().getValues();
      stats.totalEmployees = Math.max(0, employeeData.length - 1);
    }

    // Accountability statistics
    const accountabilitySheet = ss.getSheetByName(CONFIG.SHEETS.ACCOUNTABILITY);
    if (accountabilitySheet) {
      const accountabilityData = accountabilitySheet.getDataRange().getValues();
      const statusCol = getColumnIndex('ACCOUNTABILITY', 'Status') - 1;
      for (let i = 1; i < accountabilityData.length; i++) {
        if (accountabilityData[i][statusCol] === 'Pending') {
          stats.pendingAccountability++;
        }
      }
    }

    // Disposal statistics
    const disposalSheet = ss.getSheetByName(CONFIG.SHEETS.DISPOSAL);
    if (disposalSheet) {
      const disposalData = disposalSheet.getDataRange().getValues();
      const statusCol = getColumnIndex('DISPOSAL', 'Status') - 1;
      for (let i = 1; i < disposalData.length; i++) {
        if (disposalData[i][statusCol] === 'Pending') {
          stats.pendingDisposals++;
        }
      }
    }

    return stats;

  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      error: error.toString()
    };
  }
}