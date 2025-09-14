/**
 * Dashboard and Analytics Functions
 * Provides comprehensive data visualization and reporting capabilities
 */

/**
 * Get complete dashboard data
 * @return {Object} Comprehensive dashboard data
 */
function getDashboardData() {
  try {
    const dashboardData = {
      overview: getSystemOverview(),
      assetMetrics: getAssetMetrics(),
      accountabilityMetrics: getAccountabilityMetrics(),
      disposalMetrics: getDisposalMetrics(),
      recentActivity: getRecentActivity(),
      alerts: getSystemAlerts(),
      trends: getTrendData(),
      topUsers: getTopAssetUsers(),
      lastUpdated: new Date()
    };

    return dashboardData;

  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return {
      error: error.toString(),
      lastUpdated: new Date()
    };
  }
}

/**
 * Get system overview statistics
 * @return {Object} System overview data
 */
function getSystemOverview() {
  try {
    const overview = {
      totalAssets: 0,
      availableAssets: 0,
      assignedAssets: 0,
      disposedAssets: 0,
      underMaintenance: 0,
      totalEmployees: 0,
      activeEmployees: 0,
      pendingAccountability: 0,
      pendingDisposals: 0,
      totalValue: 0
    };

    // Asset statistics
    const assets = getAllRecords(CONFIG.SHEETS.ASSETS);
    overview.totalAssets = assets.length;

    assets.forEach(asset => {
      switch (asset['Status']) {
        case 'Available':
          overview.availableAssets++;
          break;
        case 'Assigned':
          overview.assignedAssets++;
          break;
        case 'Disposed':
          overview.disposedAssets++;
          break;
        case 'Under Maintenance':
          overview.underMaintenance++;
          break;
      }

      const price = parseFloat(asset['Purchase Price']) || 0;
      overview.totalValue += price;
    });

    // Employee statistics
    const employees = getAllRecords(CONFIG.SHEETS.EMPLOYEES);
    overview.totalEmployees = employees.length;
    overview.activeEmployees = employees.filter(emp => emp['Status'] === 'Active').length;

    // Accountability statistics
    const accountabilityForms = getAllRecords(CONFIG.SHEETS.ACCOUNTABILITY);
    overview.pendingAccountability = accountabilityForms.filter(form => form['Status'] === 'Pending Employee Confirmation').length;

    // Disposal statistics
    const disposals = getAllRecords(CONFIG.SHEETS.DISPOSAL);
    overview.pendingDisposals = disposals.filter(disp => disp['Status'] === 'Pending Approval').length;

    return overview;

  } catch (error) {
    console.error('Error getting system overview:', error);
    return { error: error.toString() };
  }
}

/**
 * Get detailed asset metrics
 * @return {Object} Asset metrics data
 */
function getAssetMetrics() {
  try {
    const assets = getAllRecords(CONFIG.SHEETS.ASSETS);

    const metrics = {
      byStatus: {},
      byCondition: {},
      byCategory: {},
      byLocation: {},
      byAge: { '0-1 years': 0, '1-3 years': 0, '3-5 years': 0, '5+ years': 0 },
      warrantyExpiring: 0,
      highValueAssets: 0,
      utilizationRate: 0
    };

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    assets.forEach(asset => {
      // By status
      const status = asset['Status'] || 'Unknown';
      metrics.byStatus[status] = (metrics.byStatus[status] || 0) + 1;

      // By condition
      const condition = asset['Condition'] || 'Unknown';
      metrics.byCondition[condition] = (metrics.byCondition[condition] || 0) + 1;

      // By category
      const category = asset['Category'] || 'Unknown';
      metrics.byCategory[category] = (metrics.byCategory[category] || 0) + 1;

      // By location
      const location = asset['Location'] || 'Unknown';
      metrics.byLocation[location] = (metrics.byLocation[location] || 0) + 1;

      // By age
      const receivedDate = new Date(asset['Date Received']);
      if (receivedDate > oneYearAgo) {
        metrics.byAge['0-1 years']++;
      } else if (receivedDate > threeYearsAgo) {
        metrics.byAge['1-3 years']++;
      } else if (receivedDate > fiveYearsAgo) {
        metrics.byAge['3-5 years']++;
      } else {
        metrics.byAge['5+ years']++;
      }

      // Warranty expiring
      const warrantyExpiry = new Date(asset['Warranty Expiry']);
      if (warrantyExpiry <= thirtyDaysFromNow && warrantyExpiry >= now) {
        metrics.warrantyExpiring++;
      }

      // High value assets (over $1000)
      const price = parseFloat(asset['Purchase Price']) || 0;
      if (price > 1000) {
        metrics.highValueAssets++;
      }
    });

    // Calculate utilization rate
    metrics.utilizationRate = assets.length > 0 ?
      Math.round((metrics.byStatus['Assigned'] || 0) / assets.length * 100) : 0;

    return metrics;

  } catch (error) {
    console.error('Error getting asset metrics:', error);
    return { error: error.toString() };
  }
}

