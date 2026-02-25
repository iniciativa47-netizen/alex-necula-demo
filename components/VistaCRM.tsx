'use client'

import { useState, useEffect, useMemo } from 'react'
import { obtenerCitasProximas, obtenerCitasCompletadas, eliminarCita, crearCita, type CitaLocal } from '@/lib/storage'
import { useTheme } from '@/lib/ThemeContext'

type CampoOrden = 'nombre' | 'telefono' | 'motivo' | 'fecha' | 'hora' | 'estado'
type Direccion = 'asc' | 'desc'

const MOTIVO_COLORES: Record<string, { light: string; dark: string }> = {
  'Urgencia': { light: 'bg-red-500/10 text-red-700 ring-red-500/20', dark: 'bg-red-500/20 text-red-400 ring-red-500/30' },
  'Extracción': { light: 'bg-amber-500/10 text-amber-700 ring-amber-500/20', dark: 'bg-amber-500/20 text-amber-400 ring-amber-500/30' },
  'Caries / Empaste': { light: 'bg-yellow-500/10 text-yellow-700 ring-yellow-500/20', dark: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30' },
  'Endodoncia': { light: 'bg-violet-500/10 text-violet-700 ring-violet-500/20', dark: 'bg-violet-500/20 text-violet-400 ring-violet-500/30' },
  'Ortodoncia': { light: 'bg-sky-500/10 text-sky-700 ring-sky-500/20', dark: 'bg-sky-500/20 text-sky-400 ring-sky-500/30' },
  'Higiene / limpieza': { light: 'bg-teal-500/10 text-teal-700 ring-teal-500/20', dark: 'bg-teal-500/20 text-teal-400 ring-teal-500/30' },
  'Estética dental': { light: 'bg-fuchsia-500/10 text-fuchsia-700 ring-fuchsia-500/20', dark: 'bg-fuchsia-500/20 text-fuchsia-400 ring-fuchsia-500/30' },
  'Implantes': { light: 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20', dark: 'bg-indigo-500/20 text-indigo-400 ring-indigo-500/30' },
  'Prótesis': { light: 'bg-stone-500/10 text-stone-700 ring-stone-500/20', dark: 'bg-stone-500/20 text-stone-400 ring-stone-500/30' },
  'Primera visita': { light: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20', dark: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30' },
  'Revisión': { light: 'bg-cyan-500/10 text-cyan-700 ring-cyan-500/20', dark: 'bg-cyan-500/20 text-cyan-400 ring-cyan-500/30' },
}

const ESTADO_COLORES_LIGHT: Record<string, string> = {
  confirmada: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  modificada: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  cancelada: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  completada: 'bg-gray-100 text-gray-500 ring-1 ring-gray-400/20',
}

const ESTADO_COLORES_DARK: Record<string, string> = {
  confirmada: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  modificada: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  cancelada: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  completada: 'bg-white/[0.04] text-slate-500 ring-1 ring-white/[0.08]',
}

export default function VistaCRM() {
  const { theme } = useTheme()
  const dk = theme === 'dark'
  const [citas, setCitas] = useState<CitaLocal[]>([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [campoOrden, setCampoOrden] = useState<CampoOrden>('fecha')
  const [direccion, setDireccion] = useState<Direccion>('asc')
  const [filtroMotivo, setFiltroMotivo] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [citaDetalle, setCitaDetalle] = useState<CitaLocal | null>(null)
  const [citaEditando, setCitaEditando] = useState<CitaLocal | null>(null)
  const [editForm, setEditForm] = useState({ nombre: '', telefono: '', fecha: '', hora: '', notas: '' })
  const [verHistorial, setVerHistorial] = useState(false)
  const [crearModal, setCrearModal] = useState(false)
  const [crearForm, setCrearForm] = useState({ nombre: '', telefono: '', motivo: 'Revisión', fecha: '', hora: '09:00', notas: '' })

  const cargarCitas = () => {
    setCargando(true)
    setCitas(verHistorial ? obtenerCitasCompletadas() : obtenerCitasProximas())
    setCargando(false)
  }

  const handleEliminar = (citaId: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta cita?')) return
    setEliminando(citaId)
    if (eliminarCita(citaId)) cargarCitas()
    setEliminando(null)
  }

  useEffect(() => {
    cargarCitas()
    const interval = setInterval(cargarCitas, 2000)
    return () => clearInterval(interval)
  }, [verHistorial])

  const motivosUnicos = useMemo(() => Array.from(new Set(citas.map(c => c.motivo))).sort(), [citas])
  const estadosUnicos = useMemo(() => Array.from(new Set(citas.map(c => c.estado))).sort(), [citas])

  const citasFiltradas = useMemo(() => {
    let resultado = [...citas]
    if (filtroMotivo !== 'todos') resultado = resultado.filter(c => c.motivo === filtroMotivo)
    if (filtroEstado !== 'todos') resultado = resultado.filter(c => c.estado === filtroEstado)

    resultado.sort((a, b) => {
      const valA = campoOrden === 'fecha' ? a.fecha + ' ' + a.hora : (a[campoOrden] || '').toLowerCase()
      const valB = campoOrden === 'fecha' ? b.fecha + ' ' + b.hora : (b[campoOrden] || '').toLowerCase()
      if (valA < valB) return direccion === 'asc' ? -1 : 1
      if (valA > valB) return direccion === 'asc' ? 1 : -1
      return 0
    })
    return resultado
  }, [citas, filtroMotivo, filtroEstado, campoOrden, direccion])

  const handleOrdenar = (campo: CampoOrden) => {
    if (campoOrden === campo) setDireccion(d => d === 'asc' ? 'desc' : 'asc')
    else { setCampoOrden(campo); setDireccion('asc') }
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const abrirEditar = (cita: CitaLocal) => {
    setCitaEditando(cita)
    setEditForm({ nombre: cita.nombre, telefono: cita.telefono, fecha: cita.fecha, hora: cita.hora, notas: cita.notas })
  }

  const borrarTodas = () => {
    if (!confirm(`¿Seguro que quieres eliminar las ${citas.length} citas de esta vista?`)) return
    citas.forEach(c => eliminarCita(c.id))
    cargarCitas()
  }

  const guardarNuevaCita = () => {
    if (!crearForm.nombre || !crearForm.telefono || !crearForm.fecha || !crearForm.hora) return
    crearCita(crearForm)
    setCrearModal(false)
    setCrearForm({ nombre: '', telefono: '', motivo: 'Revisión', fecha: '', hora: '09:00', notas: '' })
    cargarCitas()
  }

  const guardarEdicion = () => {
    if (!citaEditando) return
    const raw = localStorage.getItem('dental_citas')
    if (!raw) return
    const todas: CitaLocal[] = JSON.parse(raw)
    const idx = todas.findIndex(c => c.id === citaEditando.id)
    if (idx === -1) return
    todas[idx] = { ...todas[idx], ...editForm }
    localStorage.setItem('dental_citas', JSON.stringify(todas))
    setCitaEditando(null)
    cargarCitas()
  }

  const SortIcon = ({ campo }: { campo: CampoOrden }) => {
    if (campoOrden !== campo) return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 ${dk ? 'text-slate-600' : 'text-gray-300'}`}>
        <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .55.24l3.25 3.5a.75.75 0 1 1-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 0 1-1.1-1.02l3.25-3.5A.75.75 0 0 1 10 3Zm-3.76 9.2a.75.75 0 0 1 1.06.04l2.7 2.908 2.7-2.908a.75.75 0 1 1 1.1 1.02l-3.25 3.5a.75.75 0 0 1-1.1 0l-3.25-3.5a.75.75 0 0 1 .04-1.06Z" clipRule="evenodd" />
      </svg>
    )
    return direccion === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-500">
        <path fillRule="evenodd" d="M10 15a.75.75 0 0 1-.75-.75V7.612L7.29 9.77a.75.75 0 0 1-1.08-1.04l3.25-3.5a.75.75 0 0 1 1.08 0l3.25 3.5a.75.75 0 1 1-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0 1 10 15Z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-500">
        <path fillRule="evenodd" d="M10 5a.75.75 0 0 1 .75.75v6.638l1.96-2.158a.75.75 0 1 1 1.08 1.04l-3.25 3.5a.75.75 0 0 1-1.08 0l-3.25-3.5a.75.75 0 1 1 1.08-1.04l1.96 2.158V5.75A.75.75 0 0 1 10 5Z" clipRule="evenodd" />
      </svg>
    )
  }

  const ESTADO_COLORES = dk ? ESTADO_COLORES_DARK : ESTADO_COLORES_LIGHT

  return (
    <div className="h-full flex flex-col gap-5">
      {/* Header card */}
      <div className={`rounded-2xl shadow-sm p-4 ${dk ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-gray-200/50'}`}>
        {/* Row 1: title + buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          {/* Left: icon + title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${dk ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${dk ? 'text-blue-400' : 'text-blue-600'}`}>
                <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 18.375V5.625ZM21 9.375A.375.375 0 0 0 20.625 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5ZM10.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5ZM3.375 15h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375Zm0-3.75h7.5a.375.375 0 0 0 .375-.375v-1.5A.375.375 0 0 0 10.875 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375Z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className={`text-base font-bold tracking-tight leading-none ${dk ? 'text-white' : 'text-gray-900'}`}>Gestión de Citas</h2>
              <p className={`text-[12px] mt-0.5 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>
                {citasFiltradas.length === citas.length
                  ? `${citas.length} registros`
                  : `${citasFiltradas.length} de ${citas.length}`
                }
              </p>
            </div>
          </div>

          {/* Right: all buttons */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {/* Toggle próximas / historial */}
            <div className={`flex items-center rounded-xl overflow-hidden border text-[12px] font-medium ${dk ? 'border-white/[0.08]' : 'border-gray-200'}`}>
              <button
                onClick={() => setVerHistorial(false)}
                className={`px-3 py-2 transition-colors ${!verHistorial ? (dk ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700') : (dk ? 'text-slate-400 hover:bg-white/[0.04]' : 'text-gray-500 hover:bg-gray-50')}`}
              >
                Próximas
              </button>
              <button
                onClick={() => setVerHistorial(true)}
                className={`px-3 py-2 transition-colors border-l ${!verHistorial ? (dk ? 'text-slate-400 hover:bg-white/[0.04] border-white/[0.08]' : 'text-gray-500 hover:bg-gray-50 border-gray-200') : (dk ? 'bg-white/[0.04] text-slate-300 border-white/[0.08]' : 'bg-gray-100 text-gray-700 border-gray-200')}`}
              >
                Historial
              </button>
            </div>

            {/* Actualizar — icono en móvil, texto en sm+ */}
            <button
              onClick={cargarCitas}
              disabled={cargando}
              title="Actualizar"
              className={`group p-2 sm:px-3 sm:py-2 rounded-xl text-[13px] font-medium transition-all disabled:opacity-50 flex items-center gap-2 ${dk ? 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 shrink-0 ${cargando ? 'animate-spin' : ''} ${dk ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-400 group-hover:text-gray-600'}`}>
                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.846a.75.75 0 0 0-.75.75v3.386a.75.75 0 0 0 1.5 0v-1.148l.174.168a7 7 0 0 0 11.715-3.14.75.75 0 0 0-1.172-.67Zm-2.625-6.61a.75.75 0 0 0 1.172.67 5.5 5.5 0 0 1 .264.058 5.5 5.5 0 0 1-9.465 2.538l.312.311H7.603a.75.75 0 0 0 0 1.5H4.217a.75.75 0 0 0-.75-.75V5.755a.75.75 0 0 0-1.5 0v1.148l-.174-.168a7 7 0 0 1 11.894 3.079Z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Nueva cita */}
            {!verHistorial && (
              <button
                onClick={() => setCrearModal(true)}
                title="Nueva cita"
                className={`p-2 sm:px-3 sm:py-2 rounded-xl text-[13px] font-medium transition-all flex items-center gap-1.5 ${dk ? 'bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/20 text-blue-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
                <span className="hidden sm:inline">Nueva cita</span>
              </button>
            )}

            {/* Borrar todas */}
            {citas.length > 0 && (
              <button
                onClick={borrarTodas}
                title="Borrar todas"
                className={`p-2 sm:px-3 sm:py-2 rounded-xl text-[13px] font-medium transition-all flex items-center gap-1.5 ${dk ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400' : 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 1 .7.8l-.5 5.5a.75.75 0 0 1-1.495-.137l.5-5.5a.75.75 0 0 1 .795-.662Zm2.84 0a.75.75 0 0 1 .795.662l.5 5.5a.75.75 0 1 1-1.495.137l-.5-5.5a.75.75 0 0 1 .7-.8Z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Borrar todas</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <label className={`text-[10px] font-semibold uppercase tracking-wider ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Motivo</label>
            <select
              value={filtroMotivo}
              onChange={e => setFiltroMotivo(e.target.value)}
              className={`text-[12px] rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none transition-all ${dk ? 'bg-white/[0.06] border border-white/[0.08] text-slate-300' : 'border border-gray-200 bg-gray-50/50 text-gray-700'}`}
            >
              <option value="todos">Todos</option>
              {motivosUnicos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-[10px] font-semibold uppercase tracking-wider ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Estado</label>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className={`text-[12px] rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none transition-all ${dk ? 'bg-white/[0.06] border border-white/[0.08] text-slate-300' : 'border border-gray-200 bg-gray-50/50 text-gray-700'}`}
            >
              <option value="todos">Todos</option>
              {estadosUnicos.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          {(filtroMotivo !== 'todos' || filtroEstado !== 'todos') && (
            <button
              onClick={() => { setFiltroMotivo('todos'); setFiltroEstado('todos') }}
              className="text-[11px] text-gray-400 hover:text-red-500 font-medium transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className={`rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col ${dk ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-gray-200/50'}`}>
        {citasFiltradas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-16">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dk ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-gray-50 border border-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${dk ? 'text-slate-600' : 'text-gray-300'}`}>
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                </svg>
              </div>
              <p className={`font-semibold text-sm ${dk ? 'text-slate-400' : 'text-gray-600'}`}>
                {citas.length === 0 ? 'Sin citas registradas' : 'Sin resultados'}
              </p>
              <p className={`text-[13px] mt-1 max-w-[250px] ${dk ? 'text-slate-600' : 'text-gray-400'}`}>
                {citas.length === 0 ? 'Las citas del agente aparecerán aquí' : 'Prueba con otros filtros'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${dk ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
                  {([
                    ['nombre', 'Paciente'],
                    ['telefono', 'Teléfono'],
                    ['motivo', 'Motivo'],
                    ['fecha', 'Fecha'],
                    ['hora', 'Hora'],
                    ['estado', 'Estado'],
                  ] as [CampoOrden, string][]).map(([campo, label]) => (
                    <th
                      key={campo}
                      onClick={() => handleOrdenar(campo)}
                      className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] cursor-pointer select-none transition-colors ${dk ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        <SortIcon campo={campo} />
                      </span>
                    </th>
                  ))}
                  <th className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Notas</th>
                  <th className={`px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.08em] ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.map((cita) => (
                  <tr key={cita.id} className={`border-b transition-colors group ${dk ? 'border-white/[0.04] hover:bg-white/[0.03]' : 'border-gray-50/80 hover:bg-blue-50/20'}`}>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold text-[13px] ${dk ? 'text-white' : 'text-gray-900'}`}>{cita.nombre || 'Sin nombre'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[13px] font-mono tracking-wide ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{cita.telefono || '-'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ring-1 ${(MOTIVO_COLORES[cita.motivo] || { light: 'bg-gray-100 text-gray-700 ring-gray-200', dark: 'bg-gray-500/20 text-gray-400 ring-gray-500/30' })[dk ? 'dark' : 'light']}`}>
                        {cita.motivo}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[13px] ${dk ? 'text-slate-300' : 'text-gray-700'}`}>{formatearFecha(cita.fecha)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[13px] font-semibold font-mono ${dk ? 'text-white' : 'text-gray-900'}`}>{cita.hora}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md capitalize ${ESTADO_COLORES[cita.estado] || (dk ? 'bg-gray-500/15 text-gray-400' : 'bg-gray-50 text-gray-700')}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${cita.estado === 'confirmada' ? 'bg-emerald-500' : cita.estado === 'cancelada' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        {cita.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[13px] max-w-[160px] truncate block italic ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{cita.notas || '-'}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setCitaDetalle(cita)}
                          className={`p-1.5 rounded-lg transition-all ${dk ? 'text-slate-600 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50'}`}
                          title="Ver detalles"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => abrirEditar(cita)}
                          className={`p-1.5 rounded-lg transition-all ${dk ? 'text-slate-600 hover:text-amber-400 hover:bg-amber-500/10' : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50'}`}
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25h5.5a.75.75 0 0 0 0-1.5h-5.5A2.75 2.75 0 0 0 2 5.75v8.5A2.75 2.75 0 0 0 4.75 17h8.5A2.75 2.75 0 0 0 16 14.25v-5.5a.75.75 0 0 0-1.5 0v5.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-8.5Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEliminar(cita.id)}
                          disabled={eliminando === cita.id}
                          className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${dk ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 1 .7.8l-.5 5.5a.75.75 0 0 1-1.495-.137l.5-5.5a.75.75 0 0 1 .795-.662Zm2.84 0a.75.75 0 0 1 .795.662l.5 5.5a.75.75 0 1 1-1.495.137l-.5-5.5a.75.75 0 0 1 .7-.8Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detalle */}
      {citaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setCitaDetalle(null)}>
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in-up ${dk ? 'bg-[#1a2744] border border-white/[0.08]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${dk ? 'border-white/[0.06]' : 'border-gray-100'}`}>
              <h3 className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Detalle de cita</h3>
              <button onClick={() => setCitaDetalle(null)} className={`p-1 rounded-lg transition-colors ${dk ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ['Paciente', citaDetalle.nombre],
                ['Teléfono', citaDetalle.telefono],
                ['Motivo', citaDetalle.motivo],
                ['Fecha', formatearFecha(citaDetalle.fecha)],
                ['Hora', citaDetalle.hora],
                ['Estado', citaDetalle.estado],
                ['Notas', citaDetalle.notas || '-'],
                ['Creada', new Date(citaDetalle.created_at).toLocaleString('es-ES')],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start">
                  <span className={`text-[12px] font-semibold uppercase tracking-wider ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{label}</span>
                  <span className={`text-[13px] font-medium text-right max-w-[60%] ${dk ? 'text-white' : 'text-gray-900'}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <button onClick={() => setCitaDetalle(null)} className={`w-full py-2 rounded-xl text-[13px] font-medium transition-colors ${dk ? 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Cita */}
      {crearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setCrearModal(false)}>
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in-up ${dk ? 'bg-[#1a2744] border border-white/[0.08]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${dk ? 'border-white/[0.06]' : 'border-gray-100'}`}>
              <h3 className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Nueva cita</h3>
              <button onClick={() => setCrearModal(false)} className={`p-1 rounded-lg transition-colors ${dk ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { key: 'nombre' as const, label: 'Nombre', type: 'text' },
                { key: 'telefono' as const, label: 'Teléfono', type: 'text' },
                { key: 'fecha' as const, label: 'Fecha', type: 'date' },
                { key: 'hora' as const, label: 'Hora', type: 'time' },
                { key: 'notas' as const, label: 'Notas', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label className={`text-[11px] font-semibold uppercase tracking-wider ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{field.label}</label>
                  <input
                    type={field.type}
                    value={crearForm[field.key]}
                    onChange={e => setCrearForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className={`w-full mt-1 px-3 py-2 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none transition-all ${dk ? 'bg-white/[0.06] border border-white/[0.08] text-white' : 'border border-gray-200 text-gray-900'}`}
                  />
                </div>
              ))}
              <div>
                <label className={`text-[11px] font-semibold uppercase tracking-wider ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Motivo</label>
                <select
                  value={crearForm.motivo}
                  onChange={e => setCrearForm(prev => ({ ...prev, motivo: e.target.value }))}
                  className={`w-full mt-1 px-3 py-2 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none transition-all ${dk ? 'bg-white/[0.06] border border-white/[0.08] text-white' : 'border border-gray-200 text-gray-900'}`}
                >
                  {Object.keys(MOTIVO_COLORES).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-2">
              <button onClick={() => setCrearModal(false)} className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors ${dk ? 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                Cancelar
              </button>
              <button
                onClick={guardarNuevaCita}
                disabled={!crearForm.nombre || !crearForm.telefono || !crearForm.fecha || !crearForm.hora}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-[13px] font-medium text-white transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {citaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setCitaEditando(null)}>
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in-up ${dk ? 'bg-[#1a2744] border border-white/[0.08]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${dk ? 'border-white/[0.06]' : 'border-gray-100'}`}>
              <h3 className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Editar cita</h3>
              <button onClick={() => setCitaEditando(null)} className={`p-1 rounded-lg transition-colors ${dk ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { key: 'nombre' as const, label: 'Nombre', type: 'text' },
                { key: 'telefono' as const, label: 'Teléfono', type: 'text' },
                { key: 'fecha' as const, label: 'Fecha', type: 'date' },
                { key: 'hora' as const, label: 'Hora', type: 'time' },
                { key: 'notas' as const, label: 'Notas', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label className={`text-[11px] font-semibold uppercase tracking-wider ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{field.label}</label>
                  <input
                    type={field.type}
                    value={editForm[field.key]}
                    onChange={e => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className={`w-full mt-1 px-3 py-2 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none transition-all ${dk ? 'bg-white/[0.06] border border-white/[0.08] text-white' : 'border border-gray-200 text-gray-900'}`}
                  />
                </div>
              ))}
            </div>
            <div className="px-6 pb-5 flex gap-2">
              <button onClick={() => setCitaEditando(null)} className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors ${dk ? 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                Cancelar
              </button>
              <button onClick={guardarEdicion} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-[13px] font-medium text-white transition-colors">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
