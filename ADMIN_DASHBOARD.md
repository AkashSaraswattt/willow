# Willow Admin Dashboard

## Overview
The Willow Admin Dashboard provides real-time monitoring and management capabilities for the Willow chat platform. It features comprehensive user management, moderation tracking, and analytics with interactive charts.

## Admin Credentials
- **Email**: admin@willow.in
- **Password**: Willow@17

## Features

### Dashboard Analytics
- **Real-time Statistics**: Total users, blocked users, messages, and moderation metrics
- **Activity Tracking**: 24-hour active users and message counts
- **Date Range Filtering**: View stats for 7, 14, 30, 90, or 365 days
- **Auto-refresh**: Dashboard updates every 30 seconds automatically

### Interactive Charts
- **User Growth Chart**: Line chart showing new user registrations over time
- **User Status Pie Chart**: Visual breakdown of active vs blocked users
- **Moderation Activity Bar Chart**: Stacked bar chart showing blocked, rephrased, and allowed messages
- **Moderation Method Distribution**: Pie chart showing AI vs fallback moderation usage

### User Management
- **Search & Filter**: Search by email/name, filter by status (all/blocked/toxic)
- **Pagination**: Browse through users with 20 per page
- **User Details Modal**: View comprehensive user information including:
  - Profile information
  - Message counts
  - Friend count
  - Toxic message count
  - Recent moderation logs
  - Block status and reason

### User Actions
- **Block User**: Block individual users with custom reason
- **Unblock User**: Restore user access
- **Reset Toxic Count**: Reset user's toxic message counter
- **Bulk Actions**: Select multiple users for bulk block/unblock operations (up to 100 at once)

### Moderation Logs
- **Real-time Log Viewer**: View all moderation events
- **Filter by Action**: View all, blocked, rephrased, or allowed messages
- **Pagination**: Browse through logs with 50 per page
- **Detailed Information**: See original message, action taken, moderation method, and timestamp

### Export Reports
- **Users Report**: CSV export of all users with toxic counts and status
- **Blocked Users Report**: CSV export of blocked users with reasons
- **Moderation Report**: CSV export of moderation logs (last 1000 events)

### Data Synchronization
- **Sync Toxic Counts**: One-click sync to update user toxic counts from moderation logs

## Database Schema Updates

### User Model Additions
```javascript
{
  isBlocked: Boolean (default: false),
  blockedReason: String (default: ""),
  blockedAt: Date,
  isAdmin: Boolean (default: false),
  toxicMessageCount: Number (default: 0)
}
```

## API Endpoints

### Dashboard Stats
```
GET /api/admin/stats?days=7
```
Returns comprehensive dashboard statistics including user counts, moderation metrics, charts data, and top toxic users.

### User Management
```
GET /api/admin/users?page=1&limit=20&search=&filter=all
GET /api/admin/users/:userId
POST /api/admin/users/:userId/block
POST /api/admin/users/:userId/unblock
POST /api/admin/users/:userId/reset-toxic
POST /api/admin/users/bulk-block
POST /api/admin/users/bulk-unblock
```

### Moderation Logs
```
GET /api/admin/moderation-logs?page=1&limit=50&filter=all
```

### Reports
```
GET /api/admin/export?type=users
GET /api/admin/export?type=blocked
GET /api/admin/export?type=moderation
```

### Utilities
```
POST /api/admin/sync-toxic-counts
```

## Setup Instructions

### 1. Run Admin Seed Script
```bash
cd backend
node src/seeds/admin.seed.js
```

### 2. Migrate Existing Users (if any)
```bash
cd backend
node src/seeds/migrate-users.js
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install chart.js react-chartjs-2
```

### 4. Access Admin Dashboard
1. Navigate to `/login`
2. Login with admin credentials
3. You'll be automatically redirected to `/admin`

## Security Features

### Authentication & Authorization
- Admin-only access with JWT authentication
- Protected routes with middleware checks
- Automatic redirect for non-admin users

### Blocked User Protection
- Blocked users cannot login
- Login attempt returns 403 with block reason
- Real-time blocking takes effect immediately

### Admin Protection
- Admins cannot be bulk blocked
- Validation prevents admin account manipulation
- Separate admin flag in user model

## Toxic Message Tracking

### Automatic Increment
- Toxic count increments when messages are blocked
- Works for both private and group messages
- Real-time updates in database

### Manual Management
- Admins can reset toxic counts
- Sync function to recalculate from logs
- Visible in user details and main table

## Bulk Operations

### Features
- Select up to 100 users at once
- Smart UI shows mixed states (blocked/active)
- Separate buttons for block/unblock based on selection
- Detailed feedback on operation results

### Validation
- Prevents blocking admins
- Validates all user IDs
- Shows skipped/failed counts
- Requires reason for bulk blocking

## Responsive Design
- Fully responsive layout
- Mobile-friendly tables
- Adaptive charts
- Touch-friendly controls

## Performance Optimizations
- Pagination for large datasets
- Indexed database queries
- Efficient aggregation pipelines
- Auto-refresh with minimal overhead

## Troubleshooting

### Admin Can't Login
```bash
# Re-run admin seed script
cd backend
node src/seeds/admin.seed.js
```

### Toxic Counts Not Updating
```bash
# Run sync script
cd backend
node src/seeds/migrate-users.js
# Then use "Sync Counts" button in dashboard
```

### Charts Not Displaying
```bash
# Reinstall chart dependencies
cd frontend
npm install chart.js react-chartjs-2
```

## Future Enhancements
- Email notifications for admin actions
- Advanced filtering and search
- User activity timeline
- Automated blocking rules
- Custom report generation
- Role-based admin permissions
