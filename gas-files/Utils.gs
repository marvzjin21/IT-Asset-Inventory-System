/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

/**
 * Log an audit event
 * @param {string} actionType Type of action (CREATE, UPDATE, DELETE, etc.)
 * @param {string} entityType Type of entity (Asset, Employee, etc.)
 * @param {string} entityId ID of the entity
 * @param {Object} oldValue Previous value (for updates)
 * @param {Object} newValue New value
 * @param {string} details Additional details
 */
function logAuditEvent(actionType, entityType, entityId, oldValue = null, newValue = null, details = '') {
  try {
    const auditData = {
      'Timestamp': new Date(),
      'User Email': Session.getActiveUser().getEmail(),
      'Action Type': actionType,
      'Entity Type': entityType,
      'Entity ID': entityId.toString(),
      'Old Value': oldValue ? JSON.stringify(oldValue) : '',
      'New Value': newValue ? JSON.stringify(newValue) : '',
      'IP Address': '', // Note: Google Apps Script doesn't provide IP address
      'Session ID': Session.getTemporaryActiveUserKey() || Utilities.getUuid(),
      'Details': details || `${actionType} ${entityType} ${entityId}`
    };

    // Add to audit log sheet
    addRecord(CONFIG.SHEETS.AUDIT_LOG, auditData);

  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw error as audit logging shouldn't break main functionality
  }
}

/**
 * Format date for display
 * @param {Date|string} date Date to format
 * @param {string} format Format string (optional)
 * @return {string} Formatted date
 */
function formatDate(date, format = 'MM/dd/yyyy') {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), format);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toString();
  }
}

/**
 * Format currency for display
 * @param {number|string} amount Amount to format
 * @param {string} currency Currency code (default: USD)
 * @return {string} Formatted currency
 */
function formatCurrency(amount, currency = 'USD') {
  try {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(num);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `$${parseFloat(amount) || 0}`;
  }
}

/**
 * Validate email address
 * @param {string} email Email to validate
 * @return {boolean} True if valid email
 */
function isValidEmail(email) {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  } catch (error) {
    return false;
  }
}

/**
 * Generate UUID
 * @return {string} UUID string
 */
function generateUUID() {
  try {
    return Utilities.getUuid();
  } catch (error) {
    // Fallback UUID generation
    return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Sanitize string for safe storage
 * @param {string} str String to sanitize
 * @return {string} Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  return str
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
    .trim();
}

/**
 * Convert object to query string
 * @param {Object} obj Object to convert
 * @return {string} Query string
 */
function objectToQueryString(obj) {
  try {
    const params = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined) {
        params.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
      }
    }
    return params.join('&');
  } catch (error) {
    console.error('Error converting object to query string:', error);
    return '';
  }
}

/**
 * Parse query string to object
 * @param {string} queryString Query string to parse
 * @return {Object} Parsed object
 */
function parseQueryString(queryString) {
  try {
    const obj = {};
    const pairs = queryString.split('&');

    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        obj[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    });

    return obj;
  } catch (error) {
    console.error('Error parsing query string:', error);
    return {};
  }
}

/**
 * Deep clone an object
 * @param {Object} obj Object to clone
 * @return {Object} Cloned object
 */
function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Error deep cloning object:', error);
    return obj;
  }
}

/**
 * Check if user has admin permissions
 * @param {string} userEmail User email (optional, uses current user if not provided)
 * @return {boolean} True if user is admin
 */
function isUserAdmin(userEmail = null) {
  try {
    const email = userEmail || Session.getActiveUser().getEmail();
    const adminEmail = getSetting('SYSTEM_ADMIN_EMAIL');

    // Check if user is the system admin
    if (adminEmail && email === adminEmail) {
      return true;
    }

    // Check if user is in admin list (if we add that feature)
    // const adminList = getSetting('ADMIN_EMAIL_LIST');
    // if (adminList) {
    //   const admins = adminList.split(',').map(e => e.trim());
    //   return admins.includes(email);
    // }

    return false;
  } catch (error) {
    console.error('Error checking admin permissions:', error);
    return false;
  }
}

/**
 * Get user permissions for specific action
 * @param {string} action Action to check
 * @param {string} userEmail User email (optional)
 * @return {boolean} True if user has permission
 */
