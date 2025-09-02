import { Inter } from 'next/font/google'
import './globals.css'
import { ToasterComponent } from '@/components/ui/toaster'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'AI Wizard',
  description: 'AI-powered legal consultation platform',
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
