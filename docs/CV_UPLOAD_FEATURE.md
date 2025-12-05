# CV Upload Feature

This document describes the CV upload functionality added to the job application questionnaire system.

## Overview

Candidates can now upload their CV/Resume files (.pdf, .doc, .docx) as part of the application process. The files are stored on the server and linked to their questionnaire responses in the database.

## Features

- **File Upload**: Supports PDF, DOC, and DOCX formats
- **File Validation**: 
  - File type validation (PDF, DOC, DOCX only)
  - File size limit (5MB maximum)
  - Secure filename sanitization
- **Storage**: Files are stored in `/uploads/cvs/` directory with unique timestamps
- **Database Integration**: CV filename and file path are stored with candidate responses

## API Endpoints

### POST /api/upload-cv
Handles CV file uploads.

**Request**: FormData with 'cv' file field
**Response**: 
```json
{
  "success": true,
  "filename": "1234567890_resume.pdf",
  "originalName": "resume.pdf",
  "filePath": "/uploads/cvs/1234567890_resume.pdf",
  "size": 1024000,
  "type": "application/pdf"
}
```

### GET /api/uploads/cvs/[filename]
Serves uploaded CV files for download.

### POST /api/candidates
Updated to accept `cvFilename` and `cvFilePath` fields.

### GET /api/candidates
Updated to return CV information with candidate data.

## Database Schema

Added columns to `candidate_responses` table:
- `cv_filename` (VARCHAR(255)): Original filename of uploaded CV
- `cv_file_path` (VARCHAR(500)): Server path to stored CV file

## File Structure

```
/uploads/
  /cvs/
    /[timestamp]_[sanitized_filename].[ext]
```

## Security Considerations

- File type validation on both client and server
- Filename sanitization to prevent path traversal
- File size limits to prevent abuse
- Secure file serving with proper content types
- Files stored outside web root for security

## Usage

1. Candidate completes questionnaire steps
2. On CV upload step, they can drag & drop or click to select file
3. File is immediately uploaded and validated
4. Upon successful upload, filename and path are stored with form data
5. When form is submitted, CV information is saved to database
6. Admins can access CV files through the candidate management system

## Error Handling

- Invalid file types show user-friendly error messages
- File size exceeded shows clear size limit information
- Upload failures are handled gracefully with retry options
- Network errors provide appropriate feedback

## Future Enhancements

- Multiple file upload support
- Cloud storage integration (AWS S3, etc.)
- CV parsing and text extraction
- Thumbnail generation for PDF files
- Virus scanning integration
