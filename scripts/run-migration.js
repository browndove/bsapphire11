const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-candidate-status-columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('Added columns: is_read, is_starred, is_archived');
    
    // Verify the columns were added
    const result = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'candidate_responses' 
      AND column_name IN ('is_read', 'is_starred', 'is_archived')
      ORDER BY column_name;
    `);
    
    console.log('\n📋 Verified columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (default: ${row.column_default})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
