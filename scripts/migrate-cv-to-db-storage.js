const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function migrateCVToDBStorage() {
  try {
    console.log('🔄 Starting database migration for CV file storage...');

    // Add columns for storing file content in database
    const addColumnsQuery = `
      ALTER TABLE candidate_responses 
      ADD COLUMN IF NOT EXISTS cv_content BYTEA,
      ADD COLUMN IF NOT EXISTS cv_file_size INTEGER,
      ADD COLUMN IF NOT EXISTS cv_mime_type VARCHAR(100);
    `;

    await pool.query(addColumnsQuery);
    console.log('✅ CV storage columns added successfully');

    // Add comments to document the new columns
    const addCommentsQuery = `
      COMMENT ON COLUMN candidate_responses.cv_content IS 'Binary content of uploaded CV file';
      COMMENT ON COLUMN candidate_responses.cv_file_size IS 'Size of CV file in bytes';
      COMMENT ON COLUMN candidate_responses.cv_mime_type IS 'MIME type of CV file (application/pdf, etc.)';
    `;

    await pool.query(addCommentsQuery);
    console.log('✅ Column comments added successfully');

    // Verify the migration
    const verifyQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'candidate_responses' 
      AND column_name IN ('cv_content', 'cv_file_size', 'cv_mime_type', 'cv_filename', 'cv_file_path');
    `;

    const result = await pool.query(verifyQuery);
    console.log('📋 Migration verification:');
    console.table(result.rows);

    console.log('🎉 Database migration for CV file storage completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateCVToDBStorage();
