/**
 * Web Interface Functions
 * Wrapper functions for the HTML pages to call Google Apps Script backend
 */

/**
 * Get all assets for the inventory page
 * @return {Array} Array of all assets
 */
function getAllAssets() {
  try {
    return getAssets();
  } catch (error) {
    console.error('Error in getAllAssets:', error);
    return [];
  }
}

/**
 * Get available assets for accountability form
 * @return {Array} Array of available assets
 */
function getAvailableAssets() {
  try {
    return getAssetsByStatus('Available');
  } catch (error) {
    console.error('Error in getAvailableAssets:', error);
    return [];
  }
}

/**
 * Get disposable assets (assets that can be disposed)
 * @return {Array} Array of disposable assets
 */
function getDisposableAssets() {
  try {
    // Get assets that are not already disposed
    const allAssets = getAssets();
    return allAssets.filter(asset => asset['Status'] !== 'Disposed');
  } catch (error) {
    console.error('Error in getDisposableAssets:', error);
    return [];
  }
}

/**
 * Get accountability records for the accountability page
 * @return {Array} Array of accountability records
 */
function getAccountabilityRecords() {
  try {
    return getAccountabilityForms();
  } catch (error) {
    console.error('Error in getAccountabilityRecords:', error);
    return [];
  }
}

/**
 * Get disposal records for the disposal page
 * @return {Array} Array of disposal records
 */
function getDisposalRecords() {
  try {
    return getDisposalRequests();
  } catch (error) {
    console.error('Error in getDisposalRecords:', error);
    return [];
  }
}

/**
 * Process disposal approval
 * @param {Object} approvalData Approval data
 * @return {Object} Result object
 */
