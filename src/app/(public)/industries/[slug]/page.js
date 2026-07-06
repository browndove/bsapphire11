import { notFound } from 'next/navigation';
import Link from 'next/link';

const industryData = {
  healthcare: {
    title: 'Healthcare AI | BLVCK SAPPHIRE',
    orbClass: 'orb-1',
    eyebrow: 'Health Sector',
    headline: 'Healthcare AI that secures identity and accelerates claims.',
    lead: 'Improve speed, trust, and accuracy in healthcare administration with biometric verification and fraud-aware intelligence.',
    tags: ['Facial Recognition', 'Claims Validation', 'Fraud Prevention', 'Audit Trail'],
    imgUrl: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1500&q=80',
    details: [
      { title: 'Secure Patient Identity', desc: 'Biometric matching reduces duplicate identities and enables trusted records.' },
      { title: 'Smarter Claims Processing', desc: 'Automated checks flag anomalies, minimize errors, and shorten processing time.' },
      { title: 'Fraud Risk Controls', desc: 'Pattern detection surfaces suspicious activity early for rapid intervention.' },
      { title: 'Compliance Visibility', desc: 'Every key step is tracked for transparent reporting and governance.' }
    ],
    ctaTitle: 'Bring trusted AI into your healthcare workflows',
    ctaDesc: 'We can tailor a deployment plan for your facility, network, or insurance operation.'
  },
  environment: {
    title: 'Environmental AI | BLVCK SAPPHIRE',
    orbClass: 'orb-2',
    eyebrow: 'Environmental Monitoring',
    headline: 'Geospatial intelligence for faster, evidence-based enforcement.',
    lead: 'Use satellite imagery, remote sensing, and AI detection to monitor concessions and respond to illegal activity earlier.',
    tags: ['Remote Sensing', 'Illegal Mining Detection', 'Compliance Monitoring', 'Evidence Collection'],
    imgUrl: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1500&q=80',
    details: [
      { title: 'Wide-Area Surveillance', desc: 'Track large territories continuously without relying on ground-only patrol cycles.' },
      { title: 'Early Site Detection', desc: 'Identify potential illegal sites with AI-assisted image analysis and geospatial signals.' },
      { title: 'Boundary + Beyond Alerts', desc: 'Monitor activities within concessions and nearby sensitive areas in one view.' },
      { title: 'Actionable Reporting', desc: 'Generate clear evidence and maps for compliance teams and regulators.' }
    ],
    ctaTitle: 'Protect land, water, and communities with AI monitoring',
    ctaDesc: 'We\'ll help you set up a practical monitoring and response model.'
  },
  security: {
    title: 'Security AI | BLVCK SAPPHIRE',
    orbClass: 'orb-1',
    eyebrow: 'Security Operations',
    headline: 'Computer vision built for real-time security intelligence.',
    lead: 'Monitor high-volume visual streams, identify entities quickly, and support faster operational decisions.',
    tags: ['Multi-Object Tracking', 'Real-Time Analysis', 'Crowd Management', 'Smart Tolling'],
    imgUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1500&q=80',
    details: [
      { title: 'Live Monitoring at Scale', desc: 'Process multiple camera feeds with consistent AI-driven tracking and alerts.' },
      { title: 'Operational Automation', desc: 'Reduce manual workload through event tagging and response workflows.' },
      { title: 'Flexible Deployment', desc: 'Integrate with existing control-room systems and cloud/on-prem environments.' },
      { title: 'Decision Support', desc: 'Deliver concise situational insights for security and intelligence teams.' }
    ],
    ctaTitle: 'Modernize your security operation with AI',
    ctaDesc: 'Let\'s design a deployment tailored to your surveillance and response goals.'
  }
};

export function generateStaticParams() {
  return Object.keys(industryData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = industryData[slug];
  if (!data) return { title: 'Not Found' };
  return { title: data.title };
}

export default async function IndustryPage({ params }) {
  const { slug } = await params;
  const data = industryData[slug];

  if (!data) {
    notFound();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .industry-hero {
          padding-top: 180px;
          padding-bottom: 80px;
        }
        .industry-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 4rem;
          align-items: center;
        }
        .industry-eyebrow {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .industry-hero-title {
          font-size: clamp(2.4rem, 4.5vw, 3.6rem);
          line-height: 1.05;
          margin-bottom: 1.5rem;
        }
        .industry-lead {
          font-size: 1.2rem;
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 34rem;
          margin-bottom: 2.25rem;
        }
        .industry-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .industry-tags li {
          font-size: 0.82rem;
          letter-spacing: 0.03em;
          color: #ccc;
          border: 1px solid var(--border-color);
          border-radius: 999px;
          padding: 0.5rem 1rem;
          background: #0a0a0a;
        }
        .industry-hero-media {
          width: 100%;
          height: 420px;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          background-size: cover;
          background-position: center;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
        }
        .industry-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .industry-detail-card {
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 2rem;
          background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
          transition: border-color var(--transition-snappy), transform var(--transition-snappy);
        }
        .industry-detail-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-6px);
        }
        .industry-detail-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.85rem;
        }
        .industry-detail-card p {
          color: var(--text-muted);
          line-height: 1.65;
          margin: 0;
        }
        .industry-cta-panel {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 3rem;
          background: linear-gradient(135deg, #0b0b0b 0%, #000 100%);
        }
        .industry-cta-label {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .industry-cta-panel h2 {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          margin-bottom: 0.75rem;
          max-width: 32rem;
        }
        .industry-cta-panel p {
          color: var(--text-muted);
          max-width: 34rem;
          margin: 0;
        }
        @media (max-width: 900px) {
          .industry-hero { padding-top: 140px; }
          .industry-hero-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .industry-hero-media { height: 300px; }
          .industry-cta-panel { padding: 2rem; }
        }
      `}} />
      <main>
        <section className="section industry-hero">
          <div className="container industry-hero-grid">
            <div>
              <p className="industry-eyebrow">{data.eyebrow}</p>
              <h1 className="industry-hero-title">{data.headline}</h1>
              <p className="industry-lead">{data.lead}</p>
              <ul className="industry-tags">
                {data.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </div>
            <div
              className="industry-hero-media"
              style={{ backgroundImage: `url('${data.imgUrl}')` }}
              role="img"
              aria-label={data.eyebrow}
            />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header slide-up">
              <h2 className="section-title">Capabilities</h2>
            </div>
            <div className="industry-detail-grid">
              {data.details.map((item) => (
                <article className="industry-detail-card slide-up" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="industry-cta-panel slide-up">
              <div>
                <p className="industry-cta-label">Next Step</p>
                <h2>{data.ctaTitle}</h2>
                <p>{data.ctaDesc}</p>
              </div>
              <Link className="btn btn-primary" href="/#contact">Request Consultation</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
