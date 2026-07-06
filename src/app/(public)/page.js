import Link from 'next/link';
import Image from 'next/image';
import BgCanvas from '@/components/BgCanvas';
import HeroVideo from '@/components/HeroVideo';
import TypewriterCode from '@/components/TypewriterCode';

export default function Home() {
  return (
    <>
      {/* Background Canvas for Hero Particle/Grid effect */}
      <BgCanvas />

      <main>
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="container hero-content" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="hero-title">
              Intelligent solutions.<br />
              Infinite scale.
            </h1>
            <p className="hero-subtitle" style={{ maxWidth: '1100px', marginLeft: 'auto', marginRight: 'auto' }}>
              Blvck Sapphire builds intelligent, purely functional AI systems tailored for complex enterprise challenges. We deliver practical solutions so you can work smarter and more efficiently.
            </p>

            <HeroVideo />

            <div className="hero-cta" style={{ justifyContent: 'center' }}>
            </div>
          </div>
        </section>

        {/* Trusted Partners Section */}
        <section className="section partner-section" style={{ paddingTop: '1rem', paddingBottom: '4rem', borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>Our Trusted Partners</p>
            <div className="logo-scroller">
              <div className="logo-scroller-inner">
                <img src="/AWS.svg" alt="AWS" className="partner-img" />
                <img src="/SAMBUS.svg" alt="Sambus" className="partner-img" />
                <img src="/PAYSTACK.svg" alt="Paystack" className="partner-img" />
                <img src="/MTN_2022_logo.svg" alt="MTN" className="partner-img" />
                <img src="/WISE.svg" alt="Wise" className="partner-img" />
                <img src="/DocuSeal.svg" alt="DocuSeal" className="partner-img" />
                <img src="/YELP.svg" alt="Yelp" className="partner-img" />
                <img src="/eCAMPUS.svg" alt="eCampus" className="partner-img" />
                {/* Duplicated for seamless infinite scrolling loop */}
                <img src="/AWS.svg" alt="AWS" className="partner-img" />
                <img src="/SAMBUS.svg" alt="Sambus" className="partner-img" />
                <img src="/PAYSTACK.svg" alt="Paystack" className="partner-img" />
                <img src="/MTN_2022_logo.svg" alt="MTN" className="partner-img" />
                <img src="/WISE.svg" alt="Wise" className="partner-img" />
                <img src="/DocuSeal.svg" alt="DocuSeal" className="partner-img" />
                <img src="/YELP.svg" alt="Yelp" className="partner-img" />
                <img src="/eCAMPUS.svg" alt="eCampus" className="partner-img" />
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="section" id="about">
          <div className="container">
            <div className="section-header slide-up">
              <h2 className="section-title">The Blvck Sapphire Vision</h2>
            </div>
            <div className="grid-2 about-grid" style={{ gap: '4rem' }}>
              <div className="about-text slide-up delay-1">
                <p style={{ fontSize: '1.35rem', lineHeight: '1.7', color: 'var(--text-color)', marginTop: '0' }}>
                  At Blvck Sapphire, we are architects of the future, leveraging the transformative power of Artificial Intelligence, modern technology infrastructure, and robust Cybersecurity to solve complex challenges across diverse industries. With a strong commitment to innovation and ethical deployment, we empower businesses and communities especially across Africa and beyond to thrive in the digital age. We believe that cutting-edge technology, when applied responsibly, can drive significant positive change, foster growth, and build a more secure, intelligent, and interconnected world. Our mission goes beyond mere technological adoption; we strive to pioneer scalable architectures that redefine operational limits. By bridging the gap between raw data and actionable intelligence, we create resilient ecosystems designed to withstand the challenges of tomorrow.
                </p>
              </div>
              <div className="about-values slide-up delay-2">
                <ul className="values-list" style={{ listStyle: 'none', padding: 0, marginTop: 0, fontSize: '0.95rem' }}>
                  <li style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-color)' }}>Innovation:</strong> <span style={{ color: 'var(--text-muted)' }}>Constantly exploring and integrating the latest artificial intelligence advancements to push boundaries.</span></li>
                  <li style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-color)' }}>Empowerment:</strong> <span style={{ color: 'var(--text-muted)' }}>Providing tools and insights that enable clients and communities to achieve more.</span></li>
                  <li style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-color)' }}>Security & Responsibility:</strong> <span style={{ color: 'var(--text-muted)' }}>Fundamental cybersecurity, deploying tech safely to protect digital infrastructure.</span></li>
                  <li style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-color)' }}>Positive Impact:</strong> <span style={{ color: 'var(--text-muted)' }}>Fostering sustainable growth and change aligned with global goals, notably in Africa.</span></li>
                  <li style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-color)' }}>Tailored Excellence:</strong> <span style={{ color: 'var(--text-muted)' }}>Crafting precisely customized solutions for each unique client data landscape.</span></li>
                  <li style={{ marginBottom: '0' }}><strong style={{ color: 'var(--text-color)' }}>Scalability & Resilience:</strong> <span style={{ color: 'var(--text-muted)' }}>Architecting adaptable systems that seamlessly grow and maintain unwavering performance under pressure.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Expertise Section */}
        <section className="section alt-bg" id="expertise">
          <div className="container">
            <div className="section-header slide-up">
              <h2 className="section-title">Expertise</h2>
              <p className="section-desc" style={{ fontSize: '1.4rem', color: '#ffffff', marginTop: '0.8rem', maxWidth: '100%', lineHeight: '1.5' }}>Transformative capabilities built strictly for scale, innovation, unprecedented privacy, and high-margin impact.</p>
            </div>

            <div className="expertise-list">
              <div className="expertise-row slide-up">
                <div className="expertise-content">
                  <div className="card-icon">01</div>
                  <h3>Data & Artificial Intelligence</h3>
                  <p>Rapidly transform your enterprise with accessible AI. Propel your business to achieve unprecedented levels of performance utilizing distributed foundation models and predictive automation. Our tailored algorithms seamlessly integrate with your existing infrastructure to unlock hidden patterns within your datasets. We harness advanced artificial intelligence architectures designed to continuously learn, adapt, and scale alongside your organizational growth, giving you a distinct, long-term competitive edge.</p>
                </div>
                <div className="expertise-visual expertise-visual-right">
                  <div className="visual-layer visual-layer-1" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?q=80&w=996&auto=format&fit=crop')" }}></div>
                  <div className="anim-overlay anim-scanline"></div>
                </div>
              </div>

              <div className="expertise-row reverse slide-up">
                <div className="expertise-content">
                  <div className="card-icon">02</div>
                  <h3>Advanced Analytics</h3>
                  <p>Unlock the power of your streams. Turn raw data into actionable insights through predictive analytics, artificial intelligence, and realtime data processing pipelines. By establishing robust streaming foundations and sophisticated visualization dashboards, we ensure decision-makers always have immediate access to crystal-clear reporting. Our focus on statistical rigor and data integrity transforms complex metrics into highly intuitive KPIs that decisively drive your strategic foresight.</p>
                </div>
                <div className="expertise-visual expertise-visual-left">
                  <div className="visual-layer visual-layer-2" style={{ backgroundImage: "url('https://images.pexels.com/photos/7873553/pexels-photo-7873553.jpeg?auto=compress&cs=tinysrgb&w=800')" }}></div>
                  <div className="anim-overlay anim-particles"></div>
                </div>
              </div>

              <div className="expertise-row slide-up">
                <div className="expertise-content">
                  <div className="card-icon">03</div>
                  <h3>Cloud</h3>
                  <p>Cloud computing is integral for rapid reinvention. Meet ever-changing global demands with optimized edge capabilities and cloud inference that comprehensively maximizes system throughput. We architect inherently flexible, multi-cloud and hybrid environments focused on extreme uptime and dynamic resource allocation. By modernizing legacy monolithic applications into decoupled, resilient microservices, we dramatically reduce operational bottlenecks while radically improving your deployment velocity.</p>
                </div>
                <div className="expertise-visual expertise-visual-right">
                  <div className="visual-layer visual-layer-3" style={{ backgroundImage: "url('https://images.pexels.com/photos/5203849/pexels-photo-5203849.jpeg?auto=compress&cs=tinysrgb&w=800')" }}></div>
                  <div className="anim-overlay anim-pulse"></div>
                </div>
              </div>

              <div className="expertise-row reverse slide-up">
                <div className="expertise-content">
                  <div className="card-icon">04</div>
                  <h3>Cybersecurity</h3>
                  <p>Infuse cybersecurity deeply into your core ecosystem. Protect immense enterprise value, predictively prevent automated threats, and build absolute trust as your infrastructure scales. Leveraging AI-driven threat intelligence and zero-trust frameworks, we proactively monitor network behavior anomalies to identify and neutralize risks before they escalate. Our end-to-end encryption protocols and continuous auditing processes ensure strict regulatory compliance, safeguarding your most sensitive digital assets.</p>
                </div>
                <div className="expertise-visual expertise-visual-left">
                  <div className="visual-layer visual-layer-4" style={{ backgroundImage: "url('/cyber_security.png')", backgroundPosition: 'right center', inset: '-10% 0 -10% -20%' }}></div>
                </div>
              </div>

              <div className="expertise-row slide-up">
                <div className="expertise-content">
                  <div className="card-icon">05</div>
                  <h3>System Customization</h3>
                  <p>Functionally tailored to your specific requirements. We optimize identity access, encryption, and custom models natively onto your internal frameworks ensuring absolute architectural compliance. Beyond standard implementation, we provide dedicated lifecycle support and systematic architectural upgrades to keep your technology stack future-proof. Our specialized engineering teams work in tandem with your personnel to build bespoke management tools that grant you complete, simplified operational sovereignty over your platform.</p>
                </div>
                <div className="expertise-visual expertise-visual-right tech-code-animation">
                  <TypewriterCode />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="section" id="solutions">
          <div className="container">
            <div className="section-header slide-up">
              <h2 className="section-title">Solutions</h2>
              <p className="section-desc" style={{ fontSize: '1.8rem', color: 'var(--text-color)', marginTop: '1rem', fontWeight: '300', maxWidth: '100%', lineHeight: '1.4' }}>Powering progress to redefine operational superiority across different industries.</p>
            </div>

            <div className="industry-grid">
              <Link href="/solutions#healthcare" id="card-healthcare" className="industry-card slide-up">
                <div className="industry-overlay">
                  <h3>Healthcare</h3>
                </div>
              </Link>
              <Link href="/solutions#environmental" id="card-environmental" className="industry-card slide-up delay-1">
                <div className="industry-overlay">
                  <h3>Environmental</h3>
                </div>
              </Link>
              <Link href="/solutions#security" id="card-security" className="industry-card slide-up delay-2">
                <div className="industry-overlay">
                  <h3>Security</h3>
                </div>
              </Link>
              <Link href="/solutions#public-sector" id="card-public-sector" className="industry-card slide-up">
                <div className="industry-overlay">
                  <h3>Public Sector</h3>
                </div>
              </Link>
              <Link href="/solutions#technology" id="card-technology" className="industry-card slide-up delay-1">
                <div className="industry-overlay">
                  <h3>Technology</h3>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section className="section" id="insights">
          <div className="container">
            <div className="section-header slide-up">
              <h2 className="section-title">Insights and Blogs</h2>
            </div>
            <div className="grid-2 insight-grid">
              <Link href="#" className="insight-article slide-up delay-1">
                <h4>The Fall of Monolithic Software</h4>
                <p>Why micro-agents represent the next architectural epoch.</p>
                <span className="read-more">Read ↗</span>
              </Link>
              <Link href="#" className="insight-article slide-up delay-2">
                <h4>Evaluating Open Weights</h4>
                <p>A cost-benefit analysis of deploying LLaMa3 vs proprietary endpoints.</p>
                <span className="read-more">Read ↗</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Engage Section */}
        <section className="section" id="engage" style={{ padding: 0 }}>
          <div className="engage-demo slide-up" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('/request_demo_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid var(--border-color)', padding: '180px 4%', textAlign: 'center' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 className="engage-title" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', marginBottom: '1rem', color: 'var(--text-color)' }}>Ready to explore our solutions?</h2>
              <p className="engage-desc" style={{ fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', color: 'var(--text-color)' }}>Schedule a custom architecture review with our systems team.</p>
              <Link href="/demo" className="btn btn-primary btn-oval pulse-btn" style={{ padding: '18px 45px', fontSize: '1.1rem' }}>Request a Demo</Link>
            </div>
          </div>
          
          <div className="engage-careers slide-up delay-1" id="careers" style={{ backgroundColor: 'var(--bg-color)', padding: '140px 4%', textAlign: 'center' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 className="engage-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem' }}>Join Blvck Sapphire</h2>
              <p className="engage-desc" style={{ fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>We are actively looking for complex problems and top-tier engineers. View our current openings.</p>
              <Link href="/careers" className="btn btn-outline btn-oval" style={{ padding: '16px 36px' }}>Explore Careers</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
