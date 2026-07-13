# Email Integration — Backend ↔ Frontend

Audience: frontend, BFF, and backend developers  
API base: `https://jobportal.blvcksapphire.com/api/v1`  
Provider: Resend (configured server-side only)

## Responsibility split

| Concern | Frontend | Backend |
|---------|----------|---------|
| Email provider / API key | — | Resend (`RESEND_API_KEY`, `EMAIL_FROM`) |
| Guest apply confirmation copy | — | Fixed template + tracking link |
| Portal apply / withdraw copy | — | Fixed template |
| Status change copy | Compose subject + body (required) | Sends via Resend |
| Interview reminder copy | Provide at interview status | Stores per application; sends ~24h before |
| Placeholder substitution | Yes, before PATCH | — |
| Separate “send email” endpoint | — | None |

**Rule of thumb:** If the recruiter chooses the words, the frontend builds the email. If it happens automatically on apply/withdraw, the backend handles it.

## Employer status update

`PATCH /employer/applications/{id}/status`

Required always: `status`, `email_subject`, `email_body`  
Interview also requires: `interview_at`, `reminder_email_subject`, `reminder_email_body`

Success includes:

```json
{
  "email_sent": true,
  "email_error": ""
}
```

| `email_sent` | Meaning |
|--------------|---------|
| `true` | Resend accepted the send |
| `false` | Status updated; email failed — show warning + retry |
| HTTP 503 | Email not configured — status **not** updated |

Placeholders (`{{first_name}}`, etc.) are expanded **client-side** before PATCH.

## Frontend wiring (this repo)

- Templates: `src/lib/job-api/email-templates.js`
- Modal: `src/app/(admin)/job-portal/components/StatusEmailModal.js`
- Detail + kanban open the modal before PATCH
- BFF: `PATCH /api/job-portal/employer/applications/:id/status` → upstream status route (body forwarded as-is)
- Guest success: `/success-job` mentions checking email for tracking link

## Server config (EC2)

```
RESEND_API_KEY=re_...
EMAIL_FROM="Blvck Sapphire Jobs <noreply@blvcksapphire.com>"
APP_DOMAIN=https://jobportal.blvcksapphire.com
```

`blvcksapphire.com` must be verified in Resend. Sender must match that domain.
