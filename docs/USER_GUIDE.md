# IT Asset Inventory System - User Guide

This comprehensive guide explains how to use the IT Asset Inventory Management System effectively.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Asset Management](#asset-management)
4. [Accountability System](#accountability-system)
5. [Asset Disposal](#asset-disposal)
6. [Reports and Analytics](#reports-and-analytics)
7. [Common Workflows](#common-workflows)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the System

1. Open your web browser
2. Navigate to the web app URL provided by your administrator
3. You'll be automatically logged in using your Google account

### System Navigation

The system uses a navigation bar at the top with five main sections:

- **Dashboard:** Overview of system metrics and alerts
- **Inventory:** Manage IT assets (add, edit, delete)
- **Accountability:** Create and manage asset assignments
- **Disposal:** Handle asset disposal requests
- **Reports:** Generate reports and analytics

## Dashboard Overview

The dashboard provides a real-time overview of your IT asset inventory.

### Key Metrics Cards

- **Total Assets:** Complete count of all assets in the system
- **Available Assets:** Assets ready for assignment
- **Assigned Assets:** Assets currently assigned to employees
- **Pending Actions:** Items requiring attention (confirmations, approvals)

### System Alerts

The system automatically displays alerts for:

- **Warranty Expiration:** Assets with warranties expiring soon
- **Overdue Confirmations:** Employee confirmations past due date
- **Pending Approvals:** Disposal requests awaiting approval

### Charts and Analytics

- **Asset Status Distribution:** Visual breakdown of asset statuses
- **Asset Categories:** Distribution by device type
- **Recent Activity:** Latest system actions and changes

### Quick Actions

Use the Quick Actions panel to:

- Add new assets to inventory
- Assign assets to employees
- Submit disposal requests
- Generate system reports

## Asset Management

### Adding New Assets

1. Navigate to **Inventory** page
2. Click **"Add New Asset"** button
3. Fill in the required information:
   - **Serial Number:** Unique identifier (required)
   - **Category:** Select from dropdown (required)
   - **Brand:** Manufacturer name (required)
   - **Model:** Model name/number (required)
   - **Condition:** Current condition (required)
   - **Date Received:** When company received the asset (required)
   - **Purchase Price:** Original cost (optional)
   - **Warranty Expiry:** Warranty end date (optional)
   - **Location:** Current location (optional)
   - **Description:** Additional details (optional)

4. Click **"Save Asset"**

The system will automatically:
- Generate a unique asset tag (e.g., IT-1000)
- Set status to "Available"
- Record creation date and user

### Editing Assets

1. Navigate to **Inventory** page
2. Find the asset using search or filters
3. Click the **"Edit"** button for the asset
4. Modify the necessary fields
5. Click **"Update Asset"**

### Asset Status Management

Assets can have the following statuses:
- **Available:** Ready for assignment
- **Assigned:** Currently assigned to an employee
- **Under Maintenance:** Being repaired or serviced
- **Reserved:** Set aside for specific purpose
- **Disposed:** Permanently removed from inventory
- **Lost/Stolen:** Missing assets

### Bulk Operations

For multiple assets:
1. Use checkboxes to select multiple assets
2. Choose bulk action from dropdown
3. Confirm the operation

Available bulk operations:
- Update location
- Change status
- Export selected assets
- Generate asset labels

### Search and Filtering

Use the search and filter tools to find assets:

- **Text Search:** Search across all fields
- **Category Filter:** Filter by asset category
- **Status Filter:** Filter by current status
- **Location Filter:** Filter by current location
- **Date Range:** Filter by date received

## Accountability System

The accountability system tracks asset assignments to employees with proper documentation and signatures.

### Creating Accountability Forms

1. Navigate to **Accountability** page
2. Click **"New Assignment"** button
3. Complete the form:

#### Asset Selection
- **Asset Tag:** Select from available assets dropdown
- System displays asset details automatically

#### Employee Information
- **Employee Name:** Full name (required)
- **Employee Email:** Corporate email (required)
- **Employee ID:** Unique identifier (auto-generated if empty)
- **Department:** Employee's department (optional)
- **Position:** Job title (optional)

#### Assignment Details
- **IT Personnel:** Your name/email (auto-filled)
- **Assignment Notes:** Special instructions (optional)
- **IT Signature:** Digital signature (required)

4. Click **"Submit Assignment"**

### Employee Confirmation Process

After submission:
1. Employee receives email notification with asset details
2. Email includes confirmation link
3. Employee clicks link to access confirmation form
4. Employee reviews asset details
5. Employee provides digital signature
6. System generates PDF accountability document
7. IT personnel receives completion notification

### Managing Accountability Forms

View and manage accountability forms:

- **Pending Confirmations:** Forms waiting for employee confirmation
- **Completed Forms:** Fully signed and documented
- **Overdue Items:** Forms past confirmation deadline

### Asset Returns

When an employee returns an asset:
1. Navigate to **Accountability** page
2. Find the assignment record
3. Click **"Process Return"**
4. Document return condition
5. Provide IT signature
6. System generates return receipt

## Asset Disposal

The disposal system ensures proper authorization and documentation for asset disposal.

### Creating Disposal Requests

1. Navigate to **Disposal** page
2. Click **"New Disposal Request"**
3. Complete the disposal form:

#### Asset Information
- **Asset Tag:** Select asset to dispose
- System displays current asset details

#### Disposal Details
- **Disposal Method:** Choose from dropdown options:
  - Sold
  - Donated
  - Recycled
  - Destroyed
  - Returned to Vendor
  - Trade-in
  - Scrapped
- **Disposal Date:** When disposal will occur
- **Disposal Reason:** Explanation for disposal
- **Estimated Value:** Expected recovery value
- **Disposal Location:** Where disposal will take place
- **Certificate Number:** Third-party disposal certificate

#### Authorization
- **Approver Name:** Person who will approve (required)
- **Approver Email:** Approver's email (required)
- **IT Personnel:** Your information (auto-filled)
- **Additional Notes:** Special instructions

4. Click **"Submit Disposal Request"**

### Approval Process

After submission:
1. Approver receives email with disposal details
2. Email includes approval/rejection links
3. Approver reviews request details
4. Approver provides decision and digital signature
5. IT personnel receives status notification
6. If approved, system generates disposal certificate

### Disposal Status Tracking

Monitor disposal requests:
- **Pending Approval:** Awaiting approver decision
- **Approved:** Ready for disposal execution
- **Rejected:** Request declined by approver
- **Completed:** Disposal executed and documented

## Reports and Analytics

Generate comprehensive reports for asset management insights.

### Available Reports

#### System Overview Report
- Complete system statistics
- Asset distribution metrics
- Employee assignment data
- Recent activity summary

#### Asset Inventory Report
- Complete asset listing
- Filter by category, status, location
- Include/exclude disposed assets
- Custom date ranges

#### Accountability Report
- Assignment history
- Pending confirmations
- Employee asset assignments
- Accountability statistics

#### Disposal Report
- Disposal history and trends
- Disposal methods analysis
- Value recovery tracking
- Approval workflow metrics

#### Utilization Report
- Asset utilization rates
- Department-wise distribution
- Underutilized categories
- Optimization recommendations

### Generating Reports

1. Navigate to **Reports** page
2. Select report type
3. Configure options:
   - Date range
   - Filters
   - Output format (PDF, Excel, CSV)
   - Include/exclude sections
4. Click **"Generate Report"**
5. Download or view the report

### Scheduled Reports

Set up automatic report generation:
1. Configure report parameters
2. Set schedule (daily, weekly, monthly)
3. Specify recipients
4. System automatically sends reports

## Common Workflows

### New Employee Onboarding

1. **Add Employee** (if not exists):
   - Go to Accountability page
   - Employee info will be auto-created during first assignment

2. **Assign Assets:**
   - Create accountability form for each asset
   - Employee confirms receipt via email
   - Store signed documents

### Employee Departure

1. **Retrieve Assets:**
   - Identify all assigned assets
   - Process returns for each asset
   - Document asset condition

2. **Update Records:**
   - Mark employee as inactive
   - Clear asset assignments
   - Generate return documentation

### Asset Lifecycle Management

1. **Procurement:**
   - Add new asset to inventory
   - Record warranty information
   - Set appropriate location

2. **Deployment:**
   - Create accountability form
   - Assign to employee
   - Monitor confirmation

3. **Maintenance:**
   - Update status to "Under Maintenance"
   - Document service details
   - Return to available when complete

4. **Disposal:**
   - Submit disposal request
   - Obtain approval
   - Execute disposal
   - Update inventory

### Audit Preparation

1. **Generate Reports:**
   - System overview report
   - Complete asset inventory
   - Accountability documentation

2. **Verify Documentation:**
   - Check PDF storage
   - Review audit logs
   - Validate signatures

3. **Physical Verification:**
   - Export asset list for physical check
   - Update any discrepancies
   - Document findings

## Troubleshooting

### Common Issues and Solutions

#### Employee Not Receiving Emails

**Problem:** Employee doesn't receive accountability notification
**Solutions:**
- Check spam/junk folders
- Verify email address is correct
- Confirm email notifications are enabled
- Resend notification from system

#### PDF Generation Problems

**Problem:** PDF documents not generating
**Solutions:**
- Check Google Drive folder permissions
- Verify PDF generation is enabled in settings
- Try generating PDF manually
- Contact system administrator

#### Asset Not Appearing in Dropdown

**Problem:** Asset not available for assignment
**Solutions:**
- Check asset status (must be "Available")
- Verify asset exists in inventory
- Refresh the page
- Check for browser cache issues

#### Search Not Working

**Problem:** Cannot find assets using search
**Solutions:**
- Check spelling and try partial matches
- Use filters instead of text search
- Clear all filters and try again
- Verify asset data is complete

#### Permission Denied Errors

**Problem:** Cannot access certain functions
**Solutions:**
- Verify you're logged in with correct account
- Check if you have necessary permissions
- Contact system administrator
- Try logging out and back in

### Getting Help

If you encounter issues not covered in this guide:

1. **Check System Logs:**
   - System maintains audit logs of all actions
   - Error messages may provide clues

2. **Contact IT Support:**
   - Provide specific error messages
   - Include steps to reproduce the issue
   - Note the time when error occurred

3. **Documentation Resources:**
   - Review SETUP.md for configuration issues
   - Check API_DOCS.md for technical details
   - Consult system administrator

### Best Practices

1. **Data Entry:**
   - Use consistent naming conventions
   - Include all required information
   - Double-check critical data like serial numbers

2. **Regular Maintenance:**
   - Review pending actions weekly
   - Update asset conditions regularly
   - Clean up old disposal requests

3. **Documentation:**
   - Keep PDF documents organized
   - Maintain paper backup for critical assets
   - Review accountability forms quarterly

4. **Security:**
   - Log out when finished
   - Don't share account credentials
   - Report suspicious activities