'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from '../PortalContext';

export default function Login() {
  const router = useRouter();
  const { isReady, isAuthed, login } = usePortal();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isReady && isAuthed) {
      router.replace('/job-portal/dashboard');
    }
  }, [isReady, isAuthed, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(password)) {
      setError(false);
      router.push('/job-portal/dashboard');
    } else {
      setError(true);
    }
  };

  if (!isReady || isAuthed) return null;

  return (
    <div className="login-shell">
      <div className="login-accent-bar"></div>
      <div className="login-card">
        <h1>Recruiting portal</h1>
        <p className="hint">One shared password for the whole hiring team until your backend issues individual sessions.</p>
        <form id="portal-login-form" style={{ marginTop: '1.5rem' }} onSubmit={handleSubmit}>
          <label className="field" htmlFor="pw">Team password</label>
          <input 
            type="password" 
            id="pw" 
            name="password" 
            autoComplete="current-password" 
            required 
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="field-hint">Demo password: <code style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>portal-demo</code></p>
          <button type="submit" className="btn btn-primary">Sign in</button>
          <div id="login-err" className={`login-error ${error ? 'is-visible' : ''}`}>That password isn&apos;t right. Try again or ask your admin.</div>
        </form>
        <p className="login-meta">Applicants never see this page — traffic stays on the public careers site.</p>
      </div>
    </div>
  );
}
