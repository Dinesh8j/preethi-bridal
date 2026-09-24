import './globals.css';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { site } from '../lib/config';
const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--serif' });
const sans = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--sans' });
export const metadata = { title: `${site.name} | Bridal Makeup Artist`, description: `${site.tagline}. Book bridal, engagement and party makeup with ${site.name}.` };
export default function Layout({ children }) {
  return <html lang="en"><body className={`${serif.variable} ${sans.variable}`}>{children}</body></html>;
}
