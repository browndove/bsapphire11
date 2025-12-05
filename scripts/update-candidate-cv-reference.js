const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function updateCandidateCVReference() {
  try {
    console.log('🔄 Updating candidate_responses table for CV file reference...');

    // Add cv_file_id column to reference cv_files table
    const addColumnQuery = `
      ALTER TABLE candidate_responses 
      ADD COLUMN IF NOT EXISTS cv_file_id INTEGER REFERENCES cv_files(id);
    `;

    await pool.query(addColumnQuery);
    console.log('✅ CV file reference column added successfully');

    // Add index for better performance
    const addIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_candidate_responses_cv_file_id 
      ON candidate_responses(cv_file_id);
    `;

    await pool.query(addIndexQuery);
    console.log('✅ Index created successfully');

    // Add comment
    const addCommentQuery = `
      COMMENT ON COLUMN candidate_responses.cv_file_id IS 'Foreign key reference to cv_files table';
    `;

    await pool.query(addCommentQuery);
    console.log('✅ Column comment added successfully');

    // Verify the update
    const verifyQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'candidate_responses' 
      AND column_name LIKE '%cv%';
    `;

    const result = await pool.query(verifyQuery);
    console.log('📋 CV-related columns in candidate_responses:');
    console.table(result.rows);

    console.log('🎉 Candidate CV reference update completed successfully!');

  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateCandidateCVReference();
