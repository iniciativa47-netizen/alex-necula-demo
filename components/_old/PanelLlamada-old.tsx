'use client'

import { useState, useRef, useEffect } from 'react'
import type { Mensaje, EstadoConversacion } from '@/types'

interface PanelLlamadaProps {
  onCitaCreada?: () => void
  onEnviarWhatsApp?: (mensaje: string) => void
}

export default function PanelLlamada({ onCitaCreada, onEnviarWhatsApp }: PanelLlamadaProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [inputUsuario, setInputUsuario] = useState('')
  const [cargando, setCargando] = useState(false)
  const [llamadaActiva, setLlamadaActiva] = useState(false)
  const [estado, setEstado] = useState<EstadoConversacion>({
    paso: 'inicio',
    datosTemporales: {},
  })

  const mensajesRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al último mensaje
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
    setEstado({
      paso: 'inicio',
      datosTemporales: {},
    })
  }

  const enviarMensaje = async () => {
    if (!inputUsuario.trim() || cargando) return

    const nuevoMensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      role: 'user',
      content: inputUsuario,
      timestamp: new Date(),
    }

    setMensajes((prev) => [...prev, nuevoMensajeUsuario])
    setInputUsuario('')
    setCargando(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensajes: [...mensajes, nuevoMensajeUsuario],
          estado,
        }),
      })

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor')
      }

      const data = await response.json()

      const mensajeAgent: Mensaje = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: data.respuesta,
        timestamp: new Date(),
      }

      setMensajes((prev) => [...prev, mensajeAgent])
      setEstado(data.nuevoEstado || estado)

      // Si llegamos al paso de confirmación, podríamos procesar la cita aquí
      // (esto se puede mejorar con más lógica)
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      const mensajeError: Mensaje = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'Lo siento, hubo un error. ¿Podrías repetir lo que dijiste?',
        timestamp: new Date(),
      }
      setMensajes((prev) => [...prev, mensajeError])
    } finally {
      setCargando(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Llamada Simulada</h2>
        {!llamadaActiva ? (
          <button
            onClick={iniciarLlamada}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            📞 Iniciar Llamada
          </button>
        ) : (
          <button
            onClick={finalizarLlamada}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ❌ Finalizar
          </button>
        )}
      </div>

      {!llamadaActiva ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">📱</p>
            <p>Haz clic en "Iniciar Llamada" para comenzar</p>
          </div>
        </div>
      ) : (
        <>
          {/* Área de mensajes */}
          <div
            ref={mensajesRef}
            className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg"
          >
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {cargando && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-500">Escribiendo...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input del usuario */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputUsuario}
              onChange={(e) => setInputUsuario(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={cargando}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={enviarMensaje}
              disabled={cargando || !inputUsuario.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Enviar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
