import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

// GET single candidate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const query = `
      SELECT 
        id, first_name, middle_name, last_name, email, location,
        main_framework, ui_structure, git_usage, design_tools,
        cv_file_id, cv_filename, cv_original_name, cv_file_size, cv_mime_type,
        created_at, is_read, is_starred, is_archived
      FROM candidate_responses 
      WHERE id = $1 AND is_archived = FALSE
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update candidate status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, value } = body;
    
    let query = '';
    let queryParams: any[] = [];
    
    switch (action) {
      case 'read':
        query = 'UPDATE candidate_responses SET is_read = $1 WHERE id = $2 RETURNING *';
        queryParams = [value, id];
        break;
      case 'star':
        query = 'UPDATE candidate_responses SET is_starred = $1 WHERE id = $2 RETURNING *';
        queryParams = [value, id];
        break;
      case 'archive':
        query = 'UPDATE candidate_responses SET is_archived = $1 WHERE id = $2 RETURNING *';
        queryParams = [value, id];
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    const result = await pool.query(query, queryParams);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      candidate: result.rows[0],
      message: `Candidate ${action} status updated successfully`
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE candidate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const query = 'DELETE FROM candidate_responses WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Candidate deleted successfully',
      deletedCandidate: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
