'use client';

import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cookieConsent = localStorage.getItem('blvcksapphire_cookie_consent');

    if (!cookieConsent) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    const handleManageCookies = (e) => {
      e.preventDefault();
      setShow(true);
    };

    const manageLinks = document.querySelectorAll('#manage-cookies-link');
    manageLinks.forEach(link => {
      link.addEventListener('click', handleManageCookies);
    });

    return () => {
      manageLinks.forEach(link => {
        link.removeEventListener('click', handleManageCookies);
      });
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem('blvcksapphire_cookie_consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('blvcksapphire_cookie_consent', 'declined');
    setShow(false);
  };

  if (!mounted) return null;

  return (
    <div className={`cookie-banner ${show ? 'show' : ''}`} style={{ display: show ? 'flex' : 'none' }}>
      <div className="cookie-text">
        <p>We use cookies to analyze site performance and deliver personalized content. By clicking "Accept", you agree to our use of cookies.</p>
      </div>
      <div className="cookie-buttons">
        <button className="btn btn-primary" onClick={handleAccept}>Accept</button>
        <button className="btn btn-outline" onClick={handleDecline}>Decline</button>
      </div>
    </div>
  );
}
