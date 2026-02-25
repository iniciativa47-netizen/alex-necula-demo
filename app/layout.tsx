import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Demo Agente de Voz - Syntalys',
  description: 'Demostración de agente de voz con IA para gestión de citas en clínicas dentales',
  icons: {
    icon: '/logo-horizontal-color.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