function processDisposalApproval(approvalData) {
  try {
    return approveDisposal(approvalData);
  } catch (error) {
    console.error('Error in processDisposalApproval:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get report data for the reports page
 * @param {Object} filters Report filters
 * @return {Object} Report data object
 */
function getReportData(filters = {}) {
  try {
    const data = {
      summary: getSystemStats(),
      statusDistribution: getStatusDistribution(),
      categoryDistribution: getCategoryDistribution(),
      timeline: getAssetTimeline(),
      conditionReport: getConditionReport(),
      topValueAssets: getTopValueAssets(),
      utilizationReport: getUtilizationReport(),
      warrantyReport: getWarrantyReport(),
      compliance: getComplianceMetrics()
    };

    return data;
  } catch (error) {
    console.error('Error in getReportData:', error);
    return {
      summary: { totalAssets: 0, availableAssets: 0, assignedAssets: 0, totalValue: 0 },
      statusDistribution: { labels: [], values: [] },
      categoryDistribution: { labels: [], values: [] },
      timeline: { monthly: { labels: [], values: [] } },
      conditionReport: [],
      topValueAssets: [],
      utilizationReport: [],
      warrantyReport: [],
      compliance: { securityCompliance: 0, trackingCompliance: 0, documentationCompliance: 0, approvalCompliance: 0 }
    };
  }
}

/**
 * Export report functionality
 * @param {Object} options Export options
 * @return {Object} Result object
 */
function exportReport(options) {
  try {
    // This is a placeholder - implement actual export functionality
    return {
      success: true,
      message: 'Report export functionality is not yet implemented. This is a placeholder.'
    };
  } catch (error) {
    console.error('Error in exportReport:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

// Helper functions for reports

/**
 * Get status distribution for charts
 * @return {Object} Status distribution data
 */
function getStatusDistribution() {
  try {
    const assets = getAssets();
    const statusCount = {};

    assets.forEach(asset => {
      const status = asset['Status'] || 'Unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return {
      labels: Object.keys(statusCount),
      values: Object.values(statusCount)
    };
  } catch (error) {
    console.error('Error in getStatusDistribution:', error);
    return { labels: [], values: [] };
  }
}

/**
 * Get category distribution for charts
 * @return {Object} Category distribution data
 */
function getCategoryDistribution() {
  try {
    const assets = getAssets();
    const categoryCount = {};

    assets.forEach(asset => {
      const category = asset['Category'] || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return {
      labels: Object.keys(categoryCount),
      values: Object.values(categoryCount)
    };
  } catch (error) {
    console.error('Error in getCategoryDistribution:', error);
    return { labels: [], values: [] };
  }
}

/**
 * Get asset timeline data
 * @return {Object} Timeline data
 */
function getAssetTimeline() {
  try {
    const assets = getAssets();
    const monthlyData = {};

    assets.forEach(asset => {
      if (asset['Date Received']) {
        const date = new Date(asset['Date Received']);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    const sortedKeys = Object.keys(monthlyData).sort();

    return {
      monthly: {
        labels: sortedKeys,
        values: sortedKeys.map(key => monthlyData[key])
      }
    };
  } catch (error) {
    console.error('Error in getAssetTimeline:', error);
    return { monthly: { labels: [], values: [] } };
  }
}

/**
 * Get condition report
 * @return {Array} Condition report data
 */
function getConditionReport() {
  try {
    const assets = getAssets();
    const conditionCount = {};
    const conditionValue = {};

    assets.forEach(asset => {
      const condition = asset['Condition'] || 'Unknown';
      const value = parseFloat(asset['Purchase Price']) || 0;

      conditionCount[condition] = (conditionCount[condition] || 0) + 1;
      conditionValue[condition] = (conditionValue[condition] || 0) + value;
    });

    const totalAssets = assets.length;

    return Object.keys(conditionCount).map(condition => ({
      condition: condition,
      count: conditionCount[condition],
      percentage: Math.round((conditionCount[condition] / totalAssets) * 100),
      totalValue: conditionValue[condition],
      avgAge: 'N/A' // Placeholder - calculate based on date received
    }));
  } catch (error) {
    console.error('Error in getConditionReport:', error);
    return [];
  }
}

/**
 * Get top value assets
 * @return {Array} Top value assets
 */
function getTopValueAssets() {
  try {
    const assets = getAssets();

    return assets
      .filter(asset => asset['Purchase Price'])
      .sort((a, b) => parseFloat(b['Purchase Price']) - parseFloat(a['Purchase Price']))
      .slice(0, 10)
      .map(asset => ({
        ...asset,
        'Current Value': asset['Purchase Price'], // Simplified - should calculate depreciation
        'Age': 'N/A' // Placeholder
      }));
  } catch (error) {
    console.error('Error in getTopValueAssets:', error);
    return [];
  }
}

/**
 * Get utilization report
 * @return {Array} Utilization report data
 */
function getUtilizationReport() {
  try {
    const accountabilityRecords = getAccountabilityForms();
    const departmentData = {};

    accountabilityRecords.forEach(record => {
      const dept = record['Department'] || 'Unknown';
      if (!departmentData[dept]) {
        departmentData[dept] = {
          department: dept,
          assetsAssigned: 0,
          totalValue: 0,
          utilizationRate: 0,
          avgAge: 'N/A'
        };
      }

      departmentData[dept].assetsAssigned++;
      departmentData[dept].totalValue += parseFloat(record['Asset Value']) || 0;
    });

    return Object.values(departmentData);
  } catch (error) {
    console.error('Error in getUtilizationReport:', error);
    return [];
  }
}

/**
 * Get warranty report
 * @return {Array} Warranty report data
 */
function getWarrantyReport() {
  try {
    const assets = getAssets();
    const today = new Date();

    return assets
      .filter(asset => asset['Warranty Expiry'])
      .map(asset => {
        const expiryDate = new Date(asset['Warranty Expiry']);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        let warrantyStatus = 'Active';
        if (daysUntilExpiry < 0) {
          warrantyStatus = 'Expired';
        } else if (daysUntilExpiry < 30) {
          warrantyStatus = 'Expiring';
        }

        return {
          ...asset,
          daysUntilExpiry: daysUntilExpiry,
          warrantyStatus: warrantyStatus
        };
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  } catch (error) {
    console.error('Error in getWarrantyReport:', error);
    return [];
  }
}

/**
 * Get compliance metrics
 * @return {Object} Compliance metrics
 */
function getComplianceMetrics() {
  try {
    const assets = getAssets();
    const disposalRecords = getDisposalRequests();
    const accountabilityRecords = getAccountabilityForms();

    // Simplified compliance calculations
    const totalAssets = assets.length;
    const disposedWithSecurity = disposalRecords.filter(d => d['Data Wiped'] === true).length;
    const trackedAssets = accountabilityRecords.length;
    const documentedAssets = assets.filter(a => a['Description']).length;
    const approvedDisposals = disposalRecords.filter(d => d['Status'] === 'Approved').length;

    return {
      securityCompliance: totalAssets > 0 ? Math.round((disposedWithSecurity / disposalRecords.length) * 100) || 0 : 0,
      trackingCompliance: totalAssets > 0 ? Math.round((trackedAssets / totalAssets) * 100) : 0,
      documentationCompliance: totalAssets > 0 ? Math.round((documentedAssets / totalAssets) * 100) : 0,
      approvalCompliance: disposalRecords.length > 0 ? Math.round((approvedDisposals / disposalRecords.length) * 100) : 0
    };
  } catch (error) {
    console.error('Error in getComplianceMetrics:', error);
    return {
      securityCompliance: 0,
      trackingCompliance: 0,
      documentationCompliance: 0,
      approvalCompliance: 0
    };
  }
}

/**
 * Add employee record
 * @param {Object} employeeData Employee data
 * @return {Object} Result object
 */
function addEmployee(employeeData) {
  try {
    return addRecord('EMPLOYEES', employeeData);
  } catch (error) {
    console.error('Error in addEmployee:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}