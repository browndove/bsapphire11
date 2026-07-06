import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', weight: ['300', '400', '500', '600'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading', weight: ['400', '500', '600', '700'] });

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
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
