'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from '@/lib/ThemeContext'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const WHATSAPP_URL = 'https://wa.me/34641590487?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20el%20agente%20de%20voz%20IA%20para%20cl%C3%ADnicas%20dentales.'

function renderContent(text: string, dk: boolean) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  // Odd indices are always URLs from the capturing group — no stateful .test() needed
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline underline-offset-2 font-medium break-all ${dk ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
      >
        {part.includes('wa.me') ? 'Escríbenos por WhatsApp' : part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export default function FloatingChatbot() {
  const { theme } = useTheme()
  const dk = theme === 'dark'

  const [open, setOpen] = useState(false)
  const [mensajes, setMensajes] = useState<Msg[]>([
    { role: 'assistant', content: 'Bienvenido. Soy el asistente de Syntalys. ¿Tiene alguna pregunta sobre el agente de voz IA o sobre nuestros servicios?' }
  ])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [showPromo, setShowPromo] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const userInteracted = useRef(false)
  const autoOpenFired = useRef(false)

  // Auto-open after 7 seconds if the user hasn't interacted
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userInteracted.current && !autoOpenFired.current) {
        autoOpenFired.current = true
        setOpen(true)
        setShowPromo(true)
      }
    }, 7000)
    return () => clearTimeout(timer)
  }, [])

  // Hide promo banner after 6 seconds
  useEffect(() => {
    if (showPromo) {
      const t = setTimeout(() => setShowPromo(false), 6000)
      return () => clearTimeout(t)
    }
  }, [showPromo])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes, cargando])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  const handleToggle = () => {
    userInteracted.current = true
    setShowPromo(false)
    setOpen(prev => !prev)
  }

  const enviar = async () => {
    const texto = input.trim()
    if (!texto || cargando) return
    setShowPromo(false)

    const nuevosMensajes: Msg[] = [...mensajes, { role: 'user', content: texto }]
    setMensajes(nuevosMensajes)
    setInput('')
    setCargando(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensajes: nuevosMensajes.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()
      setMensajes(prev => [...prev, { role: 'assistant', content: data.respuesta }])
    } catch {
      setMensajes(prev => [...prev, { role: 'assistant', content: 'Ha ocurrido un error. Inténtelo de nuevo.' }])
    } finally {
      setCargando(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <>
      {/* Popup chat window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[370px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'
        } ${dk ? 'bg-[#0f1729] border border-white/[0.08]' : 'bg-white border border-gray-200/80'}`}
        style={{ maxHeight: '540px' }}
      >
        {/* Promo banner — auto-open greeting */}
        <div className={`overflow-hidden transition-all duration-500 ease-out shrink-0 ${showPromo ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3.5 flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <Image src="/favicon.png" alt="S" width={14} height={14} className="object-contain brightness-0 invert" />
            </div>
            <div>
              <p className="text-white text-[12px] font-semibold leading-snug">Syntalys · Inteligencia Artificial a medida</p>
              <p className="text-blue-100 text-[11.5px] mt-0.5 leading-snug">¿Tiene alguna pregunta sobre lo que acaba de ver? Estamos aquí para resolverla.</p>
            </div>
            <button onClick={() => setShowPromo(false)} className="ml-auto text-white/60 hover:text-white transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b shrink-0 ${dk ? 'border-white/[0.06] bg-[#0a1628]' : 'border-gray-100 bg-white'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dk ? 'bg-white/[0.06]' : 'bg-gray-50 border border-gray-100'}`}>
            <Image src="/favicon.png" alt="Syntalys" width={22} height={22} className="object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[13px] font-semibold leading-tight ${dk ? 'text-white' : 'text-gray-900'}`}>Syntalys</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className={`text-[11px] ${dk ? 'text-slate-400' : 'text-gray-400'}`}>Asistente virtual · En línea</p>
            </div>
          </div>
          <button
            onClick={() => { userInteracted.current = true; setOpen(false) }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${dk ? 'hover:bg-white/[0.06] text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 space-y-3 ${dk ? 'bg-[#0f1729]' : 'bg-gray-50/50'}`}>
          {mensajes.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-2 mt-0.5 shrink-0 ${dk ? 'bg-white/[0.06]' : 'bg-white border border-gray-100'}`}>
                  <Image src="/favicon.png" alt="S" width={14} height={14} className="object-contain" />
                </div>
              )}
              <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? dk
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-[#0a1628] text-white rounded-br-md'
                  : dk
                    ? 'bg-white/[0.06] text-slate-200 rounded-bl-md border border-white/[0.06]'
                    : 'bg-white text-gray-700 rounded-bl-md shadow-sm border border-gray-100/80'
              }`}>
                {renderContent(msg.content, dk)}
              </div>
            </div>
          ))}
          {cargando && (
            <div className="flex justify-start">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-2 mt-0.5 shrink-0 ${dk ? 'bg-white/[0.06]' : 'bg-white border border-gray-100'}`}>
                <Image src="/favicon.png" alt="S" width={14} height={14} className="object-contain" />
              </div>
              <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${dk ? 'bg-white/[0.06] border border-white/[0.06]' : 'bg-white shadow-sm border border-gray-100/80'}`}>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${dk ? 'bg-slate-400' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }} />
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${dk ? 'bg-slate-400' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }} />
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${dk ? 'bg-slate-400' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggested questions */}
        {mensajes.length === 1 && (
          <div className={`px-4 pb-2 flex flex-wrap gap-1.5 shrink-0 ${dk ? 'bg-[#0f1729]' : 'bg-gray-50/50'}`}>
            {['¿Cuánto cuesta?', '¿Qué incluye?', '¿Puedo personalizarlo?'].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50) }}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  dk
                    ? 'border-white/[0.1] text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.15]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* CTA button */}
        <div className={`px-3 pt-2 pb-1 shrink-0 ${dk ? 'bg-[#0a1628]' : 'bg-white'}`}>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all active:scale-[0.98] group"
          >
            <div>
              <p className="text-white text-[12px] font-semibold leading-tight">Agenda una reunión</p>
              <p className="text-blue-200 text-[10.5px] mt-0.5">Hablemos de su proyecto — sin compromiso</p>
            </div>
            <div className="flex items-center gap-2 ml-3 shrink-0">
              {/* WhatsApp icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/80 group-hover:text-white transition-colors">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.073-1.115l-.29-.173-3.008.894.894-3.008-.174-.29A7.963 7.963 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8zm4.406-5.844c-.242-.121-1.432-.707-1.654-.787-.222-.08-.384-.121-.545.121-.161.242-.626.787-.768.949-.142.162-.283.182-.525.061-.242-.121-1.022-.376-1.946-1.197-.719-.638-1.205-1.427-1.347-1.669-.142-.242-.015-.373.106-.494.11-.109.242-.283.363-.425.121-.142.161-.242.242-.404.08-.162.04-.303-.02-.425-.061-.121-.545-1.314-.747-1.799-.197-.472-.397-.408-.545-.415l-.464-.008c-.162 0-.424.061-.647.303-.222.242-.848.829-.848 2.022 0 1.193.869 2.346.99 2.508.121.162 1.709 2.609 4.141 3.658.579.25 1.031.4 1.383.512.581.185 1.11.159 1.528.097.466-.07 1.432-.586 1.635-1.152.202-.566.202-1.051.141-1.152-.061-.101-.222-.162-.464-.283z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 transition-transform">
                <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </div>
          </a>
        </div>

        {/* Input */}
        <div className={`px-3 py-3 border-t shrink-0 ${dk ? 'border-white/[0.06] bg-[#0a1628]' : 'border-gray-100 bg-white'}`}>
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${dk ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-gray-50 border border-gray-200'}`}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escribe tu pregunta..."
              className={`flex-1 text-[13px] bg-transparent outline-none ${dk ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'}`}
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || cargando}
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                input.trim() && !cargando
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  : dk ? 'bg-white/[0.04] text-slate-600' : 'bg-gray-200 text-gray-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
          open
            ? dk ? 'bg-white/[0.1] border border-white/[0.15]' : 'bg-gray-100 border border-gray-200'
            : dk ? 'bg-[#0a1628] border border-white/[0.08] hover:bg-white/[0.08] shadow-black/40' : 'bg-white border border-gray-200/80 hover:bg-gray-50 shadow-gray-300/50'
        }`}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${dk ? 'text-slate-300' : 'text-gray-600'}`}>
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        ) : (
          <Image src="/favicon.png" alt="Syntalys" width={32} height={32} className={`object-contain ${dk ? 'brightness-0 invert' : ''}`} />
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </>
  )
}
