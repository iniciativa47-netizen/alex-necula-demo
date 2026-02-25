'use client'

import { useTheme } from '@/lib/ThemeContext'
import { useEffect, useRef } from 'react'

const WA_LINK = 'https://wa.me/34641590487?text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20una%20llamada%20para%20conocer%20el%20agente%20de%20voz.'

const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
  </svg>
)

const IconChat = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.155L8.412 21.03a.75.75 0 0 1-1.28-.53v-3.065a48.842 48.842 0 0 1-2.284-.463C2.87 16.718 1.5 14.986 1.5 13.04V6.46c0-1.946 1.37-3.678 3.348-3.97Z" clipRule="evenodd" />
  </svg>
)

const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
  </svg>
)

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
)

const IconWhatsApp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

const IconBell = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
  </svg>
)

const IconHeart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
  </svg>
)

const IconDatabase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875Z" />
    <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 0 0 1.897 1.384C6.809 12.164 9.315 12.75 12 12.75Z" />
    <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 15.914 9.315 16.5 12 16.5Z" />
    <path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 20.317 16.97 22.5 12 22.5s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 19.664 9.315 20.25 12 20.25Z" />
  </svg>
)

const PASOS = [
  {
    num: 1,
    icon: IconPhone,
    color: 'blue',
    titulo: 'Llamada entrante',
    descripcion: 'Un paciente llama a la clínica. El agente de voz responde al instante, 24 horas al día, 7 días a la semana. Sin esperas, sin desvíos.',
  },
  {
    num: 2,
    icon: IconChat,
    color: 'violet',
    titulo: 'Conversación natural',
    descripcion: 'El agente habla con el paciente de forma completamente natural. Recoge el motivo de la consulta, nombre completo y número de teléfono.',
  },
  {
    num: 3,
    icon: IconCalendar,
    color: 'indigo',
    titulo: 'Disponibilidad en tiempo real',
    descripcion: 'Consulta el calendario al instante y ofrece la franja horaria disponible. Si la hora preferida está ocupada, propone alternativas.',
  },
  {
    num: 4,
    icon: IconCheck,
    color: 'emerald',
    titulo: 'Cita confirmada',
    descripcion: 'El agente confirma la cita con el paciente y la registra automáticamente en el sistema.',
  },
  {
    num: 5,
    icon: IconWhatsApp,
    color: 'green',
    titulo: 'Confirmación por WhatsApp',
    descripcion: 'En el momento de la confirmación, el paciente recibe un mensaje automático por WhatsApp con todos los detalles de su cita.',
  },
  {
    num: 6,
    icon: IconBell,
    color: 'amber',
    titulo: 'Recordatorios automáticos',
    descripcion: 'El sistema envía dos recordatorios automáticos: uno 24 horas antes y otro 1 hora antes de la cita. Sin intervención manual.',
  },
  {
    num: 7,
    icon: IconHeart,
    color: 'rose',
    titulo: 'Mensaje post-cita',
    descripcion: 'Tras la visita, el paciente recibe un mensaje de agradecimiento: "Esperamos haberte ayudado. ¡Hasta la próxima!" — un detalle que fideliza.',
  },
  {
    num: 8,
    icon: IconDatabase,
    color: 'slate',
    titulo: 'CRM + Calendario actualizados',
    descripcion: 'Cada cita, cambio o cancelación queda registrado automáticamente en el panel de control. Historial completo de pacientes accesible en todo momento.',
  },
]

