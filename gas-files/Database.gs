/**
 * Database operations for Google Sheets
 * Handles all CRUD operations for the asset management system
 */

/**
 * Get all records from a specific sheet
 * @param {string} sheetName Name of the sheet (from CONFIG.SHEETS)
 * @param {number} limit Optional limit on number of records
 * @return {Array} Array of objects representing the data
 */
function getAllRecords(sheetName, limit = null) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return []; // No data (only headers or empty sheet)
    }

    const headers = data[0];
    const records = [];

    // Convert array data to objects
    const maxRows = limit ? Math.min(data.length, limit + 1) : data.length;
    for (let i = 1; i < maxRows; i++) {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = data[i][index] || '';
      });
      records.push(record);
    }

    return records;

  } catch (error) {
    console.error(`Error getting records from ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Get a single record by unique identifier
 * @param {string} sheetName Name of the sheet
 * @param {string} keyColumn Column name to search
 * @param {string} keyValue Value to search for
 * @return {Object|null} Record object or null if not found
 */
function getRecord(sheetName, keyColumn, keyValue) {
  try {
    const records = getAllRecords(sheetName);
    return records.find(record => record[keyColumn] === keyValue) || null;

  } catch (error) {
    console.error(`Error getting record from ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Add a new record to a sheet
 * @param {string} sheetName Name of the sheet
 * @param {Object} data Record data
 * @return {Object} Result object with success status
 */
function addRecord(sheetName, data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    // Get headers to maintain column order
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Add system fields
    data['Created Date'] = new Date();
    data['Created By'] = Session.getActiveUser().getEmail();
    data['Last Modified'] = new Date();
    data['Modified By'] = Session.getActiveUser().getEmail();

    // Create row data in correct column order
    const rowData = headers.map(header => {
      return data[header] !== undefined ? data[header] : '';
    });

    // Add the row
    sheet.appendRow(rowData);

    // Log the action
    logAuditEvent('CREATE', sheetName, data, null, data);

    return {
      success: true,
      message: `Record added successfully to ${sheetName}`,
      data: data
    };

  } catch (error) {
    console.error(`Error adding record to ${sheetName}:`, error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update an existing record
 * @param {string} sheetName Name of the sheet
 * @param {string} keyColumn Column name to identify the record
 * @param {string} keyValue Value to search for
 * @param {Object} newData New data to update
 * @return {Object} Result object with success status
 */
function updateRecord(sheetName, keyColumn, keyValue, newData) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    // Find the record
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const keyColumnIndex = headers.indexOf(keyColumn);

    if (keyColumnIndex === -1) {
      throw new Error(`Column '${keyColumn}' not found in ${sheetName}`);
    }

    let rowIndex = -1;
    let oldData = null;

    // Find the row to update
    for (let i = 1; i < data.length; i++) {
      if (data[i][keyColumnIndex] === keyValue) {
        rowIndex = i + 1; // Sheet rows are 1-indexed
        oldData = {};
        headers.forEach((header, index) => {
          oldData[header] = data[i][index];
        });
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Record with ${keyColumn} = ${keyValue} not found`);
    }

    // Add system fields
    newData['Last Modified'] = new Date();
    newData['Modified By'] = Session.getActiveUser().getEmail();

    // Update only the specified fields
    headers.forEach((header, index) => {
      if (newData[header] !== undefined) {
        sheet.getRange(rowIndex, index + 1).setValue(newData[header]);
      }
    });

    // Log the action
    logAuditEvent('UPDATE', sheetName, keyValue, oldData, newData);

    return {
      success: true,
      message: `Record updated successfully in ${sheetName}`,
      data: { ...oldData, ...newData }
    };

  } catch (error) {
    console.error(`Error updating record in ${sheetName}:`, error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Delete a record from a sheet
 * @param {string} sheetName Name of the sheet
 * @param {string} keyColumn Column name to identify the record
 * @param {string} keyValue Value to search for
 * @return {Object} Result object with success status
 */
function deleteRecord(sheetName, keyColumn, keyValue) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found`);
    }

    // Find the record
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const keyColumnIndex = headers.indexOf(keyColumn);

    if (keyColumnIndex === -1) {
      throw new Error(`Column '${keyColumn}' not found in ${sheetName}`);
    }

    let rowIndex = -1;
    let oldData = null;

    // Find the row to delete
    for (let i = 1; i < data.length; i++) {
      if (data[i][keyColumnIndex] === keyValue) {
        rowIndex = i + 1; // Sheet rows are 1-indexed
        oldData = {};
        headers.forEach((header, index) => {
          oldData[header] = data[i][index];
        });
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Record with ${keyColumn} = ${keyValue} not found`);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    // Log the action
    logAuditEvent('DELETE', sheetName, keyValue, oldData, null);

    return {
      success: true,
      message: `Record deleted successfully from ${sheetName}`,
      data: oldData
    };

  } catch (error) {
    console.error(`Error deleting record from ${sheetName}:`, error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Search records with filters
 * @param {string} sheetName Name of the sheet
 * @param {Object} filters Filter criteria {column: value, ...}
 * @param {string} searchText Optional text search across all fields
 * @return {Array} Filtered records
 */
function searchRecords(sheetName, filters = {}, searchText = '') {
  try {
    let records = getAllRecords(sheetName);

    // Apply column filters
    Object.keys(filters).forEach(column => {
      const filterValue = filters[column];
      if (filterValue !== '' && filterValue !== null && filterValue !== undefined) {
        records = records.filter(record => {
          const recordValue = record[column];
          if (typeof recordValue === 'string' && typeof filterValue === 'string') {
            return recordValue.toLowerCase().includes(filterValue.toLowerCase());
          }
          return recordValue === filterValue;
        });
      }
    });

    // Apply text search across all fields
    if (searchText) {
      records = records.filter(record => {
        return Object.values(record).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchText.toLowerCase());
          }
          return value.toString().toLowerCase().includes(searchText.toLowerCase());
        });
      });
    }

    return records;

  } catch (error) {
    console.error(`Error searching records in ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Get next available asset tag number
 * @return {string} Next asset tag
 */
function getNextAssetTag() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const settingsSheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);

    if (!settingsSheet) {
      throw new Error('Settings sheet not found');
    }

    // Find the NEXT_ASSET_TAG setting
    const data = settingsSheet.getDataRange().getValues();
    let nextNumber = CONFIG.ASSET_TAG.STARTING_NUMBER;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'NEXT_ASSET_TAG') {
        nextNumber = parseInt(data[i][1]) || CONFIG.ASSET_TAG.STARTING_NUMBER;
        // Update the setting for next time
        settingsSheet.getRange(i + 1, 2).setValue(nextNumber + 1);
        break;
      }
    }

    // Format the asset tag
    const paddedNumber = nextNumber.toString().padStart(CONFIG.ASSET_TAG.PADDING, '0');
    return `${CONFIG.ASSET_TAG.PREFIX}${paddedNumber}`;

  } catch (error) {
    console.error('Error getting next asset tag:', error);
    // Fallback to timestamp-based tag
    return `${CONFIG.ASSET_TAG.PREFIX}${Date.now()}`;
  }
}

/**
 * Get database statistics
 * @return {Object} Database statistics
 */
function getDatabaseStats() {
  try {
    const stats = {};

    Object.values(CONFIG.SHEETS).forEach(sheetName => {
      try {
        const records = getAllRecords(sheetName);
        stats[sheetName] = {
          totalRecords: records.length,
          lastUpdated: records.length > 0 ?
            Math.max(...records.map(r => new Date(r['Last Modified'] || r['Created Date'] || 0))) :
            null
        };
      } catch (error) {
        stats[sheetName] = {
          totalRecords: 0,
          error: error.toString()
        };
      }
    });

    return stats;

  } catch (error) {
    console.error('Error getting database stats:', error);
    return { error: error.toString() };
  }
}

/**
 * Backup data to a new spreadsheet
 * @return {Object} Backup result
 */
function backupDatabase() {
  try {
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
    const backupName = `Asset_Inventory_Backup_${timestamp}`;

    // Create a copy of the current spreadsheet
    const currentSS = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const backupSS = currentSS.copy(backupName);

    return {
      success: true,
      message: 'Database backup created successfully',
      backupId: backupSS.getId(),
      backupUrl: backupSS.getUrl()
    };

  } catch (error) {
    console.error('Error creating database backup:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}