# Screening Questionnaire — Backend API Spec

**Audience:** backend developer implementing job screening questions and candidate answers for the Blvck Sapphire job portal.

The Next.js frontend already has an employer UI to create questions and options. It sends `screening_questions` when saving a job, but the live API (Swagger at `/swagger/doc.json`) does not yet persist or return this field. Candidate apply currently sends only `job_id`, `cover_letter`, and `resume_url`.

This document defines what the backend should store and expose so the frontend can wire the full flow.

---

## Summary

1. Employers attach a questionnaire to a job posting.
2. Published jobs expose those questions to candidates (no correct answers).
3. Candidates submit answers with their application.
4. Employers read answers on the application and filter the inbox by option chips when questions are marked `filterable` (see [Employer candidate filtering](#employer-candidate-filtering-by-screening-answers)).

---

## Question model (stored on job)

**Field name in API:** `screening_questions` (array)

Each question object:

```json
{
  "id": "sq_years",
  "label": "Years of experience",
  "type": "single",
  "filterable": true,
  "options": ["0–2", "3–5"]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Stable ID (frontend generates `sq_*` prefixes) |
| `label` | string | Required. Question text shown to candidate |
| `type` | string | Required. One of: `single`, `multi`, `text` |
| `filterable` | boolean | Optional. Default `false` |
| `options` | string[] | Required for `single` / `multi`; empty `[]` for `text` |

### Question types

| `type` | UI label | Options required | Filterable allowed |
|--------|----------|------------------|--------------------|
| `single` | Single choice | yes (≥ 1) | yes |
| `multi` | Multiple choice | yes (≥ 1) | yes |
| `text` | Short text | no (`[]`) | no (always false) |

### Validation rules

The frontend enforces these before save; the backend should validate too:

- `label` must be non-empty after trim.
- Questions without a label are dropped and not sent.
- For `single` and `multi`, `options` are trimmed strings; empty strings are removed.
- `filterable` is only `true` when `type` is not `text` **and** at least one option exists.
- Option labels are plain strings; array order is display order.
- Question `id` should be preserved on update so existing applications can reference answers. If the backend prefers UUIDs, accept client IDs on create and return the canonical ID in responses.

---

## Example job payload (employer create/update)

`POST /employer/jobs`  
`PATCH /employer/jobs/:id`

```json
{
  "title": "Backend Engineer",
  "description": "...",
  "requirements": "...",
  "location": "Remote",
  "remote_type": "remote",
  "employment_type": "full_time",
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
      "label": "Technologies you have shipped in production",
      "type": "multi",
      "filterable": true,
      "options": ["Go", "Node.js", "Python", "Kubernetes"]
    },
    {
      "id": "sq_portfolio",
      "label": "Link or summary of your best backend project",
      "type": "text",
      "filterable": false,
      "options": []
    }
  ]
}
```

To clear all questions on update, accept either:

```json
"screening_questions": []
```

or omit the field according to your PATCH semantics (document which you support).

---

## Job response (employer + public)

Return `screening_questions` on:

- `GET /employer/jobs`
- `GET /employer/jobs/:id`
- `GET /jobs/:id` (public job detail — published jobs only)

Same shape as above. Public responses must not include internal metadata beyond what candidates need to render the form.

### Field aliases (optional)

The frontend mapper also accepts:

- `question_id` instead of `id`
- `text` instead of `label`
- `is_filterable` instead of `filterable`

---

## Candidate answers (stored on application)

**Field name in API:** `answers` (object map)

- **Keys** = question `id`
- **Values** depend on question type:

| `type` | Answer value type | Example |
|--------|-------------------|---------|
| `single` | string (one option) | `"3–5 years"` |
| `multi` | string[] (subset) | `["Go", "Kubernetes"]` |
| `text` | string (free text) | `"Built payments API at ..."` |

---

## Example application submit

`POST /me/applications`

### Current body (today)

```json
{
  "job_id": "uuid",
  "cover_letter": "...",
  "resume_url": "https://..."
}
```

### Proposed body (frontend will send once backend supports it)

```json
{
  "job_id": "uuid",
  "cover_letter": "...",
  "resume_url": "https://...",
  "answers": {
    "sq_years": "3–5 years",
    "sq_stack": ["Go", "Kubernetes"],
    "sq_portfolio": "Led migration of monolith to microservices..."
  }
}
```

### Validation on submit

- `job_id` must reference a published job.
- Every question on the job must have a corresponding answer key (frontend assumes all are required unless you define optional questions).
- **`single`:** value must exactly match one of `options` (string equality).
- **`multi`:** value must be a non-empty array; each item must match an option.
- **`text`:** non-empty string; suggest max length 2000 chars.
- Reject unknown question IDs in `answers`.
- Empty `answers` object is fine for jobs with no screening questions.

### Suggested error format

Matches existing frontend error handling:

```json
{
  "message": "Human-readable summary",
  "errors": {
    "answers.sq_years": "..."
  }
}
```

---

## Application response (employer + candidate)

Return `answers` on:

- `GET /employer/applications`
- `GET /employer/applications/:id` (if you add a detail endpoint)
- `GET /me/applications`

### Example employer application row

```json
{
  "id": "app_uuid",
  "job_id": "job_uuid",
  "job_title": "Backend Engineer",
  "candidate_first_name": "Ama",
  "candidate_last_name": "Osei",
  "candidate_email": "ama@example.com",
  "cover_letter": "...",
  "resume_url": "https://...",
  "status": "reviewing",
  "created_at": "2026-05-14T09:22:00Z",
  "answers": {
    "sq_years": "3–5 years",
    "sq_stack": ["Go", "Kubernetes"],
    "sq_portfolio": "..."
  }
}
```

For list views, returning `answers` inline is fine. A denormalized `answers_summary` string for search is optional for v1.

---

## Employer candidate filtering by screening answers

This section documents how recruiters narrow the applications inbox using answers to **filterable** screening questions.

### Overview

| Role | Action |
|------|--------|
| **Employer** | When editing a job, marks choice questions as **“Use answers as recruiter filters”** (`filterable: true`). |
| **Candidate** | Answers those questions on the apply form (same options as defined on the job). |
| **Employer** | On the applications inbox, selects a **specific job**, then clicks **option chips** to show only candidates whose answers match. |

Filtering only applies to questions where:

- `filterable` is `true`
- `type` is `single` or `multi` (never `text`)
- `options` has at least one value

Non-filterable questions are still shown on the application detail view; they just do not generate filter chips.

### Enabling filters on a job (employer editor)

In the posting editor, each choice question has a checkbox:

**“Use answers as recruiter filters”**

| Question type | Checkbox | Saved `filterable` |
|---------------|----------|-------------------|
| Single choice | enabled | `true` if checked and ≥ 1 option |
| Multiple choice | enabled | `true` if checked and ≥ 1 option |
| Short text | disabled | always `false` |

The frontend only sends `filterable: true` when the question has options. Backend should persist and return this flag on `screening_questions`.

### Employer inbox UI (applications list)

When the recruiter opens **Candidates / Applications**:

1. **Pick a job** from the job filter (required for screening chips to appear).
2. If that job has filterable questions, a **“Screening filters (this posting)”** panel appears.
3. Each filterable question renders as a **label + row of chips** — one chip per option string from `options`.
4. Recruiter clicks chips to narrow the list. **Clear filters** resets job/stage/search and screening chips.

The filter panel is **hidden** when:

- No job is selected, or job is “All jobs”
- The selected job has no `screening_questions`
- None of the job’s questions are `filterable` with options

### Chip selection behavior (per question)

Chip interaction depends on the question `type`:

| `type` | How recruiter selects | Active state |
|--------|----------------------|--------------|
| `single` | **One chip at a time** per question. Clicking the active chip again clears that question’s filter. | At most one selected option per question ID. |
| `multi` | **Multiple chips** per question. Each click toggles that option on/off. | Zero or more selected options per question ID. |

Selected chips are stored client-side as:

```json
{
  "sq_years": ["3–5 years"],
  "sq_stack": ["Go", "Kubernetes"]
}
```

Keys = question `id`. Values = arrays of selected option strings (even for `single`, the UI uses a one-element array internally).

### Match logic (does a candidate pass?)

For each filterable question **that has at least one chip selected**, compare the application’s `answers[question_id]` to the selected chips.

If **no chips** are selected for a question, **skip** that question (do not filter on it).

#### `single` questions

- Candidate answer: **string** (one option).
- Recruiter selected: **one** option chip (or none).
- **Pass** if candidate answer **equals** the selected option (exact string match).

```
selected: ["3–5 years"]
candidate answers.sq_years: "3–5 years"  → pass
candidate answers.sq_years: "6+ years"    → fail
```

#### `multi` questions

- Candidate answer: **string[]** (subset of options).
- Recruiter selected: **one or more** option chips.
- **Pass** if candidate’s selections **overlap** recruiter’s selections — at least one selected chip appears in the candidate’s answer array (**OR** within that question).

```
selected: ["Go", "Kubernetes"]
candidate answers.sq_stack: ["Go", "Python"]     → pass (Go)
candidate answers.sq_stack: ["Python", "Node.js"] → fail (no overlap)
```

If a candidate stored a single string for a `multi` question, treat it as a one-element array before comparing.

#### Combining multiple questions

Filters use **AND** across questions:

- Every question with active chips must pass its match rule.
- Example: “3–5 years” **and** (“Go” or “Kubernetes”) → only candidates matching **both** questions are shown.

Pseudocode:

```
function applicationMatchesScreeningFilters(app, job, selectedFilters):
  for each question q in job.screening_questions:
    if not q.filterable: continue
    if q.type == "text": continue
    want = selectedFilters[q.id]
    if want is empty: continue

    got = app.answers[q.id]

    if q.type == "multi":
      cand = array(got)  // normalize string to [string]
      if no item in want exists in cand: return false
    else:  // single
      if got not in want: return false

  return true
