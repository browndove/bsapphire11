
# Application Field Requirements — Backend API Spec

**Audience:** backend and frontend developers configuring which apply materials are required vs optional per job.

**Staging base URL:** `https://jobportal.blvcksapphire.com/api/v1`

**Related docs:** `job-portal/BACKEND_INTEGRATION.txt`, `job-portal/GUEST_APPLY_API.md`, `job-portal/SCREENING_QUESTIONNAIRE_API.md`

**Status:** Backend **ready**. Frontend job-edit + apply form wired to `application_fields`.

---

## Goal

Let employers decide, **per job posting**, which candidate application materials are required and which are optional (or hidden).

Today the careers apply form uses fixed rules:

| Field | Current rule |
|-------|--------------|
| Cover letter (file upload) | Required |
| Resume | Required |
| Additional document | Optional |
| GitHub URL | Optional |
| Portfolio / other link | Optional |

Screening questions are already configurable per job. This spec adds the same idea for the fixed apply materials.

---

## Product rules

| Rule | Detail |
|------|--------|
| Per-job config | Stored on the job; applies to guest and authenticated apply |
| Employer UI | Configure when creating/editing a posting |
| Candidate UX | Form labels show required vs optional; hidden fields are not shown |
| Validation | Backend rejects apply payloads that omit fields marked `required` |
| Defaults | If config is missing, use the defaults below (matches current frontend) |
| Resume floor | Recommend keeping `resume` required for all posted jobs; backend may allow `optional` but product should discourage it |

**Out of scope:** renaming labels per job, multiple additional documents, arbitrary custom file fields beyond the five listed below.

---

## Field keys

Use these exact keys everywhere (job config + validation errors):

| Key | Candidate UI | Apply body field |
|-----|--------------|------------------|
| `cover_letter` | Cover letter file upload | `cover_letter` text stub + file link convention used by frontend; validation treats presence of an uploaded cover letter |
| `resume` | Resume upload | `resume_url` |
| `additional_document` | Additional document upload | `additional_document_url` |
| `github_url` | GitHub URL | `github_url` |
| `additional_link` | Portfolio or other link | `additional_link` |

Notes for `cover_letter`:

- Request bodies still use the existing `cover_letter` string field.
- Frontend currently uploads a cover letter file and stores the URL inside `cover_letter` (marker format) or as text stub + `additional_document_url` on older apps.
- Backend required-check for `cover_letter` should treat the field as present when `cover_letter` is non-empty after trim **or** a dedicated cover-letter file URL is present in an agreed marker / future `cover_letter_url` field.
- Prefer adding optional `cover_letter_url` in a follow-up if backend wants a clean dedicated column; this spec does not require that change for v1.

---

## Requirement values

| Value | Meaning |
|-------|---------|
| `required` | Field must be completed to submit |
| `optional` | Field is shown; may be blank |
| `hidden` | Field is not shown on the apply form; ignore if sent |

---

## Default config

When `application_fields` is omitted or partially omitted, merge with:

```json
{
  "cover_letter": "required",
  "resume": "required",
  "additional_document": "optional",
  "github_url": "optional",
  "additional_link": "optional"
}
```

Unknown keys: reject on write with `400` / field error.  
Missing keys on read: fill from defaults above.

---

## Data model (on Job)

Add JSON object (or normalized columns) on the job:

```json
"application_fields": {
  "cover_letter": "required",
  "resume": "required",
  "additional_document": "optional",
  "github_url": "optional",
  "additional_link": "hidden"
}
```

| Constraint | Rule |
|------------|------|
| Type | object |
| Values | only `required` \| `optional` \| `hidden` |
| Completeness | all five keys present after defaults are applied |
| Immutable after applications? | **No** for v1 — later edits affect new applies only; already-submitted apps keep whatever they sent |

---

## API changes

### 1. Create / update job

`POST /employer/jobs`  
`PATCH /employer/jobs/:id`

Accept optional:

```json
{
  "title": "…",
  "description": "…",
  "application_fields": {
    "cover_letter": "required",
    "resume": "required",
    "additional_document": "optional",
    "github_url": "hidden",
    "additional_link": "optional"
  }
}
```

