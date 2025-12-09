import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

// Map form values to database enum values
const mapFormToDbValues = (formData: any) => {
  const locationMap: { [key: string]: string } = {
    'greater_accra': 'greater_accra',
    'outside_greater_accra': 'outside_greater_accra'
  };

  const frameworkMap: { [key: string]: string } = {
    'react': 'react',
    'nextjs': 'nextjs',
    'both_react_nextjs': 'react_and_nextjs',
    'other_modern': 'other_framework',
    'no_framework': 'no_framework'
  };

  const frontendBackendMap: { [key: string]: string } = {
    'rarely_api': 'api_calls_tutorials',
    'write_api_calls': 'write_api_calls',
    'prefer_no_backend': 'no_backend_preference',
    'receive_data_props': 'receive_data_props'
  };

  const salaryExpectationMap: { [key: string]: string } = {
    '1500_2000': 'ghs_1500_2000',
    '2000_2500': 'ghs_2000_2500',
    '2500_3000': 'ghs_2500_3000'
  };

  const uiStructureMap: { [key: string]: string } = {
    'few_large_sections': 'larger_sections',
    'small_reusable_components': 'small_reusable_components',
    'existing_codebase': 'work_on_existing',
    'single_component': 'single_component'
  };

  const gitUsageMap: { [key: string]: string } = {
    'collaborative': 'collaborative_branches_prs',
    'own_projects': 'own_repos_regular_commits',
    'local_projects': 'local_machine_only',
    'basic_commands': 'basic_commands_occasional'
  };

  const designToolsMap: { [key: string]: string } = {
    'figma': 'figma',
    'prefer_coding': 'prefer_coding_only',
    'sketch': 'sketch',
    'other_tools': 'other_tools'
  };

  return {
    firstName: formData.firstName,
    middleName: formData.middleName || null,
    lastName: formData.lastName,
    portfolioUrl: formData.portfolioUrl,
    githubUrl: formData.githubUrl,
    email: formData.email,
    location: locationMap[formData.location],
    mainFramework: frameworkMap[formData.mainFramework],
    uiStructure: uiStructureMap[formData.uiStructure],
    gitUsage: gitUsageMap[formData.gitUsage],
    designTools: designToolsMap[formData.designTools],
    frontendBackend: frontendBackendMap[formData.frontendBackend],
    salaryExpectation: salaryExpectationMap[formData.salaryExpectation]
  };
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Validate required fields (portfolioUrl and githubUrl are optional)
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email' },
        { status: 400 }
      );
    }

    const mappedData = mapFormToDbValues(formData);

    // Check for existing candidate with same name and email combination
    const duplicateCheckQuery = `
      SELECT id FROM candidate_responses 
      WHERE LOWER(first_name) = LOWER($1) 
        AND LOWER(last_name) = LOWER($2) 
        AND LOWER(email) = LOWER($3)
        AND (
          (middle_name IS NULL AND $4::VARCHAR IS NULL) OR 
          (LOWER(COALESCE(middle_name, '')) = LOWER(COALESCE($4::VARCHAR, '')))
        )
    `;

    const duplicateCheckValues = [
      mappedData.firstName,
      mappedData.lastName,
      mappedData.email,
      mappedData.middleName || null
    ];

    const duplicateResult = await pool.query(duplicateCheckQuery, duplicateCheckValues);

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'An application with this name and email combination already exists' },
        { status: 409 }
      );
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO candidate_responses (
        first_name, middle_name, last_name, portfolio_url, github_url, email, location, 
        main_framework, ui_structure, git_usage, design_tools, frontend_backend, salary_expectation, cv_file_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, created_at
    `;

    const insertValues = [
      mappedData.firstName,
      mappedData.middleName,
      mappedData.lastName,
      mappedData.portfolioUrl,
      mappedData.githubUrl,
      mappedData.email,
      mappedData.location,
      mappedData.mainFramework,
      mappedData.uiStructure,
      mappedData.gitUsage,
      mappedData.designTools,
      mappedData.frontendBackend,
      mappedData.salaryExpectation,
      formData.cvFileId || null
    ];

    const result = await pool.query(insertQuery, insertValues);
    
    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      createdAt: result.rows[0].created_at,
      message: 'Application submitted successfully'
    });

  } catch (error: any) {
    console.error('Database error:', error);
    
    // Handle unique constraint violation (duplicate email)
    if (error.code === '23505' && error.constraint === 'candidate_responses_email_key') {
      return NextResponse.json(
        { error: 'An application with this email address already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const query = `
      SELECT cr.id, cr.first_name, cr.middle_name, cr.last_name, cr.email, cr.location, 
             cr.main_framework, cr.ui_structure, cr.git_usage, cr.design_tools, 
             cr.frontend_backend, cr.salary_expectation,
             cr.cv_file_id, cr.created_at, cr.is_read, cr.is_starred, cr.is_archived,
             cf.filename as cv_filename, cf.original_name as cv_original_name, 
             cf.file_size as cv_file_size, cf.mime_type as cv_mime_type
      FROM candidate_responses cr
      LEFT JOIN cv_files cf ON cr.cv_file_id = cf.id
      WHERE cr.is_archived = FALSE
      ORDER BY cr.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    return NextResponse.json({
      success: true,
      candidates: result.rows
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}
