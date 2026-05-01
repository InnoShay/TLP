import type { Metadata } from 'next'
import { DM_Serif_Display, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const ibmMono = IBM_Plex_Mono({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-ibm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://credify-tlp.vercel.app'),
  title: 'Credify — Trust Layer Protocol',
  description: 'Real-time algorithmic fact-verification infrastructure. Extract claims, score truth, deploy at scale.',
  openGraph: {
    title: 'Credify — Trust Layer Protocol',
    description: 'The deterministic trust layer between information and belief.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${ibmMono.variable}`}>
      <body className="bg-paper text-ink font-mono antialiased">
        {children}
      </body>
    </html>
  )
}
