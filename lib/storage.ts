import type { Cita, MotivoConsulta, EstadoCita } from '@/types'

const STORAGE_KEY = 'dental_citas'

export interface CitaLocal {
  id: string
  nombre: string
  telefono: string
  fecha: string
  hora: string
  motivo: MotivoConsulta
  notas: string
  estado: EstadoCita
  created_at: string
}

// Formatear teléfono español: +34 6XX XX XX XX
function formatearTelefono(telefono: string): string {
  if (!telefono) return ''
  let limpio = telefono.replace(/[\s\-\(\)\.]/g, '')

  if (limpio.startsWith('+34')) limpio = limpio.substring(3)
  else if (limpio.startsWith('34') && limpio.length > 9) limpio = limpio.substring(2)
  else if (limpio.startsWith('0034')) limpio = limpio.substring(4)

  if (limpio.length === 9 && (limpio.startsWith('6') || limpio.startsWith('7') || limpio.startsWith('9'))) {
    return `+34 ${limpio.substring(0, 3)} ${limpio.substring(3, 5)} ${limpio.substring(5, 7)} ${limpio.substring(7, 9)}`
  }

  if (telefono.startsWith('+')) return telefono
  return telefono
}

// Mapear motivo libre a motivo válido
function mapearMotivo(motivo: string): MotivoConsulta {
  const m = motivo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Extracción - ANTES de urgencia para que "sacar muela" no sea urgencia
  if (m.includes('extraccion') || m.includes('extraer') || m.includes('sacar') || m.includes('arrancar') || m.includes('quitar muela')) return 'Extracción'
  // Caries - ANTES de urgencia para que "muela picada" no sea urgencia
  if (m.includes('caries') || m.includes('empaste') || m.includes('picada') || m.includes('picado') || m.includes('agujero')) return 'Caries / Empaste'
  // Endodoncia
  if (m.includes('endodoncia') || m.includes('nervio') || m.includes('matar el nervio')) return 'Endodoncia'
  // Ortodoncia
  if (m.includes('ortodoncia') || m.includes('brackets') || m.includes('invisalign') || m.includes('alineador')) return 'Ortodoncia'
  // Limpieza
  if (m.includes('limpieza') || m.includes('higiene')) return 'Higiene / limpieza'
  // Estética
  if (m.includes('blanqueamiento') || m.includes('estetica') || m.includes('carillas')) return 'Estética dental'
  // Implantes
  if (m.includes('implante')) return 'Implantes'
  // Prótesis
  if (m.includes('protesis') || m.includes('dentadura')) return 'Prótesis'
  // Primera visita
  if (m.includes('primera') || m.includes('nuevo paciente')) return 'Primera visita'
  // Revisión
  if (m.includes('revision') || m.includes('chequeo') || m.includes('control')) return 'Revisión'
  // Urgencia - SOLO si realmente dice dolor/urgente/emergencia
  if (m.includes('dolor') || m.includes('urgente') || m.includes('urgencia') || m.includes('emergencia') || m.includes('duele')) return 'Urgencia'
  return 'Revisión'
}

// Extraer últimos 9 dígitos de un teléfono
function ultimos9(tel: string): string {
  return tel.replace(/\D/g, '').slice(-9)
}

// Normalizar texto (quitar acentos)
function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// --- CRUD ---

function getCitas(): CitaLocal[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveCitas(citas: CitaLocal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(citas))
}

function hoyISO(): string {
  const h = new Date()
  return `${h.getFullYear()}-${(h.getMonth() + 1).toString().padStart(2, '0')}-${h.getDate().toString().padStart(2, '0')}`
}