const COLOR_MAP: Record<string, { bg: string; bgDk: string; text: string; border: string; borderDk: string; glow: string }> = {
  blue:    { bg: 'bg-blue-50',   bgDk: 'bg-blue-500/10',   text: 'text-blue-500',   border: 'border-blue-100',   borderDk: 'border-blue-500/20',   glow: 'group-hover:shadow-blue-500/20' },
  violet:  { bg: 'bg-violet-50', bgDk: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-100', borderDk: 'border-violet-500/20', glow: 'group-hover:shadow-violet-500/20' },
  indigo:  { bg: 'bg-indigo-50', bgDk: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-100', borderDk: 'border-indigo-500/20', glow: 'group-hover:shadow-indigo-500/20' },
  emerald: { bg: 'bg-emerald-50',bgDk: 'bg-emerald-500/10',text: 'text-emerald-500',border: 'border-emerald-100',borderDk:'border-emerald-500/20',  glow: 'group-hover:shadow-emerald-500/20' },
  green:   { bg: 'bg-green-50',  bgDk: 'bg-green-500/10',  text: 'text-green-500',  border: 'border-green-100',  borderDk: 'border-green-500/20',   glow: 'group-hover:shadow-green-500/20' },
  amber:   { bg: 'bg-amber-50',  bgDk: 'bg-amber-500/10',  text: 'text-amber-500',  border: 'border-amber-100',  borderDk: 'border-amber-500/20',   glow: 'group-hover:shadow-amber-500/20' },
  rose:    { bg: 'bg-rose-50',   bgDk: 'bg-rose-500/10',   text: 'text-rose-500',   border: 'border-rose-100',   borderDk: 'border-rose-500/20',    glow: 'group-hover:shadow-rose-500/20' },
  slate:   { bg: 'bg-slate-50',  bgDk: 'bg-slate-500/10',  text: 'text-slate-400',  border: 'border-slate-100',  borderDk: 'border-slate-500/20',   glow: 'group-hover:shadow-slate-500/20' },
}

export default function VistaComoFunciona() {
  const { theme } = useTheme()
  const dk = theme === 'dark'
  const containerRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver — cada paso aparece cuando entra en viewport
  useEffect(() => {
    const items = containerRef.current?.querySelectorAll('.step-item')
    if (!items || items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    )

    items.forEach(item => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="max-w-4xl mx-auto py-8 px-2" ref={containerRef}>
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className={`text-2xl font-bold mb-2 ${dk ? 'text-white' : 'text-gray-900'}`}>
          Cómo funciona el agente de voz
        </h1>
        <p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>
          De la llamada a la cita confirmada — todo automatizado, sin intervención humana.
        </p>
      </div>

      {/* Pasos */}
      <div className="relative">
        {/* Línea vertical con punto viajero */}
        <div className={`absolute left-[27px] top-10 bottom-10 w-[2px] overflow-hidden ${dk ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
          <div
            className={`connector-dot absolute left-0 right-0 h-8 rounded-full ${dk ? 'bg-gradient-to-b from-transparent via-blue-400/60 to-transparent' : 'bg-gradient-to-b from-transparent via-blue-400/50 to-transparent'}`}
          />
        </div>

        <div className="space-y-4">
          {PASOS.map((paso, i) => {
            const Icon = paso.icon
            const c = COLOR_MAP[paso.color]
            return (
              <div
                key={i}
                className="step-item relative flex gap-5 items-start group"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                {/* Icono numerado */}
                <div className={`step-icon relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border cursor-default transition-all duration-200 group-hover:scale-105 ${
                  dk
                    ? `${c.bgDk} ${c.borderDk} group-hover:shadow-lg group-hover:shadow-black/30`
                    : `${c.bg} ${c.border} group-hover:shadow-md ${c.glow}`
                }`}>
                  <span className={c.text}><Icon /></span>
                  <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform duration-200 group-hover:scale-110 ${
                    dk ? 'bg-[#0d1d35] border border-white/10 text-slate-400' : 'bg-white border border-gray-200 text-gray-500'
                  }`}>
                    {paso.num}
                  </div>
                </div>

                {/* Card */}
                <div className={`flex-1 rounded-2xl px-5 py-4 border transition-all duration-200 ${
                  dk
                    ? 'bg-white/[0.03] border-white/[0.06] group-hover:bg-white/[0.055] group-hover:border-white/[0.1]'
                    : 'bg-white border-gray-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-px group-hover:border-gray-200'
                }`}>
                  <h3 className={`font-semibold text-[14px] mb-1 ${dk ? 'text-white' : 'text-gray-900'}`}>
                    {paso.titulo}
                  </h3>
                  <p className={`text-[13px] leading-relaxed ${dk ? 'text-slate-400' : 'text-gray-500'}`}>
                    {paso.descripcion}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div
        className={`step-item mt-10 rounded-2xl p-7 border text-center ${
          dk ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'
        }`}
        style={{ transitionDelay: `${PASOS.length * 70}ms` }}
      >
        <h2 className={`text-lg font-bold mb-2 ${dk ? 'text-white' : 'text-gray-900'}`}>
          ¿Desea implementar este agente en su clínica?
        </h2>
        <p className={`text-sm mb-5 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>
          Lo que acaba de ver es la demostración real. Lo adaptamos completamente a su clínica en menos de un mes.
        </p>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-btn inline-flex items-center gap-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-green-500/20 hover:scale-[1.03] hover:shadow-green-500/30 active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Agendar llamada
        </a>
      </div>
    </div>
  )
}
