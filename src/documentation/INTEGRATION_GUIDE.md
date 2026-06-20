# Frontend-Backend Integration Summary

## Overview

Successfully integrated Django REST Framework backend with React frontend for user management dashboard with real API data, server-side pagination, filtering, and search.

## Architecture

### Backend API Endpoints

- `GET /api/users/` - List users with optional filters and search
- `POST /api/users/` - Create new user
- `PATCH /api/users/{user_id}/` - Update user
- `DELETE /api/users/{user_id}/` - Delete user (soft delete)

### Frontend Structure

#### 1. Configuration Layer (`src/config/api.js`)

- API base URL configuration
- Centralized endpoint definitions
- Supports VITE_API_URL environment variable

#### 2. HTTP Client (`src/lib/axios.js`)

- Axios instance with JWT authentication
- Auto-attach Authorization header
- Token refresh interceptor for 401 responses
- Graceful logout on token expiration

#### 3. Services (`src/services/userService.js`)

- Encapsulates all API calls
- Methods: `getUsers()`, `getUser()`, `createUser()`, `updateUser()`, `deleteUser()`
- Handles request/response transformation

#### 4. Custom Hooks

**Data Fetching** (`src/hooks/useUsers.js`):

- `useUsers({ page, pageSize, search, role, isActive })` - Fetch paginated users with filters
- `useUser(userId)` - Fetch single user
- Uses React Query for caching and background refetching

**Mutations** (`src/hooks/useUserMutations.js`):

- `useCreateUser()` - Create user, invalidates users list on success
- `useUpdateUser()` - Update user, refreshes both single user and list
- `useDeleteUser()` - Delete user, refreshes list

#### 5. Components

**RecentSubmissionsTable**:

- Replaced mock data with real API calls
- Server-side search by name/email
- Role-based filtering (all/staff/student)
- Pagination (50 items per page)
- Edit and delete functionality
- Loading/error states

**UserSummaryCards**:

- Calculates statistics from real user data:
  - Total users count
  - Staff count
  - Student count
  - Inactive users count

**UserManagementHeader**:

- Integrates CreateUser mutation
- Passes loading state to AddUserModal

**AddUserModal**:

- Updated to remove department field
- Sends proper API format: `full_name`, `password_confirm`, `role`
- Shows loading state during submission
- Error messages display

**EditUserModal**:

- Rewritten to handle API data structure
- Maps `full_name` field correctly
- Sends only editable fields: `full_name`, `role`, `is_active`
- Shows loading/saving states

### React Query Setup (`src/main.jsx`)

- QueryClientProvider wraps entire app
- Automatic query caching
- Stale time: 5 minutes
- Garbage collection: 10 minutes

## Configuration

### Environment Variables (`.env.local`)

```
VITE_API_URL=http://localhost:8000/api
```

## Data Mapping

### API Response Format

```json
{
  "user_id": "uuid",
  "org_id": "uuid or null",
  "full_name": "string",
  "email": "string",
  "role": "staff|student",
  "is_active": true|false,
  "created_at": "ISO datetime"
}
```

### Create User Request

```json
{
  "full_name": "string",
  "email": "string",
  "password": "string",
  "password_confirm": "string",
  "role": "staff|student",
  "is_active": true|false
}
```

### Update User Request

```json
{
  "full_name": "string",
  "role": "staff|student",
  "is_active": true|false
}
```

## Features Implemented

✅ **Server-side Search**

- Real-time search by name and email
- Debounced with page reset

✅ **Filtering**

- Filter by role (staff/student)
- Optional active status filter
- Resets pagination on filter change

✅ **Pagination**

- 50 items per page
- Numbered pagination buttons
- Next/Previous navigation

✅ **CRUD Operations**

- Create: Modal form with validation
- Read: List with pagination
- Update: Edit modal with current values
- Delete: Soft delete with confirmation

✅ **Loading States**

- Spinners during data fetch
- Disabled buttons during submission
- Error messages on failure

✅ **Status Management**

- Active/Inactive toggle
- Reflected in badge colors

## Testing Checklist

1. ✅ Backend running on `http://localhost:8000`
2. ✅ Frontend running on `http://localhost:5173`
3. Create a test user via add modal
4. Search for user by name/email
5. Filter by role
6. Edit user details
7. Verify pagination works
8. Test soft delete functionality

## Known Limitations / Future Improvements

- No multi-select bulk operations yet
- Department field removed (can be added to user model if needed)
- No export/import functionality
- No advanced filtering UI (basic role filter only)
- No user activity logs
- No permission-based visibility (all authenticated users can see all)

## Dependencies Used

- `@tanstack/react-query@^5.101.0` - Server state management
- `axios@^1.18.0` - HTTP client
- `react-router-dom@^7.18.0` - Routing
- `lucide-react@^1.20.0` - Icons

## File Tree

```
src/
├── config/
│   └── api.js (API configuration)
├── lib/
│   └── axios.js (HTTP client)
├── services/
│   └── userService.js (API service)
├── hooks/
│   ├── useUsers.js (Data fetching hooks)
│   └── useUserMutations.js (Mutation hooks)
├── modules/admin/dashboard/
│   ├── components/
│   │   ├── UserManagementHeader.jsx (Updated)
│   │   ├── UserSummaryCards.jsx (Updated)
│   │   └── RecentSubmissionsTable.jsx (Updated)
│   └── modals/
│       ├── AddUserModal.jsx (Updated)
│       └── EditUserModal.jsx (Rewritten)
├── main.jsx (Updated with QueryClientProvider)
└── App.jsx
```
