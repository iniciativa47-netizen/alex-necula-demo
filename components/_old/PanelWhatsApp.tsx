'use client'

import { useState, useEffect } from 'react'
import type { MensajeWhatsApp } from '@/types'

export default function PanelWhatsApp() {
  const [mensajes, setMensajes] = useState<MensajeWhatsApp[]>([])

  // Función para agregar un mensaje (se llamará cuando se complete una cita)
  const agregarMensaje = (contenido: string) => {
    const nuevoMensaje: MensajeWhatsApp = {
      id: Date.now().toString(),
      contenido,
      timestamp: new Date(),
      enviado: true,
    }
    setMensajes((prev) => [...prev, nuevoMensaje])
  }

  // Exponer la función a través de un evento personalizado
  useEffect(() => {
    const handleEnviarWhatsApp = (event: CustomEvent) => {
      agregarMensaje(event.detail.mensaje)
    }

    window.addEventListener('enviarWhatsApp', handleEnviarWhatsApp as EventListener)

    return () => {
      window.removeEventListener('enviarWhatsApp', handleEnviarWhatsApp as EventListener)
    }
  }, [])

  const formatearHora = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
          💬
        </div>
        <div>
          <h2 className="text-xl font-semibold">Mensajes WhatsApp</h2>
          <p className="text-sm text-gray-500">Confirmaciones simuladas</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {mensajes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-4xl mb-2">💬</p>
              <p>No hay mensajes aún</p>
              <p className="text-sm mt-1">Los mensajes aparecerán aquí</p>
              <p className="text-sm">cuando se confirme una cita</p>
            </div>
          </div>
        ) : (
          mensajes.map((msg) => (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[85%]">
                <div className="bg-green-100 border border-green-200 rounded-lg px-4 py-3 shadow-sm">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {msg.contenido}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <span className="text-xs text-gray-600">
                      {formatearHora(msg.timestamp)}
                    </span>
                    {msg.enviado && (
                      <span className="text-green-600 text-sm">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>🔒</span>
          <p>Mensajes simulados - No se envían realmente</p>
        </div>
      </div>
    </div>
  )
}
