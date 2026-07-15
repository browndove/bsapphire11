# Guest Apply (No Login) — Backend API Spec

**Audience:** backend developers implementing public job applications without candidate authentication.

**Staging base URL:** `https://jobportal.blvcksapphire.com/api/v1`

**Related docs:** `job-portal/BACKEND_INTEGRATION.txt`, `job-portal/SCREENING_QUESTIONNAIRE_API.md`

**Status:** Frontend and BFF are **done**. Production apply is **blocked** until the two public endpoints below are implemented on the job portal API.

---

## Product requirement

Applicants must **not** create an account, sign in, or set up 2FA to apply.

| Requirement | Detail |
|-------------|--------|
| Apply from careers | Link goes to `/candidate/apply?jobId=<uuid>` — no login redirect |
| One-step submit | Contact info + cover letter + resume + screening answers → confirmation |
| No registration | `/candidate/register` redirects to careers; create-account UI removed from apply |
| No 2FA on apply | Authenticator setup is not part of the apply flow |
| Success UX | Redirect to `/success-job` after submit |
| Legacy portal | `/candidate/login` kept only for **existing** accounts to view old applications |

**Explicitly out of scope for applicants:** `POST /auth/register`, password fields, TOTP enrollment during apply.

---

## Implementation status

| Layer | Item | Status |
|-------|------|--------|
| Backend | `GET /jobs`, `GET /jobs/:id` | Done |
| Backend | `POST /me/applications` (authenticated) | Done |
| Backend | `POST /public/files/upload-url` | **Required — not implemented** |
| Backend | `POST /jobs/:id/applications` (guest) | **Required — not implemented** |
| Frontend | Guest apply form (no signup) | Done |
| Frontend | BFF `POST /api/public/files/upload-url` | Done → proxies upstream |
| Frontend | BFF `POST /api/public/jobs/:id/applications` | Done → proxies upstream |
| Optional | Guest application status lookup | Not required for launch |

**Verified on staging (2026-07-09):** `POST /jobs/:id/applications` returns **404**.

Until both required endpoints ship, applicants see a user-facing error on submit.

---

## End-to-end flow

```
Careers                         Next.js BFF                         Job portal API
───────                         ───────────                         ──────────────
/careers → apply link
/candidate/apply?jobId=…
        │
        ├─ GET /api/public/jobs/:id          ──►  GET /jobs/:id
        │                                         screening_questions[]
        │
        ├─ POST /api/public/files/upload-url ──►  POST /public/files/upload-url
        ├─ PUT  <presigned upload_url>       ──►  S3
        │
        └─ POST /api/public/jobs/:id/applications ──► POST /jobs/:id/applications
                                                        create Application row
                                                              │
Employer inbox ◄──────────────────────────────────────────────┘
GET /employer/applications
```

No `Authorization` header on guest upload or guest apply.

---

## Endpoints to implement

### 1. `POST /public/files/upload-url`

Presigned S3 upload for resumes **without** authentication.

**Auth:** None (public).

**Request body** — identical to authenticated `POST /files/upload-url`:

```json
{
  "content_type": "application/pdf",
  "filename": "resume.pdf",
  "purpose": "resume"
}
```

**Response** — identical to authenticated upload (`200 OK`):

```json
{
  "upload_url": "https://s3.amazonaws.com/...",
  "file_url": "uploads/resumes/abc123.pdf",
  "download_url": "https://s3.amazonaws.com/...",
  "expires_at": "2026-07-10T12:00:00Z"
}
```

**Rules:**

| Rule | Behavior |
|------|----------|
| `purpose` | **`resume` or `document`** — reject `company_logo` etc. with `403` |
| `content_type` | Same allowlist as `POST /files/upload-url` (PDF, DOC, DOCX, …) |
| `filename` | Sanitize; reject path traversal |
| Presigned PUT TTL | ~15 minutes |
| Max file size | Match existing upload limits (frontend enforces 20 MB) |
| Orphan keys | GC uploads not referenced by an application within 24h (optional) |

**Client flow after response:**

1. `PUT` file bytes to `upload_url` with `Content-Type` matching `content_type`
2. Pass returned `file_url` as `resume_url` on guest apply

---

### 2. `POST /jobs/:id/applications`

Submit an application without a candidate session.

**Auth:** None (public).

**Path param:** `id` — job UUID (same ID as `GET /jobs/:id`).

**Constraints:**

- Job must exist and have `status = published`
- Closed/draft/archived jobs → `404`

**Request body** — this is the **exact JSON** the frontend sends today:

