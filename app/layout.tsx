import type { Metadata } from 'next'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from 'react-hot-toast'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700']
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Meema — Better prompts. Made fun.',
  description: 'Meema is a creator-friendly prompt library to save, remix, and reuse what works. Build your library of prompts that deliver results.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var preference = localStorage.getItem('themePreference') || 'system';
                  var theme = preference;

                  // Resolve 'system' to actual theme
                  if (preference === 'system') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }

                  var root = document.documentElement;

                  // Apply dark class for Tailwind
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else {
                    root.classList.remove('dark');
                  }

                  // Apply data-theme attribute
                  root.dataset.theme = theme;

                  // Apply colorScheme
                  root.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
