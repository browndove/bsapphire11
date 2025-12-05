const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function createAdminUser() {
  try {
    console.log('Creating admin users table and user...');
    
    // Create the table
    await pool.query(`
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
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active)
    `);

    // Hash the password
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Password hash generated:', passwordHash);

    // Insert the admin user
    const result = await pool.query(`
      INSERT INTO admin_users (email, password_hash, name, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, name, role, created_at
    `, [
      'admin@bsapphire.com',
      passwordHash,
      'Admin User',
      'admin'
    ]);

    console.log('Admin user created/updated successfully:');
    console.log(result.rows[0]);
    
    console.log('\n✅ Setup complete!');
    console.log('Login credentials:');
    console.log('Email: admin@bsapphire.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
