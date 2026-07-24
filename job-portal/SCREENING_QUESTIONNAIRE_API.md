# Screening Questionnaire — Frontend ↔ Backend Integration

**Audience:** frontend / BFF developers  
**API base:** `https://jobportal.blvcksapphire.com/api/v1`  
**Related:** `BACKEND_INTEGRATION.txt`, `JOB_MARKDOWN_API.md`, Swagger `/swagger/index.html`

---

## Status

| Area | Status |
|------|--------|
| Job CRUD with `screening_questions` | Done |
| Question types `single` / `multi` / `text` / `number` | Done |
| Public job detail exposes questions | Done |
| Candidate apply with `answers` | Done |
| Application lists return `answers` | Done |
| Filter by choice answers (`answer_{id}`) | Done — inbox and per-job list |
| Filter by number answers (`answer_` / `answer_min_` / `answer_max_`) | Done |
| Sort by answer (`sort_by=answer_{id}`) | Done |
| `POST /employer/applications/search` (JSON body) | **Not implemented** — use query params |
| `GET /employer/applications/:id` (single application) | **Not implemented** — use list endpoints |

---

## Flow overview

```
Employer                          Candidate                         Employer inbox
────────                          ─────────                         ──────────────
POST/PATCH /employer/jobs         GET /jobs/:id                     GET /employer/applications
  screening_questions[]    →        screening_questions[]      →      ?job_id=&answer_*&sort_by=
                                    render apply form                 filter + sort by answers
POST /me/applications  or  POST /jobs/:id/applications
  answers{ question_id: value }
```

---

## Question model (`screening_questions`)

```json
{
  "id": "sq_years",
  "label": "Years of experience in this field",
  "type": "number",
  "filterable": true,
  "options": []
}
```

Choice example:

```json
{
  "id": "sq_stack",
  "label": "Production stack",
  "type": "multi",
  "filterable": true,
  "options": ["Go", "Node.js", "Python", "Kubernetes"]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Stable ID (`sq_*` ok). Preserved across job updates. |
| `label` | string | Required question text. |
| `type` | string | `single`, `multi`, `text`, or `number`. |
| `filterable` | boolean | Default `false`. Choice + number only (`text` always forced `false`). |
| `options` | string[] | Required for `single`/`multi`. Empty `[]` for `text`/`number`. |

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
| `filterable` on text | Always `false` |

---

## Question types

| `type` | Answer on submit | Filterable | Sortable |
|--------|------------------|------------|----------|
| `single` | string (exact option) | Yes | Yes (lexicographic) |
| `multi` | `string[]` (non-empty subset) | Yes | No |
| `text` | non-empty string | No | Yes (lexicographic) |
| `number` | JSON number (or numeric string → stored as number) | Yes | Yes (numeric) |

Prefer `number` for “how many years of experience…” so employers can filter ranges and sort by value.

---

## Endpoints — Jobs

### Create / update (employer)

```
POST   /employer/jobs
PATCH  /employer/jobs/:id
```

```json
{
  "title": "Backend Engineer",
  "description": "## About the role\n\nBuild **APIs**…",
  "description_format": "markdown",
  "status": "published",
  "screening_questions": [
    {
      "id": "sq_years",
      "label": "Years of backend experience",
      "type": "number",
      "filterable": true,
      "options": []
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

**PATCH semantics:** omit `screening_questions` → unchanged; `[]` → clear; array → replace.

### Read

| Endpoint | Returns `screening_questions` |
|----------|-------------------------------|
| `GET /employer/jobs`, `GET /employer/jobs/:id` | Yes |
| `GET /jobs/:id` | Yes (published) |

---

## Endpoints — Applications (candidate)

```
POST /me/applications
POST /jobs/:id/applications   # guest
```

```json
{
  "job_id": "…",
  "cover_letter": "…",
  "resume_url": "…",
  "answers": {
    "sq_years": 5,
    "sq_stack": ["Go", "Kubernetes"],
    "sq_portfolio": "Led migration…"
  }
}
```

| Rule | Behavior |
|------|----------|
| `number` | Accepts `5` or `"5"`; stored as JSON number; rejects non-numeric |
| Unknown answer keys | `400` |
| Missing required answer | `400` |

---

## Employer — filter & sort candidates by answers

Both endpoints share the same query params:

```
GET /employer/applications?job_id=<uuid>&…
GET /employer/jobs/:id/applications?…
```

(`job_id` is implied by the path on the per-job endpoint.)

### Base params

| Param | Description |
|-------|-------------|
| `status` | Pipeline stage |
| `q` | Search name, email, phone, answer text |
| `limit` / `offset` | Pagination |
| `sort_by` | `created_at` (default), `status`, or `answer_{question_id}` |
| `sort_dir` | `asc` or `desc` (default `desc`) |

### Choice filters (`single` / `multi`)

```
GET /employer/applications?job_id=<uuid>&answer_sq_stack=Go&answer_sq_stack=Kubernetes
```

| Pattern | Meaning |
|---------|---------|
| `answer_{question_id}=<option>` | Must match (`single`) or overlap (`multi`, OR within question) |
| Across questions | AND |
| Question must be `filterable` with options | Invalid key/value → `400` |

### Number filters

```
# Exact
?answer_sq_years=5

# Range (inclusive)
?answer_min_sq_years=3&answer_max_sq_years=8
```

| Param | Meaning |
|-------|---------|
| `answer_{id}` | Exact numeric match |
| `answer_min_{id}` | Answer ≥ value |
| `answer_max_{id}` | Answer ≤ value |

Question must be `type=number` and `filterable=true`.

### Sort by answer

```
?job_id=<uuid>&sort_by=answer_sq_years&sort_dir=desc
?sort_by=answer_sq_years&sort_dir=asc
```

Missing answers sort last (`NULLS LAST`). Secondary sort is always `created_at DESC`.

### Response extras

```json
{
  "items": [],
  "total": 3,
  "applied_filters": {
    "sq_stack": ["Go", "Kubernetes"]
  },
  "applied_numeric_filters": {
    "sq_years": { "min": 3, "max": 8 }
  }
}
```

---

## Frontend wiring checklist

### Employer posting editor

| Task | Detail |
|------|--------|
| Question type picker | Include **Number** for years/counts |
| `filterable` | Enable for `single` / `multi` / `number` |
| Markdown job copy | See `JOB_MARKDOWN_API.md` |

### Candidate apply

| `type` | Control |
|--------|---------|
| `single` | Radio / select |
| `multi` | Checkboxes |
| `text` | Textarea |
| `number` | `<input type="number">` — submit as number |

### Employer inbox / per-job applicants

| Task | API |
|------|-----|
| Choice chips | `answer_{id}=option` |
| Years range | `answer_min_{id}` + `answer_max_{id}` |
| Sort by years | `sort_by=answer_{id}&sort_dir=desc` |
| Clear | Omit `answer_*` / reset `sort_by` |

---

## Design decisions

| Topic | Decision |
|-------|----------|
| Years of experience | Use `type: "number"` (not choice buckets) when you need sort/range |
| Multi filter within one question | OR (overlap) |
| Filters across questions | AND |
| Changing questions after apply | New applies only; old answers keep prior question ids |
