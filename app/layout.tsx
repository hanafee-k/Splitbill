import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'
import './globals.css'

const kanit = Kanit({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin', 'thai'],
  variable: '--font-kanit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SplitBill — แบ่งบิล PromptPay',
  description: 'แบ่งบิลง่ายๆ พร้อม QR PromptPay สำหรับทุกคนในโต๊ะ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${kanit.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
