/**
 * Asset Inventory Management Functions
 * Handles all operations related to IT asset inventory
 */

/**
 * Add a new asset to the inventory
 * @param {Object} assetData Asset information
 * @return {Object} Result object with success status
 */
function addAsset(assetData) {
  try {
    // Validate required fields
    const requiredFields = ['Serial Number', 'Category', 'Brand', 'Model', 'Condition', 'Date Received'];
    for (let field of requiredFields) {
      if (!assetData[field] || assetData[field].toString().trim() === '') {
        return {
          success: false,
          message: `Missing required field: ${field}`
        };
      }
    }

    // Check if serial number already exists
    const existingAsset = getRecord(CONFIG.SHEETS.ASSETS, 'Serial Number', assetData['Serial Number']);
    if (existingAsset) {
      return {
        success: false,
        message: `Asset with serial number '${assetData['Serial Number']}' already exists`
      };
    }

    // Generate asset tag
    assetData['Asset Tag'] = getNextAssetTag();

    // Set default values
    assetData['Status'] = assetData['Status'] || 'Available';
    assetData['Location'] = assetData['Location'] || 'IT Department';
    assetData['IT Personnel'] = assetData['IT Personnel'] || Session.getActiveUser().getEmail();

    // Format dates
    if (assetData['Date Received']) {
      assetData['Date Received'] = new Date(assetData['Date Received']);
    }
    if (assetData['Warranty Expiry']) {
      assetData['Warranty Expiry'] = new Date(assetData['Warranty Expiry']);
    }

    // Add the asset
    const result = addRecord(CONFIG.SHEETS.ASSETS, assetData);

    if (result.success) {
      // Send notification email to IT personnel
      sendAssetNotification('ASSET_ADDED', assetData);
    }

    return result;

  } catch (error) {
    console.error('Error adding asset:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update an existing asset
 * @param {Object} assetData Updated asset information (must include Asset Tag)
 * @return {Object} Result object with success status
 */
function updateAsset(assetData) {
  try {
    if (!assetData['Asset Tag']) {
      return {
        success: false,
        message: 'Asset Tag is required for updates'
      };
    }

    // Get existing asset
    const existingAsset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', assetData['Asset Tag']);
    if (!existingAsset) {
      return {
        success: false,
        message: `Asset with tag '${assetData['Asset Tag']}' not found`
      };
    }

    // If serial number is being changed, check for duplicates
    if (assetData['Serial Number'] && assetData['Serial Number'] !== existingAsset['Serial Number']) {
      const duplicateAsset = getRecord(CONFIG.SHEETS.ASSETS, 'Serial Number', assetData['Serial Number']);
      if (duplicateAsset && duplicateAsset['Asset Tag'] !== assetData['Asset Tag']) {
        return {
          success: false,
          message: `Asset with serial number '${assetData['Serial Number']}' already exists`
        };
      }
    }

    // Format dates if provided
    if (assetData['Date Received']) {
      assetData['Date Received'] = new Date(assetData['Date Received']);
    }
    if (assetData['Warranty Expiry']) {
      assetData['Warranty Expiry'] = new Date(assetData['Warranty Expiry']);
    }
    if (assetData['Assignment Date']) {
      assetData['Assignment Date'] = new Date(assetData['Assignment Date']);
    }

    // Update the asset
    const result = updateRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', assetData['Asset Tag'], assetData);

    if (result.success) {
      // Send notification email if status changed
      if (assetData['Status'] && assetData['Status'] !== existingAsset['Status']) {
        sendAssetNotification('ASSET_STATUS_CHANGED', { ...existingAsset, ...assetData });
      }
    }

    return result;

  } catch (error) {
    console.error('Error updating asset:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Delete an asset from inventory
 * @param {string} assetTag Asset tag to delete
 * @return {Object} Result object with success status
 */
function deleteAsset(assetTag) {
  try {
    // Check if asset exists
    const existingAsset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', assetTag);
    if (!existingAsset) {
      return {
        success: false,
        message: `Asset with tag '${assetTag}' not found`
      };
    }

    // Check if asset is currently assigned
    if (existingAsset['Status'] === 'Assigned' && existingAsset['Assigned To']) {
      return {
        success: false,
        message: 'Cannot delete an asset that is currently assigned to an employee'
      };
    }

    // Delete the asset
    const result = deleteRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', assetTag);

    if (result.success) {
      // Send notification email
      sendAssetNotification('ASSET_DELETED', existingAsset);
    }

    return result;

  } catch (error) {
    console.error('Error deleting asset:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get all assets with optional filtering
 * @param {Object} filters Optional filters
 * @return {Array} Array of asset objects
 */
function getAssets(filters = {}) {
  try {
    return searchRecords(CONFIG.SHEETS.ASSETS, filters);
  } catch (error) {
    console.error('Error getting assets:', error);
    return [];
  }
}

/**
 * Get a single asset by asset tag
 * @param {string} assetTag Asset tag
 * @return {Object|null} Asset object or null
 */
function getAsset(assetTag) {
  try {
    return getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', assetTag);
  } catch (error) {
    console.error('Error getting asset:', error);
    return null;
  }
}

/**
 * Assign an asset to an employee
 * @param {string} assetTag Asset tag
 * @param {string} employeeId Employee ID
 * @param {string} itPersonnel IT personnel handling assignment
 * @return {Object} Result object
 */
function assignAsset(assetTag, employeeId, itPersonnel) {
  try {
    // Validate asset exists and is available
    const asset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', assetTag);
    if (!asset) {
      return {
        success: false,
        message: `Asset '${assetTag}' not found`
      };
    }

    if (asset['Status'] !== 'Available') {
      return {
        success: false,
        message: `Asset '${assetTag}' is not available for assignment`
      };
    }

    // Validate employee exists
    const employee = getRecord(CONFIG.SHEETS.EMPLOYEES, 'Employee ID', employeeId);
    if (!employee) {
      return {
        success: false,
        message: `Employee '${employeeId}' not found`
      };
    }

    // Update asset status
    const updateData = {
      'Status': 'Assigned',
      'Assigned To': employeeId,
      'Assignment Date': new Date(),
      'IT Personnel': itPersonnel || Session.getActiveUser().getEmail()
    };

    const result = updateRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', assetTag, updateData);

    if (result.success) {
      // Update employee's asset count
      updateEmployeeAssetCount(employeeId);

      // Send notification
      sendAssetNotification('ASSET_ASSIGNED', { ...asset, ...updateData, employee: employee });
    }

    return result;

  } catch (error) {
    console.error('Error assigning asset:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Return an asset from an employee
 * @param {string} assetTag Asset tag
 * @param {string} itPersonnel IT personnel handling return
 * @param {string} condition Asset condition after return
 * @return {Object} Result object
 */
function returnAsset(assetTag, itPersonnel, condition = null) {
  try {
    const asset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', assetTag);
    if (!asset) {
      return {
        success: false,
        message: `Asset '${assetTag}' not found`
      };
    }

    if (asset['Status'] !== 'Assigned') {
      return {
        success: false,
        message: `Asset '${assetTag}' is not currently assigned`
      };
    }

    const employeeId = asset['Assigned To'];

    // Update asset status
    const updateData = {
      'Status': 'Available',
      'Assigned To': '',
      'Assignment Date': '',
      'IT Personnel': itPersonnel || Session.getActiveUser().getEmail()
    };

    if (condition) {
      updateData['Condition'] = condition;
    }

    const result = updateRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', assetTag, updateData);

    if (result.success) {
      // Update employee's asset count
      if (employeeId) {
        updateEmployeeAssetCount(employeeId);
      }

      // Send notification
      sendAssetNotification('ASSET_RETURNED', { ...asset, ...updateData });
    }

    return result;

  } catch (error) {
    console.error('Error returning asset:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get assets by employee
 * @param {string} employeeId Employee ID
 * @return {Array} Array of assigned assets
 */
function getAssetsByEmployee(employeeId) {
  try {
    return searchRecords(CONFIG.SHEETS.ASSETS, { 'Assigned To': employeeId });
  } catch (error) {
    console.error('Error getting assets by employee:', error);
    return [];
  }
}

/**
 * Get assets by status
 * @param {string} status Asset status
 * @return {Array} Array of assets with specified status
 */
function getAssetsByStatus(status) {
  try {
    return searchRecords(CONFIG.SHEETS.ASSETS, { 'Status': status });
  } catch (error) {
    console.error('Error getting assets by status:', error);
    return [];
  }
}

/**
 * Get assets with expiring warranties
 * @param {number} daysAhead Number of days to check ahead
 * @return {Array} Array of assets with expiring warranties
 */
function getExpiringWarranties(daysAhead = 30) {
  try {
    const assets = getAllRecords(CONFIG.SHEETS.ASSETS);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    return assets.filter(asset => {
      if (!asset['Warranty Expiry']) return false;

      const warrantyDate = new Date(asset['Warranty Expiry']);
      return warrantyDate <= cutoffDate && warrantyDate >= new Date();
    });

  } catch (error) {
    console.error('Error getting expiring warranties:', error);
    return [];
  }
}

/**
 * Generate asset report
 * @param {string} reportType Type of report ('summary', 'detailed', 'by_category', 'by_status')
 * @return {Object} Report data
 */
function generateAssetReport(reportType = 'summary') {
  try {
    const assets = getAllRecords(CONFIG.SHEETS.ASSETS);

    const report = {
      generatedDate: new Date(),
      generatedBy: Session.getActiveUser().getEmail(),
      totalAssets: assets.length,
      reportType: reportType
    };

    switch (reportType) {
      case 'summary':
        report.summary = {
          byStatus: {},
          byCondition: {},
          byCategory: {},
          totalValue: 0
        };

        assets.forEach(asset => {
          // By status
          const status = asset['Status'] || 'Unknown';
          report.summary.byStatus[status] = (report.summary.byStatus[status] || 0) + 1;

          // By condition
          const condition = asset['Condition'] || 'Unknown';
          report.summary.byCondition[condition] = (report.summary.byCondition[condition] || 0) + 1;

          // By category
          const category = asset['Category'] || 'Unknown';
          report.summary.byCategory[category] = (report.summary.byCategory[category] || 0) + 1;

          // Total value
          const price = parseFloat(asset['Purchase Price']) || 0;
          report.summary.totalValue += price;
        });
        break;

      case 'detailed':
        report.assets = assets;
        break;

      case 'by_category':
        report.categories = {};
        assets.forEach(asset => {
          const category = asset['Category'] || 'Unknown';
          if (!report.categories[category]) {
            report.categories[category] = [];
          }
          report.categories[category].push(asset);
        });
        break;

      case 'by_status':
        report.statuses = {};
        assets.forEach(asset => {
          const status = asset['Status'] || 'Unknown';
          if (!report.statuses[status]) {
            report.statuses[status] = [];
          }
          report.statuses[status].push(asset);
        });
        break;
    }

    return report;

  } catch (error) {
    console.error('Error generating asset report:', error);
    return {
      error: error.toString()
    };
  }
}

/**
 * Update employee asset count
 * @param {string} employeeId Employee ID
 */
function updateEmployeeAssetCount(employeeId) {
  try {
    const assignedAssets = getAssetsByEmployee(employeeId);
    const count = assignedAssets.length;

    updateRecord(CONFIG.SHEETS.EMPLOYEES, 'Employee ID', employeeId, {
      'Assets Assigned': count,
      'Last Updated': new Date()
    });

  } catch (error) {
    console.error('Error updating employee asset count:', error);
  }
}