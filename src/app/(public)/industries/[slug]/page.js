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

export async function generateMetadata({ params }) {
  const data = industryData[params.slug];
  if (!data) return { title: 'Not Found' };
  return { title: data.title };
}

export default function IndustryPage({ params }) {
  const data = industryData[params.slug];

  if (!data) {
    notFound();
  }

  return (
    <>
      <div className={`bg-orb ${data.orbClass}`}></div>
      <main>
        <section className="section page-hero reveal">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">{data.eyebrow}</p>
              <h1>{data.headline}</h1>
              <p className="lead">{data.lead}</p>
              <ul className="detail-tags">
                {data.tags.map(tag => <li key={tag}>{tag}</li>)}
              </ul>
            </div>
            <div className="industry-card">
              <div className="card-image" style={{ height: '320px', backgroundImage: `url('${data.imgUrl}')` }}></div>
            </div>
          </div>
        </section>

        <section className="section reveal">
          <div className="container detail-layout">
            {data.details.map(item => (
              <article className="glass-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section cta reveal" id="contact">
          <div className="container impact-wrap glass-panel">
            <div>
              <p className="section-label">Next Step</p>
              <h2>{data.ctaTitle}</h2>
              <p>{data.ctaDesc}</p>
            </div>
            <div>
              <Link className="btn" href="/#contact">Request Consultation</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
