'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'blvcksapphire_cookie_consent';
const MANAGE_EVENT = 'blvcksapphire:manage-cookies';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const cookieConsent = localStorage.getItem(CONSENT_KEY);
    let timer;
    if (!cookieConsent) {
      timer = setTimeout(() => setShow(true), 1500);
    }

    const openBanner = (e) => {
      e?.preventDefault?.();
      setShow(true);
    };

    const manageLinks = document.querySelectorAll('#manage-cookies-link, [data-manage-cookies]');
    manageLinks.forEach((link) => link.addEventListener('click', openBanner));
    window.addEventListener(MANAGE_EVENT, openBanner);

    return () => {
      if (timer) clearTimeout(timer);
      manageLinks.forEach((link) => link.removeEventListener('click', openBanner));
      window.removeEventListener(MANAGE_EVENT, openBanner);
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setShow(false);
  };

  if (!mounted) return null;

  return (
    <div
      className={`cookie-banner ${show ? 'show' : ''}`}
      style={{ display: show ? 'flex' : 'none' }}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <div className="cookie-text">
        <p>
          We use cookies to analyze site performance and deliver personalized content. By clicking
          &quot;Accept&quot;, you agree to our use of cookies.
        </p>
      </div>
      <div className="cookie-buttons">
        <button type="button" className="btn btn-primary" onClick={handleAccept}>
          Accept
        </button>
        <button type="button" className="btn btn-outline" onClick={handleDecline}>
          Decline
        </button>
      </div>
    </div>
  );
}
