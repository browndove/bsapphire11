# Screening Questionnaire — Backend API Spec

**Audience:** frontend and backend developers integrating screening questions and candidate answers for the Blvck Sapphire job portal.

**Staging base URL:** `https://jobportal.blvcksapphire.com/api/v1`

Configure locally in `.env.local`:

```env
JOB_API_BASE_URL=https://jobportal.blvcksapphire.com/api/v1
```

The Next.js app proxies through same-origin BFF routes under `/api/job-portal/*` and `/api/public/*`. See `job-portal/BACKEND_INTEGRATION.txt` for auth and general integration notes.

---

## Implementation status

| Area | Status |
|------|--------|
| Job CRUD with `screening_questions` | Done |
| Public job detail exposes questions | Done |
| Candidate apply with `answers` | Done |
| Application lists return `answers` | Done |
| Employer inbox screening filters (`answer_{id}` params) | Done |
| `POST /employer/applications/search` (JSON body) | **Not implemented** — use query params below |
| `GET /employer/applications/:id` (single application) | **Not implemented** — use list endpoints |

---

## Flow overview

```
Employer                          Candidate                         Employer inbox
────────                          ─────────                         ──────────────
POST/PATCH /employer/jobs         GET /jobs/:id                     GET /employer/applications
  screening_questions[]    →        screening_questions[]      →      ?job_id=&answer_sq_*=
                                    render apply form                 filter by chip answers

POST /me/applications
  answers{ question_id: value }
```

1. Employer attaches questions when creating/updating a job.
2. Published jobs expose questions to candidates (no correct answers).
3. Candidate submits answers with their application.
4. Employer reads answers on application rows and filters the inbox using `answer_{question_id}` query params.

---

## Question model (`screening_questions`)

Returned on job responses and accepted on create/update.

```json
{
  "id": "sq_years",
  "label": "Years of experience",
  "type": "single",
  "filterable": true,
  "options": ["0–2 years", "3–5 years", "6+ years"]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Stable ID. Frontend may send `sq_*` prefixes; backend preserves them. |
| `label` | string | Required question text. |
| `type` | string | `single`, `multi`, or `text`. |
| `filterable` | boolean | Default `false`. Only meaningful for `single`/`multi` with ≥ 1 option. |
| `options` | string[] | Required for `single`/`multi`. Empty `[]` for `text`. |

### Accepted field aliases (request bodies only)

| Canonical | Also accepted |
|-----------|---------------|
| `id` | `question_id` |
| `label` | `text` |
| `filterable` | `is_filterable` |

### Validation limits

| Rule | Value |
|------|-------|
| Max questions per job | 20 |
| Max options per choice question | 20 |
| Max text answer length | 2000 characters |
| All questions required on apply | Yes |
| `filterable` on text questions | Always forced to `false` |

### Question types

| `type` | Answer value on submit | Filterable |
|--------|------------------------|------------|
| `single` | string (exact option match) | Yes |
| `multi` | string[] (non-empty subset of options) | Yes |
| `text` | string (non-empty) | No |

---

## Endpoints — Jobs

### Create / update (employer)

```
POST   /employer/jobs
PATCH  /employer/jobs/:id
```

Include `screening_questions` in the JSON body:

```json
{
  "title": "Backend Engineer",
  "description": "...",
  "status": "published",
  "screening_questions": [
    {
      "id": "sq_years",
      "label": "Years of backend experience",
      "type": "single",
      "filterable": true,
      "options": ["0–2 years", "3–5 years", "6+ years"]
    },
    {
      "id": "sq_stack",
      "label": "Production stack",
      "type": "multi",
      "filterable": true,
      "options": ["Go", "Node.js", "Python", "Kubernetes"]
    },
    {
      "id": "sq_portfolio",
      "label": "Best backend project",
      "type": "text",
      "filterable": false,
      "options": []
    }
  ]
}
```

#### PATCH semantics

| Payload | Effect |
|---------|--------|
| Field omitted | Questions unchanged |
| `"screening_questions": []` | Remove all questions |
| `"screening_questions": [...]` | Replace entire questionnaire |

Question `id` values are preserved across updates so existing application answers remain addressable.

### Read (employer + public)

| Endpoint | Returns `screening_questions` |
|----------|------------------------------|
| `GET /employer/jobs` | Yes (per job in `items`) |
| `GET /employer/jobs/:id` | Yes |
| `GET /jobs/:id` | Yes (published jobs only) |

Jobs with no questionnaire return `"screening_questions": []`.

---

## Endpoints — Applications

### Submit (candidate)

```
POST /me/applications
Authorization: Bearer <candidate_token>
```

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "cover_letter": "Interested in this role.",
  "resume_url": "https://...",
  "answers": {
    "sq_years": "3–5 years",
    "sq_stack": ["Go", "Kubernetes"],
    "sq_portfolio": "Led migration of monolith to microservices..."
  }
}
```

