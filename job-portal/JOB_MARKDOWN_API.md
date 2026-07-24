# Job Description & Requirements — Rich Text (Markdown)

**Audience:** frontend / BFF developers  
**API base:** `https://jobportal.blvcksapphire.com/api/v1`

Employers can format job description and requirements with Markdown so headers can be bold, lists render cleanly, and structure is preserved on public career pages.

---

## Format fields

Every job response includes:

| Field | Values | Default |
|-------|--------|---------|
| `description_format` | `markdown` \| `plain` | `markdown` |
| `requirements_format` | `markdown` \| `plain` | `markdown` |

Set on create/update:

```json
{
  "title": "Senior Backend Engineer",
  "description": "## About the role\n\nWe are hiring a **backend** engineer…\n\n### Responsibilities\n\n- Own APIs\n- Mentor juniors",
  "description_format": "markdown",
  "requirements": "## Must have\n\n- **5+ years** Go\n- Postgres",
  "requirements_format": "markdown"
}
```

| Status | When |
|--------|------|
| Omit format | Stored/returned as `markdown` |
| `plain` | Render as escaped plain text (no Markdown) |
| Invalid value | `400` field error |

---

## Recommended Markdown subset

Frontend renders with a safe Markdown renderer (**no raw HTML**), supporting at least:

| Syntax | Example | Use |
|--------|---------|-----|
| Headings | `## About the role` | Section headers |
| Bold | `**must have**` | Emphasis |
| Lists | `- item` / `1. item` | Bullets / numbered |
| Links | `[Site](https://…)` | Optional |
| Paragraphs | blank line between blocks | Body copy |

Do **not** send HTML (`<b>`, `<h2>`) unless you intentionally set `plain` and escape on display. Prefer Markdown + `description_format: "markdown"`.

---

## Frontend wiring

| Surface | Behavior |
|---------|----------|
| Employer editor | WYSIWYG rich-text toolbar (bold, headings, lists, links). Content is stored as Markdown with `*_format: "markdown"` |
| Public / apply job page | If `*_format === "markdown"`, render Markdown; else plain text |
| Employer preview | Same as public (live formatting in the editor) |

---

## Endpoints

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/employer/jobs` | Accepts `description_format`, `requirements_format` |
| `PATCH` | `/employer/jobs/:id` | Same; omit to leave unchanged |
| `GET` | `/jobs/:id`, `/employer/jobs/:id` | Always returns both format fields |
