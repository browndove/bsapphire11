import Link from 'next/link';

export default function SuccessDemo() {
  return (
    <main className="demo-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <div className="container slide-up">
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(0,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2" style={{ width: '40px', height: '40px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-color)' }}>Request Received</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Your demo request has been successfully submitted. One of our enterprise architects will contact you shortly to schedule your tailored consultation.
          </p>
          <Link href="/" className="btn btn-primary" style={{ padding: '12px 30px' }}>Return to Home</Link>
        </div>
      </div>
    </main>
  );
}
