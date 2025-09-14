/**
 * Asset Disposal Management Functions
 * Handles the disposal of IT assets with proper approval workflow
 */

/**
 * Submit a new asset disposal request
 * @param {Object} disposalData Disposal request data
 * @return {Object} Result object with success status
 */
function submitDisposalForm(disposalData) {
  try {
    // Validate required fields
    const requiredFields = ['Asset Tag', 'Disposal Method', 'Disposal Reason', 'IT Personnel', 'Approver Name', 'Approver Email'];
    for (let field of requiredFields) {
      if (!disposalData[field] || disposalData[field].toString().trim() === '') {
        return {
          success: false,
          message: `Missing required field: ${field}`
        };
      }
    }

    // Validate asset exists
    const asset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', disposalData['Asset Tag']);
    if (!asset) {
      return {
        success: false,
        message: `Asset '${disposalData['Asset Tag']}' not found`
      };
    }

    // Check if asset is currently assigned
    if (asset['Status'] === 'Assigned' && asset['Assigned To']) {
      return {
        success: false,
        message: `Cannot dispose asset '${disposalData['Asset Tag']}' - it is currently assigned to ${asset['Assigned To']}. Please return the asset first.`
      };
    }

    // Generate unique disposal ID
    const disposalId = generateDisposalId();

    // Prepare disposal record
    const disposalRecord = {
      'Disposal ID': disposalId,
      'Asset Tag': disposalData['Asset Tag'],
      'Disposal Method': disposalData['Disposal Method'],
      'Disposal Date': disposalData['Disposal Date'] ? new Date(disposalData['Disposal Date']) : new Date(),
      'Disposal Reason': disposalData['Disposal Reason'],
      'IT Personnel': disposalData['IT Personnel'],
      'IT Email': Session.getActiveUser().getEmail(),
      'IT Signature': disposalData['IT Signature'] || '',
      'Approver Name': disposalData['Approver Name'],
      'Approver Email': disposalData['Approver Email'],
      'Approver Signature': '',
      'Approval Date': '',
      'Disposal Value': disposalData['Disposal Value'] || 0,
      'Disposal Location': disposalData['Disposal Location'] || '',
      'Certificate Number': disposalData['Certificate Number'] || '',
      'PDF Generated': 'No',
      'PDF URL': '',
      'Status': 'Pending Approval',
      'Notes': disposalData['Notes'] || '',
      'Email Sent': 'No'
    };

    // Add the disposal record
    const result = addRecord(CONFIG.SHEETS.DISPOSAL, disposalRecord);

    if (!result.success) {
      return result;
    }

    // Send approval request email to approver
    const emailResult = sendDisposalApprovalEmail(disposalId, disposalRecord, asset);

    if (emailResult.success) {
      updateRecord(CONFIG.SHEETS.DISPOSAL, 'Disposal ID', disposalId, {
        'Email Sent': 'Yes'
      });
    }

    return {
      success: true,
      message: 'Disposal request submitted successfully and sent for approval',
      disposalId: disposalId,
      data: disposalRecord,
      emailSent: emailResult.success
    };

  } catch (error) {
    console.error('Error submitting disposal form:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Approve an asset disposal request
 * @param {Object} approvalData Approval data from approver
 * @return {Object} Result object
 */
function approveDisposal(approvalData) {
  try {
    const { disposalId, approverSignature, approvalNotes, approved } = approvalData;

    // Validate disposal request exists
    const disposalRecord = getRecord(CONFIG.SHEETS.DISPOSAL, 'Disposal ID', disposalId);
    if (!disposalRecord) {
      return {
        success: false,
        message: `Disposal request '${disposalId}' not found`
      };
    }

    if (disposalRecord['Status'] !== 'Pending Approval') {
      return {
        success: false,
        message: 'This disposal request has already been processed'
      };
    }

    const newStatus = approved ? 'Approved' : 'Rejected';
    const updateData = {
      'Approver Signature': approverSignature || '',
      'Approval Date': new Date(),
      'Status': newStatus,
      'Notes': (disposalRecord['Notes'] || '') + '\n' + (approvalNotes || '')
    };

    const result = updateRecord(CONFIG.SHEETS.DISPOSAL, 'Disposal ID', disposalId, updateData);

    if (!result.success) {
      return result;
    }

    if (approved) {
      // Update asset status to disposed
      const assetUpdateResult = updateAssetToDisposed(disposalRecord['Asset Tag'], disposalId);
      if (!assetUpdateResult.success) {
        // Rollback disposal approval if asset update fails
        updateRecord(CONFIG.SHEETS.DISPOSAL, 'Disposal ID', disposalId, {
          'Status': 'Pending Approval',
          'Approver Signature': '',
          'Approval Date': ''
        });
        return assetUpdateResult;
      }

      // Generate disposal certificate PDF
      generateDisposalPDF(disposalId);
    }

    // Send notification to IT personnel about approval/rejection
    sendDisposalStatusNotification(disposalId, disposalRecord, approved);

    return {
      success: true,
      message: `Disposal request ${approved ? 'approved' : 'rejected'} successfully`,
      approved: approved,
      disposalId: disposalId
    };

  } catch (error) {
    console.error('Error approving disposal:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get disposal request by ID
 * @param {string} disposalId Disposal ID
 * @return {Object|null} Disposal data or null
 */
function getDisposalRequest(disposalId) {
  try {
    return getRecord(CONFIG.SHEETS.DISPOSAL, 'Disposal ID', disposalId);
  } catch (error) {
    console.error('Error getting disposal request:', error);
    return null;
  }
}

/**
 * Get all disposal requests with optional filters
 * @param {Object} filters Optional filters
 * @return {Array} Array of disposal requests
 */
function getDisposalRequests(filters = {}) {
  try {
    return searchRecords(CONFIG.SHEETS.DISPOSAL, filters);
  } catch (error) {
    console.error('Error getting disposal requests:', error);
    return [];
  }
}

/**
 * Get disposal requests by status
 * @param {string} status Disposal status
 * @return {Array} Array of disposal requests
 */
function getDisposalsByStatus(status) {
  try {
    return searchRecords(CONFIG.SHEETS.DISPOSAL, { 'Status': status });
  } catch (error) {
    console.error('Error getting disposals by status:', error);
    return [];
  }
}

/**
 * Get pending approvals (disposal requests awaiting approval)
 * @return {Array} Array of pending disposal requests
 */
function getPendingApprovals() {
  try {
    return searchRecords(CONFIG.SHEETS.DISPOSAL, { 'Status': 'Pending Approval' });
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    return [];
  }
}

/**
 * Get disposal requests by approver
 * @param {string} approverEmail Approver's email
 * @return {Array} Array of disposal requests for the approver
 */
function getDisposalsByApprover(approverEmail) {
  try {
    return searchRecords(CONFIG.SHEETS.DISPOSAL, { 'Approver Email': approverEmail });
  } catch (error) {
    console.error('Error getting disposals by approver:', error);
    return [];
  }
}

/**
 * Update asset status to disposed
 * @param {string} assetTag Asset tag
 * @param {string} disposalId Disposal ID
 * @return {Object} Result object
 */
function updateAssetToDisposed(assetTag, disposalId) {
  try {
    const updateData = {
      'Status': 'Disposed',
      'Assigned To': '',
      'Assignment Date': '',
      'Notes': `Asset disposed via disposal request ${disposalId} on ${new Date().toDateString()}`
    };

    return updateRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', assetTag, updateData);

  } catch (error) {
    console.error('Error updating asset to disposed:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Generate a unique disposal ID
 * @return {string} Unique disposal ID
 */
function generateDisposalId() {
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DISP-${timestamp}-${random}`;
}

/**
 * Get disposal statistics
 * @return {Object} Statistics object
 */
function getDisposalStats() {
  try {
    const disposals = getAllRecords(CONFIG.SHEETS.DISPOSAL);

    const stats = {
      totalDisposals: disposals.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      byMethod: {},
      byMonth: {},
      totalValue: 0,
      recentDisposals: []
    };

    // Process each disposal
    disposals.forEach(disposal => {
      // Count by status
      switch (disposal['Status']) {
        case 'Pending Approval':
          stats.pending++;
          break;
        case 'Approved':
          stats.approved++;
          break;
        case 'Rejected':
          stats.rejected++;
          break;
      }

      // Count by method
      const method = disposal['Disposal Method'] || 'Unknown';
      stats.byMethod[method] = (stats.byMethod[method] || 0) + 1;

      // Count by month
      const disposalDate = new Date(disposal['Disposal Date']);
      const monthKey = Utilities.formatDate(disposalDate, Session.getScriptTimeZone(), 'yyyy-MM');
      stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;

      // Calculate total value
      const value = parseFloat(disposal['Disposal Value']) || 0;
      stats.totalValue += value;
    });

    // Get recent disposals (last 10)
    stats.recentDisposals = disposals
      .sort((a, b) => new Date(b['Disposal Date']) - new Date(a['Disposal Date']))
      .slice(0, 10);

    return stats;

  } catch (error) {
    console.error('Error getting disposal stats:', error);
    return { error: error.toString() };
  }
}

/**
 * Get overdue approvals (pending approvals for more than specified days)
 * @param {number} daysOverdue Number of days to consider overdue
 * @return {Array} Array of overdue disposal requests
 */
function getOverdueApprovals(daysOverdue = 5) {
  try {
    const pendingDisposals = searchRecords(CONFIG.SHEETS.DISPOSAL, { 'Status': 'Pending Approval' });
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

    return pendingDisposals.filter(disposal => {
      const createdDate = new Date(disposal['Created Date']);
      return createdDate < cutoffDate;
    });

  } catch (error) {
    console.error('Error getting overdue approvals:', error);
    return [];
  }
}

/**
 * Send reminder emails for overdue approvals
 * @return {Object} Result object with count of reminders sent
 */
function sendOverdueApprovalReminders() {
  try {
    const overdueDisposals = getOverdueApprovals(5);
    let remindersSent = 0;

    overdueDisposals.forEach(disposal => {
      try {
        const asset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', disposal['Asset Tag']);
        if (asset) {
          const emailResult = sendDisposalApprovalEmail(disposal['Disposal ID'], disposal, asset, true);
          if (emailResult.success) {
            remindersSent++;
          }
        }
      } catch (error) {
        console.error(`Error sending approval reminder for disposal ${disposal['Disposal ID']}:`, error);
      }
    });

    return {
      success: true,
      message: `Sent ${remindersSent} approval reminder emails`,
      remindersSent: remindersSent,
      totalOverdue: overdueDisposals.length
    };

  } catch (error) {
    console.error('Error sending overdue approval reminders:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Generate disposal report
 * @param {Object} options Report options
 * @return {Object} Report data
 */
function generateDisposalReport(options = {}) {
  try {
    const {
      startDate = null,
      endDate = null,
      method = null,
      status = null,
      includeAssetDetails = true
    } = options;

    let disposals = getAllRecords(CONFIG.SHEETS.DISPOSAL);

    // Apply filters
    if (startDate) {
      const start = new Date(startDate);
      disposals = disposals.filter(d => new Date(d['Disposal Date']) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      disposals = disposals.filter(d => new Date(d['Disposal Date']) <= end);
    }

    if (method) {
      disposals = disposals.filter(d => d['Disposal Method'] === method);
    }

    if (status) {
      disposals = disposals.filter(d => d['Status'] === status);
    }

    const report = {
      generatedDate: new Date(),
      generatedBy: Session.getActiveUser().getEmail(),
      totalDisposals: disposals.length,
      filters: options,
      summary: {
        totalValue: 0,
        byMethod: {},
        byStatus: {},
        byMonth: {}
      },
      disposals: []
    };

    // Process disposals
    disposals.forEach(disposal => {
      // Add asset details if requested
      if (includeAssetDetails) {
        const asset = getRecord(CONFIG.SHEETS.ASSETS, 'Asset Tag', disposal['Asset Tag']);
        disposal.assetDetails = asset;
      }

      // Update summary statistics
      const value = parseFloat(disposal['Disposal Value']) || 0;
      report.summary.totalValue += value;

      const method = disposal['Disposal Method'] || 'Unknown';
      report.summary.byMethod[method] = (report.summary.byMethod[method] || 0) + 1;

      const status = disposal['Status'] || 'Unknown';
      report.summary.byStatus[status] = (report.summary.byStatus[status] || 0) + 1;

      const month = Utilities.formatDate(new Date(disposal['Disposal Date']), Session.getScriptTimeZone(), 'yyyy-MM');
      report.summary.byMonth[month] = (report.summary.byMonth[month] || 0) + 1;

      report.disposals.push(disposal);
    });

    return report;

  } catch (error) {
    console.error('Error generating disposal report:', error);
    return {
      error: error.toString()
    };
  }
}

/**
 * Cancel a pending disposal request
 * @param {string} disposalId Disposal ID
 * @param {string} reason Cancellation reason
 * @return {Object} Result object
 */
function cancelDisposalRequest(disposalId, reason = '') {
  try {
    const disposalRecord = getRecord(CONFIG.SHEETS.DISPOSAL, 'Disposal ID', disposalId);
    if (!disposalRecord) {
      return {
        success: false,
        message: `Disposal request '${disposalId}' not found`
      };
    }

    if (disposalRecord['Status'] !== 'Pending Approval') {
      return {
        success: false,
        message: 'Only pending disposal requests can be cancelled'
      };
    }

    const updateData = {
      'Status': 'Cancelled',
      'Notes': (disposalRecord['Notes'] || '') + '\n' + `Cancelled on ${new Date().toDateString()}. Reason: ${reason || 'Not specified'}`
    };

    const result = updateRecord(CONFIG.SHEETS.DISPOSAL, 'Disposal ID', disposalId, updateData);

    if (result.success) {
      // Send cancellation notification to approver
      sendDisposalCancellationNotification(disposalId, disposalRecord, reason);
    }

    return result;

  } catch (error) {
    console.error('Error cancelling disposal request:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}