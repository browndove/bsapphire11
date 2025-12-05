import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = parseInt(params.id);

    if (isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    // Retrieve file from database
    const query = `
      SELECT filename, original_name, file_content, file_size, mime_type
      FROM cv_files 
      WHERE id = $1
    `;

    const result = await pool.query(query, [fileId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = result.rows[0];

    // Return file as response
    return new NextResponse(file.file_content, {
      headers: {
        'Content-Type': file.mime_type,
        'Content-Disposition': `attachment; filename="${file.original_name}"`,
        'Content-Length': file.file_size.toString(),
      },
    });

  } catch (error) {
    console.error('File retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    );
  }
}
