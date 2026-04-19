import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Wtracker',
  description: 'Your daily work tracker — a better alternative to Google Docs/Sheets for tracking daily work.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#000',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '14px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
