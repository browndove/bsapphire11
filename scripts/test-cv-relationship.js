const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function testCVRelationship() {
  try {
    console.log('🔍 Testing CV file and candidate relationship...');

    // Check cv_files table
    const cvFilesQuery = `
      SELECT id, filename, original_name, file_size, mime_type, created_at
      FROM cv_files 
      ORDER BY created_at DESC 
      LIMIT 5;
    `;

    const cvFilesResult = await pool.query(cvFilesQuery);
    console.log('\n📁 Recent CV files:');
    console.table(cvFilesResult.rows);

    // Check candidate_responses with CV relationships
    const candidatesQuery = `
      SELECT cr.id, cr.first_name, cr.last_name, cr.email, cr.cv_file_id, cr.created_at,
             cf.filename as cv_filename, cf.original_name as cv_original_name
      FROM candidate_responses cr
      LEFT JOIN cv_files cf ON cr.cv_file_id = cf.id
      ORDER BY cr.created_at DESC 
      LIMIT 5;
    `;

    const candidatesResult = await pool.query(candidatesQuery);
    console.log('\n👥 Recent candidates with CV relationships:');
    console.table(candidatesResult.rows);

    // Check for orphaned CV files (files without candidate references)
    const orphanedQuery = `
      SELECT cf.id, cf.filename, cf.original_name, cf.created_at
      FROM cv_files cf
      LEFT JOIN candidate_responses cr ON cf.id = cr.cv_file_id
      WHERE cr.cv_file_id IS NULL;
    `;

    const orphanedResult = await pool.query(orphanedQuery);
    console.log('\n🔍 Orphaned CV files (no candidate reference):');
    console.table(orphanedResult.rows);

    // Check for candidates without CV files
    const noCVQuery = `
      SELECT id, first_name, last_name, email, created_at
      FROM candidate_responses 
      WHERE cv_file_id IS NULL;
    `;

    const noCVResult = await pool.query(noCVQuery);
    console.log('\n📝 Candidates without CV files:');
    console.table(noCVResult.rows);

    console.log('\n✅ CV relationship test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testCVRelationship();
