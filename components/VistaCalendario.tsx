'use client'

import { useState, useEffect, useMemo } from 'react'
import { obtenerCitasProximas, type CitaLocal } from '@/lib/storage'
import { useTheme } from '@/lib/ThemeContext'

const COLORES: Record<string, { bg: string; text: string; dot: string; border: string; card: string }> = {
  'Urgencia':          { bg: 'bg-red-100',     text: 'text-red-800',     dot: 'bg-red-500',     border: 'border-red-400',     card: 'bg-red-50 border-l-red-500' },
  'Extracción':        { bg: 'bg-amber-100',   text: 'text-amber-900',   dot: 'bg-amber-500',   border: 'border-amber-400',   card: 'bg-amber-50 border-l-amber-500' },
  'Caries / Empaste':  { bg: 'bg-yellow-100',  text: 'text-yellow-900',  dot: 'bg-yellow-500',  border: 'border-yellow-400',  card: 'bg-yellow-50 border-l-yellow-500' },
  'Endodoncia':        { bg: 'bg-violet-100',  text: 'text-violet-800',  dot: 'bg-violet-500',  border: 'border-violet-400',  card: 'bg-violet-50 border-l-violet-500' },
  'Ortodoncia':        { bg: 'bg-sky-100',     text: 'text-sky-800',     dot: 'bg-sky-500',     border: 'border-sky-400',     card: 'bg-sky-50 border-l-sky-500' },
  'Higiene / limpieza':{ bg: 'bg-teal-100',    text: 'text-teal-800',    dot: 'bg-teal-500',    border: 'border-teal-400',    card: 'bg-teal-50 border-l-teal-500' },
  'Estética dental':   { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', dot: 'bg-fuchsia-500', border: 'border-fuchsia-400', card: 'bg-fuchsia-50 border-l-fuchsia-500' },
  'Implantes':         { bg: 'bg-indigo-100',  text: 'text-indigo-800',  dot: 'bg-indigo-500',  border: 'border-indigo-400',  card: 'bg-indigo-50 border-l-indigo-500' },
  'Prótesis':          { bg: 'bg-stone-200',   text: 'text-stone-800',   dot: 'bg-stone-500',   border: 'border-stone-400',   card: 'bg-stone-50 border-l-stone-500' },
  'Primera visita':    { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500', border: 'border-emerald-400', card: 'bg-emerald-50 border-l-emerald-500' },
  'Revisión':          { bg: 'bg-cyan-100',    text: 'text-cyan-800',    dot: 'bg-cyan-500',    border: 'border-cyan-400',    card: 'bg-cyan-50 border-l-cyan-500' },
}

// 1 letter on mobile, 3 letters on desktop
const DIAS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DIAS_LONG  = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function getColor(motivo: string) {
  return COLORES[motivo] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400', border: 'border-gray-300', card: 'bg-gray-50 border-l-gray-400' }
}

export default function VistaCalendario() {
  const { theme } = useTheme()
  const dk = theme === 'dark'
  const [citas, setCitas] = useState<CitaLocal[]>([])
  const [mesActual, setMesActual] = useState(() => {
    const h = new Date()
    return { mes: h.getMonth(), anio: h.getFullYear() }
  })
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null)

  useEffect(() => {
    const cargar = () => setCitas(obtenerCitasProximas())
    cargar()
    const interval = setInterval(cargar, 2000)
    return () => clearInterval(interval)
  }, [])

  const citasPorFecha = useMemo(() => {
    const mapa: Record<string, CitaLocal[]> = {}
    for (const c of citas) {
      if (!mapa[c.fecha]) mapa[c.fecha] = []
      mapa[c.fecha].push(c)
    }
    for (const f in mapa) mapa[f].sort((a, b) => a.hora.localeCompare(b.hora))
    return mapa
  }, [citas])

  const diasDelMes = useMemo(() => {
    const { mes, anio } = mesActual
    const primer = new Date(anio, mes, 1)
    const ultimo = new Date(anio, mes + 1, 0)
    let inicio = primer.getDay() - 1
    if (inicio < 0) inicio = 6

    const dias: { fecha: string; dia: number; actual: boolean }[] = []
    const diasPrev = new Date(anio, mes, 0).getDate()

    for (let i = inicio - 1; i >= 0; i--) {
      const d = diasPrev - i
      const m = mes === 0 ? 12 : mes
      const a = mes === 0 ? anio - 1 : anio
      dias.push({ fecha: `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, dia: d, actual: false })
    }
    for (let d = 1; d <= ultimo.getDate(); d++) {
      dias.push({ fecha: `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, dia: d, actual: true })
    }
    const rest = 7 - (dias.length % 7)
    if (rest < 7) {
      for (let d = 1; d <= rest; d++) {
        const m = mes === 11 ? 1 : mes + 2
        const a = mes === 11 ? anio + 1 : anio
        dias.push({ fecha: `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, dia: d, actual: false })
      }
    }
    return dias
  }, [mesActual])

  const hoyISO = useMemo(() => {
    const h = new Date()
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`
  }, [])

  const citasDelDia = diaSeleccionado ? (citasPorFecha[diaSeleccionado] || []) : []
  const motivosActivos = useMemo(() => Array.from(new Set(citas.map(c => c.motivo))).sort(), [citas])

  const formatFechaDetalle = (fecha: string) => {
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className={`rounded-2xl shadow-sm px-4 py-3.5 ${dk ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-gray-200/50'}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${dk ? 'bg-violet-500/10' : 'bg-violet-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${dk ? 'text-violet-400' : 'text-violet-600'}`}>
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className={`text-base font-bold tracking-tight leading-none ${dk ? 'text-white' : 'text-gray-900'}`}>Calendario</h2>
              <p className={`text-[12px] mt-0.5 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{citas.length} citas programadas</p>
            </div>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => { setMesActual(p => p.mes === 0 ? { mes: 11, anio: p.anio - 1 } : { mes: p.mes - 1, anio: p.anio }); setDiaSeleccionado(null) }}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${dk ? 'hover:bg-white/[0.06] text-slate-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
            </button>
            <span className={`text-[12px] font-semibold whitespace-nowrap text-center w-[110px] sm:w-[150px] ${dk ? 'text-white' : 'text-gray-900'}`}>
              {MESES[mesActual.mes]} {mesActual.anio}
            </span>
            <button
              onClick={() => { setMesActual(p => p.mes === 11 ? { mes: 0, anio: p.anio + 1 } : { mes: p.mes + 1, anio: p.anio }); setDiaSeleccionado(null) }}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${dk ? 'hover:bg-white/[0.06] text-slate-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => { const h = new Date(); setMesActual({ mes: h.getMonth(), anio: h.getFullYear() }); setDiaSeleccionado(hoyISO) }}
              className={`ml-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${dk ? 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600'}`}
            >
              Hoy
            </button>
          </div>
        </div>
      </div>

      {/* Content — column on mobile, row on lg+ */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-y-auto lg:overflow-hidden">

        {/* Calendar Grid */}
        <div className={`rounded-2xl shadow-sm flex flex-col overflow-hidden lg:flex-1 ${dk ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-gray-200/50'}`}>
          {/* Days header */}
          <div className={`grid grid-cols-7 border-b ${dk ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50/30'}`}>
            {DIAS_SHORT.map((d, i) => (
              <div key={d} className={`py-2 text-center text-[10px] font-bold uppercase tracking-wider ${dk ? (i >= 5 ? 'text-slate-700' : 'text-slate-500') : (i >= 5 ? 'text-gray-300' : 'text-gray-400')}`}>
                <span className="sm:hidden">{d}</span>
                <span className="hidden sm:inline">{DIAS_LONG[i]}</span>
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 flex-1">
            {diasDelMes.map((d, i) => {
              const citasDia = citasPorFecha[d.fecha] || []
              const esHoy = d.fecha === hoyISO
              const esSel = d.fecha === diaSeleccionado
              const esFin = i % 7 >= 5

              return (
                <div
                  key={d.fecha + i}
                  onClick={() => setDiaSeleccionado(d.fecha)}
                  className={`relative p-1 cursor-pointer transition-all duration-150 min-h-[44px] sm:min-h-[64px] lg:min-h-[72px] ${
                    dk
                      ? `border-b border-r border-white/[0.04] ${!d.actual ? 'bg-white/[0.01]' : esFin ? 'bg-white/[0.015]' : ''}`
                      : `border-b border-r border-gray-50 ${!d.actual ? 'bg-gray-50/40' : esFin ? 'bg-gray-50/20' : 'bg-white'}`
                  } ${esSel
                      ? dk ? 'ring-1 ring-blue-500/50 ring-inset z-10 bg-blue-500/10' : 'ring-1 ring-blue-400 ring-inset z-10 bg-blue-50/30'
                      : dk ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-0.5 px-0.5">
                    {esHoy ? (
                      <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold">
                        {d.dia}
                      </span>
                    ) : (
                      <span className={`text-[11px] sm:text-[13px] font-medium px-0.5 leading-tight ${dk ? (!d.actual ? 'text-slate-700' : 'text-slate-400') : (!d.actual ? 'text-gray-300' : 'text-gray-600')}`}>
                        {d.dia}
                      </span>
                    )}
                    {citasDia.length > 0 && !esHoy && (
                      <span className={`text-[8px] sm:text-[9px] font-semibold leading-tight ${dk ? 'text-slate-600' : 'text-gray-400'}`}>{citasDia.length}</span>
                    )}
                  </div>
                  {/* Dots on mobile, labels on sm+ */}
                  <div className="space-y-[1px] sm:space-y-[2px]">
                    <div className="sm:hidden flex gap-[2px] flex-wrap mt-0.5 px-0.5">
                      {citasDia.slice(0, 3).map(cita => (
                        <div key={cita.id} className={`w-1.5 h-1.5 rounded-full ${getColor(cita.motivo).dot}`} />
                      ))}
                    </div>
                    <div className="hidden sm:block space-y-[2px]">
                      {citasDia.slice(0, 2).map(cita => {
                        const c = getColor(cita.motivo)
                        return (
                          <div key={cita.id} className={`flex items-center gap-1 px-1 py-[1px] rounded ${dk ? 'bg-white/[0.06]' : c.bg}`}>
                            <div className={`w-1 h-1 rounded-full shrink-0 ${c.dot}`} />
                            <span className={`text-[9px] font-medium truncate leading-tight ${dk ? 'text-slate-400' : c.text}`}>
                              {cita.hora}
                            </span>
                          </div>
                        )
                      })}
                      {citasDia.length > 2 && (
                        <span className={`text-[9px] font-medium px-1 ${dk ? 'text-slate-600' : 'text-gray-400'}`}>+{citasDia.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          {motivosActivos.length > 0 && (
            <div className={`flex flex-wrap gap-x-3 gap-y-1 px-4 py-2 border-t ${dk ? 'border-white/[0.04] bg-white/[0.02]' : 'border-gray-50 bg-gray-50/30'}`}>
              {motivosActivos.map(m => {
                const c = getColor(m)
                return (
                  <div key={m} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                    <span className={`text-[10px] ${dk ? 'text-slate-500' : 'text-gray-500'}`}>{m}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail Panel — full width on mobile (below calendar), fixed width on lg+ */}
        <div className={`lg:w-[280px] lg:shrink-0 rounded-2xl shadow-sm flex flex-col overflow-hidden ${dk ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-gray-200/50'} ${!diaSeleccionado ? 'hidden lg:flex' : 'flex'}`}>
          <div className={`px-4 py-3.5 border-b flex items-center justify-between ${dk ? 'border-white/[0.06]' : 'border-gray-50'}`}>
            <div>
              {diaSeleccionado ? (
                <>
                  <h3 className={`font-bold capitalize text-[13px] tracking-tight ${dk ? 'text-white' : 'text-gray-900'}`}>
                    {formatFechaDetalle(diaSeleccionado)}
                  </h3>
                  <p className={`text-[11px] mt-0.5 font-medium ${dk ? 'text-slate-500' : 'text-gray-400'}`}>
                    {citasDelDia.length} {citasDelDia.length === 1 ? 'cita' : 'citas'}
                  </p>
                </>
              ) : (
                <h3 className={`font-medium text-[13px] ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Detalle del día</h3>
              )}
            </div>
            {/* Close button on mobile */}
            {diaSeleccionado && (
              <button
                onClick={() => setDiaSeleccionado(null)}
                className={`lg:hidden p-1 rounded-lg transition-colors ${dk ? 'hover:bg-white/[0.06] text-slate-500' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {!diaSeleccionado ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${dk ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-gray-50 border border-gray-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${dk ? 'text-slate-600' : 'text-gray-300'}`}>
                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className={`text-xs ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Selecciona un día</p>
              </div>
            ) : citasDelDia.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${dk ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-400">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className={`text-xs font-medium ${dk ? 'text-slate-500' : 'text-gray-400'}`}>Sin citas este día</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {citasDelDia.map(cita => {
                  const c = getColor(cita.motivo)
                  return (
                    <div key={cita.id} className={`rounded-xl p-3.5 transition-all ${dk ? 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06]' : 'bg-white border border-gray-100 shadow-sm shadow-gray-100/50 hover:shadow-md hover:border-gray-200/80'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                          <span className={`text-[13px] font-bold truncate ${dk ? 'text-white' : 'text-gray-900'}`}>{cita.nombre}</span>
                        </div>
                        <span className={`text-[12px] font-bold font-mono px-2 py-0.5 rounded-md shrink-0 ml-2 ${dk ? 'text-slate-400 bg-white/[0.06]' : 'text-gray-500 bg-gray-50'}`}>
                          {cita.hora}
                        </span>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ${dk ? 'bg-white/[0.06]' : c.bg} ${dk ? 'text-slate-300' : c.text}`}>
                        {cita.motivo}
                      </span>
                      {cita.telefono && (
                        <p className={`text-[11px] mt-2 font-mono tracking-wide ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{cita.telefono}</p>
                      )}
                      {cita.notas && cita.notas !== '-' && (
                        <p className={`text-[11px] mt-1 italic ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{cita.notas}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
