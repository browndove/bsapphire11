import { formatDateTime } from './format';

const TEMPLATES = {
  reviewing: {
    subject: 'Update on your application — {{job_title}}',
    body: `Hi {{first_name}},

Thank you again for applying for the {{job_title}} role at {{company_name}}.

Our team is now reviewing your application. We will contact you if we need any additional information.

Best regards,
The {{company_name}} Hiring Team`,
  },
  shortlisted: {
    subject: "You've been shortlisted — {{job_title}}",
    body: `Hi {{first_name}},

Good news — you have been shortlisted for the {{job_title}} position at {{company_name}}.

We were impressed with your application and will be in touch soon about next steps.

Best regards,
The {{company_name}} Hiring Team`,
  },
  interview: {
    subject: 'Interview invitation — {{job_title}}',
    body: `Hi {{first_name}},

We would like to invite you to an interview for the {{job_title}} role at {{company_name}}.

Date & time: {{interview_at}}
Format: [Video call / In person — edit as needed]
Location or link: [Add details]

Please reply to this email if you need to reschedule.

Best regards,
The {{company_name}} Hiring Team`,
    reminderSubject: 'Reminder: Interview tomorrow — {{job_title}}',
    reminderBody: `Hi {{first_name}},

This is a friendly reminder about your upcoming interview for {{job_title}} at {{company_name}}.

Date & time: {{interview_at}}
Location or link: [Same as invitation]

We look forward to speaking with you.

Best regards,
The {{company_name}} Hiring Team`,
  },
  rejected: {
    subject: 'Update on your application — {{job_title}}',
    body: `Hi {{first_name}},

Thank you for your interest in the {{job_title}} role at {{company_name}} and for the time you invested in your application.

After careful consideration, we will not be moving forward with your application at this time. We encourage you to apply for future openings that match your experience.

We wish you all the best in your job search.

Best regards,
The {{company_name}} Hiring Team`,
  },
  hired: {
    subject: 'Offer — {{job_title}} at {{company_name}}',
    body: `Hi {{first_name}},

We are pleased to offer you the {{job_title}} position at {{company_name}}.

A member of our team will contact you shortly with formal offer details and next steps.

Congratulations, and welcome aboard!

Best regards,
The {{company_name}} Hiring Team`,
  },
};

export function applyEmailPlaceholders(text, context) {
  if (!text) return '';
  return String(text).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = context[key];
    return value != null ? String(value) : '';
  });
}

export function buildEmailContext(application, job, companyName, interviewAt) {
  const firstName =
    application.firstName ||
    application.candidate_first_name ||
    (application.candidateName || '').split(/\s+/)[0] ||
    'there';
  const lastName =
    application.lastName ||
    application.candidate_last_name ||
    (application.candidateName || '').split(/\s+/).slice(1).join(' ') ||
    '';

  return {
    first_name: firstName,
    last_name: lastName,
    job_title: job?.title || application.jobTitle || 'this role',
    company_name: companyName || application.companyName || 'Blvck Sapphire',
    interview_at: interviewAt ? formatDateTime(interviewAt) : '',
  };
}

export function defaultStatusEmailFields(status, application, job, companyName, interviewAtIso) {
  const template = TEMPLATES[status];
  if (!template) {
    return {
      emailSubject: '',
      emailBody: '',
      reminderEmailSubject: '',
      reminderEmailBody: '',
    };
  }

  const context = buildEmailContext(application, job, companyName, interviewAtIso);

  return {
    emailSubject: applyEmailPlaceholders(template.subject, context),
    emailBody: applyEmailPlaceholders(template.body, context),
    reminderEmailSubject: template.reminderSubject
      ? applyEmailPlaceholders(template.reminderSubject, context)
      : '',
    reminderEmailBody: template.reminderBody
      ? applyEmailPlaceholders(template.reminderBody, context)
      : '',
  };
}

function defaultInterviewTime() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(14, 0, 0, 0);
  return date.toISOString();
}

export function buildStatusEmailDefaults(application, job, companyName, targetStatus) {
  const interviewIso =
    application?.interviewAt && targetStatus === 'interview'
      ? application.interviewAt
      : defaultInterviewTime();

  return {
    interviewIso,
    fields: defaultStatusEmailFields(
      targetStatus,
      application,
      job,
      companyName,
      interviewIso
    ),
  };
}

export function buildStatusEmailPatch({
  status,
  emailSubject,
  emailBody,
  emailHtml,
  interviewAt,
  reminderEmailSubject,
  reminderEmailBody,
  reminderEmailHtml,
}) {
  const body = {
    status,
    email_subject: emailSubject.trim(),
    email_body: emailBody.trim(),
  };

  if (emailHtml?.trim()) {
    body.email_html = emailHtml.trim();
  }

  if (status === 'interview') {
    body.interview_at = interviewAt;
    body.reminder_email_subject = reminderEmailSubject.trim();
    body.reminder_email_body = reminderEmailBody.trim();
    if (reminderEmailHtml?.trim()) {
      body.reminder_email_html = reminderEmailHtml.trim();
    }
  }

  return body;
}

export function toDatetimeLocalValue(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function datetimeLocalToIso(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}
