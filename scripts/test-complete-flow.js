const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function testCompleteFlow() {
  try {
    console.log('🔍 Testing complete questionnaire + CV flow...');

    // Step 1: Create a CV file (simulating upload)
    console.log('\n📁 Step 1: Creating CV file...');
    const cvInsertQuery = `
      INSERT INTO cv_files (filename, original_name, file_content, file_size, mime_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, filename;
    `;

    const testFileContent = Buffer.from('Test CV content');
    const cvResult = await pool.query(cvInsertQuery, [
      'test_cv_file.pdf',
      'test-resume.pdf',
      testFileContent,
      testFileContent.length,
      'application/pdf'
    ]);

    console.log('✅ CV file created:', cvResult.rows[0]);
    const cvFileId = cvResult.rows[0].id;

    // Step 2: Test the mapping function logic
    console.log('\n🗂️ Step 2: Testing form data mapping...');
    const formData = {
      firstName: 'Complete',
      lastName: 'Test',
      middleName: 'Flow',
      email: `completetest${Date.now()}@example.com`, // Unique email
      location: 'greater-accra',
      framework: 'react',
      uiStructure: 'small-components',
      gitUsage: 'own-repos',
      designTools: 'figma',
      cvFileId: cvFileId
    };

    // Apply the same mapping as in the API
    const locationMap = {
      'greater-accra': 'greater_accra',
      'outside-accra': 'outside_greater_accra'
    };

    const frameworkMap = {
      'react': 'react',
      'nextjs': 'nextjs',
      'both': 'react_and_nextjs',
      'other': 'other_framework',
      'vanilla': 'no_framework'
    };

    const uiStructureMap = {
      'small-components': 'small_reusable_components',
      'large-sections': 'larger_sections',
      'single-component': 'single_component',
      'existing-codebase': 'work_on_existing'
    };

    const gitUsageMap = {
      'own-repos': 'own_repos_regular_commits',
      'collaborative': 'collaborative_branches_prs',
      'basic-usage': 'basic_commands_occasional',
      'local-only': 'local_machine_only'
    };

    const designToolsMap = {
      'figma': 'figma',
      'sketch': 'sketch',
      'other-tools': 'other_tools',
      'prefer-coding': 'prefer_coding_only'
    };

    const mappedData = {
      firstName: formData.firstName,
      middleName: formData.middleName || null,
      lastName: formData.lastName,
      email: formData.email,
      location: locationMap[formData.location],
      mainFramework: frameworkMap[formData.framework],
      uiStructure: uiStructureMap[formData.uiStructure],
      gitUsage: gitUsageMap[formData.gitUsage],
      designTools: designToolsMap[formData.designTools]
    };

    console.log('Original form data:', formData);
    console.log('Mapped data:', mappedData);

    // Step 3: Insert candidate with CV reference
    console.log('\n👤 Step 3: Creating candidate record...');
    const candidateInsertQuery = `
      INSERT INTO candidate_responses (
        first_name, middle_name, last_name, email, location, 
        main_framework, ui_structure, git_usage, design_tools, cv_file_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at, cv_file_id
    `;

    const candidateValues = [
      mappedData.firstName,
      mappedData.middleName,
      mappedData.lastName,
      mappedData.email,
      mappedData.location,
      mappedData.mainFramework,
      mappedData.uiStructure,
      mappedData.gitUsage,
      mappedData.designTools,
      formData.cvFileId
    ];

    const candidateResult = await pool.query(candidateInsertQuery, candidateValues);
    console.log('✅ Candidate created:', candidateResult.rows[0]);

    // Step 4: Verify the complete relationship
    console.log('\n🔗 Step 4: Verifying complete relationship...');
    const verifyQuery = `
      SELECT 
        cr.id as candidate_id,
        cr.first_name,
        cr.last_name,
        cr.email,
        cr.cv_file_id,
        cf.id as file_id,
        cf.filename,
        cf.original_name,
        cf.file_size,
        cf.mime_type
      FROM candidate_responses cr
      JOIN cv_files cf ON cr.cv_file_id = cf.id
      WHERE cr.id = $1;
    `;

    const verifyResult = await pool.query(verifyQuery, [candidateResult.rows[0].id]);
    console.log('🎉 Complete relationship verification:');
    console.table(verifyResult.rows);

    console.log('\n✅ Complete flow test successful!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
  }
}

testCompleteFlow();