// Auto-marca como 'completada' las citas confirmadas cuya fecha+hora ya pasó
function autoCompletar(citas: CitaLocal[]): CitaLocal[] {
  const ahora = new Date()
  const hoy = hoyISO()
  const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`
  let changed = false
  const updated = citas.map(c => {
    if (c.estado === 'confirmada') {
      const yaPaso = c.fecha < hoy || (c.fecha === hoy && c.hora <= horaActual)
      if (yaPaso) {
        changed = true
        return { ...c, estado: 'completada' as const }
      }
    }
    return c
  })
  if (changed) saveCitas(updated)
  return updated
}

// Citas no canceladas (incluye completadas) — para el agente de voz
export function obtenerCitas(): CitaLocal[] {
  return autoCompletar(getCitas()).filter(c => c.estado !== 'cancelada')
}

// Solo citas confirmadas con fecha >= hoy — para vistas de agenda
export function obtenerCitasProximas(): CitaLocal[] {
  const hoy = hoyISO()
  return autoCompletar(getCitas()).filter(c => c.estado === 'confirmada' && c.fecha >= hoy)
}

// Citas ya atendidas
export function obtenerCitasCompletadas(): CitaLocal[] {
  return autoCompletar(getCitas()).filter(c => c.estado === 'completada')
}

export function obtenerTodasCitas(): CitaLocal[] {
  return autoCompletar(getCitas())
}

export function crearCita(data: {
  nombre: string
  telefono: string
  motivo: string
  notas?: string
  fecha: string
  hora: string
}): CitaLocal {
  const citas = getCitas()
  const motivoMapeado = mapearMotivo(data.motivo)

  const nueva: CitaLocal = {
    id: crypto.randomUUID(),
    nombre: data.nombre,
    telefono: formatearTelefono(data.telefono),
    fecha: data.fecha,
    hora: data.hora,
    motivo: motivoMapeado,
    notas: data.notas || '',
    estado: 'confirmada',
    created_at: new Date().toISOString(),
  }

  citas.push(nueva)
  saveCitas(citas)
  console.log('✅ Cita guardada en localStorage:', nueva)
  return nueva
}

// Resolución de ambigüedad: dado un array de índices candidatos, filtra por motivo y/o fecha
function refinarCandidatos(citas: CitaLocal[], candidatos: number[], motivo?: string, fecha?: string): number[] {
  if (candidatos.length <= 1) return candidatos
  if (motivo) {
    const m = normalizar(motivo)
    const porMotivo = candidatos.filter(i => normalizar(citas[i].motivo).includes(m))
    if (porMotivo.length > 0) candidatos = porMotivo
  }
  if (candidatos.length <= 1) return candidatos
  if (fecha) {
    const porFecha = candidatos.filter(i => citas[i].fecha === fecha)
    if (porFecha.length > 0) candidatos = porFecha
  }
  return candidatos
}

export function reagendarCita(data: {
  telefono?: string
  nombre?: string
  motivo?: string
  fecha_actual?: string
  nueva_fecha: string
  nueva_hora: string
}): CitaLocal | null {
  const citas = getCitas()

  // Buscar por teléfono (resultado único, sin ambigüedad)
  if (data.telefono) {
    const tel9 = ultimos9(data.telefono)
    const idx = citas.findIndex(c => c.estado !== 'cancelada' && ultimos9(c.telefono) === tel9)
    if (idx !== -1) {
      citas[idx].fecha = data.nueva_fecha
      citas[idx].hora = data.nueva_hora
      citas[idx].estado = 'confirmada'
      saveCitas(citas)
      return citas[idx]
    }
  }

  // Buscar por nombre y refinar con motivo/fecha si hay ambigüedad
  if (data.nombre) {
    const nombreNorm = normalizar(data.nombre)
    let candidatos = citas.reduce((acc, c, i) => {
      if (c.estado !== 'cancelada' && normalizar(c.nombre).includes(nombreNorm)) acc.push(i)
      return acc
    }, [] as number[])
    candidatos = refinarCandidatos(citas, candidatos, data.motivo, data.fecha_actual)
    if (candidatos.length > 0) {
      const idx = candidatos[0]
      citas[idx].fecha = data.nueva_fecha
      citas[idx].hora = data.nueva_hora
      citas[idx].estado = 'confirmada'
      saveCitas(citas)
      console.log('✅ Cita reagendada en localStorage:', citas[idx])
      return citas[idx]
    }
  }

  console.log('❌ No se encontró cita para reagendar:', data)
  return null
}

export function cancelarCita(data: { telefono?: string; nombre?: string; motivo?: string; fecha?: string }): CitaLocal | null {
  const citas = getCitas()

  // Buscar por teléfono (resultado único, sin ambigüedad)
  if (data.telefono) {
    const tel9 = ultimos9(data.telefono)
    const idx = citas.findIndex(c => c.estado !== 'cancelada' && ultimos9(c.telefono) === tel9)
    if (idx !== -1) {
      citas[idx].estado = 'cancelada'
      saveCitas(citas)
      return citas[idx]
    }
  }

  // Buscar por nombre y refinar con motivo/fecha si hay ambigüedad
  if (data.nombre) {
    const nombreNorm = normalizar(data.nombre)
    let candidatos = citas.reduce((acc, c, i) => {
      if (c.estado !== 'cancelada' && normalizar(c.nombre).includes(nombreNorm)) acc.push(i)
      return acc
    }, [] as number[])
    candidatos = refinarCandidatos(citas, candidatos, data.motivo, data.fecha)
    if (candidatos.length > 0) {
      const idx = candidatos[0]
      citas[idx].estado = 'cancelada'
      saveCitas(citas)
      console.log('✅ Cita cancelada en localStorage:', citas[idx])
      return citas[idx]
    }
  }

  return null
}

export function eliminarCita(id: string): boolean {
  const citas = getCitas()
  const nuevas = citas.filter(c => c.id !== id)
  if (nuevas.length === citas.length) return false
  saveCitas(nuevas)
  return true
}

// Calcula los próximos N días laborables desde hoy
function proximosDiasLaborables(n: number): string[] {
  const result: string[] = []
  let offset = 1
  while (result.length < n) {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      result.push(
        `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      )
    }
    offset++
  }
  return result
}

// Precarga citas de ejemplo si el localStorage está vacío (primera visita al demo)
export function seedDemoData(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('dental_demo_seeded')) return
  const existing = getCitas()
  if (existing.length > 0) {
    localStorage.setItem('dental_demo_seeded', '1')
    return
  }
  const dias = proximosDiasLaborables(3)
  const seed: CitaLocal[] = [
    {
      id: crypto.randomUUID(),
      nombre: 'Carmen Ruiz Soto',
      telefono: '+34 622 11 33 44',
      fecha: dias[0],
      hora: '10:00',
      motivo: 'Higiene / limpieza',
      notas: 'Primera visita — viene recomendada',
      estado: 'confirmada',
      created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Andrés Molina García',
      telefono: '+34 677 44 55 66',
      fecha: dias[0],
      hora: '17:00',
      motivo: 'Ortodoncia',
      notas: 'Revisión mensual de brackets',
      estado: 'confirmada',
      created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Lucía Fernández Torres',
      telefono: '+34 655 88 99 00',
      fecha: dias[1],
      hora: '12:00',
      motivo: 'Estética dental',
      notas: 'Consulta blanqueamiento dental',
      estado: 'confirmada',
      created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Miguel Ángel Sánchez',
      telefono: '+34 634 76 12 09',
      fecha: dias[2],
      hora: '09:00',
      motivo: 'Implantes',
      notas: 'Segunda fase del implante inferior derecho',
      estado: 'confirmada',
      created_at: new Date().toISOString(),
    },
  ]
  saveCitas(seed)
  localStorage.setItem('dental_demo_seeded', '1')
}
