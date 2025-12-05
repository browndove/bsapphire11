# Authentication System Documentation

## Overview

The application uses a secure database-backed authentication system for admin access to the candidate dashboard. Only authorized administrators can access the dashboard - no public signups are allowed.

## Database Schema

### Admin Users Table

```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);
```

## API Endpoints

### POST /api/auth/login
Authenticates admin users against the database.

**Request:**
```json
{
  "email": "admin@bsapphire.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "base64-encoded-token",
  "user": {
    "id": "1",
    "email": "admin@bsapphire.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### POST /api/auth/validate
Validates authentication tokens and ensures user is still active.

**Request:**
```json
{
  "token": "base64-encoded-token"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "admin@bsapphire.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

## Security Features

### Password Security
- **Bcrypt Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **No Plain Text**: Passwords are never stored in plain text
- **Secure Comparison**: Uses bcrypt.compare() for timing-attack resistant validation

### Token Security
- **Expiration**: Tokens expire after 24 hours
- **Server Validation**: Tokens are validated against the database on each request
- **User Status Check**: Validates that user is still active during token validation

### Database Security
- **Parameterized Queries**: All database queries use parameterized statements to prevent SQL injection
- **Active User Check**: Only active users can authenticate
- **Connection Pooling**: Uses PostgreSQL connection pooling for performance and security

## Default Admin Account

**Email:** `admin@bsapphire.com`  
**Password:** `admin123`

> ⚠️ **Important**: Change the default password in production!

## Management Scripts

### Create Admin User
```bash
node scripts/create-admin.js
```
Creates the admin_users table and inserts the default admin user.

### List Admin Users
```bash
node scripts/manage-admin.js list
```

### Change Password
```bash
node scripts/manage-admin.js change-password admin@bsapphire.com newpassword123
```

### Deactivate User
```bash
node scripts/manage-admin.js deactivate admin@bsapphire.com
```

## Frontend Components

### AuthContext
Manages authentication state across the application:
- Validates tokens on app startup
- Provides login/logout functions
- Handles token storage and cleanup

### ProtectedRoute
Wraps protected pages to require authentication:
- Shows loading spinner during auth check
- Displays login form if not authenticated
- Renders protected content if authenticated

### ShadcnLoginForm
Elegant login interface with:
- Modern shadcn/ui styling
- Demo credentials helper
- Form validation and error handling
- Responsive design

## Usage

### Protecting a Route
```tsx
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
```

### Using Auth Context
```tsx
import { useAuth } from '@/app/context/AuthContext'

function MyComponent() {
  const { user, login, logout, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Please login</div>
  
  return (
    <div>
      Welcome, {user.name}!
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## Security Best Practices

1. **Change Default Password**: Always change the default admin password in production
2. **Use HTTPS**: Ensure all authentication requests are made over HTTPS
3. **Token Expiration**: Tokens automatically expire after 24 hours
4. **Regular Validation**: Tokens are validated on each protected route access
5. **Database Security**: Use environment variables for database credentials
6. **User Deactivation**: Deactivate unused admin accounts

## Troubleshooting

### Login Issues
1. Check server logs for authentication errors
2. Verify database connection
3. Ensure admin user exists and is active
4. Confirm password is correct

### Token Issues
1. Check token expiration (24 hours)
2. Verify user is still active in database
3. Clear localStorage and re-login if needed

### Database Issues
1. Ensure admin_users table exists
2. Check database connection string
3. Verify PostgreSQL is running and accessible

## Production Considerations

1. **Environment Variables**: Move database credentials to environment variables
2. **Proper JWT**: Consider using proper JWT tokens instead of base64 encoding
3. **Rate Limiting**: Implement rate limiting on login endpoints
4. **Audit Logging**: Log all authentication attempts
5. **Password Policy**: Enforce strong password requirements
6. **Multi-Factor Authentication**: Consider adding MFA for additional security