| Status | When |
|--------|------|
| `200` / `201` | Saved; response includes merged `application_fields` |
| `400` | Invalid key, invalid value, or empty object where invalid |

Same shape on `UpdateJobRequest`.

### 2. Employer job responses

`GET /employer/jobs`, `GET /employer/jobs/:id`

Always include resolved `application_fields` (defaults applied).

### 3. Public job responses

`GET /jobs`, `GET /jobs/:id` (and BFF `/api/public/jobs*`)

Include the same `application_fields` object so the apply form can render required/optional/hidden correctly **without** employer auth.

Example public job fragment:

```json
{
  "id": "…",
  "title": "Senior Backend Engineer",
  "screening_questions": [],
  "application_fields": {
    "cover_letter": "required",
    "resume": "required",
    "additional_document": "optional",
    "github_url": "optional",
    "additional_link": "optional"
  }
}
```

### 4. Apply validation

`POST /jobs/:id/applications` (guest)  
`POST /me/applications` (authenticated)

After resolving the job’s `application_fields`:

| Config | Validation |
|--------|------------|
| `required` | Field must be present and non-empty (URLs trim; cover letter non-empty trim; file URLs must look like issued upload `file_url`s where applicable) |
| `optional` | May be omitted or empty |
| `hidden` | Do not require; if provided, either ignore silently **or** accept and store (prefer **accept and store**) |

Return `400` with field errors using the keys above (or the apply body key when clearer):

```json
{
  "code": 400,
  "message": "validation failed",
  "errors": {
    "resume_url": "required",
    "github_url": "required"
  }
}
```

Mapping for error keys:

| Config key | Preferred error key |
|------------|---------------------|
| `cover_letter` | `cover_letter` |
| `resume` | `resume_url` |
| `additional_document` | `additional_document_url` |
| `github_url` | `github_url` |
| `additional_link` | `additional_link` |

---

## End-to-end flow

```
Employer job edit                 Public apply                      Apply submit
─────────────────                 ────────────                      ────────────
PATCH /employer/jobs/:id          GET /jobs/:id                     POST …/applications
  application_fields     →          application_fields     →          validate against job config
                                    render / hide fields              400 if required missing
```

Screening questions remain independent: `application_fields` does not replace `screening_questions`.

---

## Frontend plan (after backend ships)

| Area | Change |
|------|--------|
| Job edit | New “Application materials” section: select Required / Optional / Hidden per field |
| Mappers | Map `application_fields` on job read/write |
| Apply form | Drive labels, visibility, and client validation from job config |
| Employer detail | Unchanged (already shows whatever was submitted) |

Until backend ships, frontend keeps hardcoded defaults identical to this spec’s default config.

---

## Migration

| Existing jobs | Behavior |
|---------------|----------|
| No `application_fields` column / null | Respond with defaults |
| Partial object | Merge missing keys from defaults |

No backfill required if defaults are applied at read time.

---

## Acceptance checklist

- [ ] `POST/PATCH /employer/jobs` accepts `application_fields`
- [ ] Invalid values/`keys` return `400` field errors
- [ ] `GET /employer/jobs/:id` and `GET /jobs/:id` return fully resolved `application_fields`
- [ ] Guest apply rejects missing required materials with field errors
- [ ] Authenticated apply uses the same rules
- [ ] Jobs without config behave like current product defaults
- [ ] Swagger updated (`CreateJobRequest`, `UpdateJobRequest`, `JobResponse`)

---

## Example curl

```bash
# Configure a posting: hide GitHub, require portfolio link
curl -s -X PATCH "$BASE/employer/jobs/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "application_fields": {
      "cover_letter": "required",
      "resume": "required",
      "additional_document": "optional",
      "github_url": "hidden",
      "additional_link": "required"
    }
  }'
```

```bash
# Public job must expose the same config
curl -s "$BASE/jobs/$JOB_ID" | jq .application_fields
```

---

## Open questions for backend

1. Should `resume: "hidden"` or `resume: "optional"` be forbidden for published jobs?
2. Prefer adding first-class `cover_letter_url` instead of encoding file URLs in `cover_letter` text?
3. Should changing requirements after publish send any employer warning? (frontend-only is fine for v1)