/**
 * Get accountability metrics
 * @return {Object} Accountability metrics data
 */
function getAccountabilityMetrics() {
  try {
    const forms = getAllRecords(CONFIG.SHEETS.ACCOUNTABILITY);

    const metrics = {
      totalForms: forms.length,
      byStatus: {},
      byDepartment: {},
      averageConfirmationTime: 0,
      monthlyAssignments: {},
      topEmployees: []
    };

    let confirmationTimes = [];

    forms.forEach(form => {
      // By status
      const status = form['Status'] || 'Unknown';
      metrics.byStatus[status] = (metrics.byStatus[status] || 0) + 1;

      // By department
      const department = form['Department'] || 'Unknown';
      metrics.byDepartment[department] = (metrics.byDepartment[department] || 0) + 1;

      // Monthly assignments
      const assignmentDate = new Date(form['Assignment Date']);
      const monthKey = Utilities.formatDate(assignmentDate, Session.getScriptTimeZone(), 'yyyy-MM');
      metrics.monthlyAssignments[monthKey] = (metrics.monthlyAssignments[monthKey] || 0) + 1;

      // Confirmation times
      if (form['Confirmation Date'] && form['Assignment Date']) {
        const assignDate = new Date(form['Assignment Date']);
        const confirmDate = new Date(form['Confirmation Date']);
        const timeDiff = confirmDate - assignDate;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        confirmationTimes.push(daysDiff);
      }
    });

    // Calculate average confirmation time
    if (confirmationTimes.length > 0) {
      metrics.averageConfirmationTime = Math.round(
        confirmationTimes.reduce((sum, time) => sum + time, 0) / confirmationTimes.length * 10
      ) / 10;
    }

    // Get top employees by asset count
    const employees = getAllRecords(CONFIG.SHEETS.EMPLOYEES);
    metrics.topEmployees = employees
      .filter(emp => emp['Assets Assigned'] > 0)
      .sort((a, b) => (b['Assets Assigned'] || 0) - (a['Assets Assigned'] || 0))
      .slice(0, 10)
      .map(emp => ({
        name: emp['Full Name'],
        email: emp['Email'],
        department: emp['Department'],
        assetsCount: emp['Assets Assigned'] || 0
      }));

    return metrics;

  } catch (error) {
    console.error('Error getting accountability metrics:', error);
    return { error: error.toString() };
  }
}

/**
 * Get disposal metrics
 * @return {Object} Disposal metrics data
 */
function getDisposalMetrics() {
  try {
    const disposals = getAllRecords(CONFIG.SHEETS.DISPOSAL);

    const metrics = {
      totalDisposals: disposals.length,
      byStatus: {},
      byMethod: {},
      totalValue: 0,
      monthlyDisposals: {},
      averageApprovalTime: 0
    };

    let approvalTimes = [];

    disposals.forEach(disposal => {
      // By status
      const status = disposal['Status'] || 'Unknown';
      metrics.byStatus[status] = (metrics.byStatus[status] || 0) + 1;

      // By method
      const method = disposal['Disposal Method'] || 'Unknown';
      metrics.byMethod[method] = (metrics.byMethod[method] || 0) + 1;

      // Total value
      const value = parseFloat(disposal['Disposal Value']) || 0;
      metrics.totalValue += value;

      // Monthly disposals
      const disposalDate = new Date(disposal['Disposal Date']);
      const monthKey = Utilities.formatDate(disposalDate, Session.getScriptTimeZone(), 'yyyy-MM');
      metrics.monthlyDisposals[monthKey] = (metrics.monthlyDisposals[monthKey] || 0) + 1;

      // Approval times
      if (disposal['Approval Date'] && disposal['Created Date']) {
        const createdDate = new Date(disposal['Created Date']);
        const approvalDate = new Date(disposal['Approval Date']);
        const timeDiff = approvalDate - createdDate;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        approvalTimes.push(daysDiff);
      }
    });

    // Calculate average approval time
    if (approvalTimes.length > 0) {
      metrics.averageApprovalTime = Math.round(
        approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length * 10
      ) / 10;
    }

    return metrics;

  } catch (error) {
    console.error('Error getting disposal metrics:', error);
    return { error: error.toString() };
  }
}