| Rule | Behavior |
|------|----------|
| Job has no questions | `answers` may be omitted or `{}` |
| Job has questions | Every question `id` must have an answer |
| Unknown keys in `answers` | `400` with `errors["answers.<id>"]` |
| Wrong option value | `400` |
| Empty multi selection | `400` |
| Duplicate apply | `409` |

Error shape:

```json
{
  "status": "error",
  "message": "Invalid screening answers",
  "code": 400,
  "errors": {
    "answers.sq_years": "must match one of the question options"
  }
}
```

Success response includes `answers` on the application object.

### List (candidate)

```
GET /me/applications
```

Each item in `items` includes `answers` when present.

### List (employer)

```
GET /employer/applications
GET /employer/jobs/:id/applications
```

Each item includes candidate contact fields and `answers`:

```json
{
  "id": "app-uuid",
  "job_id": "job-uuid",
  "job_title": "Backend Engineer",
  "candidate_first_name": "Ama",
  "candidate_last_name": "Osei",
  "candidate_email": "ama@example.com",
  "candidate_phone": "+233...",
  "status": "reviewing",
  "cover_letter": "...",
  "resume_url": "https://...",
  "answers": {
    "sq_years": "3–5 years",
    "sq_stack": ["Go", "Kubernetes"],
    "sq_portfolio": "..."
  },
  "created_at": "2026-05-14T09:22:00Z",
  "updated_at": "2026-05-14T09:22:00Z"
}
```

> **Note:** There is no `GET /employer/applications/:id` detail endpoint. Load the application from a list response or filter by `job_id` / application `id` client-side.

---

## Employer inbox — screening filters

Use `GET /employer/applications` with a selected `job_id` and option chips encoded as query params.

### Base params

| Param | Example | Description |
|-------|---------|-------------|
| `job_id` | uuid | Required for screening filters to apply |
| `status` | `reviewing` | Pipeline stage |
| `q` | `ama` | Case-insensitive search: name, email, phone, answer text |
| `limit` / `offset` | `20` / `0` | Pagination |

### Screening params (implemented)

```
GET /employer/applications?job_id=<uuid>&answer_sq_years=3–5%20years&answer_sq_stack=Go&answer_sq_stack=Kubernetes
```

| Pattern | Meaning |
|---------|---------|
| `answer_{question_id}=<option>` | Filter by that option |
| Repeat param | Multiple selections on a `multi` question (OR within question) |
| Omit param | No filter on that question |

When screening params are active, the response may include:

```json
{
  "items": [ "..." ],
  "total": 3,
  "applied_filters": {
    "sq_years": ["3–5 years"],
    "sq_stack": ["Go", "Kubernetes"]
  }
}
```

### Match logic (server-side)

| Question type | Candidate passes when |
|---------------|----------------------|
| `single` | `answers[question_id]` equals the selected option |
| `multi` | Candidate's array overlaps any selected chip (**OR**) |
| Across questions | **AND** — all active question filters must pass |
| Missing answer | Excluded |

**Example:** filters `sq_years=3–5 years` AND `sq_stack=Go,Kubernetes` → candidate needs years match **and** at least one stack chip overlap.

### When filters are ignored or rejected

| Case | Behavior |
|------|----------|
| No `job_id` | Screening query params rejected or ignored for filter validation |
| Filter key not a filterable question on that job | `400` |
| Filter value not in question's `options` | `400` |

