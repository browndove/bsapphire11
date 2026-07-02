import './globals.css';

export const metadata = {
  title: 'Recruiting portal | Blvck Sapphire',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