/**
 * Get recent system activity
 * @param {number} limit Number of recent activities to return
 * @return {Array} Recent activity items
 */
function getRecentActivity(limit = 20) {
  try {
    const activities = [];

    // Get recent audit log entries
    const auditEntries = getAllRecords(CONFIG.SHEETS.AUDIT_LOG);
    auditEntries
      .sort((a, b) => new Date(b['Timestamp']) - new Date(a['Timestamp']))
      .slice(0, limit)
      .forEach(entry => {
        activities.push({
          timestamp: entry['Timestamp'],
          user: entry['User Email'],
          action: entry['Action Type'],
          entity: entry['Entity Type'],
          entityId: entry['Entity ID'],
          details: entry['Details'] || `${entry['Action Type']} ${entry['Entity Type']}`,
          type: 'audit'
        });
      });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return activities.slice(0, limit);

  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

/**
 * Get system alerts and notifications
 * @return {Array} System alerts
 */
function getSystemAlerts() {
  try {
    const alerts = [];

    // Warranty expiration alerts
    const expiringWarranties = getExpiringWarranties(30);
    if (expiringWarranties.length > 0) {
      alerts.push({
        type: 'warning',
        category: 'warranty',
        title: 'Warranties Expiring Soon',
        message: `${expiringWarranties.length} assets have warranties expiring within 30 days`,
        count: expiringWarranties.length,
        priority: 'medium'
      });
    }

    // Overdue confirmations
    const overdueConfirmations = getOverdueConfirmations(3);
    if (overdueConfirmations.length > 0) {
      alerts.push({
        type: 'error',
        category: 'accountability',
        title: 'Overdue Confirmations',
        message: `${overdueConfirmations.length} accountability forms are overdue for employee confirmation`,
        count: overdueConfirmations.length,
        priority: 'high'
      });
    }

    // Pending approvals
    const pendingApprovals = getPendingApprovals();
    if (pendingApprovals.length > 0) {
      alerts.push({
        type: 'info',
        category: 'disposal',
        title: 'Pending Disposal Approvals',
        message: `${pendingApprovals.length} disposal requests are waiting for approval`,
        count: pendingApprovals.length,
        priority: 'medium'
      });
    }

    // Overdue approvals
    const overdueApprovals = getOverdueApprovals(5);
    if (overdueApprovals.length > 0) {
      alerts.push({
        type: 'warning',
        category: 'disposal',
        title: 'Overdue Approvals',
        message: `${overdueApprovals.length} disposal approvals are overdue`,
        count: overdueApprovals.length,
        priority: 'high'
      });
    }

    return alerts.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

  } catch (error) {
    console.error('Error getting system alerts:', error);
    return [];
  }
}

/**
 * Get trend data for charts
 * @return {Object} Trend data
 */
function getTrendData() {
  try {
    const trends = {
      assetsByMonth: {},
      assignmentsByMonth: {},
      disposalsByMonth: {},
      valueByMonth: {}
    };

    // Get data for the last 12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM');
      trends.assetsByMonth[monthKey] = 0;
      trends.assignmentsByMonth[monthKey] = 0;
      trends.disposalsByMonth[monthKey] = 0;
      trends.valueByMonth[monthKey] = 0;
    }

    // Asset additions by month
    const assets = getAllRecords(CONFIG.SHEETS.ASSETS);
    assets.forEach(asset => {
      const createdDate = new Date(asset['Created Date']);
      const monthKey = Utilities.formatDate(createdDate, Session.getScriptTimeZone(), 'yyyy-MM');
      if (trends.assetsByMonth[monthKey] !== undefined) {
        trends.assetsByMonth[monthKey]++;
        const value = parseFloat(asset['Purchase Price']) || 0;
        trends.valueByMonth[monthKey] += value;
      }
    });

    // Assignments by month
    const accountabilityForms = getAllRecords(CONFIG.SHEETS.ACCOUNTABILITY);
    accountabilityForms.forEach(form => {
      const assignmentDate = new Date(form['Assignment Date']);
      const monthKey = Utilities.formatDate(assignmentDate, Session.getScriptTimeZone(), 'yyyy-MM');
      if (trends.assignmentsByMonth[monthKey] !== undefined) {
        trends.assignmentsByMonth[monthKey]++;
      }
    });

    // Disposals by month
    const disposals = getAllRecords(CONFIG.SHEETS.DISPOSAL);
    disposals.forEach(disposal => {
      const disposalDate = new Date(disposal['Disposal Date']);
      const monthKey = Utilities.formatDate(disposalDate, Session.getScriptTimeZone(), 'yyyy-MM');
      if (trends.disposalsByMonth[monthKey] !== undefined) {
        trends.disposalsByMonth[monthKey]++;
      }
    });

    return trends;

  } catch (error) {
    console.error('Error getting trend data:', error);
    return { error: error.toString() };
  }
}

/**
 * Get top asset users
 * @param {number} limit Number of top users to return
 * @return {Array} Top users by asset count
 */
function getTopAssetUsers(limit = 10) {
  try {
    const employees = getAllRecords(CONFIG.SHEETS.EMPLOYEES);

    return employees
      .filter(emp => (emp['Assets Assigned'] || 0) > 0)
      .sort((a, b) => (b['Assets Assigned'] || 0) - (a['Assets Assigned'] || 0))
      .slice(0, limit)
      .map(emp => ({
        name: emp['Full Name'],
        email: emp['Email'],
        department: emp['Department'],
        position: emp['Position'],
        assetsCount: emp['Assets Assigned'] || 0,
        startDate: emp['Start Date']
      }));

  } catch (error) {
    console.error('Error getting top asset users:', error);
    return [];
  }
}

/**
 * Generate comprehensive system report
 * @param {Object} options Report options
 * @return {Object} Comprehensive report data
 */
function generateSystemReport(options = {}) {
  try {
    const {
      includeAssets = true,
      includeAccountability = true,
      includeDisposals = true,
      includeEmployees = true,
      startDate = null,
      endDate = null
    } = options;

    const report = {
      generatedDate: new Date(),
      generatedBy: Session.getActiveUser().getEmail(),
      reportOptions: options,
      summary: getSystemOverview(),
      sections: {}
    };

    if (includeAssets) {
      report.sections.assets = {
        metrics: getAssetMetrics(),
        data: getAllRecords(CONFIG.SHEETS.ASSETS)
      };
    }

    if (includeAccountability) {
      report.sections.accountability = {
        metrics: getAccountabilityMetrics(),
        data: getAllRecords(CONFIG.SHEETS.ACCOUNTABILITY)
      };
    }

    if (includeDisposals) {
      report.sections.disposals = {
        metrics: getDisposalMetrics(),
        data: getAllRecords(CONFIG.SHEETS.DISPOSAL)
      };
    }

    if (includeEmployees) {
      report.sections.employees = {
        data: getAllRecords(CONFIG.SHEETS.EMPLOYEES),
        topUsers: getTopAssetUsers()
      };
    }

    return report;

  } catch (error) {
    console.error('Error generating system report:', error);
    return {
      error: error.toString(),
      generatedDate: new Date(),
      generatedBy: Session.getActiveUser().getEmail()
    };
  }
}

/**
 * Get asset utilization report
 * @return {Object} Utilization report
 */
function getAssetUtilizationReport() {
  try {
    const assets = getAllRecords(CONFIG.SHEETS.ASSETS);
    const employees = getAllRecords(CONFIG.SHEETS.EMPLOYEES);

    const report = {
      totalAssets: assets.length,
      assignedAssets: assets.filter(a => a['Status'] === 'Assigned').length,
      availableAssets: assets.filter(a => a['Status'] === 'Available').length,
      utilizationRate: 0,
      byDepartment: {},
      underutilizedCategories: [],
      overutilizedDepartments: []
    };

    // Calculate overall utilization rate
    report.utilizationRate = report.totalAssets > 0 ?
      Math.round(report.assignedAssets / report.totalAssets * 100) : 0;

    // Utilization by department
    employees.forEach(emp => {
      if (emp['Department'] && emp['Assets Assigned']) {
        const dept = emp['Department'];
        if (!report.byDepartment[dept]) {
          report.byDepartment[dept] = {
            employees: 0,
            totalAssets: 0,
            averageAssetsPerEmployee: 0
          };
        }
        report.byDepartment[dept].employees++;
        report.byDepartment[dept].totalAssets += parseInt(emp['Assets Assigned']) || 0;
      }
    });

    // Calculate averages
    Object.keys(report.byDepartment).forEach(dept => {
      const deptData = report.byDepartment[dept];
      deptData.averageAssetsPerEmployee = deptData.employees > 0 ?
        Math.round(deptData.totalAssets / deptData.employees * 10) / 10 : 0;
    });

    return report;

  } catch (error) {
    console.error('Error getting asset utilization report:', error);
    return { error: error.toString() };
  }
}