### Enabling filters on a job (employer editor)

In the posting editor, each choice question has **“Use answers as recruiter filters”**:

| Question type | Checkbox | Saved `filterable` |
|---------------|----------|-------------------|
| Single choice | enabled | `true` if checked and ≥ 1 option |
| Multiple choice | enabled | `true` if checked and ≥ 1 option |
| Short text | disabled | always `false` |

### Chip UI behavior (employer inbox)

| `type` | Recruiter selects | Match rule |
|--------|-------------------|------------|
| `single` | One chip per question (toggle off by clicking again) | Exact string match |
| `multi` | Multiple chips (toggle each) | Overlap with any selected chip |

Filters combine with job, stage, and search filters (all must pass).

Reference prototype: `job-portal/applications.html` (`matchesQuestions`, `chipsAppend`, `renderFilters`).

---

## Frontend wiring checklist

### Employer posting editor (already built)

| Task | API call |
|------|----------|
| Load job for edit | `GET /employer/jobs/:id` → map `screening_questions` |
| Save job | `POST` or `PATCH /employer/jobs` → send `screening_questions` array |
| `filterable` checkbox | Set `filterable: true` only on `single`/`multi` with options |

**Files:** `ScreeningQuestionsEditor.js`, `postings/edit/page.js`, `mappers.js`

### Candidate apply page (to wire)

| Task | API call |
|------|----------|
| Load job | `GET /jobs/:id` → read `screening_questions` |
| Render form | One control per question by `type` |
| Submit | `POST /me/applications` with `answers` map |
| Handle errors | Read `errors["answers.<id>"]` |

**Files:** `candidate/apply/page.js`, `mappers.js`, `client.js`

### Employer applications inbox (to wire)

| Task | API call |
|------|----------|
| Load applications | `GET /employer/applications?job_id=...` |
| Show answers | Read `item.answers` on each row |
| Render filter chips | From selected job's `screening_questions` where `filterable` |
| Apply filters | Append `answer_{id}=<option>` query params |
| Clear filters | Omit `answer_*` params |

**Files:** `applications/page.js`, `FilterRail.js` or new screening filter panel, `client.js`

---

## Mapper hints (`mappers.js`)

### Job from API

```javascript
screeningQuestions: job.screening_questions ?? job.screeningQuestions ?? []
```

### Job to API

```javascript
screening_questions: questions.map((q) => ({
  id: q.id,
  label: q.label,
  type: q.type,
  filterable: q.filterable ?? false,
  options: q.options ?? [],
}))
```

### Application from API

```javascript
answers: app.answers ?? {}
```

### Submit application

```javascript
{
  job_id: jobId,
  cover_letter,
  resume_url,
  answers: { [questionId]: value, ... },
}
```

### Screening filter query builder

```javascript
// selectedFilters: { sq_years: ["3–5 years"], sq_stack: ["Go", "Kubernetes"] }
const params = new URLSearchParams({ job_id: jobId });
for (const [qid, opts] of Object.entries(selectedFilters)) {
  for (const opt of opts) params.append(`answer_${qid}`, opt);
}
```

---

## Design decisions (resolved)

| Question | Decision |
|----------|----------|
| Max questions per job | 20 |
| Max options per question | 20 |
| All questions required on apply? | Yes |
| PATCH omit `screening_questions` | Leave unchanged |
| PATCH `screening_questions: []` | Clear all |
| Duplicate applications | `409` |
| Screening filter implementation | Server-side via `answer_{id}` query params |
| Multi-question filter within one question | **OR** (overlap) |
| Filter across questions | **AND** |
| Answer storage | Option strings, not indices (safe when options reordered) |
| `POST /employer/applications/search` | Not implemented; use `GET` query params |
| Application detail endpoint | Not implemented; use list endpoints |

---

## Reference — prototype answer examples

From `job-portal/assets/mock-store.js`:

```json
{
  "answers": {
    "sq_years": "6–10",
    "sq_tz": "UTC±3–5",
    "sq_stack": ["Kubernetes", "Hybrid"]
  }
}
```