```json
{
  "first_name": "Ama",
  "last_name": "Osei",
  "email": "ama@example.com",
  "phone": "+233201234567",
  "cover_letter": "I am interested in this role because…",
  "resume_url": "uploads/resumes/abc123.pdf",
  "answers": {
    "sq_years": "3–5 years",
    "sq_stack": ["Go", "Kubernetes"],
    "sq_portfolio": "Led migration of monolith to microservices…"
  }
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `first_name` | Yes | Trimmed string |
| `last_name` | Yes | Trimmed string |
| `email` | Yes | Valid email; used for duplicate detection |
| `phone` | No | Omitted when empty |
| `cover_letter` | Yes | Non-empty after trim |
| `resume_url` | Yes | Must be a `file_url` from `POST /public/files/upload-url` (or authenticated upload) |
| `github_url` | No | Optional GitHub profile / repo URL |
| `additional_link` | No | Optional portfolio / website URL |
| `additional_document_url` | No | Optional `file_url` from upload (`purpose: "document"`) — used for cover-letter PDF uploads |
| `answers` | Conditional | Same rules as `POST /me/applications` |

**Optional aliases** (frontend sends canonical names only; aliases help other clients):

| Canonical | Also accept |
|-----------|-------------|
| `first_name` | `candidate_first_name` |
| `last_name` | `candidate_last_name` |
| `email` | `candidate_email` |
| `phone` | `candidate_phone` |

**Do not** expect `job_id` in the body — it is only in the path.

**Success:** `201 Created` — use the same `ApplicationResponse` as authenticated apply:

```json
{
  "id": "app-uuid",
  "job_id": "job-uuid",
  "job_title": "Backend Engineer",
  "status": "submitted",
  "candidate_first_name": "Ama",
  "candidate_last_name": "Osei",
  "candidate_email": "ama@example.com",
  "candidate_phone": "+233201234567",
  "cover_letter": "…",
  "resume_url": "uploads/resumes/abc123.pdf",
  "answers": {
    "sq_years": "3–5 years",
    "sq_stack": ["Go", "Kubernetes"]
  },
  "created_at": "2026-07-10T10:00:00Z",
  "updated_at": "2026-07-10T10:00:00Z"
}
```

**Error envelope** — same as existing APIs:

```json
{
  "status": "error",
  "message": "Invalid screening answers",
  "code": 400,
  "errors": {
    "email": "required",
    "answers.sq_years": "must match one of the question options"
  }
}
```

| HTTP | When |
|------|------|
| `400` | Validation failure (contact fields, screening, invalid `resume_url`) |
| `404` | Job not found or not published |
| `409` | Active application already exists for this `email` + `job_id` |
| `429` | Rate limit exceeded |
| `503` | S3 / storage unavailable |

**Frontend error mapping:**

| Status | User message (approx.) |
|--------|------------------------|
| `409` | "You have already applied for this role with this email address." |
| `404` | "Applications are temporarily unavailable. Please try again shortly." |

---

## Screening answers

Reuse validation from `POST /me/applications` — see `SCREENING_QUESTIONNAIRE_API.md`.

| Rule | Behavior |
|------|----------|
| Job has no questions | `answers` omitted or `{}` |
| Job has questions | Every question `id` must have an answer |
| Unknown keys | `400` → `errors["answers.<id>"]` |
| `single` | String matching one option |
| `multi` | Non-empty array; each value in options |
| `text` | Non-empty string |
| Wrong / empty values | `400` |

---

## Duplicate applications

| Case | Behavior |
|------|----------|
| Same `email` + `job_id`, active application | `409` |
| Previous application `withdrawn` for same email + job | Allow reapply |
| Email has candidate account with active apply | `409` (same rule) |

Match authenticated apply: one active application per email per job.

---

## Data model

Store guest applications in the **same** `applications` table as portal applies.

| Field | Guest apply |
|-------|-------------|
| `candidate_id` | `NULL` (no user row required) |
| `candidate_first_name` | From request |
| `candidate_last_name` | From request |
| `candidate_email` | From request |
| `candidate_phone` | From request |
| `cover_letter`, `resume_url`, `answers`, `status`, `job_id` | Same as today |
| `source` (optional) | `guest` vs `portal` for analytics |

Employer endpoints must return guest rows unchanged:

- `GET /employer/applications`
- `GET /employer/jobs/:id/applications`

Screening filters (`answer_{question_id}=…`) must include guest applications.

---

## What stays the same

| Endpoint / behavior | Notes |
|---------------------|-------|
| `POST /me/applications` | Legacy logged-in candidates only |
| `POST /files/upload-url` | Authenticated uploads (employer logos, portal resumes) |
| `POST /auth/register` | May remain for admin/bootstrap; **not used by careers apply** |
| Employer application APIs | No schema changes expected |
| Screening filters | Unchanged |

---

## Security (required for public routes)

| Control | Recommendation |
|---------|----------------|
| Rate limiting | Per IP: ~5 uploads + 5 applies / hour; per email: ~3 applies / day |
| `resume_url` validation | Reject URLs not issued by your presigned upload flow |
| File type / size | Same rules as authenticated upload |
| PII logging | Do not log cover letter body or resume content |
| CAPTCHA | Optional later via `X-Captcha-Token` header |
| Spam honeypot | Optional `website` field — reject if non-empty |

---

## Phase 2 (optional — not blocking launch)

| Feature | Notes |
|---------|-------|
| Account linking | Attach `candidate_id` when guest email matches existing user |
| Confirmation email | "Application received" to `candidate_email` |
| Status lookup | `GET /public/applications/:token` magic link — no login |
| Re-open registration | Only if product decides to bring back candidate portal signup |

Registration is **disabled** on the frontend; do not require it for guest apply MVP.

---

## Design decisions

| Question | Decision |
|----------|----------|
| Separate guest applications table? | **No** — same table, nullable `candidate_id` |
| Password on apply? | **No** |
| 2FA on apply? | **No** |
| Email verification before submit? | **No** (optional email after submit) |
| Public upload purposes | **`resume` and `document`** on `/public/files/upload-url` |
| Upload mechanism | Presigned PUT (same as existing file flow) |
| Duplicate active apply | `409` |
| Reapply after withdraw | Allow |

---

## Frontend integration (already shipped)

The Next.js app calls these BFF routes; BFF forwards to the upstream paths above.

| BFF route | Upstream | Client function |
|-----------|----------|-----------------|
| `POST /api/public/files/upload-url` | `POST /public/files/upload-url` | `uploadResumePublic()` |
| `POST /api/public/jobs/:id/applications` | `POST /jobs/:id/applications` | `submitGuestApplication()` |

**Mapper:** `mapGuestApplicationSubmitToApi()` in `src/lib/job-api/mappers.js`

**Apply page:** `src/app/(candidate)/candidate/apply/page.js`

**Payload notes from frontend:**

- `first_name`, `last_name`, `email` are trimmed before send
- `phone` omitted when blank
- Empty `answers` object is omitted entirely
- Multi-choice answers sent as string arrays; single/text as strings

---

## Acceptance criteria (backend PR)

Use this checklist before marking done:

- [ ] `POST /public/files/upload-url` accepts `purpose: "resume"` without auth
- [ ] `POST /public/files/upload-url` rejects non-resume purposes with `403`
- [ ] Presigned PUT works; returned `file_url` can be stored on application
- [ ] `POST /jobs/:id/applications` creates application without auth
- [ ] Only **published** jobs accept applications
- [ ] Contact field validation returns `400` with `errors` map
- [ ] Screening validation matches `POST /me/applications`
- [ ] Duplicate active apply (same email + job) returns `409`
- [ ] Reapply allowed after `withdrawn`
- [ ] Guest applications appear in `GET /employer/applications` with contact fields
- [ ] Screening inbox filters work on guest applications
- [ ] Rate limiting enabled on both public endpoints
- [ ] Swagger / OpenAPI updated
- [ ] Staging smoke test: careers → apply → success (full flow)

---

## Smoke test script

Replace `JOB_ID` with a published job UUID on staging.

```bash
BASE=https://jobportal.blvcksapphire.com/api/v1
JOB_ID=c448d261-0445-4261-b5ad-f567d1ae6502

