'use client'

import { useState, useRef, useEffect } from 'react'
import type { Mensaje, EstadoConversacion, MotivoConsulta } from '@/types'
import { buscarOCrearPaciente, crearCita, buscarCitasPorPaciente, modificarCita, cancelarCita } from '@/app/actions'

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
  const [mostrarBotonesRapidos, setMostrarBotonesRapidos] = useState(false)

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
      content: 'Hola, bienvenido a la Clínica Dental. ¿En qué puedo ayudarte hoy? Puedes:\n\n1. Crear una nueva cita\n2. Modificar una cita existente\n3. Cancelar una cita',
      timestamp: new Date(),
    }
    setMensajes([mensajeBienvenida])
    setEstado({
      paso: 'filtro',
      datosTemporales: {},
    })
    setMostrarBotonesRapidos(true)
  }

  const finalizarLlamada = () => {
    setLlamadaActiva(false)
    setMensajes([])
    setEstado({
      paso: 'inicio',
      datosTemporales: {},
    })
    setMostrarBotonesRapidos(false)
  }

  const confirmarYCrearCita = async () => {
    const { nombre, telefono, motivo, fecha, hora } = estado.datosTemporales

    if (!nombre || !telefono || !motivo || !fecha || !hora) {
      agregarMensajeAgent('Faltan datos para crear la cita. Por favor, proporciona todos los datos necesarios.')
      return
    }

    setCargando(true)

    try {
      // 1. Buscar o crear paciente
      const resultadoPaciente = await buscarOCrearPaciente(nombre, telefono)

      if (!resultadoPaciente.success || !resultadoPaciente.data) {
        agregarMensajeAgent('Error al crear el paciente. Por favor, intenta de nuevo.')
        return
      }

      // 2. Crear la cita
      const resultadoCita = await crearCita(
        resultadoPaciente.data.id,
        fecha,
        hora,
        motivo as MotivoConsulta
      )

      if (!resultadoCita.success) {
        agregarMensajeAgent('Error al crear la cita. Por favor, intenta de nuevo.')
        return
      }

      // 3. Confirmar al usuario
      agregarMensajeAgent(
        `¡Perfecto! Tu cita ha sido confirmada para el ${formatearFecha(fecha)} a las ${hora}. Te enviaremos un mensaje de confirmación por WhatsApp.`
      )

      // 4. Enviar mensaje de WhatsApp simulado
      const mensajeWhatsApp = `Hola ${nombre},\n\nTu cita ha quedado confirmada:\n\n📅 Fecha: ${formatearFecha(fecha)}\n🕐 Hora: ${hora}\n🦷 Motivo: ${motivo}\n\nGracias por confiar en nuestra clínica dental.\n\nClínica Dental`

      if (onEnviarWhatsApp) {
        onEnviarWhatsApp(mensajeWhatsApp)
      }

      // 5. Notificar que la cita fue creada
      if (onCitaCreada) {
        onCitaCreada()
      }

      // Resetear estado
      setEstado({
        paso: 'completado',
        datosTemporales: {},
      })
      setMostrarBotonesRapidos(false)

    } catch (error) {
      console.error('Error al crear cita:', error)
      agregarMensajeAgent('Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.')
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
    const mensaje: Mensaje = {
      id: Date.now().toString(),
      role: 'agent',
      content,
      timestamp: new Date(),
    }
    setMensajes((prev) => [...prev, mensaje])
  }

  const accionRapida = (accion: string) => {
    setInputUsuario(accion)
    // Simular envío
    enviarMensajeConTexto(accion)
  }

  const enviarMensajeConTexto = async (texto: string) => {
    if (!texto.trim() || cargando) return

    const nuevoMensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      role: 'user',
      content: texto,
      timestamp: new Date(),
    }

    setMensajes((prev) => [...prev, nuevoMensajeUsuario])
    setInputUsuario('')
    setCargando(true)
    setMostrarBotonesRapidos(false)

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
      const nuevoEstado = data.nuevoEstado || estado
      setEstado(nuevoEstado)

      // Si tenemos todos los datos para crear, mostrar botón de confirmar
      if (
        nuevoEstado.accion === 'crear' &&
        nuevoEstado.datosTemporales.nombre &&
        nuevoEstado.datosTemporales.telefono &&
        nuevoEstado.datosTemporales.motivo
      ) {
        // Sugerir fecha si no existe
        if (!nuevoEstado.datosTemporales.fecha) {
          const fechaSugerida = new Date()
          fechaSugerida.setDate(fechaSugerida.getDate() + 3)
          nuevoEstado.datosTemporales.fecha = fechaSugerida.toISOString().split('T')[0]
          nuevoEstado.datosTemporales.hora = '10:00'
          setEstado(nuevoEstado)
        }
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      agregarMensajeAgent('Lo siento, hubo un error. ¿Podrías repetir lo que dijiste?')
    } finally {
      setCargando(false)
    }
  }

  const enviarMensaje = () => {
    enviarMensajeConTexto(inputUsuario)
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
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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

          {/* Botones de acción rápida */}
          {mostrarBotonesRapidos && estado.paso === 'filtro' && (
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                onClick={() => accionRapida('Quiero crear una nueva cita')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm transition-colors"
              >
                Crear cita
              </button>
              <button
                onClick={() => accionRapida('Necesito modificar mi cita')}
                className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded text-sm transition-colors"
              >
                Modificar cita
              </button>
              <button
                onClick={() => accionRapida('Quiero cancelar mi cita')}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
              >
                Cancelar cita
              </button>
            </div>
          )}

          {/* Botón de confirmar cita */}
          {estado.accion === 'crear' &&
            estado.datosTemporales.nombre &&
            estado.datosTemporales.telefono &&
            estado.datosTemporales.motivo &&
            estado.datosTemporales.fecha && (
              <div className="mb-3">
                <button
                  onClick={confirmarYCrearCita}
                  disabled={cargando}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ✅ Confirmar y Crear Cita
                </button>
              </div>
            )}

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
