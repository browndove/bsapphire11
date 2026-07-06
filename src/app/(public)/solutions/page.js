import Link from 'next/link';

export const metadata = {
  title: 'Solutions | Blvck Sapphire',
};

export default function Solutions() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .solutions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        .solutions-card {
            display: flex;
            align-items: flex-end;
            min-height: 400px;
            padding: 2rem;
            text-decoration: none;
            position: relative;
            overflow: hidden;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }
        .solutions-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
            z-index: 1;
        }
        .solutions-card h3 {
            position: relative;
            z-index: 2;
            color: #fff;
            font-size: 2rem;
            margin: 0;
            transition: transform 0.3s ease;
        }
        .solutions-card:hover h3 {
            transform: translateY(-10px);
        }
        .solutions-card:hover {
            border-color: #555;
        }
        .solutions-card.is-coming-soon {
            cursor: default;
            opacity: 0.72;
        }
        .solutions-card.is-coming-soon:hover {
            border-color: var(--border-color);
        }
        .solutions-card.is-coming-soon:hover h3 {
            transform: none;
        }
        .solutions-card-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            z-index: 2;
            font-size: 0.72rem;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #aaa;
            border: 1px solid #444;
            border-radius: 999px;
            padding: 0.3rem 0.65rem;
            background: rgba(0, 0, 0, 0.55);
        }

        #healthcare { background: url('/solution_healthcare.jpg') center/cover; }
        #environmental { background: url('/solution_environmental.jpg') center/cover; }
        #security { background: url('/solution_security.jpg') center/cover; }
        #public-sector { background: url('/solution_public_sector.jpg') center/cover; }
        #technology { background: url('/solution_technology.jpg') center/cover; }
      `}} />
      <main style={{ padding: '150px 0', minHeight: '100vh', background: '#050505' }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem', textAlign: 'center' }}>Enterprise Solutions</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '4rem', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 4rem auto' }}>Select an industry to explore tailored technical integrations and deployments.</p>
          
          <div className="solutions-grid">
            <Link href="/industries/healthcare" id="healthcare" className="solutions-card">
              <h3>Healthcare</h3>
            </Link>
            <Link href="/industries/environment" id="environmental" className="solutions-card">
              <h3>Environmental</h3>
            </Link>
            <Link href="/industries/security" id="security" className="solutions-card">
              <h3>Security</h3>
            </Link>
            <div id="public-sector" className="solutions-card is-coming-soon" aria-disabled="true">
              <span className="solutions-card-badge">Coming soon</span>
              <h3>Public Sector</h3>
            </div>
            <div id="technology" className="solutions-card is-coming-soon" aria-disabled="true">
              <span className="solutions-card-badge">Coming soon</span>
              <h3>Technology</h3>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
