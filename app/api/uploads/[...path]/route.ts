import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = join(process.cwd(), 'uploads', ...params.path);
    
    // Security check - ensure the file is within the uploads directory
    if (!filePath.startsWith(join(process.cwd(), 'uploads'))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const fileName = params.path[params.path.length - 1];
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (fileName.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (fileName.endsWith('.doc')) {
      contentType = 'application/msword';
    } else if (fileName.endsWith('.docx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
