import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_qpVXRjeW3v0y@ep-summer-mode-adt3xx71-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('cv') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer for database storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique file ID
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;

    // Store file content in database
    const insertQuery = `
      INSERT INTO cv_files (
        filename, original_name, file_content, file_size, mime_type, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, filename
    `;

    const insertValues = [
      uniqueFileName,
      file.name,
      buffer,
      file.size,
      file.type
    ];

    const result = await pool.query(insertQuery, insertValues);

    // Return file info
    return NextResponse.json({
      success: true,
      fileId: result.rows[0].id,
      filename: result.rows[0].filename,
      originalName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
