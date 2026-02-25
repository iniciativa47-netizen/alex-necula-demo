'use client'

import { useState, useEffect } from 'react'
import { obtenerCitas } from '@/app/actions'
import type { Cita } from '@/types'

export default function PanelCRM() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [cargando, setCargando] = useState(true)

  const cargarCitas = async () => {
    setCargando(true)
    try {
      const resultado = await obtenerCitas()
      if (resultado.success && resultado.data) {
        setCitas(resultado.data as Cita[])
      }
    } catch (error) {
      console.error('Error al cargar citas:', error)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarCitas()

    // Actualizar cada 5 segundos
    const interval = setInterval(cargarCitas, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'modificada':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMotivoEmoji = (motivo: string) => {
    switch (motivo) {
      case 'Primera visita':
        return '👋'
      case 'Higiene / limpieza':
        return '🦷'
      case 'Urgencia':
        return '🚨'
      case 'Ortodoncia':
        return '🎗️'
      case 'Revisión':
        return '📋'
      default:
        return '📅'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">CRM - Citas</h2>
        <button
          onClick={cargarCitas}
          disabled={cargando}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {cargando && citas.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Cargando citas...</p>
          </div>
        ) : citas.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-4xl mb-2">📅</p>
              <p>No hay citas programadas</p>
              <p className="text-sm mt-1">Crea una nueva cita con el agente</p>
            </div>
          </div>
        ) : (
          citas.map((cita) => (
            <div
              key={cita.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getMotivoEmoji(cita.motivo)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {cita.paciente?.nombre || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {cita.paciente?.telefono || 'Sin teléfono'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded border ${getEstadoColor(
                    cita.estado
                  )}`}
                >
                  {cita.estado}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Motivo:</span> {cita.motivo}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Fecha:</span>{' '}
                  {formatearFecha(cita.fecha)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Hora:</span> {cita.hora}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Total de citas: <span className="font-semibold">{citas.length}</span>
        </p>
      </div>
    </div>
  )
}
