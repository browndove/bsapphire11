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
        
        #healthcare-card { background: url('/healthcare_bg.png') center/cover; }
        #environmental-card { background: url('/environment_bg.png') center/cover; }
        #security-card { background: url('/cyber_security.png') center/cover; }
        #public-sector-card { background: url('https://images.pexels.com/photos/37347/office-sitting-room-executive-sitting.jpg?auto=compress&cs=tinysrgb&w=800') center/cover; }
        #technology-card { background: url('https://images.pexels.com/photos/5203849/pexels-photo-5203849.jpeg?auto=compress&cs=tinysrgb&w=800') center/cover; }
      `}} />
      <main style={{ padding: '150px 0', minHeight: '100vh', background: '#050505' }}>
        <div className="container slide-up">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem', textAlign: 'center' }}>Enterprise Solutions</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '4rem', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 4rem auto' }}>Select an industry to explore tailored technical integrations and deployments.</p>
          
          <div className="solutions-grid">
            <Link href="/industries/healthcare" id="healthcare-card" className="solutions-card slide-up">
              <h3>Healthcare</h3>
            </Link>
            <Link href="/industries/environment" id="environmental-card" className="solutions-card slide-up delay-1">
              <h3>Environmental</h3>
            </Link>
            <Link href="/industries/security" id="security-card" className="solutions-card slide-up delay-2">
              <h3>Security</h3>
            </Link>
            <Link href="#" id="public-sector-card" className="solutions-card slide-up">
              <h3>Public Sector</h3>
            </Link>
            <Link href="#" id="technology-card" className="solutions-card slide-up delay-1">
              <h3>Technology</h3>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
