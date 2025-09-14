/**
 * Accountability Form Management Functions
 * Handles asset assignment accountability forms and employee signatures
 */

/**
 * Submit a new accountability form
 * @param {Object} formData Form submission data
 * @return {Object} Result object with success status
 */
function submitAccountabilityForm(formData) {
  try {
    // Validate required fields
    const requiredFields = ['Asset Tag', 'Employee Name', 'Employee Email', 'IT Personnel'];
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        return {
          success: false,
          message: `Missing required field: ${field}`
        };
      }
    }

    // Validate asset exists and is available
    const asset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', formData['Asset Tag']);
    if (!asset) {
      return {
        success: false,
        message: `Asset '${formData['Asset Tag']}' not found`
      };
    }

    if (asset['Status'] !== 'Available') {
      return {
        success: false,
        message: `Asset '${formData['Asset Tag']}' is not available for assignment`
      };
    }

    // Generate unique form ID
    const formId = generateFormId();

    // Prepare accountability record
    const accountabilityData = {
      'Form ID': formId,
      'Asset Tag': formData['Asset Tag'],
      'Employee Name': formData['Employee Name'],
      'Employee Email': formData['Employee Email'],
      'Employee ID': formData['Employee ID'] || generateEmployeeId(formData['Employee Email']),
      'Department': formData['Department'] || '',
      'Position': formData['Position'] || '',
      'Assignment Date': new Date(),
      'IT Personnel': formData['IT Personnel'],
      'IT Email': Session.getActiveUser().getEmail(),
      'IT Signature': formData['IT Signature'] || '',
      'Employee Confirmed': 'No',
      'Employee Signature': '',
      'Confirmation Date': '',
      'PDF Generated': 'No',
      'PDF URL': '',
      'Status': 'Pending Employee Confirmation',
      'Notes': formData['Notes'] || '',
      'Email Sent': 'No',
      'Return Date': ''
    };

    // Add the accountability record
    const result = addRecord(CONFIG.SHEETS.ACCOUNTABILITY, accountabilityData);

    if (!result.success) {
      return result;
    }

    // Update asset status to assigned
    const assetUpdateResult = assignAsset(
      formData['Asset Tag'],
      accountabilityData['Employee ID'],
      formData['IT Personnel']
    );

    if (!assetUpdateResult.success) {
      // Rollback the accountability record if asset assignment fails
      deleteRecord(CONFIG.SHEETS.ACCOUNTABILITY, 'Form ID', formId);
      return assetUpdateResult;
    }

    // Add or update employee record
    updateOrAddEmployee({
      'Employee ID': accountabilityData['Employee ID'],
      'Full Name': formData['Employee Name'],
      'Email': formData['Employee Email'],
      'Department': formData['Department'] || '',
      'Position': formData['Position'] || '',
      'Status': 'Active'
    });

    // Send confirmation email to employee
    const emailResult = sendAccountabilityEmail(formId, accountabilityData, asset);

    if (emailResult.success) {
      updateRecord(CONFIG.SHEETS.ACCOUNTABILITY, 'Form ID', formId, {
        'Email Sent': 'Yes'
      });
    }

    return {
      success: true,
      message: 'Accountability form submitted successfully',
      formId: formId,
      data: accountabilityData,
      emailSent: emailResult.success
    };

  } catch (error) {
    console.error('Error submitting accountability form:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Employee confirms receipt of asset and provides signature
 * @param {Object} confirmationData Confirmation data from employee
 * @return {Object} Result object
 */
function confirmAssetReceipt(confirmationData) {
  try {
    const { formId, employeeSignature, confirmationNotes } = confirmationData;

    // Validate form exists
    const accountabilityRecord = getRecord(CONFIG.SHEETS.ACCOUNTABILITY, 'Form ID', formId);
    if (!accountabilityRecord) {
      return {
        success: false,
        message: `Accountability form '${formId}' not found`
      };
    }

    if (accountabilityRecord['Status'] !== 'Pending Employee Confirmation') {
      return {
        success: false,
        message: 'This form has already been processed'
      };
    }

    // Update accountability record with employee confirmation
    const updateData = {
      'Employee Confirmed': 'Yes',
      'Employee Signature': employeeSignature || '',
      'Confirmation Date': new Date(),
      'Status': 'Completed',
      'Notes': (accountabilityRecord['Notes'] || '') + '\n' + (confirmationNotes || '')
    };

    const result = updateRecord(CONFIG.SHEETS.ACCOUNTABILITY, 'Form ID', formId, updateData);

    if (result.success) {
      // Generate PDF document
      generateAccountabilityPDF(formId);

      // Send completion notification to IT personnel
      sendAccountabilityCompletionNotification(formId, accountabilityRecord);
    }

    return result;

  } catch (error) {
    console.error('Error confirming asset receipt:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get accountability form by ID
 * @param {string} formId Form ID
 * @return {Object|null} Form data or null
 */
function getAccountabilityForm(formId) {
  try {
    return getRecord(CONFIG.SHEETS.ACCOUNTABILITY, 'Form ID', formId);
  } catch (error) {
    console.error('Error getting accountability form:', error);
    return null;
  }
}

/**
 * Get all accountability forms with optional filters
 * @param {Object} filters Optional filters
 * @return {Array} Array of accountability forms
 */
function getAccountabilityForms(filters = {}) {
  try {
    return searchRecords(CONFIG.SHEETS.ACCOUNTABILITY, filters);
  } catch (error) {
    console.error('Error getting accountability forms:', error);
    return [];
  }
}

/**
 * Get accountability forms by employee
 * @param {string} employeeId Employee ID or email
 * @return {Array} Array of forms for the employee
 */
function getAccountabilityFormsByEmployee(employeeId) {
  try {
    // Search by both Employee ID and Employee Email
    const byId = searchRecords(CONFIG.SHEETS.ACCOUNTABILITY, { 'Employee ID': employeeId });
    const byEmail = searchRecords(CONFIG.SHEETS.ACCOUNTABILITY, { 'Employee Email': employeeId });

    // Combine and deduplicate results
    const forms = [...byId];
    byEmail.forEach(form => {
      if (!forms.find(f => f['Form ID'] === form['Form ID'])) {
        forms.push(form);
      }
    });

    return forms;

  } catch (error) {
    console.error('Error getting accountability forms by employee:', error);
    return [];
  }
}

/**
 * Process asset return - create return documentation
 * @param {string} formId Original accountability form ID
 * @param {Object} returnData Return information
 * @return {Object} Result object
 */
function processAssetReturn(formId, returnData) {
  try {
    const accountabilityRecord = getRecord(CONFIG.SHEETS.ACCOUNTABILITY, 'Form ID', formId);
    if (!accountabilityRecord) {
      return {
        success: false,
        message: `Accountability form '${formId}' not found`
      };
    }

    if (accountabilityRecord['Status'] !== 'Completed') {
      return {
        success: false,
        message: 'Asset assignment was not completed'
      };
    }

    // Return the asset
    const returnResult = returnAsset(
      accountabilityRecord['Asset Tag'],
      returnData['IT Personnel'] || Session.getActiveUser().getEmail(),
      returnData['Condition']
    );

    if (!returnResult.success) {
      return returnResult;
    }

    // Update accountability record
    const updateData = {
      'Return Date': new Date(),
      'Status': 'Returned',
      'Notes': (accountabilityRecord['Notes'] || '') + '\n' + `Asset returned on ${new Date().toDateString()}. Return condition: ${returnData['Condition'] || 'Not specified'}`
    };

    const result = updateRecord(CONFIG.SHEETS.ACCOUNTABILITY, 'Form ID', formId, updateData);

    if (result.success) {
      // Generate return PDF
      generateReturnPDF(formId, returnData);

      // Send return notification
      sendAssetReturnNotification(formId, accountabilityRecord, returnData);
    }

    return result;

  } catch (error) {
    console.error('Error processing asset return:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Generate a unique form ID
 * @return {string} Unique form ID
 */
function generateFormId() {
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ACC-${timestamp}-${random}`;
}

/**
 * Generate employee ID from email if not provided
 * @param {string} email Employee email
 * @return {string} Generated employee ID
 */
function generateEmployeeId(email) {
  // Extract username from email and create ID
  const username = email.split('@')[0].toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `EMP-${username}-${timestamp}`;
}

/**
 * Add or update employee record
 * @param {Object} employeeData Employee information
 * @return {Object} Result object
 */
function updateOrAddEmployee(employeeData) {
  try {
    // Check if employee already exists
    const existingEmployee = getRecord(CONFIG.SHEETS.EMPLOYEES, 'Employee ID', employeeData['Employee ID']);

    employeeData['Last Updated'] = new Date();

    if (existingEmployee) {
      // Update existing employee
      return updateRecord(CONFIG.SHEETS.EMPLOYEES, 'Employee ID', employeeData['Employee ID'], employeeData);
    } else {
      // Add new employee
      employeeData['Start Date'] = employeeData['Start Date'] || new Date();
      employeeData['Status'] = employeeData['Status'] || 'Active';
      employeeData['Assets Assigned'] = 0; // Will be updated by updateEmployeeAssetCount

      return addRecord(CONFIG.SHEETS.EMPLOYEES, employeeData);
    }

  } catch (error) {
    console.error('Error updating/adding employee:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get accountability statistics
 * @return {Object} Statistics object
 */
function getAccountabilityStats() {
  try {
    const forms = getAllRecords(CONFIG.SHEETS.ACCOUNTABILITY);

    const stats = {
      totalForms: forms.length,
      pending: 0,
      completed: 0,
      returned: 0,
      byMonth: {},
      byDepartment: {},
      recentForms: []
    };

    // Process each form
    forms.forEach(form => {
      // Count by status
      switch (form['Status']) {
        case 'Pending Employee Confirmation':
          stats.pending++;
          break;
        case 'Completed':
          stats.completed++;
          break;
        case 'Returned':
          stats.returned++;
          break;
      }

      // Count by month
      const assignmentDate = new Date(form['Assignment Date']);
      const monthKey = Utilities.formatDate(assignmentDate, Session.getScriptTimeZone(), 'yyyy-MM');
      stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;

      // Count by department
      const dept = form['Department'] || 'Unknown';
      stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
    });

    // Get recent forms (last 10)
    stats.recentForms = forms
      .sort((a, b) => new Date(b['Assignment Date']) - new Date(a['Assignment Date']))
      .slice(0, 10);

    return stats;

  } catch (error) {
    console.error('Error getting accountability stats:', error);
    return { error: error.toString() };
  }
}

/**
 * Get overdue confirmations (forms pending employee confirmation for more than specified days)
 * @param {number} daysOverdue Number of days to consider overdue
 * @return {Array} Array of overdue forms
 */
function getOverdueConfirmations(daysOverdue = 3) {
  try {
    const forms = searchRecords(CONFIG.SHEETS.ACCOUNTABILITY, { 'Status': 'Pending Employee Confirmation' });
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

    return forms.filter(form => {
      const assignmentDate = new Date(form['Assignment Date']);
      return assignmentDate < cutoffDate;
    });

  } catch (error) {
    console.error('Error getting overdue confirmations:', error);
    return [];
  }
}

/**
 * Send reminder emails for overdue confirmations
 * @return {Object} Result object with count of reminders sent
 */
function sendOverdueReminders() {
  try {
    const overdueFroms = getOverdueConfirmations(3);
    let remindersSent = 0;

    overdueFroms.forEach(form => {
      try {
        const asset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', form['Asset Tag']);
        if (asset) {
          const emailResult = sendAccountabilityEmail(form['Form ID'], form, asset, true);
          if (emailResult.success) {
            remindersSent++;
          }
        }
      } catch (error) {
        console.error(`Error sending reminder for form ${form['Form ID']}:`, error);
      }
    });

    return {
      success: true,
      message: `Sent ${remindersSent} reminder emails`,
      remindersSent: remindersSent,
      totalOverdue: overdueFroms.length
    };

  } catch (error) {
    console.error('Error sending overdue reminders:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}