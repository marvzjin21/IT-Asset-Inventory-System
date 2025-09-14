# IT Asset Inventory System

A comprehensive Google Apps Script-based system for managing and tracking IT assets within an organization.

## Features

### Core Functionality
- **Asset Inventory Management** - Add, edit, delete, and track IT assets
- **Accountability System** - Employee assignment with digital forms and signatures
- **Asset Disposal Management** - Track disposed assets with approval workflow
- **Dashboard & Analytics** - Real-time reports and asset utilization data
- **PDF Documentation** - Automated form generation and Google Drive storage

### Key Fields
- **Item Serial Number** - Unique identifier for each asset
- **Asset Tag** - Auto-incrementing tag number
- **Condition** - Brand New, Good, Fair, Poor
- **Date Received** - When the company received the asset
- **Employee Assignment** - Current user of the asset
- **IT Personnel** - Staff member handling the asset

### System Components

#### 1. Inventory Management
- CRUD operations for all IT assets
- Auto-incrementing asset tags
- Asset status tracking (Available, Assigned, Under Maintenance, Disposed)
- Asset categories and location tracking
- Warranty management with expiration alerts

#### 2. Accountability Form System
- Employee information capture (Name, Email)
- Asset assignment dropdown
- IT personnel details and digital signature
- Automatic email confirmation to employee
- PDF generation and storage
- Employee signature confirmation

#### 3. Asset Disposal Management
- Disposal method tracking
- IT personnel and approver details
- Email notifications to approvers
- PDF documentation generation
- Disposal date and reason tracking

#### 4. Dashboard & Analytics
- Assets by status (Available, Assigned, Disposed)
- Assets by condition
- Employee asset assignments
- Disposal statistics
- Maintenance schedules

## Google Apps Script Setup

### Prerequisites
- Google Account
- Google Drive access
- Google Sheets access

### Installation Steps

1. **Create Google Apps Script Project**
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"
   - Copy and paste the provided code files

2. **Set up Google Sheets Database**
   - Create a new Google Sheets file
   - Copy the spreadsheet ID to the configuration
   - The system will automatically create the required sheets

3. **Configure Google Drive Folder**
   - Create a folder in Google Drive for PDF storage
   - Copy the folder ID to the configuration

4. **Deploy as Web App**
   - Click "Deploy" > "New Deployment"
   - Choose "Web App" as type
   - Set execute as "Me" and access to "Anyone"
   - Copy the web app URL

### File Structure

```
IT-Asset-Inventory-System/
├── gas-files/
│   ├── Code.gs              # Main server-side functions
│   ├── Database.gs          # Google Sheets database operations
│   ├── InventoryManager.gs  # Asset inventory CRUD operations
│   ├── AccountabilityForm.gs # Accountability system
│   ├── AssetDisposal.gs     # Disposal management
│   ├── Dashboard.gs         # Analytics and reporting
│   ├── PDFGenerator.gs      # PDF creation and storage
│   ├── EmailService.gs      # Email notifications
│   └── Utils.gs             # Utility functions
├── html-files/
│   ├── Index.html           # Main dashboard interface
│   ├── Inventory.html       # Inventory management page
│   ├── Accountability.html  # Accountability form page
│   ├── Disposal.html        # Asset disposal page
│   ├── Reports.html         # Reports and analytics
│   └── Styles.html          # CSS styling
├── config/
│   ├── Config.gs            # System configuration
│   └── Schema.gs            # Database schema definitions
├── docs/
│   ├── SETUP.md             # Detailed setup instructions
│   ├── USER_GUIDE.md        # User manual
│   └── API_DOCS.md          # Technical documentation
└── README.md                # This file
```

## Key Features in Detail

### Asset Management
- **Auto Asset Tag Generation**: Automatically assigns sequential asset tags
- **Serial Number Tracking**: Unique identification for each asset
- **Condition Monitoring**: Track asset condition over time
- **Location Management**: Track where assets are located
- **Warranty Tracking**: Monitor warranty expiration dates

### Accountability System
- **Digital Forms**: Web-based forms for asset assignment
- **Email Integration**: Automatic notifications and confirmations
- **Digital Signatures**: Capture IT personnel signatures
- **PDF Generation**: Create professional accountability documents
- **Employee Confirmation**: Employees receive details for confirmation

### Disposal Management
- **Approval Workflow**: Require approver confirmation
- **Disposal Methods**: Track how assets are disposed
- **Documentation**: Generate disposal certificates
- **Chain of Custody**: Track who handled the disposal

### Security Features
- **Google Authentication**: Uses Google account authentication
- **Access Control**: Role-based access through Google permissions
- **Audit Trail**: Track all changes and who made them
- **Data Backup**: Automatic Google Sheets backups

## Usage

1. **Adding Assets**: Use the Inventory page to add new IT assets
2. **Assigning Assets**: Use the Accountability form to assign assets to employees
3. **Disposing Assets**: Use the Disposal page to properly dispose of assets
4. **Monitoring**: Use the Dashboard to monitor asset status and analytics

## Support

For technical support or feature requests, please create an issue in this repository.

## License

This project is licensed under the MIT License.