```

### Combined with other inbox filters

Screening filters are applied **together with** existing filters (all must pass):

| Filter | Field | Logic |
|--------|-------|--------|
| Job | `job_id` | Application must belong to selected job |
| Stage | `status` | Exact match on pipeline status |
| Search | name, email, phone, answers | Case-insensitive substring match; answers flattened to text |
| Screening | `answers` | Rules above |

**Order does not matter** — result is the intersection of all active filters.

### Worked example

**Job screening questions:**

```json
[
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
  }
]
```

**Recruiter selects:**

- `sq_years` → `3–5 years`
- `sq_stack` → `Go`, `Kubernetes`

**Applications:**

| Candidate | `answers.sq_years` | `answers.sq_stack` | Shown? |
|-----------|-------------------|-------------------|--------|
| Ama | `"3–5 years"` | `["Go", "Kubernetes"]` | Yes |
| Kwesi | `"3–5 years"` | `["Node.js"]` | No (stack mismatch) |
| Rosa | `"6+ years"` | `["Go"]` | No (years mismatch) |
| James | `"3–5 years"` | `["Go", "Python"]` | Yes (Go overlaps) |

### API: server-side filtering (recommended)

`GET /employer/applications`

#### Base params (already used by frontend)

| Param | Example | Description |
|-------|---------|-------------|
| `job_id` | `uuid` | Limit to one posting |
| `status` | `reviewing` | Pipeline stage |
| `q` | `ama` | Search name / email / phone / answers |

#### Screening answer params

**Option A — flat params (simple):**

```
GET /employer/applications?job_id=...&answer_sq_years=3–5 years&answer_sq_stack=Go&answer_sq_stack=Kubernetes
```

- Param name: `answer_{question_id}`
- Repeat param for multiple selections on `multi` questions
- Omit param when that question has no active filter

**Option B — JSON body on POST search endpoint (flexible):**

`POST /employer/applications/search`

```json
{
  "job_id": "job_uuid",
  "status": "reviewing",
  "q": "ama",
  "screening_filters": {
    "sq_years": ["3–5 years"],
    "sq_stack": ["Go", "Kubernetes"]
  }
}
```

**Option C — client-side only (v1 fallback):**

- `GET /employer/applications` returns all rows with `answers`
- Frontend filters in memory using the match logic above
- Acceptable for small datasets; prefer server-side at scale

#### Validation

- Reject `screening_filters` keys that are not `filterable` questions on the selected job.
- Reject filter values that are not in that question’s `options` list.
- If `job_id` is missing, ignore screening filters (no job context).

#### Response

Same application list shape; each row includes `answers` so the UI can show which chips matched. Optional metadata:

```json
{
  "items": [ /* applications */ ],
  "total": 42,
  "applied_filters": {
    "sq_years": ["3–5 years"],
    "sq_stack": ["Go", "Kubernetes"]
  }
}
```

### Edge cases

| Case | Behavior |
|------|----------|
| Candidate missing an answer for a filtered question | Treat as **fail** (exclude from results) |
| Job options changed after applications submitted | Match on **stored answer strings**; old answers may not match new chips |
| Question removed from job | Historical `answers` key may be orphaned; ignore in filters |
| `filterable` turned off after applications exist | Question no longer shows chips; stored answers remain on application |
| “All jobs” selected | Screening filter panel hidden; API should not apply per-job screening filters without `job_id` |
| Export CSV | Include flattened screening answers column (prototype exports all answer values joined) |

### Frontend integration (filtering)

| Status | File | Notes |
|--------|------|-------|
| Done | `ScreeningQuestionsEditor.js` | `filterable` checkbox on choice questions |
| Done | `job-portal/applications.html` (prototype) | Full chip UI + match logic reference |
| TODO | `applications/page.js` | Wire screening chips into `filteredApps` |
| TODO | `FilterRail.js` or new `ScreeningFilterPanel.js` | Render chips from selected job’s `screeningQuestions` |
| TODO | `mappers.js` | Map `answers`; pass `screening_filters` query params if server-side |

Reference implementation: `job-portal/applications.html` functions `matchesQuestions`, `chipsAppend`, `renderFilters`.

---

## Database suggestion

Minimal relational model:

**`job_screening_questions`**

| Column | Type |
|--------|------|
| `id` | PK, string/uuid |
| `job_id` | FK |
| `sort_order` | int |
| `label` | text |
| `type` | enum: `single`, `multi`, `text` |
| `filterable` | bool |
| `options` | jsonb (string[]) |

**`application_answers`**

| Column | Type |
|--------|------|
| `application_id` | FK |
| `question_id` | FK → `job_screening_questions.id` |
| `value_text` | text (for `single` + `text`) |
| `value_json` | jsonb (for `multi`, or always use jsonb) |

### Job update strategy

- **Recommended:** upsert by question `id`; delete questions removed from payload.
- Changing options on a live job is OK; old applications keep historical answers.
- Store answers as submitted option **strings**, not indices, so re-ordering options does not break historical data.

---

## Endpoint checklist

- [ ] `POST /employer/jobs` — accept `screening_questions`
- [ ] `PATCH /employer/jobs/:id` — accept `screening_questions` (including `[]`)
- [ ] `GET /employer/jobs` — return `screening_questions` per job
- [ ] `GET /employer/jobs/:id` — return `screening_questions`
- [ ] `GET /jobs/:id` — return `screening_questions` (public)
- [ ] `POST /me/applications` — accept `answers` map
- [ ] `GET /me/applications` — return `answers` on own applications
- [ ] `GET /employer/applications` — return `answers`; accept screening filter params (see [Employer candidate filtering](#employer-candidate-filtering-by-screening-answers))
- [ ] `POST /employer/applications/search` (optional) — structured `screening_filters` body

---

## Frontend integration (after backend is ready)

### Files to update

| File | Change |
|------|--------|
| `src/lib/job-api/mappers.js` | Map `answers` in `mapApplicationFromApi`; add submit helper |
| `src/app/(candidate)/candidate/apply/page.js` | Render questions; collect and submit answers |
| `src/app/(admin)/job-portal/applications/detail/page.js` | Show screening answers section |
| `src/app/(admin)/job-portal/applications/page.js` | Screening filter chips + `filteredApps` logic |
| `src/app/(admin)/job-portal/components/FilterRail.js` | Or new `ScreeningFilterPanel` for answer chips |

### Already implemented (employer editor)

- `src/app/(admin)/job-portal/components/ScreeningQuestionsEditor.js`
- `src/app/(admin)/job-portal/postings/edit/page.js`

---

## Reference — frontend job mapper (current)

**`mapJobToApi` sends:**

```json
"screening_questions": [
  { "id", "label", "type", "filterable", "options" }
]
```

**`mapJobFromApi` reads:**

```
job.screening_questions || job.screeningQuestions
```

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

---

## Open questions for backend

1. Max questions per job? (frontend has no hard limit; suggest **20**)
2. Max options per question? (frontend has no hard limit; suggest **20**)
3. Are all screening questions required on apply? (frontend assumes **yes**)
4. PATCH semantics: omit `screening_questions` = leave unchanged, or replace only when field is present?
5. Should duplicate applications be rejected if the candidate already applied?
6. Server-side vs client-side screening filters for v1?
7. Should `multi` question filters use **OR** (any selected chip matches) or **AND** (candidate must have all selected chips)? **Frontend prototype uses OR** — document if backend differs.
