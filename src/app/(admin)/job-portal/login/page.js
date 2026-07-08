'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortal } from '../PortalContext';
import { toUserMessage } from '@/lib/job-api/errors';
import BrandMark from '@/components/BrandMark';

function QrCode({ value }) {
  if (!value) return null;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}`;
  return (
    <img
      src={src}
      alt="Scan this QR code with your authenticator app"
      width={180}
      height={180}
      style={{ border: '1px solid var(--border-color)', margin: '1rem 0' }}
    />
  );
}

export default function Login() {
  const router = useRouter();
  const { isReady, isAuthed, login, completeLogin } = usePortal();
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingToken, setPendingToken] = useState('');
  const [pendingExpiresAt, setPendingExpiresAt] = useState('');
  const [setupRequired, setSetupRequired] = useState(false);
  const [otpSecret, setOtpSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && isAuthed) {
      router.replace('/job-portal/dashboard');
    }
  }, [isReady, isAuthed, router]);

  const handleCredentials = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await login(email, password);
      setPendingToken(res.pending_token);
      setPendingExpiresAt(res.pending_expires_at || '');

      if (res.two_factor?.setup_required) {
        setSetupRequired(true);
        setOtpSecret(res.two_factor.secret || '');
        setOtpauthUrl(res.two_factor.otpauth_url || '');
      } else {
        setSetupRequired(false);
      }
      setStep('2fa');
    } catch (err) {
      setError(toUserMessage(err, 'login'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await completeLogin(pendingToken, code);
      router.push('/job-portal/dashboard');
    } catch (err) {
      setError(toUserMessage(err, '2fa'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isReady || isAuthed) return null;

  return (
    <div className="login-shell">
      <div className="login-accent-bar"></div>
      <div className="login-card">
        <div className="login-brand">
          <BrandMark size={28} />
          <span>Blvck Sapphire</span>
        </div>
        <h1>Recruiting portal</h1>
        {step === 'credentials' ? (
          <>
            <p className="hint">
              Sign in with your employer account. Two-factor authentication is required for every login.
            </p>
            <form id="portal-login-form" onSubmit={handleCredentials}>
              <label className="field" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="field" htmlFor="pw">Password</label>
              <input
                type="password"
                id="pw"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Continue'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="hint">
              {setupRequired
                ? 'Scan the QR code in your authenticator app, then enter the 6-digit code to finish setup.'
                : 'Enter the 6-digit code from your authenticator app.'}
            </p>
            {pendingExpiresAt ? (
              <p className="field-hint">Challenge expires at {new Date(pendingExpiresAt).toLocaleString()}</p>
            ) : null}
            {setupRequired ? (
              <div>
                <QrCode value={otpauthUrl} />
                {otpSecret ? (
                  <p className="field-hint">
                    Manual entry secret: <code>{otpSecret}</code>
                  </p>
                ) : null}
              </div>
            ) : null}
            <form onSubmit={handleVerify}>
              <label className="field" htmlFor="code">Authentication code</label>
              <input
                type="text"
                id="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Verifying…' : 'Verify & sign in'}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginTop: '0.75rem', width: '100%' }}
                onClick={() => {
                  setStep('credentials');
                  setCode('');
                  setError('');
                }}
              >
                Back
              </button>
            </form>
          </>
        )}
        <div className={`login-error ${error ? 'is-visible' : ''}`}>{error}</div>
        <p className="login-meta">
          Employer accounts only.{' '}
          <Link href="/candidate/login">Candidate portal</Link>
          {' · '}
          <Link href="/careers">Careers site</Link>
        </p>
      </div>
    </div>
  );
}
