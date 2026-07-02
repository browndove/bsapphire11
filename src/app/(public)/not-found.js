import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found | Blvck Sapphire',
};

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '8rem', margin: '0', lineHeight: '1', color: 'var(--text-color)' }}>404</h1>
      <h2 style={{ fontSize: '2rem', margin: '1rem 0', color: 'var(--text-color)' }}>System Node Not Found</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
        The requested protocol sequence cannot be located within the current infrastructure parameters. The node may have been re-assigned or deprecated.
      </p>
      <Link href="/" className="btn btn-outline">Return to Home</Link>
    </main>
  );
}
