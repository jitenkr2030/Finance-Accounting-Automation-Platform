import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinanceAI Platform - Transform Your Finance Operations',
  description: 'AI-powered Finance & Accounting Automation Platform with 30+ business engines, 100% test coverage, and enterprise-grade security. Streamline your financial operations today.',
  keywords: 'finance automation, accounting software, AI-powered analytics, financial management, business intelligence, enterprise finance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}