# 1. Load job (should include screening_questions)
curl -s "$BASE/jobs/$JOB_ID" | jq '.screening_questions'

# 2. Get upload URL
curl -s -X POST "$BASE/public/files/upload-url" \
  -H 'Content-Type: application/json' \
  -d '{"content_type":"application/pdf","filename":"resume.pdf","purpose":"resume"}'

# 3. PUT resume to upload_url from step 2
# curl -X PUT "<upload_url>" -H "Content-Type: application/pdf" --data-binary @resume.pdf

# 4. Submit application
curl -s -X POST "$BASE/jobs/$JOB_ID/applications" \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name": "Test",
    "last_name": "Applicant",
    "email": "test.applicant@example.com",
    "phone": "+1234567890",
    "cover_letter": "Interested in this role.",
    "resume_url": "<file_url from step 2>",
    "answers": {}
  }'
# Expect 201

# 5. Duplicate submit (same email) → expect 409
```

---

## Example full sequence

```http
GET /api/v1/jobs/{jobId}
→ 200 { "screening_questions": [...] }

POST /api/v1/public/files/upload-url
Content-Type: application/json

{"content_type":"application/pdf","filename":"resume.pdf","purpose":"resume"}
→ 200 { "upload_url", "file_url", "download_url", "expires_at" }

PUT {upload_url}
Content-Type: application/pdf

<binary>
→ 200

POST /api/v1/jobs/{jobId}/applications
Content-Type: application/json

{
  "first_name": "Ama",
  "last_name": "Osei",
  "email": "ama@example.com",
  "phone": "+233201234567",
  "cover_letter": "…",
  "resume_url": "uploads/resumes/abc123.pdf",
  "answers": { "sq_years": "3–5 years" }
}
→ 201 ApplicationResponse
```
