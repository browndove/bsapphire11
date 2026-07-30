'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import BgCanvas from '@/components/BgCanvas';
import CustomSelect from '@/components/CustomSelect';

const BUSINESS_OPTIONS = [
  { value: 'accounting', label: 'Accounting & Finance' },
  { value: 'agriculture', label: 'Agriculture & Forestry' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'aviation', label: 'Aviation & Aerospace' },
  { value: 'communication', label: 'Communication & Media' },
  { value: 'construction', label: 'Construction & Engineering' },
  { value: 'consulting', label: 'Consulting Services' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'education', label: 'Education & Training' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'environmental', label: 'Environmental Services' },
  { value: 'government', label: 'Government & Public Sector' },
  { value: 'healthcare', label: 'Healthcare & Medical' },
  { value: 'hospitality', label: 'Hospitality & Tourism' },
  { value: 'logistics', label: 'Logistics & Supply Chain' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'mining', label: 'Mining & Metals' },
  { value: 'nonprofit', label: 'Non-Profit & NGO' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'retail', label: 'Retail' },
  { value: 'security', label: 'Security & Defense' },
  { value: 'technology', label: 'Technology & IT' },
  { value: 'telecom', label: 'Telecommunications' },
  { value: 'other', label: 'Other' },
];

const REFERRAL_OPTIONS = [
  { value: 'search', label: 'Search Engine' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'social', label: 'Social Media' },
  { value: 'referral', label: 'Internal Referral' },
  { value: 'other', label: 'Other Protocol' },
];

export default function Demo() {
  const [businessField, setBusinessField] = useState('');
  const [hearAbout, setHearAbout] = useState('');

  useEffect(() => {
    // Only initialize if window.intlTelInput is available
    const initTelInput = () => {
      const phoneInputField = document.querySelector("#phoneNumber");
      if (phoneInputField && window.intlTelInput && !phoneInputField.classList.contains('iti__tel-input')) {
        window.intlTelInput(phoneInputField, {
          initialCountry: "auto",
          separateDialCode: true,
          geoIpLookup: callback => {
            fetch("https://ipapi.co/json")
              .then(res => res.json())
              .then(data => callback(data.country_code))
              .catch(() => callback("us"));
          },
          utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/js/utils.js",
        });
      }
    };

    // Try immediately in case script loaded, else wait
    if (window.intlTelInput) {
      initTelInput();
    } else {
      window.addEventListener('load', initTelInput);
    }
    
    return () => window.removeEventListener('load', initTelInput);
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/css/intlTelInput.css" />
      <style dangerouslySetInnerHTML={{__html: `
        .iti { width: 100%; display: block; margin-bottom: 2rem; }
        .iti__flag { background-image: url("https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/img/flags.png"); }
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .iti__flag { background-image: url("https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/img/flags@2x.png"); }
        }
        .iti__country-list {
            background-color: var(--bg-color);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            font-family: var(--font-body);
            white-space: nowrap;
        }
        .iti__country { padding: 10px; }
        .iti__country.iti__highlight { background-color: rgba(255,255,255,0.1); }
        .iti__dial-code { color: var(--text-muted); }
        .iti input, .iti input[type=text], .iti input[type=tel] {
            width: 100%;
            padding: 18px 0;
            padding-left: 50px !important;
            background: transparent;
            border: none;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-color);
            font-family: var(--font-body);
            font-size: 1.1rem;
            border-radius: 0;
            transition: var(--transition-snappy);
            margin: 0;
        }
        .iti input:focus, .iti input[type=text]:focus, .iti input[type=tel]:focus {
            outline: none;
            border-bottom-color: var(--text-color);
            background: rgba(255,255,255,0.02);
            box-shadow: none;
        }
        .iti__selected-flag { padding-left: 0; }
        
        /* Mobile overrides */
        .iti-mobile .iti__country-list { background-color: var(--bg-color); }
      `}} />
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/js/intlTelInput.min.js"
        onLoad={() => {
          const phoneInputField = document.querySelector("#phoneNumber");
          if (phoneInputField && !phoneInputField.classList.contains('iti__tel-input')) {
            window.intlTelInput(phoneInputField, {
              initialCountry: "auto",
              separateDialCode: true,
              geoIpLookup: callback => {
                fetch("https://ipapi.co/json")
                  .then(res => res.json())
                  .then(data => callback(data.country_code))
                  .catch(() => callback("us"));
              },
              utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/js/utils.js",
            });
          }
        }}
      />
      
      <BgCanvas />
      
      <main className="demo-page">
        <div className="container demo-grid">
          {/* Left Info Panel */}
          <div className="demo-info">
            <h1>Get a custom architecture demo from an engineer.</h1>
            <p className="demo-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-color)', marginBottom: '1rem' }}>Here's how the protocol works:</p>
            <ul className="demo-steps">
              <li>First, we will map out your exact process requirements on an intro call.</li>
              <li>Then, we showcase a tailored run-through of how Blvck Sapphire deploys in your specific environment.</li>
              <li>Our team consists of seasoned experts and engineers — bring us your most complex technical problems.</li>
            </ul>
          </div>

          {/* Right Form Box */}
          <div className="demo-form-container">
            <div className="demo-form-box">
              <h3>Discuss AI & Custom Tech Solutions</h3>
              <p className="form-desc text-muted">Submit your details below, and our enterprise architects will be in touch to schedule a tailored consultation.</p>

              <form action="/success-demo" method="get">
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <input type="text" placeholder="First Name*" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <input type="text" placeholder="Last Name*" required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <input type="email" placeholder="Business Email*" required />
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <input type="tel" id="phoneNumber" name="phoneNumber" placeholder="Phone Number*" required />
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="field" htmlFor="business-field">Field of Business*</label>
                  <CustomSelect
                    id="business-field"
                    name="business"
                    value={businessField}
                    onChange={setBusinessField}
                    placeholder="Field of Business*"
                    options={BUSINESS_OPTIONS}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="field" htmlFor="hear-about">How did you hear about us?</label>
                  <CustomSelect
                    id="hear-about"
                    name="referral"
                    value={hearAbout}
                    onChange={setHearAbout}
                    placeholder="How did you hear about us?"
                    options={REFERRAL_OPTIONS}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <textarea placeholder="Anything specific you'd like to discuss during the demo?" rows="4"></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary btn-oval pulse-btn" style={{ width: '100%', borderRadius: '5px' }}>Initiate Booking</button>
                
                <p style={{ fontSize: '0.8rem', marginTop: '1.5rem', color: '#555', lineHeight: '1.4' }}>
                  We store and process the telemetry in this form to respond to your request. For more information on how we securely handle data, please refer to our <a href="#" style={{ borderBottom: '1px solid #555' }}>Privacy Policy</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
