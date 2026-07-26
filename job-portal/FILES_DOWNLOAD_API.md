# File download URLs — Backend API Spec

**Audience:** backend developers  
**Staging base URL:** `https://jobportal.blvcksapphire.com/api/v1`  
**Related:** upload flow in prior S3 / `POST /files/upload-url` notes

---

## Problem

Uploads store an S3 **key** (e.g. `jobportal/document/.../uuid_OriginalName.pdf`) in
`resume_url`, `additional_document_url`, `logo_url`, or inside cover-letter text markers.

The bucket is private. Employers cannot open those keys in the browser.

List/detail responses should already rewrite dedicated URL fields to temporary HTTPS
download links. Keys embedded in free-text `cover_letter` (and any unresolved keys)
still need an explicit download endpoint.

**Filename issue:** Opening a raw signed URL makes the browser use the storage object
name (often UUID-prefixed). The original candidate upload name must be restored via
`Content-Disposition` (or the BFF content proxy below).

---

## Endpoint

### `POST /files/download-url`

Return a short-lived presigned GET URL for an existing object key.

**Auth:** Bearer (employer or candidate who is allowed to access the object).

**Request:**

```json
{
  "file_url": "jobportal/document/document/guest/c0781769-…_test.docx",
  "filename": "test.docx"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `file_url` | Yes | S3 key previously issued by upload (`file_url`). Reject `https://…` that are not our keys, path traversal, and unknown prefixes. |
| `filename` | No | Original upload name (or recovered from key after `{uuid}_`). Prefer using this for `ResponseContentDisposition`. |

**Response `200`:**

```json
{
  "download_url": "https://s3.amazonaws.com/…?X-Amz-…",
  "expires_at": "2026-07-23T18:00:00Z"
}
```

| Field | Notes |
|-------|-------|
| `download_url` | Presigned GET; open in browser / download. **Recommended:** sign with `ResponseContentDisposition: inline; filename="<original>"` (sanitize) so Save As keeps the candidate’s name. |
| `expires_at` | ISO-8601; ~1 hour recommended (same as read rewriting) |

**Errors:**

| Status | When |
|--------|------|
| `400` | Missing/invalid `file_url` |
| `401` | Missing/invalid token |
| `403` | Caller not allowed to access this object |
| `404` | Object not found |
| `503` | S3 not configured |

---

## Access rules (recommended)

- **Employer:** may download files referenced by applications (or company logo) for their org.
- **Candidate:** may download their own `resume_url` / application documents.
- Do **not** allow arbitrary key download across orgs.

---

## Frontend (already wired)

- BFF: `POST /api/job-portal/files/download-url` → upstream `POST /files/download-url`
- BFF content proxy (preserves original filename today without waiting on S3 disposition):
  - `POST /api/job-portal/files/content` → mints a 2-minute ticket after authorizing via download-url
  - `GET /api/job-portal/files/content?ticket=…` → streams the file with
    `Content-Disposition: inline|attachment; filename="<original>"`
- UI “View” / “Download” on application materials use this proxy and recover the name from
  the storage key (`{uuid}_{originalName}`) or the cover-letter marker.

---

## Also keep

On `GET` application / company / profile responses, continue resolving `resume_url`,
`additional_document_url`, and `logo_url` keys to HTTPS so most “View” clicks never
need this endpoint. When rewriting those URLs, also set
`ResponseContentDisposition` with the original filename when known.

`POST /files/download-url` covers keys that were not rewritten (cover-letter markers,
stale clients, etc.).
