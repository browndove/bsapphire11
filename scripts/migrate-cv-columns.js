const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function migrateCVColumns() {
  try {
    console.log('🔄 Starting database migration for CV columns...');

    // Add CV columns
    const addColumnsQuery = `
      ALTER TABLE candidate_responses 
      ADD COLUMN IF NOT EXISTS cv_filename VARCHAR(255),
      ADD COLUMN IF NOT EXISTS cv_file_path VARCHAR(500);
    `;

    await pool.query(addColumnsQuery);
    console.log('✅ CV columns added successfully');

    // Add index for better performance
    const addIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_candidate_responses_cv_filename 
      ON candidate_responses(cv_filename);
    `;

    await pool.query(addIndexQuery);
    console.log('✅ Index created successfully');

    // Add comments to document the columns
    const addCommentsQuery = `
      COMMENT ON COLUMN candidate_responses.cv_filename IS 'Original filename of uploaded CV';
      COMMENT ON COLUMN candidate_responses.cv_file_path IS 'Server path to stored CV file';
    `;

    await pool.query(addCommentsQuery);
    console.log('✅ Column comments added successfully');

    // Verify the migration
    const verifyQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'candidate_responses' 
      AND column_name IN ('cv_filename', 'cv_file_path');
    `;

    const result = await pool.query(verifyQuery);
    console.log('📋 Migration verification:');
    console.table(result.rows);

    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateCVColumns();
