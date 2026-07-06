'use client';

import Link from 'next/link';
import GlobeViz from './GlobeViz';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-main">
          {/* Brand Column */}
          <div className="footer-brand fade-in-up active">
            <Link href="/" className="logo">
              <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.33 16.03">
                <path d="M0,9.48c1.05.29,2.12.13,3.18,0,1.29-.16,2.57-.46,3.87-.57.3-.03.65-.08.94,0l-3.43,1.94c-.86.54-3.09,1.97-3.26,2.98-.16.91.61,1.35,1.45,1.22,1.17-.18,3.39-1.89,4.28-2.72.89-.83,1.82-1.84,2.2-3.02l2.43-1.2.14-.26c1.41.51,2.41,1.82,2.52,3.31.28,3.89-3.03,4.74-6.25,4.85-2.61.09-5.27-.08-7.88,0L0,15.92v-6.44Z"/>
                <path d="M13.08,2.54c.12-.02.09,0,.12.07.05.1.13.35.16.47.38,1.43.02,3.15-1.17,4.12-.53.43-.36.14-.95.12l-2.22,1.05c-.31-.12-.51-.31-.87-.36-1.6-.21-4.45.58-6.2.73-.49.04-1,.12-1.47-.06-.08-.11.19-.45.27-.55,1.54-1.91,5.7-4.5,7.97-5.53.82-.37,2.49-1.07,3.37-.91.62.11-.42,1.28.2,1.55.54.23.73-.28.79-.7Z"/>
                <path d="M0,.13L.18.05c2.82.16,5.9-.23,8.68.06.84.09,1.68.3,2.45.66.02.13-.06.06-.13.08C7.46,1.72,2.71,4.76.15,7.54c-.05.05-.05.11-.15.09V.13Z"/>
                <path d="M7.85,10.02c-.47.77-1.19,1.47-1.88,2.06-.62.54-2.77,2.19-3.54,2.17s.39-1.09.56-1.24c1.37-1.21,3.25-2.11,4.85-2.99Z"/>
              </svg>LVCK SAPPHIRE
            </Link>
            <p className="footer-tagline" style={{ marginTop: '5px' }}>Products at the speed of thought.</p>
            <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <Link href="/demo" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>Request a Demo</Link>
            </div>
            <div className="footer-socials">
              <a href="https://www.linkedin.com/company/blvck-sapphire" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://twitter.com/blvck_sapphire" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.04H5.078z"/>
                </svg>
              </a>
              <a href="https://instagram.com/blvcksapphire_" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column 1: Product */}
          <div className="footer-links-col fade-in-up delay-1 active">
            <h4>Product</h4>
            <ul>
              <li><Link href="#">Product Overview</Link></li>
              <li><Link href="#">Build Your AI Strategy</Link></li>
              <li><Link href="#">Integrations</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Resources */}
          <div className="footer-links-col fade-in-up delay-2 active">
            <h4>Resources</h4>
            <ul>
              <li><Link href="#">Blog</Link></li>
              <li><Link href="#">Design Review Best Practices</Link></li>
              <li><Link href="#">AI Tools For Engineers</Link></li>
            </ul>
          </div>

          {/* Links Column 3: Company */}
          <div className="footer-links-col fade-in-up delay-3 active">
            <h4>Company</h4>
            <ul>
              <li><Link href="/#about">About Us</Link></li>
              <li><Link href="/#careers">Careers</Link></li>
              <li><Link href="#">News</Link></li>
            </ul>
          </div>

          {/* Links Column 4: Contact */}
          <div className="footer-links-col fade-in-up delay-4 active">
            <h4>Contact Us</h4>
            <ul className="contact-info" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><a href="mailto:info@blvcksapphire.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>info@blvcksapphire.com</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="tel:+233543571525" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>+233 54 357 1525</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="https://api.whatsapp.com/send/?phone=233543571525&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>WhatsApp Us</a></li>
              <li style={{ lineHeight: 1.6, marginTop: '1rem', color: 'var(--text-muted)' }}>
                1st Labone St, D7<br />
                Accra, Ghana<br />
                GL-015-8622
              </li>
            </ul>
          </div>

          {/* Column 5: Global Locations Globe */}
          <div className="footer-links-col fade-in-up delay-5 active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', marginTop: '-15px' }}>
            <GlobeViz />
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-legal">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Sale</Link>
            <Link href="#">Website Terms of Use</Link>
            <a href="#" id="manage-cookies-link">Manage Cookies</a>
          </div>
          <p>&copy; {new Date().getFullYear()} Blvck Sapphire. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
