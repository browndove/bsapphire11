'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCandidate } from '../CandidateContext';
import PortalHeader from '@/app/(admin)/job-portal/components/PortalHeader';
import { toUserMessage } from '@/lib/job-api/errors';

export default function CandidateProfile() {
  const router = useRouter();
  const { isReady, isAuthed, user, saveProfile } = useCandidate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/candidate/login');
    }
  }, [isReady, isAuthed, router]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name || '');
    setLastName(user.last_name || '');
    setPhone(user.phone || '');
    setHeadline(user.headline || '');
  }, [user]);

  if (!isReady || !isAuthed) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        headline: headline || undefined,
      });
      setToast('Profile saved');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setError(toUserMessage(err, 'profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PortalHeader title="Profile" />

      {toast ? <div className="ats-toast is-success">{toast}</div> : null}
      {error ? <div className="ats-toast is-error">{error}</div> : null}

      <div className="ats-panel">
        <form className="ats-form" onSubmit={handleSubmit}>
          <div className="ats-form-grid cols-2">
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="c-first">First name</label>
              <input id="c-first" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="c-last">Last name</label>
              <input id="c-last" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="ats-field">
            <label className="ats-field-label" htmlFor="c-email">Email</label>
            <input id="c-email" type="email" value={user?.email || ''} disabled />
          </div>
          <div className="ats-field">
            <label className="ats-field-label" htmlFor="c-phone">Phone</label>
            <input id="c-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="ats-field">
            <label className="ats-field-label" htmlFor="c-headline">Headline</label>
            <input id="c-headline" placeholder="e.g. Senior Software Engineer" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </>
  );
}
