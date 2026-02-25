import { NextRequest, NextResponse } from 'next/server'
import { buscarOCrearPaciente, crearCita, obtenerCitas } from '@/app/actions'
import type { MotivoConsulta } from '@/types'

// Formatear teléfono español: +34 6XX XX XX XX
function formatearTelefono(telefono: string): string {
  // Limpiar el teléfono de espacios, guiones, etc.
  let limpio = telefono.replace(/[\s\-\(\)\.]/g, '')

  // Si ya tiene prefijo +34, formatearlo
  if (limpio.startsWith('+34')) {
    limpio = limpio.substring(3)
  } else if (limpio.startsWith('34') && limpio.length > 9) {
    limpio = limpio.substring(2)
  } else if (limpio.startsWith('0034')) {
    limpio = limpio.substring(4)
  }

  // Si tiene 9 dígitos y empieza por 6 o 7, es español
  if (limpio.length === 9 && (limpio.startsWith('6') || limpio.startsWith('7') || limpio.startsWith('9'))) {
    // Formato: +34 6XX XX XX XX
    return `+34 ${limpio.substring(0, 3)} ${limpio.substring(3, 5)} ${limpio.substring(5, 7)} ${limpio.substring(7, 9)}`
  }

  // Si ya tiene prefijo internacional (empieza con +), mantenerlo formateado
  if (telefono.startsWith('+')) {
    return telefono
  }

  // Si no es español estándar, devolver tal cual
  return telefono
}

// Mapear motivo libre a motivo válido
function mapearMotivo(motivo: string): MotivoConsulta {
  const motivoLower = motivo.toLowerCase()

  if (motivoLower.includes('dolor') || motivoLower.includes('urgente') || motivoLower.includes('urgencia') || motivoLower.includes('emergencia')) {
    return 'Urgencia'
  }
  if (motivoLower.includes('limpieza') || motivoLower.includes('higiene')) {
    return 'Higiene / limpieza'
  }
  if (motivoLower.includes('revisión') || motivoLower.includes('revision') || motivoLower.includes('chequeo')) {
    return 'Revisión'
  }
  if (motivoLower.includes('ortodoncia') || motivoLower.includes('brackets')) {
    return 'Ortodoncia'
  }
  if (motivoLower.includes('caries') || motivoLower.includes('empaste')) {
    return 'Caries / Empaste'
  }
  if (motivoLower.includes('extracción') || motivoLower.includes('extraer') || motivoLower.includes('sacar')) {
    return 'Extracción'
  }
  if (motivoLower.includes('endodoncia') || motivoLower.includes('nervio')) {
    return 'Endodoncia'
  }
  if (motivoLower.includes('implante')) {
    return 'Implantes'
  }
  if (motivoLower.includes('prótesis') || motivoLower.includes('dentadura')) {
    return 'Prótesis'
  }
  if (motivoLower.includes('blanqueamiento') || motivoLower.includes('estética') || motivoLower.includes('carillas')) {
    return 'Estética dental'
  }
  if (motivoLower.includes('primera') || motivoLower.includes('nuevo paciente')) {
    return 'Primera visita'
  }

  return 'Revisión' // Por defecto
}

