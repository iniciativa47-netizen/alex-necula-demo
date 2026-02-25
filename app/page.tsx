'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Sidebar from '@/components/Sidebar'
import VistaMovilVoz from '@/components/VistaMovilVoz'
import VistaCRM from '@/components/VistaCRM'
import VistaCalendario from '@/components/VistaCalendario'
import VistaClientes from '@/components/VistaClientes'
import VistaComoFunciona from '@/components/VistaComoFunciona'
import VistaQuienesSomos from '@/components/VistaQuienesSomos'
import PopupWhatsApp from '@/components/PopupWhatsApp'
import FloatingChatbot from '@/components/FloatingChatbot'
import { ThemeProvider, useTheme } from '@/lib/ThemeContext'
import { seedDemoData } from '@/lib/storage'

function AppContent() {
  const [vistaActual, setVistaActual] = useState<'agente' | 'crm' | 'calendario' | 'clientes' | 'como-funciona' | 'quienes-somos'>('agente')
  const [mensajeWhatsApp, setMensajeWhatsApp] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()

  const isDark = theme === 'dark'

  useEffect(() => {
    seedDemoData()
  }, [])

  const handleCitaCreada = () => {
    console.log('Cita creada')
  }

  const handleEnviarWhatsApp = (mensaje: string) => {
    setMensajeWhatsApp(mensaje)
  }

  return (
    <div className={`flex min-h-screen dark-transition ${isDark ? 'bg-[#0f1729]' : 'bg-[#f0f2f5]'}`}>
      <Sidebar
        vistaActual={vistaActual}
        onCambiarVista={setVistaActual}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile top bar */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 border-b ${
        isDark ? 'bg-[#0a1628] border-white/[0.06]' : 'bg-white border-gray-200/80'
      }`}>
        <button
          onClick={() => setSidebarOpen(true)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isDark ? 'text-slate-400 hover:bg-white/[0.06]' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </button>
        <Image
          src="/logo-horizontal-color.png"
          alt="Syntalys"
          width={120}
          height={38}
          className={`object-contain ${isDark ? 'brightness-0 invert opacity-90' : ''}`}
        />
        <div className="w-9" /> {/* spacer */}
      </header>

      <main className="flex-1 lg:ml-[260px] px-4 lg:px-6 pt-[72px] lg:pt-4 pb-4 overflow-hidden">
        {vistaActual === 'agente' && (
          <VistaMovilVoz
            onCitaCreada={handleCitaCreada}
            onEnviarWhatsApp={handleEnviarWhatsApp}
          />
        )}
        {vistaActual === 'crm' && <VistaCRM />}
        {vistaActual === 'calendario' && <VistaCalendario />}
        {vistaActual === 'clientes' && <VistaClientes />}
        {vistaActual === 'como-funciona' && <VistaComoFunciona />}
        {vistaActual === 'quienes-somos' && <VistaQuienesSomos />}
      </main>

      {mensajeWhatsApp && (
        <PopupWhatsApp
          mensaje={mensajeWhatsApp}
          onCerrar={() => setMensajeWhatsApp(null)}
        />
      )}

      <FloatingChatbot />
    </div>
  )
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
