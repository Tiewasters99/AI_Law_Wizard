# Attorney Interface User Guide

## Overview
The attorney interface has been completely redesigned with a modern vertical sidebar navigation system that provides better organization, more screen space, and improved user experience.

## New Navigation Structure

### Visual Layout

```
┌────────────────────────────────────────────────────────────────┐
│  [Logo]                    [Attorney Badge] [🔔] [User Menu ▼] │ ← Top Bar (64px)
├─────────────────┬──────────────────────────────────────────────┤
│                 │                                              │
│  [≡] ─→         │                                              │
│                 │                                              │
│ CLIENT MGMT     │           Main Content Area                 │
│  👥 Directory   │                                              │
│  💬 Inbox (3)   │           Your selected page content        │
│                 │           displays here                      │
│ LEGAL TOOLS     │                                              │
│  🧠 Analysis    │                                              │
│  👑 Advanced    │                                              │
│  📊 History     │                                              │
│                 │                                              │
│ RESOURCES       │                                              │
│  📰 Blog        │                                              │
│  🌍 Miniverse   │                                              │
│                 │                                              │
│ ACCOUNT         │                                              │
│  👤 Profile     │                                              │
│  💰 Credits     │                                              │
│                 │                                              │
│ ─────────────   │                                              │
│ 💰 Credits      │                                              │
│    5,000        │                                              │
└─────────────────┴──────────────────────────────────────────────┘
```

### Collapsed Sidebar (72px)

```
┌────────────────────────────────────────────────────────────────┐
│  [Logo]                    [Attorney Badge] [🔔] [User Menu ▼] │
├──┬────────────────────────────────────────────────────────────┤
│  │                                                            │
│←─│                                                            │
│  │                                                            │
│👥│              Main Content Area                            │
│💬│              (More Screen Space)                          │
│  │                                                            │
│🧠│                                                            │
│👑│                                                            │
│📊│                                                            │
│  │                                                            │
│📰│                                                            │
│🌍│                                                            │
│  │                                                            │
│👤│                                                            │
│💰│                                                            │
│  │                                                            │
└──┴────────────────────────────────────────────────────────────┘
```

### Mobile View (< 1024px)

```
┌─────────────────────────────────┐
│  [Logo]       [🔔] [User Menu ▼]│
├─────────────────────────────────┤
│                                 │
│                                 │
│      Main Content Area          │
│      (Full Width)               │
│                                 │
│                                 │
│                                 │
│                          [ ≡ ]  │ ← Floating Button
└─────────────────────────────────┘

When tapped:
┌─────────────────────────────────┐
│█ [Logo]       [🔔] [User Menu ▼]│
│█├─────────────────────────────┬┤
│█│                             │█│
│█│ CLIENT MGMT                 │█│ ← Overlay
│█│  👥 Directory               │█│   Sidebar
│█│  💬 Inbox                   │█│
│█│                             │█│
│█│ [All navigation...]         │█│
│█│                             │█│
│█│                             │█│
│█│ 💰 Credits: 5,000          │█│
│█└─────────────────────────────┴█│
└─────────────────────────────────┘
Tap backdrop to close →
```

## Navigation Sections

### 1. Client Management
**Purpose**: Manage client relationships and communications

- **Directory** (`/directory`)
  - Browse available clients
  - View client profiles
  - Send consultation requests
  - Track request status

- **Inbox** (`/inbox`)
  - View all conversations
  - Message clients
  - Track consultation requests
  - Unread count badge (red)

### 2. Legal Tools
**Purpose**: AI-powered legal analysis and research tools

- **Document Analysis** (`/wizard`)
  - Upload and analyze documents
  - AI-powered legal insights
  - Document comparison
  - Research assistance

- **Advanced Analysis** (`/grand-wizard`)
  - Premium analysis features
  - Complex document processing
  - Enhanced AI capabilities
  - Advanced legal research

- **Query History** (`/query-history`)
  - View past analyses
  - Review previous results
  - Track usage statistics
  - Download reports

### 3. Resources
**Purpose**: Educational content and legal community

- **Legal Blog** (`/blog`)
  - Latest legal articles
  - Industry insights
  - Best practices
  - Case studies

- **Miniverse** (`/miniverse`)
  - Interactive legal world
  - Community features
  - Educational resources
  - Networking tools

### 4. Account
**Purpose**: Manage your professional account

- **Profile** (`/profile`)
  - Edit professional information
  - Update credentials
  - Manage certifications
  - View achievements

- **Service Credits** (`/tokens`)
  - View credit balance
  - Purchase credits
  - Usage analytics
  - Transaction history

## Key Features

### ✨ Collapsible Sidebar
- **Toggle Button**: Click the chevron button to collapse/expand
- **Persistent State**: Your preference is saved locally
- **Space Saving**: Collapsed mode gives you 208px more screen width
- **Icon Mode**: When collapsed, shows icons with tooltips on hover

### 🔔 Notification System
- **Bell Icon**: Top right corner
- **Unread Count**: Badge shows number of unread messages
- **Quick Access**: Click to see all notifications
- **Real-time Updates**: Automatically refreshes

