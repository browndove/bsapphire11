'use client';

import { useState } from 'react';
import {
  candidateLoginStep1,
  candidateRegister,
  candidateVerify2FA,
} from '@/lib/job-api/client';
import { toUserMessage } from '@/lib/job-api/errors';
import CandidateFlowSteps from './CandidateFlowSteps';

function QrCode({ value }) {
  if (!value) return null;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}`;
  return (
    <img
      src={src}
      alt="Scan this QR code with your authenticator app"
      width={180}
      height={180}
      style={{ border: '1px solid var(--border-color, #333)', margin: '1rem 0' }}
    />
  );
}

export default function CandidateAuthForm({
  initialMode = 'login',
  showModeToggle = true,
  showFlowSteps = initialMode === 'register',
  className = '',
  onAuthenticated,
  onCredentials,
  onVerify,
}) {
  const [authMode, setAuthMode] = useState(initialMode);
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [code, setCode] = useState('');
  const [pendingToken, setPendingToken] = useState('');
  const [setupRequired, setSetupRequired] = useState(false);
  const [otpSecret, setOtpSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (mode) => {
    setAuthMode(mode);
    setStep('credentials');
    setError('');
    setCode('');
  };

  const handleCredentials = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fields = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        headline: headline || undefined,
      };

      const res = onCredentials
        ? await onCredentials(authMode, fields)
        : authMode === 'register'
          ? await candidateRegister(fields)
          : await candidateLoginStep1(email, password);

      setPendingToken(res.pending_token);
      if (res.two_factor?.setup_required) {
        setSetupRequired(true);
        setOtpSecret(res.two_factor.secret || '');
        setOtpauthUrl(res.two_factor.otpauth_url || '');
      } else {
        setSetupRequired(false);
      }
      setStep('2fa');
    } catch (err) {
      setError(toUserMessage(err, authMode === 'register' ? 'register' : 'login'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = onVerify
        ? await onVerify(pendingToken, code)
        : await candidateVerify2FA(pendingToken, code);

      const user = data.user || data;
      if (user?.role && user.role !== 'candidate') {
        setError('Employer accounts cannot be used here. Use a candidate account.');
        return;
      }
      onAuthenticated?.(user);
    } catch (err) {
      setError(toUserMessage(err, '2fa'));
    } finally {
      setSubmitting(false);
    }
  };

  const displayFlow = showFlowSteps && authMode === 'register';
  const flowStep = step === 'credentials' ? 1 : 2;

  return (
    <div className={`ats-form ${className}`.trim()}>
      {displayFlow ? <CandidateFlowSteps currentStep={flowStep} /> : null}
      {showModeToggle && step === 'credentials' ? (
        <div className="auth-tabs">
          <button
            type="button"
            className={authMode === 'login' ? 'is-active' : ''}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={authMode === 'register' ? 'is-active' : ''}
            onClick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>
      ) : null}

      {step === 'credentials' ? (
        <>
          <form onSubmit={handleCredentials}>
            {authMode === 'register' ? (
              <>
                <div className="ats-field">
                  <label className="ats-field-label" htmlFor="reg-first">First name</label>
                  <input id="reg-first" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="ats-field">
                  <label className="ats-field-label" htmlFor="reg-last">Last name</label>
                  <input id="reg-last" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="ats-field">
                  <label className="ats-field-label" htmlFor="reg-phone">Phone</label>
                  <input id="reg-phone" type="tel" autoComplete="tel" placeholder="+1234567890" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="ats-field">
                  <label className="ats-field-label" htmlFor="reg-headline">Headline</label>
                  <input id="reg-headline" placeholder="e.g. Senior Software Engineer" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                </div>
              </>
            ) : null}
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="auth-email">Email</label>
              <input id="auth-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="auth-pw">Password</label>
              <input
                id="auth-pw"
                type="password"
                required
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {authMode === 'register' ? (
                <p className="ats-field-hint">At least 8 characters with upper, lower, number, and symbol.</p>
              ) : null}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Please wait…' : authMode === 'register' ? 'Create account' : 'Continue'}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="hint" style={{ marginBottom: 0 }}>
            {setupRequired
              ? 'Scan the QR code in your authenticator app, then enter the 6-digit code to finish setup.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
          {setupRequired ? (
            <div>
              <QrCode value={otpauthUrl} />
              {otpSecret ? <p className="ats-field-hint">Manual entry secret: <code>{otpSecret}</code></p> : null}
            </div>
          ) : null}
          <form onSubmit={handleVerify}>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="auth-code">Authentication code</label>
              <input
                id="auth-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Verifying…' : 'Verify & continue'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ marginTop: '0.75rem', width: '100%' }}
              onClick={() => { setStep('credentials'); setCode(''); setError(''); }}
            >
              Back
            </button>
          </form>
        </>
      )}

      {error ? <p style={{ color: '#f87171', fontSize: '0.9rem' }} role="alert">{error}</p> : null}
    </div>
  );
}