function hasPermission(action, userEmail = null) {
  try {
    const email = userEmail || Session.getActiveUser().getEmail();

    // Admin has all permissions
    if (isUserAdmin(email)) {
      return true;
    }

    // Define permission matrix
    const permissions = {
      'VIEW_ASSETS': true, // Everyone can view assets
      'ADD_ASSET': true,   // Everyone can add assets (adjust as needed)
      'EDIT_ASSET': true,  // Everyone can edit assets (adjust as needed)
      'DELETE_ASSET': isUserAdmin(email), // Only admins can delete
      'VIEW_REPORTS': true,
      'MANAGE_USERS': isUserAdmin(email),
      'SYSTEM_SETTINGS': isUserAdmin(email)
    };

    return permissions[action] || false;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Validate required fields in an object
 * @param {Object} obj Object to validate
 * @param {Array} requiredFields Array of required field names
 * @return {Object} Validation result
 */
function validateRequiredFields(obj, requiredFields) {
  const result = {
    valid: true,
    missingFields: [],
    errors: []
  };

  try {
    requiredFields.forEach(field => {
      if (!obj[field] || obj[field].toString().trim() === '') {
        result.valid = false;
        result.missingFields.push(field);
        result.errors.push(`Missing required field: ${field}`);
      }
    });

    return result;
  } catch (error) {
    console.error('Error validating required fields:', error);
    return {
      valid: false,
      missingFields: [],
      errors: [error.toString()]
    };
  }
}

/**
 * Convert array of objects to CSV string
 * @param {Array} data Array of objects
 * @param {Array} headers Optional array of headers
 * @return {string} CSV string
 */
function arrayToCSV(data, headers = null) {
  try {
    if (!data || data.length === 0) {
      return '';
    }

    // Get headers from first object if not provided
    if (!headers) {
      headers = Object.keys(data[0]);
    }

    let csv = headers.join(',') + '\n';

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  } catch (error) {
    console.error('Error converting array to CSV:', error);
    return '';
  }
}

/**
 * Export data to Google Sheets
 * @param {Array} data Array of objects to export
 * @param {string} sheetName Name for the new sheet
 * @return {Object} Export result
 */
function exportToNewSheet(data, sheetName) {
  try {
    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'No data to export'
      };
    }

    // Create new spreadsheet
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
    const fileName = `${sheetName}_Export_${timestamp}`;
    const newSS = SpreadsheetApp.create(fileName);

    // Get the first sheet and rename it
    const sheet = newSS.getSheets()[0];
    sheet.setName(sheetName);

    // Prepare data for writing
    const headers = Object.keys(data[0]);
    const values = [headers];

    data.forEach(row => {
      const rowValues = headers.map(header => row[header] || '');
      values.push(rowValues);
    });

    // Write data to sheet
    sheet.getRange(1, 1, values.length, headers.length).setValues(values);

    // Format the sheet
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');

    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);

    return {
      success: true,
      message: 'Data exported successfully',
      spreadsheetUrl: newSS.getUrl(),
      spreadsheetId: newSS.getId()
    };

  } catch (error) {
    console.error('Error exporting to new sheet:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Send email with error details to admin
 * @param {Error} error Error object
 * @param {string} context Context where error occurred
 */
function notifyAdminOfError(error, context = '') {
  try {
    const adminEmail = getSetting('SYSTEM_ADMIN_EMAIL');
    if (!adminEmail) return;

    const subject = `IT Asset Management System Error: ${context}`;
    const body = `
An error occurred in the IT Asset Management System:

Context: ${context}
Error: ${error.toString()}
Stack Trace: ${error.stack || 'Not available'}
User: ${Session.getActiveUser().getEmail()}
Timestamp: ${new Date().toISOString()}
    `;

    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      body: body,
      name: CONFIG.EMAIL.FROM_NAME
    });

  } catch (emailError) {
    console.error('Error sending admin notification:', emailError);
  }
}

/**
 * Rate limiting for API calls
 * @param {string} userId User identifier
 * @param {number} maxCalls Maximum calls allowed
 * @param {number} windowMs Time window in milliseconds
 * @return {boolean} True if call is allowed
 */
function checkRateLimit(userId, maxCalls = 100, windowMs = 60000) {
  try {
    const cache = CacheService.getScriptCache();
    const key = `rate_limit_${userId}`;
    const data = cache.get(key);

    let callData;
    if (data) {
      callData = JSON.parse(data);
    } else {
      callData = {
        count: 0,
        resetTime: Date.now() + windowMs
      };
    }

    // Reset if window has expired
    if (Date.now() > callData.resetTime) {
      callData = {
        count: 1,
        resetTime: Date.now() + windowMs
      };
    } else {
      callData.count++;
    }

    // Save updated data
    cache.put(key, JSON.stringify(callData), Math.ceil(windowMs / 1000));

    return callData.count <= maxCalls;

  } catch (error) {
    console.error('Error checking rate limit:', error);
    return true; // Allow call if rate limiting fails
  }
}

/**
 * Calculate business days between two dates
 * @param {Date} startDate Start date
 * @param {Date} endDate End date
 * @return {number} Number of business days
 */
function calculateBusinessDays(startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let businessDays = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        businessDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return businessDays;
  } catch (error) {
    console.error('Error calculating business days:', error);
    return 0;
  }
}

/**
 * Format phone number
 * @param {string} phone Phone number to format
 * @return {string} Formatted phone number
 */
function formatPhoneNumber(phone) {
  try {
    if (!phone) return '';

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length === 10) {
      return `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`;
    }

    // Return original if not a standard US number
    return phone;
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phone;
  }
}