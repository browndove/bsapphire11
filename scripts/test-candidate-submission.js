const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function testCandidateSubmission() {
  try {
    console.log('🔍 Testing candidate submission with CV file ID...');

    // Test insert with the existing CV file ID (1)
    const insertQuery = `
      INSERT INTO candidate_responses (
        first_name, middle_name, last_name, email, location, 
        main_framework, ui_structure, git_usage, design_tools, cv_file_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at, cv_file_id
    `;

    const insertValues = [
      'Test',                           // first_name
      'Middle',                         // middle_name
      'User',                           // last_name
      'test@example.com',               // email
      'greater_accra',                  // location
      'react',                          // main_framework
      'small_reusable_components',      // ui_structure
      'own_repos_regular_commits',      // git_usage
      'figma',                          // design_tools
      1                                 // cv_file_id (existing file)
    ];

    console.log('Attempting to insert with values:', insertValues);

    const result = await pool.query(insertQuery, insertValues);
    
    console.log('✅ Insert successful!');
    console.log('Result:', result.rows[0]);

    // Verify the relationship
    const verifyQuery = `
      SELECT cr.id, cr.first_name, cr.last_name, cr.cv_file_id,
             cf.filename, cf.original_name
      FROM candidate_responses cr
      JOIN cv_files cf ON cr.cv_file_id = cf.id
      WHERE cr.id = $1;
    `;

    const verifyResult = await pool.query(verifyQuery, [result.rows[0].id]);
    console.log('\n🔗 Relationship verification:');
    console.table(verifyResult.rows);

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testCandidateSubmission();
