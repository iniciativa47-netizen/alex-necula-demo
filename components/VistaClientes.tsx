'use client'

import { useState, useEffect, useMemo } from 'react'
import { obtenerCitasProximas, type CitaLocal } from '@/lib/storage'
import { useTheme } from '@/lib/ThemeContext'

interface Cliente {
  nombre: string
  telefono: string
  totalCitas: number
  ultimaCita: string
  motivos: string[]
  estado: string
  citas: CitaLocal[]
}

const MOTIVO_DOT: Record<string, string> = {
  'Urgencia': 'bg-red-500', 'Extracción': 'bg-amber-500', 'Caries / Empaste': 'bg-yellow-500',
  'Endodoncia': 'bg-violet-500', 'Ortodoncia': 'bg-sky-500', 'Higiene / limpieza': 'bg-teal-500',
  'Estética dental': 'bg-fuchsia-500', 'Implantes': 'bg-indigo-500', 'Prótesis': 'bg-stone-500',
  'Primera visita': 'bg-emerald-500', 'Revisión': 'bg-cyan-500',
}

function DetalleCliente({ cliente, dk, onCerrar, formatearFecha }: {
  cliente: Cliente
  dk: boolean
  onCerrar?: () => void
  formatearFecha: (f: string) => string
}) {
  return (
    <>
      {/* Client header */}
      <div className={`px-5 py-5 border-b flex-shrink-0 ${dk ? 'border-white/[0.06]' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${dk ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            {cliente.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[15px] font-bold truncate ${dk ? 'text-white' : 'text-gray-900'}`}>{cliente.nombre}</p>
            <p className={`text-[12px] font-mono tracking-wide ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{cliente.telefono}</p>
          </div>
          {/* Close button — mobile only */}
          {onCerrar && (
            <button
              onClick={onCerrar}
              className={`lg:hidden p-1.5 rounded-lg transition-colors ${dk ? 'hover:bg-white/[0.08] text-slate-500' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          )}
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: cliente.totalCitas, label: 'Citas', color: '' },
            { val: cliente.motivos.length, label: 'Motivos', color: '' },
            { val: cliente.citas.filter(c => c.estado === 'confirmada').length, label: 'Activas', color: dk ? 'text-emerald-400' : 'text-emerald-600' },
          ].map(({ val, label, color }) => (
            <div key={label} className={`rounded-lg px-3 py-2 text-center ${dk ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
              <p className={`text-lg font-bold ${color || (dk ? 'text-white' : 'text-gray-900')}`}>{val}</p>
              <p className={`text-[9px] font-semibold uppercase tracking-wider ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment history */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-3 px-1 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Historial de citas</p>
        <div className="space-y-2">
          {cliente.citas
            .sort((a, b) => b.fecha.localeCompare(a.fecha))
            .map(cita => (
              <div key={cita.id} className={`rounded-xl p-3 border ${dk ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50/50 border-gray-100'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[12px] font-semibold ${dk ? 'text-white' : 'text-gray-900'}`}>{formatearFecha(cita.fecha)}</span>
                  <span className={`text-[11px] font-bold font-mono ${dk ? 'text-slate-300' : 'text-gray-700'}`}>{cita.hora}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${MOTIVO_DOT[cita.motivo] || 'bg-gray-400'}`} />
                  <span className={`text-[11px] font-medium ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{cita.motivo}</span>
                  <span className={`ml-auto text-[10px] font-semibold capitalize ${
                    cita.estado === 'confirmada' ? dk ? 'text-emerald-400' : 'text-emerald-600'
                    : cita.estado === 'cancelada' ? dk ? 'text-red-400' : 'text-red-600'
                    : dk ? 'text-blue-400' : 'text-blue-600'
                  }`}>{cita.estado}</span>
                </div>
                {cita.notas && cita.notas !== '-' && (
                  <p className={`text-[11px] mt-1.5 italic ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{cita.notas}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  )
}

export default function VistaClientes() {
  const { theme } = useTheme()
  const dk = theme === 'dark'
  const [citas, setCitas] = useState<CitaLocal[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroMotivo, setFiltroMotivo] = useState('todos')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)

  useEffect(() => {
    const cargar = () => setCitas(obtenerCitasProximas())
    cargar()
    const interval = setInterval(cargar, 2000)
    return () => clearInterval(interval)
  }, [])

  const clientes = useMemo(() => {
    const mapa: Record<string, Cliente> = {}
    for (const cita of citas) {
      const tel = cita.telefono.replace(/\D/g, '').slice(-9)
      const key = tel || cita.nombre.toLowerCase()
      if (!mapa[key]) {
        mapa[key] = { nombre: cita.nombre, telefono: cita.telefono, totalCitas: 0, ultimaCita: cita.fecha, motivos: [], estado: cita.estado, citas: [] }
      }
      mapa[key].totalCitas++
      mapa[key].citas.push(cita)
      if (cita.fecha > mapa[key].ultimaCita) { mapa[key].ultimaCita = cita.fecha; mapa[key].estado = cita.estado }
      if (!mapa[key].motivos.includes(cita.motivo)) mapa[key].motivos.push(cita.motivo)
      if (cita.nombre && cita.created_at > (mapa[key].citas[0]?.created_at || '')) mapa[key].nombre = cita.nombre
    }
    return Object.values(mapa).sort((a, b) => b.ultimaCita.localeCompare(a.ultimaCita))
  }, [citas])

  const motivosUnicos = useMemo(() => Array.from(new Set(citas.map(c => c.motivo))).sort(), [citas])
  const clientesFiltrados = useMemo(() => {
    let r = clientes
    if (busqueda) { const q = busqueda.toLowerCase(); r = r.filter(c => c.nombre.toLowerCase().includes(q) || c.telefono.includes(q)) }
    if (filtroMotivo !== 'todos') r = r.filter(c => c.motivos.includes(filtroMotivo))
    return r
  }, [clientes, busqueda, filtroMotivo])

  const formatearFecha = (fecha: string) => new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className={`rounded-2xl shadow-sm p-4 border ${dk ? 'bg-[#1a2740] border-white/[0.06] shadow-black/20' : 'bg-white border-gray-100 shadow-gray-200/50'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${dk ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
            </svg>
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${dk ? 'text-white' : 'text-gray-900'}`}>Clientes</h2>
            <p className={`text-[12px] mt-0.5 ${dk ? 'text-slate-400' : 'text-gray-400'}`}>{clientesFiltrados.length} {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[140px]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-[13px] outline-none transition-all ${
                dk ? 'bg-white/[0.06] border border-white/[0.08] text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30'
                   : 'bg-gray-50/50 border border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300'
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-[10px] font-semibold uppercase tracking-wider ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Motivo</label>
            <select
              value={filtroMotivo}
              onChange={e => setFiltroMotivo(e.target.value)}
              className={`text-[12px] rounded-lg px-2.5 py-1.5 outline-none transition-all ${
                dk ? 'bg-white/[0.06] border border-white/[0.08] text-white' : 'bg-gray-50/50 border border-gray-200 text-gray-700'
              }`}
            >
              <option value="todos">Todos</option>
              {motivosUnicos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {(busqueda || filtroMotivo !== 'todos') && (
            <button onClick={() => { setBusqueda(''); setFiltroMotivo('todos') }} className={`text-[11px] font-medium transition-colors flex items-center gap-1 ${dk ? 'text-slate-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Client list + Detail panel */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Client cards */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {clientesFiltrados.length === 0 ? (
            <div className={`rounded-2xl border flex items-center justify-center py-16 ${dk ? 'bg-[#1a2740] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
              <div className="text-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border ${dk ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-gray-50 border-gray-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${dk ? 'text-slate-600' : 'text-gray-300'}`}>
                    <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122Z" />
                  </svg>
                </div>
                <p className={`font-semibold text-sm ${dk ? 'text-slate-400' : 'text-gray-600'}`}>Sin clientes</p>
                <p className={`text-[13px] mt-1 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Los clientes aparecerán al crear citas</p>
              </div>
            </div>
          ) : (
            clientesFiltrados.map(cliente => (
              <div
                key={cliente.telefono + cliente.nombre}
                onClick={() => setClienteSeleccionado(cliente)}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${
                  clienteSeleccionado?.telefono === cliente.telefono && clienteSeleccionado?.nombre === cliente.nombre
                    ? dk ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-100'
                    : dk ? 'bg-[#1a2740] border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.03]' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-[13px] font-bold ${dk ? 'bg-white/[0.06] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {cliente.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[13px] font-semibold truncate ${dk ? 'text-white' : 'text-gray-900'}`}>{cliente.nombre}</p>
                      <p className={`text-[11px] font-mono tracking-wide ${dk ? 'text-slate-400' : 'text-gray-400'}`}>{cliente.telefono}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-[11px] font-semibold ${dk ? 'text-slate-300' : 'text-gray-700'}`}>{cliente.totalCitas} {cliente.totalCitas === 1 ? 'cita' : 'citas'}</p>
                    <p className={`text-[10px] ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{formatearFecha(cliente.ultimaCita)}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  {cliente.motivos.map(m => (
                    <span key={m} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${MOTIVO_DOT[m] || 'bg-gray-400'}`} />
                      <span className={`text-[10px] font-medium ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{m}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop side panel */}
        <div className={`hidden lg:flex w-[320px] shrink-0 rounded-2xl shadow-sm border flex-col overflow-hidden ${dk ? 'bg-[#1a2740] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
          {clienteSeleccionado ? (
            <DetalleCliente cliente={clienteSeleccionado} dk={dk} formatearFecha={formatearFecha} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 border ${dk ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-gray-50 border-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${dk ? 'text-slate-600' : 'text-gray-300'}`}>
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
              </div>
              <p className={`text-xs font-medium ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Selecciona un cliente</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet — shown when a client is selected */}
      {clienteSeleccionado && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
          onClick={() => setClienteSeleccionado(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className={`relative w-full max-h-[82vh] rounded-t-2xl flex flex-col overflow-hidden animate-fade-in-up ${dk ? 'bg-[#1a2744] border-t border-white/[0.08]' : 'bg-white border-t border-gray-100'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag indicator */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className={`w-10 h-1 rounded-full ${dk ? 'bg-white/20' : 'bg-gray-200'}`} />
            </div>
            <DetalleCliente
              cliente={clienteSeleccionado}
              dk={dk}
              onCerrar={() => setClienteSeleccionado(null)}
              formatearFecha={formatearFecha}
            />
          </div>
        </div>
      )}
    </div>
  )
}
