'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { crearCita, reagendarCita, cancelarCita, obtenerCitasProximas } from '@/lib/storage'
import { useTheme } from '@/lib/ThemeContext'

// "2026-02-23" → "23 de febrero"
function formatearFechaWA(fecha: string): string {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const [, m, d] = fecha.split('-')
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]}`
}

interface Mensaje {
  id: string
  role: 'user' | 'agent'
  content: string
}

interface DatosPaciente {
  nombre?: string
  telefono?: string
  motivo?: string
  fecha?: string
  hora?: string
}

interface VistaMovilVozProps {
  onCitaCreada?: () => void
  onEnviarWhatsApp?: (mensaje: string) => void
}

export default function VistaMovilVoz({ onCitaCreada, onEnviarWhatsApp }: VistaMovilVozProps) {
  const { theme } = useTheme()
  const dk = theme === 'dark'
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [datosPaciente, setDatosPaciente] = useState<DatosPaciente>({})
  const [llamadaActiva, setLlamadaActiva] = useState(false)
  const [escuchando, setEscuchando] = useState(false)
  const [hablando, setHablando] = useState(false)

  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const llamadaActivaRef = useRef(false)
  const datosPacienteRef = useRef<DatosPaciente>({})
  const mensajesRef = useRef<Mensaje[]>([])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes])

  useEffect(() => {
    datosPacienteRef.current = datosPaciente
  }, [datosPaciente])

  useEffect(() => {
    mensajesRef.current = mensajes
  }, [mensajes])

  // escucharAlTerminar: si true, arranca reconocimiento INMEDIATAMENTE al acabar de hablar
  const hablar = async (texto: string, escucharAlTerminar = false): Promise<void> => {
    if (!texto) return

    // Parar audio anterior si hay
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    setHablando(true)

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      })

      if (!response.ok) throw new Error('TTS error')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      await new Promise<void>((resolve) => {
        audio.onended = () => {
          setHablando(false)
          URL.revokeObjectURL(audioUrl)
          audioRef.current = null
          if (escucharAlTerminar && llamadaActivaRef.current) {
            iniciarReconocimiento()
          }
          resolve()
        }
        audio.onerror = () => {
          setHablando(false)
          URL.revokeObjectURL(audioUrl)
          audioRef.current = null
          if (escucharAlTerminar && llamadaActivaRef.current) {
            iniciarReconocimiento()
          }
          resolve()
        }
        audio.play()
      })
    } catch (error) {
      console.error('Error TTS:', error)
      setHablando(false)
      if (escucharAlTerminar && llamadaActivaRef.current) {
        iniciarReconocimiento()
      }
    }
  }

  const pendingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const iniciarReconocimiento = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = 'es-ES'
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    let textoFinal = ''
    let procesando = false

    recognitionRef.current.onstart = () => setEscuchando(true)

    recognitionRef.current.onresult = (event: any) => {
      if (!llamadaActivaRef.current || procesando) return

      let textoActual = ''
      for (let i = 0; i < event.results.length; i++) {
        textoActual += event.results[i][0].transcript
      }
      textoFinal = textoActual

      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current)

      pendingTimeoutRef.current = setTimeout(async () => {
        if (!llamadaActivaRef.current || procesando) return
        if (textoFinal.trim()) {
          procesando = true
          recognitionRef.current?.stop()
          setEscuchando(false)
          await procesarMensaje(textoFinal.trim())
          textoFinal = ''
          procesando = false
        }
      }, 1300)
    }

    recognitionRef.current.onerror = () => {
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current)
      setEscuchando(false)
    }

    recognitionRef.current.onend = () => {
      setEscuchando(false)
    }

    recognitionRef.current.start()
  }

  const procesarMensaje = async (textoUsuario: string) => {
    // Guard: si la llamada ya terminó, no procesar
    if (!llamadaActivaRef.current) return

    const msgUsuario: Mensaje = {
      id: Date.now().toString(),
      role: 'user',
      content: textoUsuario,
    }

    // USAR LA REF para obtener los mensajes actuales
    const mensajesActuales = [...mensajesRef.current, msgUsuario]
    setMensajes(mensajesActuales)
    mensajesRef.current = mensajesActuales

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensajes: mensajesActuales,
          datosPaciente: datosPacienteRef.current,
          citasExistentes: obtenerCitasProximas(),
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.datosPaciente) {
        setDatosPaciente(data.datosPaciente)
        datosPacienteRef.current = data.datosPaciente
      }

      const msgAgente: Mensaje = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: data.respuesta,
      }

      const mensajesConRespuesta = [...mensajesActuales, msgAgente]
      setMensajes(mensajesConRespuesta)
      mensajesRef.current = mensajesConRespuesta

      // Determinar si hay que seguir escuchando o es acción final
      const esAccionFinal = data.citaConfirmada || data.citaReagendada || data.citaCancelada

      // Si es acción final → parar TODO antes de hablar para que no recoja más audio
      if (esAccionFinal) {
        if (pendingTimeoutRef.current) {
          clearTimeout(pendingTimeoutRef.current)
          pendingTimeoutRef.current = null
        }
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
        setEscuchando(false)
        llamadaActivaRef.current = false
      }

      // Si NO es final → escuchar al terminar de hablar (0ms delay)
      // Si ES final → solo hablar, luego colgar
      await hablar(data.respuesta, !esAccionFinal)

      // REAGENDAR CITA EXISTENTE (comprobar ANTES que crear, para no duplicar)
      if (data.citaReagendada && data.reagendarData) {
        const r = data.reagendarData
        const d = data.datosPaciente || {}
        const citaReagendada = reagendarCita({
          telefono: r.telefono || d.telefono,
          nombre: r.nombre || d.nombre,
          motivo: r.motivo,
          fecha_actual: r.fecha_actual,
          nueva_fecha: r.nueva_fecha,
          nueva_hora: r.nueva_hora,
        })

        if (onEnviarWhatsApp && citaReagendada) {
          onEnviarWhatsApp(`Cita reagendada para el ${formatearFechaWA(r.nueva_fecha)} a las ${r.nueva_hora}`)
        }
        finalizarLlamada()
        onCitaCreada?.()
        return
      }

      // CREAR CITA NUEVA
      if (data.citaConfirmada && data.datosPaciente) {
        const d = data.datosPaciente

        crearCita({
          nombre: d.nombre,
          telefono: d.telefono,
          motivo: d.motivo || 'Consulta general',
          notas: d.notas || '',
          fecha: d.fecha,
          hora: d.hora,
        })

        if (onEnviarWhatsApp) {
          onEnviarWhatsApp(`Cita confirmada para ${d.nombre} el ${formatearFechaWA(d.fecha)} a las ${d.hora}`)
        }
        finalizarLlamada()
        onCitaCreada?.()
        return
      }

      // CANCELAR CITA
      if (data.citaCancelada && data.cancelarData) {
        // Parar reconocimiento INMEDIATAMENTE
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
        llamadaActivaRef.current = false

        const c = data.cancelarData
        const citaCancelada = cancelarCita({ telefono: c.telefono, nombre: c.nombre, motivo: c.motivo, fecha: c.fecha })

        if (onEnviarWhatsApp && citaCancelada) {
          onEnviarWhatsApp(`Tu cita del ${formatearFechaWA(citaCancelada.fecha)} a las ${citaCancelada.hora} ha sido cancelada.`)
        }

        finalizarLlamada()
        onCitaCreada?.()
        return
      }

      // El reconocimiento ya se arrancó en el onend de hablar()

    } catch (error) {
      console.error('Error:', error)
      await hablar('Perdona, no te he entendido. ¿Puedes repetir?', true)
    }
  }

  const iniciarLlamada = async () => {
    setLlamadaActiva(true)
    llamadaActivaRef.current = true
    setDatosPaciente({})
    datosPacienteRef.current = {}

    const saludo: Mensaje = {
      id: Date.now().toString(),
      role: 'agent',
      content: '¡Hola! Soy Laura de la Clínica Dental Sonrisa. ¿En qué puedo ayudarte?',
    }

    setMensajes([saludo])
    mensajesRef.current = [saludo]

    await hablar(saludo.content, true)
  }

  const finalizarLlamada = () => {
    setLlamadaActiva(false)
    llamadaActivaRef.current = false
    setEscuchando(false)
    setHablando(false)
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current)
      pendingTimeoutRef.current = null
    }
    recognitionRef.current?.stop()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setMensajes([])
    mensajesRef.current = []
    setDatosPaciente({})
  }

  const AudioWave = () => (
    <div className="flex items-center gap-[3px] h-5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`w-[3px] rounded-full ${hablando ? 'bg-emerald-400' : 'bg-blue-400'} animate-wave-${i}`} />
      ))}
    </div>
  )

  const datosCards = [
    { label: 'Nombre', value: datosPaciente.nombre, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
      </svg>
    ), span: true },
    { label: 'Teléfono', value: datosPaciente.telefono, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
      </svg>
    ) },
    { label: 'Motivo', value: datosPaciente.motivo, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      </svg>
    ) },
    { label: 'Fecha', value: datosPaciente.fecha, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
      </svg>
    ) },
    { label: 'Hora', value: datosPaciente.hora, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
      </svg>
    ) },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-8 h-[calc(100vh-2rem)]">
        <div className="flex-shrink-0 h-full">
        {/* Phone mockup - iPhone style */}
        <div className="w-[340px] h-full max-h-[700px] bg-gradient-to-b from-[#2a2a2c] via-[#1d1d1f] to-[#1d1d1f] rounded-[50px] p-[9px] shadow-[0_25px_60px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)] relative">
          {/* Side buttons */}
          <div className="absolute -left-[2px] top-[120px] w-[3px] h-[30px] bg-[#2a2a2c] rounded-l-sm" />
          <div className="absolute -left-[2px] top-[170px] w-[3px] h-[50px] bg-[#2a2a2c] rounded-l-sm" />
          <div className="absolute -left-[2px] top-[230px] w-[3px] h-[50px] bg-[#2a2a2c] rounded-l-sm" />
          <div className="absolute -right-[2px] top-[170px] w-[3px] h-[65px] bg-[#2a2a2c] rounded-r-sm" />
          {/* Dynamic Island */}
          <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-20" />
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[42px] overflow-hidden flex flex-col">
            {!llamadaActiva ? (
              <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50/50 overflow-hidden">
                {/* Logo + clinic name */}
                <div className="flex flex-col items-center pt-12 pb-4">
                  <div className="relative overflow-hidden mb-3">
                    <div className="animate-slide-in-right">
                      <div className="relative">
                        <Image
                          src="/logo-horizontal-color.png"
                          alt="Syntalys"
                          width={170}
                          height={54}
                          className="object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/80 animate-shimmer" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Clínica Dental Sonrisa</h3>
                  <p className="text-[12px] text-gray-400 font-medium mt-0.5">Asistente de voz IA</p>
                </div>

                {/* Pain stats */}
                <div className="mx-4 bg-blue-50 border border-blue-100/80 rounded-2xl p-3.5">
                  <p className="text-[9.5px] font-bold text-blue-400 uppercase tracking-[0.1em] text-center mb-3">Impacto en clínicas dentales</p>
                  <div className="flex justify-around">
                    {[
                      { num: '40%', label: 'llamadas sin atender' },
                      { num: '2h', label: 'al día en citas' },
                      { num: '3/10', label: 'pacientes perdidos' },
                    ].map(s => (
                      <div key={s.num} className="text-center">
                        <div className="text-[19px] font-bold text-blue-600 leading-none">{s.num}</div>
                        <div className="text-[9px] text-gray-400 mt-1 max-w-[52px] mx-auto leading-tight">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-center text-[12px] font-semibold text-gray-900 leading-snug mt-3 px-6">
                  Cada llamada no contestada<br />es dinero perdido
                </p>

                {/* Call button */}
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <button
                    onClick={iniciarLlamada}
                    className="group relative bg-gradient-to-b from-emerald-400 to-emerald-600 text-white w-16 h-16 rounded-full font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mx-auto">
                      <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-400/50 animate-pulse-ring" />
                  </button>
                  <p className="text-xs text-gray-400 font-medium">Pulsa para llamar</p>
                </div>
              </div>
            ) : (
              <>
                {/* Call header */}
                <div className="bg-gradient-to-b from-[#0a1628] to-[#101e36] text-white px-5 pt-12 pb-5">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3">
                      <div className="w-14 h-14 bg-white/[0.08] backdrop-blur rounded-2xl flex items-center justify-center border border-white/[0.06]">
                        {(hablando || escuchando) ? (
                          <AudioWave />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/50">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0e1b30] ${hablando ? 'bg-emerald-400' : escuchando ? 'bg-red-400' : 'bg-blue-400'}`} />
                    </div>
                    <p className="font-semibold text-[15px] tracking-tight">Agente de Voz</p>
                    <p className="text-[11px] text-white/40 font-medium mt-0.5">
                      {hablando ? 'Hablando' : escuchando ? 'Escuchando' : 'En línea'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#f8f9fb] to-[#f0f1f4]">
                  {mensajes.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                      <div className={`max-w-[80%] px-4 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#0a1628] text-white rounded-2xl rounded-br-md'
                          : 'bg-white text-gray-700 rounded-2xl rounded-bl-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100/80'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom bar */}
                <div className="px-5 py-3 bg-white/80 backdrop-blur border-t border-gray-100/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${
                          hablando ? 'bg-emerald-500' : escuchando ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        {(hablando || escuchando) && (
                          <div className={`absolute inset-0 w-2 h-2 rounded-full ${
                            hablando ? 'bg-emerald-500' : 'bg-red-500'
                          } animate-pulse-ring`} />
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-gray-400">
                        {hablando ? 'Agente habla...' : escuchando ? 'Escuchando...' : 'Conectado'}
                      </span>
                    </div>
                    <button
                      onClick={finalizarLlamada}
                      className="w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm shadow-red-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                        <path d="M3.68 3.68a.75.75 0 0 0-1.06 1.06L10.94 13.06l-8.32 8.32a.75.75 0 1 0 1.06 1.06L12 14.12l8.32 8.32a.75.75 0 1 0 1.06-1.06L13.06 13.06l8.32-8.32a.75.75 0 0 0-1.06-1.06L12 11.94 3.68 3.68Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Patient data card */}
        <div className={`rounded-2xl shadow-sm p-5 ${dk ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-gray-200/50'}`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dk ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${dk ? 'text-blue-400' : 'text-blue-600'}`}>
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className={`text-[13px] font-semibold tracking-tight ${dk ? 'text-white' : 'text-gray-900'}`}>Datos del paciente</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {datosCards.map((item) => (
              <div key={item.label} className={`group rounded-xl px-3.5 py-2.5 transition-colors ${
                dk
                  ? item.value ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/[0.03] border border-white/[0.06]'
                  : item.value ? 'bg-blue-50/50 border border-blue-100/60' : 'bg-gray-50/80 border border-gray-100/60'
              } ${item.span ? 'col-span-2' : ''}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={dk ? (item.value ? 'text-blue-400' : 'text-slate-600') : (item.value ? 'text-blue-500' : 'text-gray-300')}>{item.icon}</span>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{item.label}</p>
                </div>
                <p className={`text-[13px] font-medium ${
                  dk ? (item.value ? 'text-white' : 'text-slate-600') : (item.value ? 'text-gray-900' : 'text-gray-300')
                } ${item.label === 'Teléfono' ? 'font-mono tracking-wide' : ''}`}>
                  {item.value || '-'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transcription card */}
        <div className={`rounded-2xl shadow-sm p-5 flex-1 flex flex-col min-h-0 ${dk ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-gray-200/50'}`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dk ? 'bg-violet-500/10' : 'bg-violet-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${dk ? 'text-violet-400' : 'text-violet-600'}`}>
                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className={`text-[13px] font-semibold tracking-tight ${dk ? 'text-white' : 'text-gray-900'}`}>Transcripción en vivo</h3>
            {llamadaActiva && (
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Directo</span>
              </div>
            )}
          </div>
          <div className="space-y-2.5 overflow-y-auto flex-1 min-h-0">
            {mensajes.length === 0 ? (
              <div className="space-y-2.5 pt-1">
                <p className={`text-[10px] font-semibold uppercase tracking-[0.08em] mb-3 ${dk ? 'text-slate-600' : 'text-gray-400'}`}>
                  Frases de ejemplo para probar
                </p>
                {[
                  { emoji: '📅', titulo: 'Nueva cita', texto: '"Quiero una cita para limpieza dental el jueves a las 5 de la tarde"' },
                  { emoji: '🔄', titulo: 'Cambiar cita', texto: '"Soy Carmen Ruiz, tengo una cita mañana y necesito cambiarla"' },
                  { emoji: '❌', titulo: 'Cancelar', texto: '"Quiero cancelar mi cita de esta semana"' },
                ].map(({ emoji, titulo, texto }) => (
                  <div key={titulo} className={`flex gap-3 items-start p-3 rounded-xl border ${dk ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50 border-gray-100'}`}>
                    <span className="text-base leading-none mt-0.5 shrink-0">{emoji}</span>
                    <div>
                      <p className={`text-[11px] font-semibold mb-0.5 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{titulo}</p>
                      <p className={`text-[12px] italic leading-relaxed ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{texto}</p>
                    </div>
                  </div>
                ))}
                <p className={`text-[11px] text-center pt-1 ${dk ? 'text-slate-600' : 'text-gray-400'}`}>
                  Pulse el botón verde ↙ y hable con naturalidad
                </p>
              </div>
            ) : (
              mensajes.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 text-[13px] leading-relaxed py-1.5 px-3 rounded-lg ${
                  dk ? (msg.role === 'agent' ? 'bg-blue-500/10' : '') : (msg.role === 'agent' ? 'bg-blue-50/50' : '')
                }`}>
                  <span className={`font-semibold shrink-0 ${
                    dk ? (msg.role === 'agent' ? 'text-blue-400' : 'text-slate-400') : (msg.role === 'agent' ? 'text-blue-600' : 'text-gray-500')
                  }`}>
                    {msg.role === 'agent' ? 'Agente' : 'Paciente'}
                  </span>
                  <span className={dk ? 'text-slate-300' : 'text-gray-600'}>{msg.content}</span>
                </div>
              ))
            )}
          </div>

          {/* CTA footer */}
          {!llamadaActiva && (
            <div className={`mt-4 pt-4 border-t flex items-center justify-between gap-4 ${dk ? 'border-white/[0.06]' : 'border-gray-100'}`}>
              <div>
                <p className={`text-[14px] font-semibold leading-snug ${dk ? 'text-white' : 'text-gray-900'}`}>
                  ¿Desea implementar este agente?
                </p>
                <p className={`text-[12px] mt-0.5 ${dk ? 'text-slate-400' : 'text-gray-400'}`}>Implantación en menos de un mes</p>
              </div>
              <a
                href="https://wa.me/34641590487?text=Hola%2C%20me%20gustar%C3%ADa%20saber%20m%C3%A1s%20sobre%20el%20agente%20de%20voz%20para%20mi%20cl%C3%ADnica%20dental."
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-green-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Contactar
              </a>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
