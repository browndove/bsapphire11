import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import ScrollToTop from '@/components/ScrollToTop';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', weight: ['300', '400', '500', '600'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading', weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: 'Blvck Sapphire | Modern AI Solutions',
  description: 'Blvck Sapphire builds intelligent, purely functional AI systems tailored for complex enterprise challenges.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Blvck Sapphire | Modern AI Solutions',
    description: 'Blvck Sapphire builds intelligent, purely functional AI systems tailored for complex enterprise challenges.',
    url: 'https://blvcksapphire.com',
    type: 'website',
    images: [
      {
        url: '/request_demo_bg.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@blvck_sapphire',
    title: 'Blvck Sapphire | Modern AI Solutions',
    description: 'Blvck Sapphire builds intelligent, purely functional AI systems tailored for complex enterprise challenges.',
    images: ['/request_demo_bg.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <div className="site-content">
          <Header />
          {children}
          <Footer />
          <CookieBanner />
          <ScrollToTop />
        </div>
      </body>
    </html>
  );
}
