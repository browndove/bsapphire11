const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function checkEnumTypes() {
  try {
    console.log('🔍 Checking ENUM types in database...');

    // Check all enum types
    const enumQuery = `
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder;
    `;

    const enumResult = await pool.query(enumQuery);
    console.log('\n📋 Database ENUM values:');
    
    // Group by enum type
    const enumsByType = {};
    enumResult.rows.forEach(row => {
      if (!enumsByType[row.enum_name]) {
        enumsByType[row.enum_name] = [];
      }
      enumsByType[row.enum_name].push(row.enum_value);
    });

    Object.keys(enumsByType).forEach(enumName => {
      console.log(`\n${enumName}:`);
      enumsByType[enumName].forEach(value => {
        console.log(`  - ${value}`);
      });
    });

    // Check column types for candidate_responses
    const columnTypesQuery = `
      SELECT c.column_name, c.data_type, c.udt_name
      FROM information_schema.columns c
      WHERE c.table_name = 'candidate_responses' 
        AND c.data_type = 'USER-DEFINED'
      ORDER BY c.ordinal_position;
    `;

    const columnTypesResult = await pool.query(columnTypesQuery);
    console.log('\n📊 USER-DEFINED columns in candidate_responses:');
    console.table(columnTypesResult.rows);

    console.log('\n✅ ENUM types check completed!');

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await pool.end();
  }
}

checkEnumTypes();