export async function GET() {
  try {
    const resultado = await obtenerCitas()

    if (!resultado.success) {
      return NextResponse.json(
        { error: 'Error al obtener citas' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      citas: resultado.data,
    })
  } catch (error: any) {
    console.error('Error en GET /api/citas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, telefono, motivo, notas, fecha, hora } = body

    if (!nombre || !telefono || !motivo || !fecha || !hora) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // 1. Buscar o crear paciente (formatear teléfono)
    const telefonoFormateado = formatearTelefono(telefono)
    const resultadoPaciente = await buscarOCrearPaciente(nombre, telefonoFormateado)

    if (!resultadoPaciente.success || !resultadoPaciente.data) {
      return NextResponse.json(
        { error: 'Error al crear el paciente' },
        { status: 500 }
      )
    }

    // 2. Crear la cita (mapear motivo a uno válido)
    const motivoMapeado = mapearMotivo(motivo)
    console.log(`📋 Motivo original: "${motivo}" → Mapeado a: "${motivoMapeado}"`)

    // Solo guardar en notas si aporta info adicional (no repetir el motivo)
    const notasFinales = motivo.toLowerCase() !== motivoMapeado.toLowerCase() ? motivo : ''

    const resultadoCita = await crearCita(
      resultadoPaciente.data.id,
      fecha,
      hora,
      motivoMapeado,
      notasFinales
    )

    if (!resultadoCita.success) {
      return NextResponse.json(
        { error: 'Error al crear la cita' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      cita: resultadoCita.data,
    })
  } catch (error: any) {
    console.error('Error en /api/citas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Reagendar cita existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { telefono, nueva_fecha, nueva_hora, nombre } = body

    console.log('📞 PUT /api/citas - Reagendar:', { telefono, nombre, nueva_fecha, nueva_hora })

    if ((!telefono && !nombre) || !nueva_fecha || !nueva_hora) {
      return NextResponse.json(
        { error: 'Faltan datos: (telefono o nombre), nueva_fecha, nueva_hora' },
        { status: 400 }
      )
    }

    const { buscarCitasPorPaciente, modificarCita } = await import('@/app/actions')

    // Normalizar teléfono (quitar espacios, guiones)
    const telefonoNormalizado = telefono ? telefono.replace(/[\s\-]/g, '') : null

    let resultadoBusqueda = await buscarCitasPorPaciente(telefonoNormalizado || '')

    // Si no encuentra por teléfono, intentar buscar todas las citas y filtrar por nombre
    if ((!resultadoBusqueda.success || !resultadoBusqueda.data || resultadoBusqueda.data.length === 0) && nombre) {
      console.log('📋 No encontrado por teléfono, buscando por nombre:', nombre)
      const { obtenerCitas } = await import('@/app/actions')
      const todasCitas = await obtenerCitas()
      if (todasCitas.success && todasCitas.data) {
        // Normalizar texto (quitar acentos) para comparación
        const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        const nombreNorm = normalizar(nombre)

        const citasPorNombre = todasCitas.data.filter((c: any) => {
          const nombrePaciente = c.paciente?.nombre || ''
          return normalizar(nombrePaciente).includes(nombreNorm)
        })
        if (citasPorNombre.length > 0) {
          resultadoBusqueda = { success: true, data: citasPorNombre }
        }
      }
    }

    if (!resultadoBusqueda.success || !resultadoBusqueda.data || resultadoBusqueda.data.length === 0) {
      console.log('❌ No se encontró cita para:', { telefonoNormalizado, nombre })
      return NextResponse.json(
        { error: 'No se encontró ninguna cita' },
        { status: 404 }
      )
    }

    // Tomar la cita más próxima (primera en la lista ordenada por fecha)
    const citaExistente = resultadoBusqueda.data[0]
    console.log(`✅ Reagendando cita ${citaExistente.id}: ${citaExistente.fecha} ${citaExistente.hora} → ${nueva_fecha} ${nueva_hora}`)

    // Modificar la cita
    const resultadoModificar = await modificarCita(citaExistente.id, nueva_fecha, nueva_hora)

    if (!resultadoModificar.success) {
      return NextResponse.json(
        { error: 'Error al reagendar la cita' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      cita: resultadoModificar.data,
      mensaje: `Cita reagendada de ${citaExistente.fecha} a ${nueva_fecha} ${nueva_hora}`,
    })
  } catch (error: any) {
    console.error('Error en PUT /api/citas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar cita
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telefono = searchParams.get('telefono')

    if (!telefono) {
      return NextResponse.json(
        { error: 'Falta el teléfono' },
        { status: 400 }
      )
    }

    const { buscarCitasPorPaciente, cancelarCita } = await import('@/app/actions')

    const resultadoBusqueda = await buscarCitasPorPaciente(telefono)

    if (!resultadoBusqueda.success || !resultadoBusqueda.data || resultadoBusqueda.data.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró ninguna cita para este teléfono' },
        { status: 404 }
      )
    }

    const citaExistente = resultadoBusqueda.data[0]
    const resultadoCancelar = await cancelarCita(citaExistente.id)

    if (!resultadoCancelar.success) {
      return NextResponse.json(
        { error: 'Error al cancelar la cita' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Cita cancelada correctamente',
    })
  } catch (error: any) {
    console.error('Error en DELETE /api/citas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}
