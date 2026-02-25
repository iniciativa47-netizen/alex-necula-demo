'use client'

import Image from 'next/image'
import { useTheme } from '@/lib/ThemeContext'

interface SidebarProps {
  vistaActual: 'agente' | 'crm' | 'calendario' | 'clientes' | 'como-funciona' | 'quienes-somos'
  onCambiarVista: (vista: 'agente' | 'crm' | 'calendario' | 'clientes' | 'como-funciona' | 'quienes-somos') => void
  isOpen?: boolean
  onClose?: () => void
}

const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
  </svg>
)

const IconTable = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 18.375V5.625ZM21 9.375A.375.375 0 0 0 20.625 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5ZM10.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5ZM3.375 15h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375Zm0-3.75h7.5a.375.375 0 0 0 .375-.375v-1.5A.375.375 0 0 0 10.875 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375Z" clipRule="evenodd" />
  </svg>
)

const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
  </svg>
)

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
  </svg>
)

const IconSun = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
  </svg>
)

const IconMoon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
  </svg>
)

const IconInfo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5A.75.75 0 0 0 12 9Z" clipRule="evenodd" />
  </svg>
)

const IconBuilding = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5h-.75V3.75a.75.75 0 0 0 0-1.5h-15ZM9 6a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm-.75 3.75A.75.75 0 0 1 9 9h1.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM9 12a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm3.75-5.25A.75.75 0 0 1 13.5 6H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM13.5 9a.75.75 0 0 0 0 1.5H15A.75.75 0 0 0 15 9h-1.5Zm-.75 3.75a.75.75 0 0 1 .75-.75H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM9 19.5v-2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 9 19.5Z" clipRule="evenodd" />
  </svg>
)

const TABS_DEMO = [
  { id: 'agente' as const, label: 'Agente de Voz', icon: IconPhone },
  { id: 'crm' as const, label: 'CRM', icon: IconTable },
  { id: 'calendario' as const, label: 'Calendario', icon: IconCalendar },
  { id: 'clientes' as const, label: 'Clientes', icon: IconUsers },
]

const TABS_INFO = [
  { id: 'como-funciona' as const, label: 'Cómo funciona', icon: IconInfo },
  { id: 'quienes-somos' as const, label: 'Quiénes somos', icon: IconBuilding },
]

export default function Sidebar({ vistaActual, onCambiarVista, isOpen = false, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const dk = theme === 'dark'

  const handleNav = (vista: typeof vistaActual) => {
    onCambiarVista(vista)
    onClose?.()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    <aside className={`w-[260px] flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    } ${
      dk
        ? 'bg-gradient-to-b from-[#0a1628] to-[#0d1d35] shadow-2xl shadow-black/30'
        : 'bg-white border-r border-gray-200/80 shadow-lg shadow-gray-200/40'
    }`}>
      {/* Logo */}
      <div className={`px-6 py-7 border-b ${dk ? 'border-white/[0.06]' : 'border-gray-100'}`}>
        <Image
          src="/logo-horizontal-color.png"
          alt="Syntalys"
          width={170}
          height={55}
          priority
          className={`object-contain ${dk ? 'brightness-0 invert opacity-90' : ''}`}
        />
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.15em] mb-3 px-4 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>
          Demo
        </p>
        <ul className="space-y-1 mb-5">
          {TABS_DEMO.map(tab => {
            const Icon = tab.icon
            const isActive = vistaActual === tab.id
            return (
              <li key={tab.id}>
                <button
                  onClick={() => handleNav(tab.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-all duration-200 relative group ${
                    isActive
                      ? dk ? 'bg-white/[0.08] text-white' : 'bg-blue-50 text-gray-900'
                      : dk ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${dk ? 'bg-blue-400' : 'bg-blue-600'}`} />
                  )}
                  <span className="flex items-center gap-3">
                    <span className={
                      isActive
                        ? dk ? 'text-blue-400' : 'text-blue-600'
                        : dk ? 'text-slate-500 group-hover:text-slate-400' : 'text-gray-400 group-hover:text-gray-600'
                    }>
                      <Icon />
                    </span>
                    <span className="text-[13px]">{tab.label}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className={`border-t mb-4 ${dk ? 'border-white/[0.06]' : 'border-gray-100'}`} />

        <p className={`text-[10px] font-semibold uppercase tracking-[0.15em] mb-3 px-4 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>
          Syntalys
        </p>
        <ul className="space-y-1">
          {TABS_INFO.map(tab => {
            const Icon = tab.icon
            const isActive = vistaActual === tab.id
            return (
              <li key={tab.id}>
                <button
                  onClick={() => handleNav(tab.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-all duration-200 relative group ${
                    isActive
                      ? dk ? 'bg-white/[0.08] text-white' : 'bg-blue-50 text-gray-900'
                      : dk ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${dk ? 'bg-blue-400' : 'bg-blue-600'}`} />
                  )}
                  <span className="flex items-center gap-3">
                    <span className={
                      isActive
                        ? dk ? 'text-blue-400' : 'text-blue-600'
                        : dk ? 'text-slate-500 group-hover:text-slate-400' : 'text-gray-400 group-hover:text-gray-600'
                    }>
                      <Icon />
                    </span>
                    <span className="text-[13px]">{tab.label}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Theme toggle + Footer */}
      <div className="px-4 pb-5">
        {/* Dark/Light toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 mb-4 ${
            dk ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center gap-3">
            <span className={dk ? 'text-slate-500' : 'text-gray-400'}>
              {dk ? <IconMoon /> : <IconSun />}
            </span>
            <span className="text-[13px] font-medium">{dk ? 'Modo oscuro' : 'Modo claro'}</span>
          </span>
          <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${dk ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${dk ? 'left-[18px]' : 'left-0.5'}`} />
          </div>
        </button>

        <div className={`border-t pt-4 ${dk ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            <p className={`text-[11px] tracking-wide ${dk ? 'text-slate-500' : 'text-gray-400'}`}>
              Sistema activo
            </p>
          </div>
          <p className={`text-[10px] text-center mt-2 tracking-wider uppercase ${dk ? 'text-slate-600' : 'text-gray-300'}`}>
            Powered by Syntalys
          </p>
        </div>
      </div>
    </aside>
    </>
  )
}
