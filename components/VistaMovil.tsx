'use client'

import { useState, useRef, useEffect } from 'react'
import type { Mensaje, EstadoConversacion } from '@/types'

interface VistaMovilProps {
  onCitaCreada?: () => void
  onEnviarWhatsApp?: (mensaje: string) => void
}

export default function VistaMovil({ onCitaCreada, onEnviarWhatsApp }: VistaMovilProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [inputUsuario, setInputUsuario] = useState('')
  const [cargando, setCargando] = useState(false)
  const [llamadaActiva, setLlamadaActiva] = useState(false)
  const [estado, setEstado] = useState<EstadoConversacion>({
    paso: 'inicio',
    datosTemporales: {},
  })

  const mensajesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  const iniciarLlamada = () => {
    setLlamadaActiva(true)
    const mensajeBienvenida: Mensaje = {
      id: Date.now().toString(),
      role: 'agent',
      content: 'Hola, bienvenido a la Clínica Dental. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    }
    setMensajes([mensajeBienvenida])
    setEstado({
      paso: 'filtro',
      datosTemporales: {},
    })
  }

  const finalizarLlamada = () => {
    setLlamadaActiva(false)
    setMensajes([])
    setEstado({ paso: 'inicio', datosTemporales: {} })
  }

  const confirmarYCrearCita = async () => {
    const { nombre, telefono, motivo, fecha, hora } = estado.datosTemporales

    if (!nombre || !telefono || !motivo || !fecha || !hora) {
      agregarMensajeAgent('Faltan datos para crear la cita.')
      return
    }

    setCargando(true)

    try {
      // Llamar a la API route para crear la cita
      const response = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, motivo, fecha, hora }),
      })

      if (!response.ok) {
        agregarMensajeAgent('Error al crear la cita.')
        setCargando(false)
        return
      }

      const data = await response.json()

      if (!data.success) {
        agregarMensajeAgent('Error al crear la cita.')
        setCargando(false)
        return
      }

      agregarMensajeAgent(
        `¡Perfecto! Tu cita ha sido confirmada para el ${formatearFecha(fecha)} a las ${hora}.`
      )

      const mensajeWhatsApp = `Hola ${nombre},\n\nTu cita ha quedado confirmada:\n\n📅 Fecha: ${formatearFecha(fecha)}\n🕐 Hora: ${hora}\n🦷 Motivo: ${motivo}\n\nGracias por confiar en nuestra clínica dental.\n\nClínica Dental`

      if (onEnviarWhatsApp) {
        onEnviarWhatsApp(mensajeWhatsApp)
      }

      if (onCitaCreada) {
        onCitaCreada()
      }

      setEstado({ paso: 'completado', datosTemporales: {} })
    } catch (error) {
      console.error('Error:', error)
      agregarMensajeAgent('Hubo un error.')
    } finally {
      setCargando(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const agregarMensajeAgent = (content: string) => {
    setMensajes((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'agent',
        content,
        timestamp: new Date(),
      },
    ])
  }

  const enviarMensaje = async () => {
    if (!inputUsuario.trim() || cargando) return

    const nuevoMensaje: Mensaje = {
      id: Date.now().toString(),
      role: 'user',
      content: inputUsuario,
      timestamp: new Date(),
    }

    setMensajes((prev) => [...prev, nuevoMensaje])
    setInputUsuario('')
    setCargando(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensajes: [...mensajes, nuevoMensaje],
          estado,
        }),
      })

      const data = await response.json()

      setMensajes((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: data.respuesta,
          timestamp: new Date(),
        },
      ])

      const nuevoEstado = data.nuevoEstado || estado
      setEstado(nuevoEstado)

      if (
        nuevoEstado.accion === 'crear' &&
        nuevoEstado.datosTemporales.nombre &&
        nuevoEstado.datosTemporales.telefono &&
        nuevoEstado.datosTemporales.motivo &&
        !nuevoEstado.datosTemporales.fecha
      ) {
        const fechaSugerida = new Date()
        fechaSugerida.setDate(fechaSugerida.getDate() + 3)
        nuevoEstado.datosTemporales.fecha = fechaSugerida.toISOString().split('T')[0]
        nuevoEstado.datosTemporales.hora = '10:00'
        setEstado(nuevoEstado)
      }
    } catch (error) {
      agregarMensajeAgent('Error de conexión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex gap-8 items-start max-w-6xl mx-auto">
      {/* Móvil */}
      <div className="flex-shrink-0">
        <div className="w-[340px] h-[680px] bg-gray-900 rounded-[50px] p-3 shadow-2xl relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10"></div>

          {/* Pantalla */}
          <div className="w-full h-full bg-white rounded-[40px] overflow-hidden flex flex-col">
            {!llamadaActiva ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 bg-[#01336c] rounded-full flex items-center justify-center mb-6">
                  <span className="text-5xl">📞</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Agente de Voz
                </h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Simula una llamada con el asistente virtual
                </p>
                <button
                  onClick={iniciarLlamada}
                  className="bg-[#01336c] hover:bg-[#03366d] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg"
                >
                  Iniciar Llamada
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-[#01336c] text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-xl">🤖</span>
                    </div>
                    <div>
                      <p className="font-semibold">Asistente Virtual</p>
                      <p className="text-xs opacity-80">En llamada...</p>
                    </div>
                  </div>
                  <button
                    onClick={finalizarLlamada}
                    className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                {/* Mensajes */}
                <div ref={mensajesRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {mensajes.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-[#01336c] text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {cargando && (
                    <div className="flex justify-start">
                      <div className="bg-white px-3 py-2 rounded-2xl border border-gray-200">
                        <p className="text-sm text-gray-500">Escribiendo...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón confirmar */}
                {estado.accion === 'crear' &&
                  estado.datosTemporales.nombre &&
                  estado.datosTemporales.telefono &&
                  estado.datosTemporales.motivo &&
                  estado.datosTemporales.fecha && (
                    <div className="px-4 py-2 bg-green-50 border-t border-green-200">
                      <button
                        onClick={confirmarYCrearCita}
                        disabled={cargando}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium text-sm"
                      >
                        ✅ Confirmar Cita
                      </button>
                    </div>
                  )}

                {/* Input */}
                <div className="p-3 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputUsuario}
                      onChange={(e) => setInputUsuario(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
                      placeholder="Escribe..."
                      disabled={cargando}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#01336c]"
                    />
                    <button
                      onClick={enviarMensaje}
                      disabled={cargando || !inputUsuario.trim()}
                      className="bg-[#01336c] hover:bg-[#03366d] disabled:bg-gray-400 text-white w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      ➤
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transcripción */}
      <div className="flex-1">
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-[680px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📝</span>
            Transcripción en Tiempo Real
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {mensajes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-12">
                La conversación aparecerá aquí...
              </p>
            ) : (
              mensajes.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <p className="text-xs font-semibold text-gray-600">
                    {msg.role === 'agent' ? '🤖 Asistente' : '👤 Usuario'}
                  </p>
                  <p className="text-sm text-gray-800 pl-5">{msg.content}</p>
                  <p className="text-xs text-gray-400 pl-5">
                    {msg.timestamp.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
