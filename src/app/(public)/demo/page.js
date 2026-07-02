'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import Head from 'next/head';
import BgCanvas from '@/components/BgCanvas';

export default function Demo() {
  const tsliderRef = useRef(null);

  const scrollLeft = () => {
    if (tsliderRef.current) {
      tsliderRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tsliderRef.current) {
      tsliderRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

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
        
        .carousel-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            margin-top: 2rem;
            width: 100%;
        }
        .team-slider {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 1.5rem;
            padding: 1rem 0;
            scrollbar-width: none;
            -ms-overflow-style: none;
            scroll-behavior: smooth;
            max-width: 504px;
            margin: 0 auto;
            flex: 1;
            min-width: 0;
        }
        .team-slider::-webkit-scrollbar {
            display: none;
        }
        .team-member-h {
            flex: 0 0 240px;
            scroll-snap-align: start;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1rem;
            padding: 2.5rem 1.5rem;
            border: 1px solid var(--border-color);
            background: rgba(255,255,255,0.02);
            transition: var(--transition-snappy);
        }
        .team-member-h:hover {
            border-color: var(--text-color);
            transform: translateY(-8px);
            background: transparent;
            box-shadow: inset 0 0 15px rgba(255,255,255,0.05);
        }
        .team-slider .team-avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background-color: var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-heading);
            color: var(--text-color);
            font-size: 1.4rem;
            margin: 0 auto;
            transition: var(--transition-snappy);
        }
        .team-member-h:hover .team-avatar {
            background-color: var(--text-color);
            color: var(--bg-color);
        }
        .carousel-btn {
            background: rgba(0,0,0,0.8);
            border: 1px solid var(--border-color);
            color: var(--text-color);
            width: 45px;
            height: 45px;
            font-size: 1.2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: var(--transition-snappy);
            flex-shrink: 0;
            z-index: 10;
        }
        .carousel-btn:hover {
            background: var(--text-color);
            color: var(--bg-color);
        }
        .carousel-btn.prev-btn { margin-right: 15px; }
        .carousel-btn.next-btn { margin-left: 15px; }
        
        @media(max-width: 600px) {
            .carousel-wrapper {
                gap: 0.5rem;
            }
            .team-slider {
                max-width: 100%;
                gap: 1rem;
                padding: 0.5rem 0;
            }
            .carousel-btn { width: 35px; height: 35px; font-size: 1rem; }
            .carousel-btn.prev-btn { margin-right: 0; }
            .carousel-btn.next-btn { margin-left: 0; }
            .team-member-h { flex: 0 0 min(78vw, 220px); padding: 1.25rem; }
        }
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
          <div className="demo-info slide-up">
            <h1>Get a custom architecture demo from an engineer.</h1>
            <p className="demo-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-color)', marginBottom: '1rem' }}>Here's how the protocol works:</p>
            <ul className="demo-steps">
              <li>First, we will map out your exact process requirements on an intro call.</li>
              <li>Then, we showcase a tailored run-through of how Blvck Sapphire deploys in your specific environment.</li>
              <li>Our team consists of seasoned experts and engineers — bring us your most complex technical problems.</li>
            </ul>

            <h3 style={{ fontSize: '2rem', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>Meet the Solutions Node</h3>
            
            <div className="carousel-wrapper">
              <button type="button" className="carousel-btn prev-btn" onClick={scrollLeft}>❮</button>
              <div className="team-slider" ref={tsliderRef}>
                {/* Amin */}
                <div className="team-member-h">
                  <div className="team-avatar">AY</div>
                  <div className="team-details" style={{ textAlign: 'center' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--text-color)' }}>Amin Yakubu</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chief Medical Technologist</p>
                  </div>
                </div>
                {/* Micheal */}
                <div className="team-member-h">
                  <div className="team-avatar">MB</div>
                  <div className="team-details" style={{ textAlign: 'center' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--text-color)' }}>Micheal Owusu Budu</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI Scientist</p>
                  </div>
                </div>
                {/* Hafez */}
                <div className="team-member-h">
                  <div className="team-avatar">HM</div>
                  <div className="team-details" style={{ textAlign: 'center' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--text-color)' }}>Hafez Mahamah</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Senior Technical Solution Specialist</p>
                  </div>
                </div>
                {/* Mawuli */}
                <div className="team-member-h">
                  <div className="team-avatar">MP</div>
                  <div className="team-details" style={{ textAlign: 'center' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--text-color)' }}>Mawuli Pomary</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Head of Emerging Technologist</p>
                  </div>
                </div>
              </div>
              <button type="button" className="carousel-btn next-btn" onClick={scrollRight}>❯</button>
            </div>
          </div>

          {/* Right Form Box */}
          <div className="demo-form-container slide-up delay-1">
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
                  <select required defaultValue="">
                    <option value="" disabled hidden>Field of Business*</option>
                    <option value="accounting">Accounting & Finance</option>
                    <option value="agriculture">Agriculture & Forestry</option>
                    <option value="automotive">Automotive</option>
                    <option value="aviation">Aviation & Aerospace</option>
                    <option value="communication">Communication & Media</option>
                    <option value="construction">Construction & Engineering</option>
                    <option value="consulting">Consulting Services</option>
                    <option value="ecommerce">E-Commerce</option>
                    <option value="education">Education & Training</option>
                    <option value="energy">Energy & Utilities</option>
                    <option value="environmental">Environmental Services</option>
                    <option value="government">Government & Public Sector</option>
                    <option value="healthcare">Healthcare & Medical</option>
                    <option value="hospitality">Hospitality & Tourism</option>
                    <option value="logistics">Logistics & Supply Chain</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="marketing">Marketing & Advertising</option>
                    <option value="mining">Mining & Metals</option>
                    <option value="nonprofit">Non-Profit & NGO</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="retail">Retail</option>
                    <option value="security">Security & Defense</option>
                    <option value="technology">Technology & IT</option>
                    <option value="telecom">Telecommunications</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <select required defaultValue="">
                    <option value="" disabled hidden>How did you hear about us?</option>
                    <option value="search">Search Engine</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="social">Social Media</option>
                    <option value="referral">Internal Referral</option>
                    <option value="other">Other Protocol</option>
                  </select>
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
