'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortal } from '../PortalContext';
import { consumeSessionNotice } from '@/lib/job-api/auth-storage';
import { toUserMessage } from '@/lib/job-api/errors';
import BrandMark from '@/components/BrandMark';
import PasswordInput from '@/components/PasswordInput';
import PinInput from '../components/PinInput';
import LocalQrCode from '../components/LocalQrCode';

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
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const message = consumeSessionNotice();
    if (message) setNotice(message);
  }, []);

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
        {notice ? <p className="login-notice" role="status">{notice}</p> : null}
        {step === 'credentials' ? (
          <>
            <p className="hint">
              Sign in with your employer account. We&apos;ll email you a one-time code to verify each login.
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
              <PasswordInput
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
              {setupRequired && (otpauthUrl || otpSecret)
                ? 'Scan the QR code in your authenticator app, then enter the 6-digit code to finish setup.'
                : 'Enter the 6-digit code we sent to your email.'}
            </p>
            {pendingExpiresAt ? (
              <p className="field-hint">Challenge expires at {new Date(pendingExpiresAt).toLocaleString()}</p>
            ) : null}
            {setupRequired && (otpauthUrl || otpSecret) ? (
              <div>
                <LocalQrCode value={otpauthUrl} />
                {otpSecret ? (
                  <p className="field-hint">
                    Manual entry secret: <code>{otpSecret}</code>
                  </p>
                ) : null}
              </div>
            ) : null}
            <form onSubmit={handleVerify}>
              <label className="field" htmlFor="code">
                {setupRequired && (otpauthUrl || otpSecret)
                  ? 'Authenticator code'
                  : 'Email verification code'}
              </label>
              <PinInput id="code" value={code} onChange={setCode} disabled={submitting} />
              <button type="submit" className="btn btn-primary" disabled={submitting || code.length < 6}>
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