### 💰 Credit Balance
- **Always Visible**: Bottom of sidebar (when expanded)
- **Real-time**: Updates automatically
- **Quick Link**: Click to go to purchase page
- **Usage Tracking**: Monitor your consumption

### 👤 User Menu
- **Profile Picture**: Shows your photo or initials
- **Quick Actions**:
  - View Profile
  - Account Settings
  - Sign Out
- **Role Badge**: Shows "Attorney Account" with shield icon

### 🎯 Active Page Indicator
- **Blue Highlight**: Current page has blue background
- **Left Border**: Blue accent bar on active item
- **Clear Feedback**: Always know where you are

## Interaction Guide

### Desktop (≥ 1024px)

#### Expanding/Collapsing Sidebar
1. Click the chevron button (→ or ←)
2. Sidebar smoothly animates to new width
3. State is automatically saved
4. Icons remain visible when collapsed

#### Navigation
1. Click any menu item to navigate
2. Active page is highlighted in blue
3. Hover for smooth color transitions
4. Click logo to return home

#### Tooltips (Collapsed Mode)
1. Hover over any icon
2. Tooltip appears showing full name
3. Tooltip includes badge counts if applicable

### Mobile (< 1024px)

#### Opening Sidebar
1. Tap the floating menu button (bottom left)
2. Sidebar slides in from left
3. Backdrop darkens main content
4. Full navigation menu visible

#### Closing Sidebar
1. Tap anywhere on the backdrop
2. Tap the X button on sidebar
3. Tap any navigation link (auto-closes)
4. Sidebar slides out smoothly

#### Navigation
1. Sidebar opens full-width (288px)
2. All features accessible
3. Touch-friendly tap targets
4. No collapsing on mobile

## Color Guide

### Sidebar Colors
- **Background**: Light gray (`#f8fafc`)
- **Border**: Medium gray (`#e2e8f0`)
- **Active Item**: Light blue (`#eff6ff`)
- **Active Border**: Dark blue (`#1e40af`)
- **Hover**: Lighter gray (`#f1f5f9`)
- **Icons Active**: Dark blue (`#1e40af`)
- **Icons Inactive**: Medium gray (`#475569`)

### Top Bar Colors
- **Background**: White
- **Border**: Light gray (`#e2e8f0`)
- **Attorney Badge**: Gold background (`#fffbeb`), gold text (`#b45309`)
- **Notification**: Red badge for unread

### Credit Widget
- **Background**: Light blue (`#eff6ff`)
- **Text**: Dark blue (`#1e293b`)
- **Icon**: Blue (`#1e40af`)

## Keyboard Navigation

### Tab Navigation
- Press `Tab` to move between links
- Press `Enter` to activate a link
- Standard browser shortcuts work

### Screen Reader Support
- All icons have labels
- Active states announced
- Semantic HTML structure
- ARIA labels on buttons

## Tips & Tricks

### 💡 Pro Tips

1. **Quick Toggle**: 
   - Use the chevron button to toggle sidebar instantly
   - Perfect for focusing on document review

2. **Mobile Access**:
   - Swipe from left edge on mobile to open sidebar (browser dependent)
   - Floating button always accessible

3. **Notification Management**:
   - Check the inbox badge for unread count
   - Red badge means you have messages

4. **Credit Monitoring**:
   - Sidebar shows your balance at a glance
   - Click to view detailed usage

5. **Quick Navigation**:
   - Logo always returns to home
   - Back button in browser works as expected

### 🎨 Customization

**Current State**: Sidebar preference is saved per browser

**Coming Soon**:
- Theme customization
- Pinned favorites
- Custom sections
- Workspace switcher

## Troubleshooting

### Sidebar Not Saving State
- Check browser local storage is enabled
- Try clearing site data and re-login
- State is per-browser, not synced across devices

### Mobile Sidebar Stuck
- Refresh the page
- Try tapping backdrop to close
- Check for JavaScript errors in console

### Navigation Not Working
- Ensure JavaScript is enabled
- Check internet connection
- Try hard refresh (Ctrl+F5 / Cmd+Shift+R)

### Credits Not Loading
- Check network connection
- Refresh the page
- Verify you're logged in

## What Changed From Old Design

### Before (Horizontal Tabs)
- ❌ 9+ tabs in horizontal header
- ❌ Cluttered top navigation
- ❌ No grouping or organization
- ❌ Limited screen space
- ❌ Difficult on mobile

### After (Vertical Sidebar)
- ✅ Organized into 4 clear sections
- ✅ Collapsible for more space
- ✅ Better mobile experience
- ✅ Clear visual hierarchy
- ✅ Professional appearance
- ✅ Easier navigation
- ✅ Persistent state
- ✅ Quick access to credits

## Feedback & Support

### Getting Help
- Contact support through the user menu
- Check documentation in Help Center
- Report bugs via support email

### Feature Requests
- Submit through user menu
- Community forum discussions
- Direct feedback to development team

---

**Last Updated**: October 11, 2025
**Interface Version**: 2.0
**Compatible With**: All modern browsers, iOS 12+, Android 8+

