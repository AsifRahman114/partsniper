import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { CompareProvider } from '@/lib/compare-context';
import { ThemeProvider } from '@/lib/theme-context';
import Navbar from '@/components/Navbar';
import CompareBar from '@/components/CompareBar';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata = {
  title: 'PartSniper — Best Value PC Parts in Bangladesh',
  description: 'Compare prices across Star Tech, Ryans, Techland, and more. Find the best value for money on PC parts, laptops, and accessories in Bangladesh.',
};

const themeInitScript = `
(function() {
  try {
    var storageKey = 'partsniper-theme';
    var root = document.documentElement;
    var storedTheme = localStorage.getItem(storageKey);
    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemTheme;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (error) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-bg text-text min-h-screen flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <CompareProvider>
              <Navbar />
              <main className="flex-1 pb-20">{children}</main>
              <footer className="border-t border-border py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted">
                  PartSniper — Best value for money, sniped from {' '}
                  <span className="text-lime font-mono">10</span> Bangladeshi tech retailers.
                </div>
              </footer>
              <CompareBar />
            </CompareProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
