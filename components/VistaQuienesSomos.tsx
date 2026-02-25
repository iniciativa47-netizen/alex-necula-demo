'use client'

import { useTheme } from '@/lib/ThemeContext'
import { useEffect, useRef } from 'react'
import Image from 'next/image'

const WA_LINK = 'https://wa.me/34641590487?text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20una%20llamada%20para%20conocer%20m%C3%A1s%20sobre%20Syntalys.'
const WEB_LINK = 'https://syntalys.ch'

const IcoBrain = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 0 1 .878.645 49.17 49.17 0 0 1 .376 5.452.657.657 0 0 1-.63.657c-.855.025-1.707.052-2.558.082v1.093l2.035.64a.75.75 0 0 1 .482.718v2.25a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1-.75-.75V16.5l-2.035-.64a.75.75 0 0 1-.482-.718v-1.09l-1.5.047v1.093l2.035.64a.75.75 0 0 1 .482.718v2.25a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1-.75-.75V16.5l-2.035-.64a.75.75 0 0 1-.482-.718v-1.09l-2.558-.082a.657.657 0 0 1-.63-.657 49.17 49.17 0 0 1 .376-5.452.75.75 0 0 1 .878-.645c1.842.334 3.721.562 5.632.676.332.02.61-.246.61-.578Z" />
  </svg>
)
const IcoCode = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M14.447 3.026a.75.75 0 0 1 .527.921l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.527ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
  </svg>
)
const IcoShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
)
const IcoChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
  </svg>
)
const IcoLink = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clipRule="evenodd" />
  </svg>
)
const IcoMegaphone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M16.881 4.345A23.112 23.112 0 0 1 8.25 6H7.5a5.25 5.25 0 0 0-.88 10.427 21.593 21.593 0 0 0 1.378 3.94c.464 1.004 1.674 1.32 2.582.796l.657-.379c.88-.508 1.165-1.593.772-2.468a17.116 17.116 0 0 1-.628-1.607c1.918.258 3.76.75 5.5 1.446A21.727 21.727 0 0 0 18 11.25c0-2.414-.393-4.735-1.119-6.905ZM18.26 3.74a23.22 23.22 0 0 1 1.24 7.51 23.22 23.22 0 0 1-1.24 7.51c-.055.161-.111.322-.17.482a.75.75 0 1 0 1.409.516 24.555 24.555 0 0 0 1.415-6.43 2.992 2.992 0 0 0 .836-2.078c0-.806-.319-1.54-.836-2.079a24.65 24.65 0 0 0-1.415-6.43.75.75 0 1 0-1.409.516c.059.16.115.321.17.483Z" />
  </svg>
)
const IcoTarget = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5Z" clipRule="evenodd" />
  </svg>
)
const IcoEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
  </svg>
)
const IcoLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
  </svg>
)
const IcoBolt = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.818a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .845-.143Z" clipRule="evenodd" />
  </svg>
)

const SERVICIOS = [
  { Icon: IcoBrain,     color: 'blue',   titulo: 'IA a medida',            desc: 'Agentes de voz, chatbots y sistemas de automatización diseñados desde cero para cada negocio.' },
  { Icon: IcoCode,      color: 'violet', titulo: 'Desarrollo web y móvil',  desc: 'Plataformas web, apps móviles y software interno. Sin plantillas, sin atajos.' },
  { Icon: IcoShield,    color: 'slate',  titulo: 'Ciberseguridad',          desc: 'Monitorización activa, auditorías y sistemas de protección inteligente para empresas.' },
  { Icon: IcoChart,     color: 'indigo', titulo: 'Analítica de datos',      desc: 'Insights predictivos y cuadros de mando que convierten datos en decisiones concretas.' },
  { Icon: IcoLink,      color: 'cyan',   titulo: 'Integración de APIs',     desc: 'Conectamos cualquier sistema existente con nuevas soluciones. Sin fricción.' },
  { Icon: IcoMegaphone, color: 'rose',   titulo: 'Marketing digital',       desc: 'SEO, automatización de leads y estrategias digitales orientadas a resultados.' },
]

