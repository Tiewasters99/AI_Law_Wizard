import { Inter } from 'next/font/google'
import './globals.css'
import { ToasterComponent } from '@/app/components/ui/toaster'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'AI Law Wizard',
  description: 'AI-powered legal consultation platform combining wizard intelligence with scales of justice',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <ToasterComponent />
        </Providers>
      </body>
    </html>
  )
}
