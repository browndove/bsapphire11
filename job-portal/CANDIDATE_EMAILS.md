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

Default is **silent** (no email):

```json
{ "status": "reviewing" }
```

`interview` can also be set silently without `interview_at`.

To notify the candidate, pass `send_email: true` with `email_subject` and `email_body`.
When emailing for interview, include `interview_at` and reminder fields if you want them in the message.

Shortlist without email:

`POST /employer/applications/{id}/shortlist`

Success may include:

```json
{
  "email_sent": true,
  "email_error": ""
}
```

| `email_sent` | Meaning |
|--------------|---------|
| `true` | Resend accepted the send (only expected when `send_email: true`) |
| `false` / omitted | Status updated; no email (or email failed if notify was requested) |
| HTTP 503 | Email not configured — only blocks when `send_email: true` |

Placeholders (`{{first_name}}`, etc.) are expanded **client-side** before PATCH when notifying.

## Frontend wiring (this repo)

- Templates: `src/lib/job-api/email-templates.js`
- Modal: `src/app/(admin)/job-portal/components/StatusEmailModal.js` (optional notify / resend)
- Board + detail move stages silently by default; Shortlist uses the shortlist endpoint
- BFF: `PATCH /api/job-portal/employer/applications/:id/status`, `POST .../shortlist`
- Guest success: `/success-job` mentions checking email for tracking link

## Server config (EC2)

```
RESEND_API_KEY=re_...
EMAIL_FROM="Blvck Sapphire Jobs <noreply@blvcksapphire.com>"
APP_DOMAIN=https://jobportal.blvcksapphire.com
```

`blvcksapphire.com` must be verified in Resend. Sender must match that domain.
