const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function listAdminUsers() {
  try {
    const result = await pool.query(`
      SELECT id, email, name, role, is_active, created_at, last_login 
      FROM admin_users 
      ORDER BY created_at DESC
    `);
    
    console.log('\n📋 Admin Users:');
    console.log('================');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.is_active ? '✅' : '❌'}`);
      console.log(`Created: ${user.created_at}`);
      console.log(`Last Login: ${user.last_login || 'Never'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

async function changePassword(email, newPassword) {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const result = await pool.query(`
      UPDATE admin_users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE email = $2 
      RETURNING email, name
    `, [passwordHash, email]);
    
    if (result.rows.length > 0) {
      console.log(`✅ Password updated for ${result.rows[0].name} (${result.rows[0].email})`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }
  } catch (error) {
    console.error('Error changing password:', error);
  }
}

async function deactivateUser(email) {
  try {
    const result = await pool.query(`
      UPDATE admin_users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP 
      WHERE email = $1 
      RETURNING email, name
    `, [email]);
    
    if (result.rows.length > 0) {
      console.log(`✅ User deactivated: ${result.rows[0].name} (${result.rows[0].email})`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }
  } catch (error) {
    console.error('Error deactivating user:', error);
  }
}

// Command line interface
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

async function main() {
  try {
    switch (command) {
      case 'list':
        await listAdminUsers();
        break;
      case 'change-password':
        if (!arg1 || !arg2) {
          console.log('Usage: node manage-admin.js change-password <email> <new-password>');
          return;
        }
        await changePassword(arg1, arg2);
        break;
      case 'deactivate':
        if (!arg1) {
          console.log('Usage: node manage-admin.js deactivate <email>');
          return;
        }
        await deactivateUser(arg1);
        break;
      default:
        console.log('Available commands:');
        console.log('  list                              - List all admin users');
        console.log('  change-password <email> <pass>   - Change user password');
        console.log('  deactivate <email>               - Deactivate user');
        break;
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();
