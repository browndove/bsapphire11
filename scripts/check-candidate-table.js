const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function checkCandidateTable() {
  try {
    console.log('🔍 Checking candidate_responses table structure and data...');

    // Check table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'candidate_responses'
      ORDER BY ordinal_position;
    `;

    const structureResult = await pool.query(structureQuery);
    console.log('\n📋 Table structure:');
    console.table(structureResult.rows);

    // Check if there are any records at all
    const countQuery = `SELECT COUNT(*) as total_records FROM candidate_responses;`;
    const countResult = await pool.query(countQuery);
    console.log('\n📊 Total records in candidate_responses:', countResult.rows[0].total_records);

    // Check recent records
    const recentQuery = `
      SELECT * FROM candidate_responses 
      ORDER BY created_at DESC 
      LIMIT 5;
    `;

    const recentResult = await pool.query(recentQuery);
    console.log('\n📝 Recent candidate records:');
    console.table(recentResult.rows);

    console.log('\n✅ Candidate table check completed!');

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await pool.end();
  }
}

checkCandidateTable();
