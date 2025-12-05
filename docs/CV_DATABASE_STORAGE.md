# CV Database Storage Implementation

This document describes the updated CV storage system that stores file content directly in the PostgreSQL database instead of the file system.

## Overview

The CV upload system now stores file content as binary data (BYTEA) in PostgreSQL, providing better data integrity, easier backups, and simplified deployment.

## Database Schema

### cv_files Table
Stores the actual CV file content and metadata:

```sql
CREATE TABLE cv_files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,           -- Unique filename with timestamp
  original_name VARCHAR(255) NOT NULL,      -- Original filename from user
  file_content BYTEA NOT NULL,              -- Binary file content
  file_size INTEGER NOT NULL,               -- File size in bytes
  mime_type VARCHAR(100) NOT NULL,          -- MIME type (application/pdf, etc.)
  created_at TIMESTAMP DEFAULT NOW()
);
```

### candidate_responses Table Updates
Added reference to cv_files table:

```sql
ALTER TABLE candidate_responses 
ADD COLUMN cv_file_id INTEGER REFERENCES cv_files(id);
```

## API Endpoints

### POST /api/upload-cv
Uploads CV file and stores content in database.

**Request**: FormData with 'cv' file field
**Response**: 
```json
{
  "success": true,
  "fileId": 123,
  "filename": "1234567890_resume.pdf",
  "originalName": "resume.pdf",
  "size": 1024000,
  "type": "application/pdf"
}
```

### GET /api/cv-files/[id]
Retrieves CV file content from database by file ID.

**Response**: Binary file content with appropriate headers:
- Content-Type: [mime_type]
- Content-Disposition: attachment; filename="[original_name]"
- Content-Length: [file_size]

### POST /api/candidates
Updated to accept `cvFileId` field linking to cv_files table.

### GET /api/candidates
Returns candidate data with joined CV file information:
```json
{
  "success": true,
  "candidates": [
    {
      "id": 1,
      "first_name": "John",
      "cv_file_id": 123,
      "cv_filename": "1234567890_resume.pdf",
      "cv_original_name": "resume.pdf",
      "cv_file_size": 1024000,
      "cv_mime_type": "application/pdf"
    }
  ]
}
```

## Data Flow

1. **Upload Process**:
   - User selects CV file in questionnaire
   - File is uploaded to `/api/upload-cv`
   - File content stored as BYTEA in `cv_files` table
   - Returns `fileId` to frontend
   - `fileId` stored in form data

2. **Submission Process**:
   - Form submitted with `cvFileId`
   - Candidate record created with reference to CV file
   - Foreign key relationship established

3. **Retrieval Process**:
   - Admin views candidate list with CV information
   - CV downloaded via `/api/cv-files/[id]` endpoint
   - File content served directly from database

## Advantages of Database Storage

### ✅ **Benefits**:
- **Data Integrity**: Files and metadata stay together
- **Atomic Operations**: File upload and candidate creation in single transaction
- **Backup Simplicity**: Single database backup includes all data
- **Deployment**: No file system dependencies
- **Security**: Database-level access controls
- **Scalability**: Works with database clustering/replication

### ⚠️ **Considerations**:
- **Database Size**: Files stored in database increase size
- **Memory Usage**: Large files loaded into memory for serving
- **Performance**: May be slower for very large files
- **Backup Time**: Database backups take longer with binary data

## File Size Limits

- **Upload Limit**: 5MB per file
- **Supported Formats**: PDF, DOC, DOCX
- **Database Limit**: PostgreSQL BYTEA can handle up to 1GB per field

## Security Features

- **File Type Validation**: Server-side MIME type and extension checking
- **Size Validation**: Prevents oversized uploads
- **Access Control**: Files only accessible via authenticated API
- **SQL Injection Protection**: Parameterized queries used throughout

## Migration Scripts

The following scripts were used to migrate from file system to database storage:

1. `scripts/create-cv-files-table.js` - Creates cv_files table
2. `scripts/update-candidate-cv-reference.js` - Adds cv_file_id column
3. `scripts/migrate-cv-to-db-storage.js` - Adds additional CV columns

## Usage Examples

### Download CV File
```javascript
// Get file by ID
const response = await fetch(`/api/cv-files/${fileId}`);
const blob = await response.blob();
const url = URL.createObjectURL(blob);

// Trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'resume.pdf';
a.click();
```

### Check File Exists
```sql
SELECT EXISTS(
  SELECT 1 FROM cv_files WHERE id = $1
) as file_exists;
```

## Monitoring and Maintenance

### Database Size Monitoring
```sql
-- Check cv_files table size
SELECT 
  pg_size_pretty(pg_total_relation_size('cv_files')) as table_size,
  COUNT(*) as file_count,
  AVG(file_size) as avg_file_size
FROM cv_files;
```

### Cleanup Old Files
```sql
-- Remove files older than 1 year with no candidate reference
DELETE FROM cv_files 
WHERE created_at < NOW() - INTERVAL '1 year'
  AND id NOT IN (
    SELECT cv_file_id FROM candidate_responses 
    WHERE cv_file_id IS NOT NULL
  );
```

## Future Enhancements

- **Compression**: Implement file compression before storage
- **Chunked Upload**: Support for larger files via chunked upload
- **CDN Integration**: Serve files via CDN for better performance
- **File Versioning**: Support multiple versions of candidate CVs
- **Bulk Operations**: Batch file operations for admin interface
