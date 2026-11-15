import { describe, expect, it } from 'vitest';
import {
  assertCanNotifyPositionFilled,
  buildPositionFilledEmailHtml,
  buildPositionFilledStatusPatch,
  POSITION_FILLED_COMPANY_EMAIL,
  resolvePublicCareersUrl,
  resolvePositionFilledSendList,
  selectPositionFilledRecipients,
  summarizeCampaignRecipients,
} from './position-filled';

const apps = [
  { id: 'a1', email: 'a@example.com', status: 'submitted', candidateName: 'Ada' },
  { id: 'a2', email: 'b@example.com', status: 'hired', candidateName: 'Hire' },
  { id: 'a3', email: 'c@example.com', status: 'withdrawn', candidateName: 'Out' },
  { id: 'a4', email: 'd@example.com', status: 'shortlisted', candidateName: 'Sam' },
  { id: 'a5', email: '', status: 'reviewing', candidateName: 'No Mail' },
  { id: 'a6', email: 'e@example.com', status: 'rejected', candidateName: 'Rejected Already' },
];

describe('selectPositionFilledRecipients', () => {
  it('excludes selected (hired) and withdrawn applicants', () => {
    const { eligible, skipped } = selectPositionFilledRecipients(apps);
    expect(eligible.map((app) => app.id)).toEqual(['a1', 'a4', 'a6']);
    expect(skipped.map((row) => row.reason)).toEqual(['selected', 'withdrawn', 'no_email']);
  });
});

describe('resolvePositionFilledSendList', () => {
  it('honors checkbox exclusions and skips already notified unless resend is allowed', () => {
    const { eligible } = selectPositionFilledRecipients(apps);
    const withoutResend = resolvePositionFilledSendList({
      eligible,
      excludedIds: ['a4'],
      alreadyNotifiedIds: ['a1'],
      allowResend: false,
    });
    expect(withoutResend.toSend.map((app) => app.id)).toEqual(['a6']);
    expect(withoutResend.excludedRecipients.map((app) => app.id)).toEqual(['a4']);
    expect(withoutResend.alreadySent.map((app) => app.id)).toEqual(['a1']);

    const withResend = resolvePositionFilledSendList({
      eligible,
      excludedIds: ['a4'],
      alreadyNotifiedIds: ['a1'],
      allowResend: true,
    });
    expect(withResend.toSend.map((app) => app.id)).toEqual(['a1', 'a6']);
  });
});

describe('assertCanNotifyPositionFilled', () => {
  it('requires an authenticated employer and a closed job', () => {
    expect(() =>
      assertCanNotifyPositionFilled({ id: 'j1', status: 'published' }, { isAuthed: true, isEmployer: true })
    ).toThrow(/closed/i);

    expect(() =>
      assertCanNotifyPositionFilled({ id: 'j1', status: 'closed' }, { isAuthed: false, isEmployer: true })
    ).toThrow(/employers/i);

    expect(
      assertCanNotifyPositionFilled({ id: 'j1', status: 'closed' }, { isAuthed: true, isEmployer: true })
    ).toBe(true);
  });
});

describe('buildPositionFilledStatusPatch', () => {
  it('builds a rejected status email payload for one candidate', () => {
    expect(
      buildPositionFilledStatusPatch({
        emailSubject: 'Update',
        emailBody: 'Hello',
      })
    ).toEqual({
      status: 'rejected',
      send_email: true,
      email_subject: 'Update',
      email_body: 'Hello',
    });
  });

  it('includes email_html when provided', () => {
    expect(
      buildPositionFilledStatusPatch({
        emailSubject: 'Update',
        emailBody: 'Hello',
        emailHtml: '<p>Hello</p>',
      }).email_html
    ).toBe('<p>Hello</p>');
  });
});

describe('branded position-filled HTML', () => {
  it('rewrites localhost careers links to the public site', () => {
    expect(resolvePublicCareersUrl('http://localhost:3000/careers')).toBe(
      'https://blvcksapphire.com/careers'
    );
  });

  it('includes company email and a careers CTA button', () => {
    const html = buildPositionFilledEmailHtml(
      `Hi Ada,\n\nBrowse open roles: http://localhost:3000/careers\n\nThanks,\n\n${POSITION_FILLED_COMPANY_EMAIL}`,
      {
        company_name: 'Blvck Sapphire',
        company_email: POSITION_FILLED_COMPANY_EMAIL,
        careers_url: 'http://localhost:3000/careers',
      }
    );
    expect(html).toContain('mailto:info@blvcksapphire.com');
    expect(html).toContain('Browse open roles');
    expect(html).toContain('https://blvcksapphire.com/careers');
    expect(html).not.toContain('localhost');
  });
});

describe('failure and retry path helpers', () => {
  it('keeps failed recipients countable so retries can target them', () => {
    const counts = summarizeCampaignRecipients([
      { status: 'sent' },
      { status: 'failed' },
      { status: 'failed' },
      { status: 'excluded' },
      { status: 'queued' },
    ]);
    expect(counts).toEqual({ queued: 1, sent: 1, failed: 2, excluded: 1 });
  });
});
