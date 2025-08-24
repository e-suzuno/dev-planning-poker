import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dev Planning Poker',
  description: 'Planning poker for development teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
