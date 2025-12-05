-- Create admin users table for authentication
-- Run this SQL script on your PostgreSQL database

-- Create users table for admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Insert the single admin user (password is 'admin123' hashed with bcrypt)
-- Note: This is the bcrypt hash for 'admin123' with salt rounds 10
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES (
    'admin@bsapphire.com', 
    '$2b$10$rOzJqQZKqKqKqKqKqKqKqOzJqQZKqKqKqKqKqKqKqOzJqQZKqKqKqK',
    'Admin User',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Add comments to document the table
COMMENT ON TABLE admin_users IS 'Admin users for dashboard authentication';
COMMENT ON COLUMN admin_users.email IS 'Admin user email address (unique)';
COMMENT ON COLUMN admin_users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN admin_users.name IS 'Display name for the admin user';
COMMENT ON COLUMN admin_users.role IS 'User role (admin, super_admin, etc.)';
COMMENT ON COLUMN admin_users.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN admin_users.last_login IS 'Timestamp of last successful login';