const COLOR_MAP: Record<string, { bg: string; bgDk: string; text: string; border: string; borderDk: string; glow: string }> = {
  blue:   { bg: 'bg-blue-50',   bgDk: 'bg-blue-500/10',   text: 'text-blue-500',   border: 'border-blue-100',   borderDk: 'border-blue-500/20',   glow: 'group-hover:shadow-blue-500/20' },
  violet: { bg: 'bg-violet-50', bgDk: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-100', borderDk: 'border-violet-500/20', glow: 'group-hover:shadow-violet-500/20' },
  slate:  { bg: 'bg-slate-50',  bgDk: 'bg-slate-500/10',  text: 'text-slate-400',  border: 'border-slate-200',  borderDk: 'border-slate-500/20',  glow: 'group-hover:shadow-slate-500/20' },
  indigo: { bg: 'bg-indigo-50', bgDk: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-100', borderDk: 'border-indigo-500/20', glow: 'group-hover:shadow-indigo-500/20' },
  cyan:   { bg: 'bg-cyan-50',   bgDk: 'bg-cyan-500/10',   text: 'text-cyan-500',   border: 'border-cyan-100',   borderDk: 'border-cyan-500/20',   glow: 'group-hover:shadow-cyan-500/20' },
  rose:   { bg: 'bg-rose-50',   bgDk: 'bg-rose-500/10',   text: 'text-rose-500',   border: 'border-rose-100',   borderDk: 'border-rose-500/20',   glow: 'group-hover:shadow-rose-500/20' },
}

const STATS = [
  { valor: '+14',   label: 'años de experiencia' },
  { valor: '+2000', label: 'clientes satisfechos' },
  { valor: '100%',  label: 'soluciones a medida' },
  { valor: '<24h',  label: 'tiempo de respuesta' },
]

const DIFERENCIADORES = [
  { Icon: IcoTarget, color: 'text-blue-500',   bgDk: 'bg-blue-500/10',   bgLt: 'bg-blue-50',   txt: 'Cada solución se desarrolla desde cero, adaptada al proceso real del cliente — sin compromisos ni plantillas.' },
  { Icon: IcoEye,    color: 'text-violet-500', bgDk: 'bg-violet-500/10', bgLt: 'bg-violet-50', txt: 'Siempre construimos un prototipo funcional antes de pedir ningún pago. Lo que ves es exactamente lo que recibes.' },
  { Icon: IcoLock,   color: 'text-slate-400',  bgDk: 'bg-slate-500/10',  bgLt: 'bg-slate-100', txt: 'Cumplimiento total con GDPR y normativa suiza y europea. Infraestructura segura con SSL en todos los proyectos.' },
  { Icon: IcoBolt,   color: 'text-amber-500',  bgDk: 'bg-amber-500/10',  bgLt: 'bg-amber-50',  txt: 'Tiempo de respuesta inferior a 24 horas. Canal directo por WhatsApp Business para soporte y consultas.' },
]

export default function VistaQuienesSomos() {
  const { theme } = useTheme()
  const dk = theme === 'dark'
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const items = containerRef.current?.querySelectorAll('.step-item')
    if (!items || items.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    )
    items.forEach(item => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="max-w-4xl mx-auto py-8 px-2" ref={containerRef}>
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className={`text-2xl font-bold mb-2 ${dk ? 'text-white' : 'text-gray-900'}`}>Quiénes somos</h1>
        <p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>La empresa detrás de este agente de voz.</p>
      </div>

      {/* Hero card */}
      <div
        className={`step-item rounded-2xl p-7 mb-5 border relative overflow-hidden transition-all duration-300 ${
          dk ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]' : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
        }`}
      >
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none ${dk ? 'bg-blue-400' : 'bg-blue-200'}`} style={{ transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex-shrink-0 transition-transform duration-200 hover:scale-110 overflow-hidden">
              <Image src="/favicon.png" alt="Syntalys" width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>SYNTALYS TECH</h2>
              <p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Zurich, Suiza · Filial en España · Presencia internacional</p>
            </div>
          </div>
          <p className={`text-[14px] leading-relaxed mb-4 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>
            Somos una empresa tecnológica suiza con más de 14 años de experiencia desarrollando soluciones digitales e inteligencia artificial completamente a medida. No comercializamos productos estándar: cada proyecto que construimos es único, diseñado desde cero según las necesidades reales de cada cliente.
          </p>
          <p className={`text-[14px] leading-relaxed ${dk ? 'text-slate-400' : 'text-gray-600'}`}>
            Llevamos más de una década demostrando que no hay dos negocios iguales — y por eso no hay dos soluciones iguales. Nuestro lema lo resume bien:{' '}
            <span className={`font-semibold ${dk ? 'text-white' : 'text-gray-900'}`}>"Tailor-made AI. Code at your service."</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {STATS.map((s, i) => (
          <div
            key={i}
            className={`step-item rounded-2xl p-4 text-center border cursor-default transition-all duration-200 group ${
              dk ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-0.5'
                 : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5'
            }`}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className={`text-2xl font-bold mb-0.5 transition-transform duration-200 group-hover:scale-110 ${dk ? 'text-blue-400' : 'text-blue-600'}`}>
              {s.valor}
            </div>
            <div className={`text-[11px] ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Servicios */}
      <div
        className={`step-item rounded-2xl p-6 mb-5 border transition-all duration-200 ${
          dk ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'
        }`}
      >
        <h3 className={`font-semibold text-[14px] mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Qué hacemos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICIOS.map(({ Icon, color, titulo, desc }, i) => {
            const c = COLOR_MAP[color]
            return (
              <div
                key={i}
                className={`group flex gap-3 p-3.5 rounded-xl border cursor-default transition-all duration-200 ${
                  dk
                    ? `bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-px`
                    : `bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm hover:-translate-y-px ${c.glow} hover:shadow-md`
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all duration-200 group-hover:scale-110 ${
                  dk ? `${c.bgDk} ${c.borderDk}` : `${c.bg} ${c.border}`
                }`}>
                  <span className={c.text}><Icon /></span>
                </div>
                <div>
                  <div className={`text-[13px] font-semibold mb-0.5 ${dk ? 'text-white' : 'text-gray-800'}`}>{titulo}</div>
                  <div className={`text-[12px] leading-relaxed ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Diferenciadores */}
      <div
        className={`step-item rounded-2xl p-6 mb-5 border transition-all duration-200 ${
          dk ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'
        }`}
      >
        <h3 className={`font-semibold text-[14px] mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Por qué Syntalys</h3>
        <div className="space-y-3">
          {DIFERENCIADORES.map(({ Icon, color, bgDk, bgLt, txt }, i) => (
            <div
              key={i}
              className={`group flex gap-3 items-start p-2.5 rounded-xl transition-all duration-200 cursor-default ${
                dk ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110 ${dk ? bgDk : bgLt}`}>
                <span className={color}><Icon /></span>
              </div>
              <p className={`text-[13px] leading-relaxed transition-colors duration-200 ${dk ? 'text-slate-300 group-hover:text-slate-200' : 'text-gray-600 group-hover:text-gray-800'}`}>
                {txt}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div
        className={`step-item rounded-2xl p-7 border text-center ${
          dk ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'
        }`}
      >
        <h2 className={`text-lg font-bold mb-2 ${dk ? 'text-white' : 'text-gray-900'}`}>Hablemos de tu proyecto</h2>
        <p className={`text-sm mb-6 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>
          Sin compromiso. Te explicamos cómo podemos adaptar esta solución — o cualquier otra — a tu negocio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn inline-flex items-center justify-center gap-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-green-500/20 hover:scale-[1.03] hover:shadow-green-500/30 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Agendar llamada
          </a>
          <a
            href={WEB_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm border hover:scale-[1.02] active:scale-[0.98] ${
              dk ? 'border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.06]' : 'border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm hover:border-gray-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z" />
            </svg>
            Visitar syntalys.ch
          </a>
        </div>
      </div>
    </div>
  )
}
