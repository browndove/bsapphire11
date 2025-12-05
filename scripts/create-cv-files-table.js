const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function createCVFilesTable() {
  try {
    console.log('🔄 Creating CV files table...');

    // Create cv_files table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS cv_files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_content BYTEA NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await pool.query(createTableQuery);
    console.log('✅ CV files table created successfully');

    // Create index for better performance
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_cv_files_filename ON cv_files(filename);
      CREATE INDEX IF NOT EXISTS idx_cv_files_created_at ON cv_files(created_at);
    `;

    await pool.query(createIndexQuery);
    console.log('✅ Indexes created successfully');

    // Add comments
    const addCommentsQuery = `
      COMMENT ON TABLE cv_files IS 'Stores CV files uploaded by candidates';
      COMMENT ON COLUMN cv_files.filename IS 'Unique filename for the CV file';
      COMMENT ON COLUMN cv_files.original_name IS 'Original filename as uploaded by user';
      COMMENT ON COLUMN cv_files.file_content IS 'Binary content of the CV file';
      COMMENT ON COLUMN cv_files.file_size IS 'Size of the file in bytes';
      COMMENT ON COLUMN cv_files.mime_type IS 'MIME type of the file';
    `;

    await pool.query(addCommentsQuery);
    console.log('✅ Table comments added successfully');

    // Verify table creation
    const verifyQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'cv_files'
      ORDER BY ordinal_position;
    `;

    const result = await pool.query(verifyQuery);
    console.log('📋 Table structure verification:');
    console.table(result.rows);

    console.log('🎉 CV files table creation completed successfully!');

  } catch (error) {
    console.error('❌ Table creation failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createCVFilesTable();
