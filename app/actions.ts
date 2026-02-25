'use server'

import { supabaseAdmin } from '@/lib/supabase'
import type { MotivoConsulta, TipoInteraccion } from '@/types'

// ============================================
// ACCIONES PARA PACIENTES
// ============================================

export async function buscarOCrearPaciente(nombre: string, telefono: string) {
  try {
    const supabase = supabaseAdmin()

    // Primero buscar si ya existe
    const { data: pacienteExistente, error: errorBusqueda } = await supabase
      .from('pacientes')
      .select('*')
      .eq('telefono', telefono)
      .single()

    if (pacienteExistente) {
      return { success: true, data: pacienteExistente }
    }

    // Si no existe, crear nuevo
    const { data: nuevoPaciente, error: errorCrear } = await supabase
      .from('pacientes')
      .insert({ nombre, telefono })
      .select()
      .single()

    if (errorCrear) {
      console.error('Error al crear paciente:', errorCrear)
      return { success: false, error: errorCrear.message }
    }

    return { success: true, data: nuevoPaciente }
  } catch (error: any) {
    console.error('Error en buscarOCrearPaciente:', error)
    return { success: false, error: error.message }
  }
}

export async function buscarPacientePorTelefono(telefono: string) {
  try {
    const supabase = supabaseAdmin()

    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('telefono', telefono)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// ACCIONES PARA CITAS
// ============================================

export async function crearCita(
  pacienteId: string,
  fecha: string,
  hora: string,
  motivo: MotivoConsulta,
  notas?: string
) {
  try {
    const supabase = supabaseAdmin()

    const { data, error } = await supabase
      .from('citas')
      .insert({
        paciente_id: pacienteId,
        fecha,
        hora,
        motivo,
        notas: notas || '',
        estado: 'confirmada',
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear cita:', error)
      return { success: false, error: error.message }
    }

    // Log de la interacción
    await registrarInteraccion('crear', data.id, `Cita creada: ${motivo} - ${fecha} ${hora}${notas ? ` - ${notas}` : ''}`)

    return { success: true, data }
  } catch (error: any) {
    console.error('Error en crearCita:', error)
    return { success: false, error: error.message }
  }
}

export async function modificarCita(
  citaId: string,
  fecha: string,
  hora: string
) {
  try {
    const supabase = supabaseAdmin()

    const { data, error } = await supabase
      .from('citas')
      .update({
        fecha,
        hora,
        estado: 'modificada',
      })
      .eq('id', citaId)
      .select()
      .single()

    if (error) {
      console.error('Error al modificar cita:', error)
      return { success: false, error: error.message }
    }

    // Log de la interacción
    await registrarInteraccion('modificar', citaId, `Cita modificada a: ${fecha} ${hora}`)

    return { success: true, data }
  } catch (error: any) {
    console.error('Error en modificarCita:', error)
    return { success: false, error: error.message }
  }
}

export async function cancelarCita(citaId: string) {
  try {
    const supabase = supabaseAdmin()

    const { data, error } = await supabase
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', citaId)
      .select()
      .single()

    if (error) {
      console.error('Error al cancelar cita:', error)
      return { success: false, error: error.message }
    }

    // Log de la interacción
    await registrarInteraccion('cancelar', citaId, 'Cita cancelada')

    return { success: true, data }
  } catch (error: any) {
    console.error('Error en cancelarCita:', error)
    return { success: false, error: error.message }
  }
}

export async function eliminarCita(citaId: string) {
  try {
    const supabase = supabaseAdmin()

    const { error } = await supabase
      .from('citas')
      .delete()
      .eq('id', citaId)

    if (error) {
      console.error('Error al eliminar cita:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Cita eliminada:', citaId)
    return { success: true }
  } catch (error: any) {
    console.error('Error en eliminarCita:', error)
    return { success: false, error: error.message }
  }
}

export async function obtenerCitas() {
  try {
    const supabase = supabaseAdmin()

    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        paciente:pacientes (
          id,
          nombre,
          telefono
        )
      `)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true })

    if (error) {
      console.error('Error al obtener citas:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error en obtenerCitas:', error)
    return { success: false, error: error.message }
  }
}

export async function buscarCitasPorPaciente(telefono: string) {
  try {
    const supabase = supabaseAdmin()

    // Normalizar: extraer solo dígitos del teléfono
    const soloDigitos = telefono.replace(/\D/g, '')
    // Últimos 9 dígitos (sin prefijo país)
    const ultimos9 = soloDigitos.slice(-9)

    // Buscar paciente con teléfono que contenga esos dígitos
    const { data: pacientes, error: errorPaciente } = await supabase
      .from('pacientes')
      .select('id, telefono')

    if (errorPaciente || !pacientes || pacientes.length === 0) {
      return { success: false, error: 'No hay pacientes' }
    }

    // Buscar el que coincida (comparando últimos 9 dígitos)
    const paciente = pacientes.find(p => {
      const pDigitos = p.telefono?.replace(/\D/g, '') || ''
      const pUltimos9 = pDigitos.slice(-9)
      return pUltimos9 === ultimos9
    })

    if (!paciente) {
      console.log(`❌ No se encontró paciente con teléfono ${telefono} (buscando ${ultimos9})`)
      return { success: false, error: 'Paciente no encontrado' }
    }

    // Buscar citas del paciente que no estén canceladas
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        paciente:pacientes (
          id,
          nombre,
          telefono
        )
      `)
      .eq('paciente_id', paciente.id)
      .neq('estado', 'cancelada')
      .order('fecha', { ascending: true })

    if (error) {
      console.error('Error al buscar citas:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error en buscarCitasPorPaciente:', error)
    return { success: false, error: error.message }
  }
}

// Nueva función para encontrar el PRIMER hueco disponible (según reglas del usuario)
export async function encontrarPrimerHuecoDisponible(esUrgencia: boolean = false) {
  try {
    const supabase = supabaseAdmin()

    // Obtener TODAS las citas confirmadas (no canceladas)
    const { data: citasExistentes, error } = await supabase
      .from('citas')
      .select('fecha, hora')
      .neq('estado', 'cancelada')

    if (error) {
      console.error('Error al obtener citas:', error)
      return { success: false, error: error.message }
    }

    // Crear un Set de slots ocupados en formato "YYYY-MM-DD HH:00"
    const slotsOcupados = new Set(
      citasExistentes?.map(cita => `${cita.fecha} ${cita.hora}`) || []
    )

    console.log('🔍 Slots ocupados en CRM:', Array.from(slotsOcupados))

    const hoy = new Date()
    const horaActual = hoy.getHours()
    const minutosActual = hoy.getMinutes()

    const HORA_APERTURA = 9
    const HORA_CIERRE = 22 // Última cita a las 21:00, cierra a las 22:00

    // Redondear al siguiente bloque horario completo
    let siguienteHora = horaActual
    if (minutosActual > 0) {
      siguienteHora = horaActual + 1
    }

    // Si la siguiente hora es después del cierre, empezar mañana
    if (siguienteHora >= HORA_CIERRE) {
      siguienteHora = HORA_APERTURA
      hoy.setDate(hoy.getDate() + 1)
    }

    console.log('🕐 Hora actual:', `${horaActual}:${minutosActual}`)
    console.log('🕐 Siguiente bloque candidato:', siguienteHora)

    // Buscar el PRIMER hueco disponible desde ese momento
    let diaOffset = 0
    const maxDias = 14

    while (diaOffset < maxDias) {
      const fechaBusqueda = new Date(hoy)
      fechaBusqueda.setDate(hoy.getDate() + diaOffset)
      const fechaString = fechaBusqueda.toISOString().split('T')[0]

      // Si es el primer día, empezar desde siguienteHora
      // Si no, empezar desde hora de apertura
      const horaInicio = diaOffset === 0 ? siguienteHora : HORA_APERTURA

      for (let hora = horaInicio; hora < HORA_CIERRE; hora++) {
        const horaString = `${hora.toString().padStart(2, '0')}:00`
        const slot = `${fechaString} ${horaString}`

        console.log(`  🔍 Verificando slot: ${slot}`)

        // Verificar si el slot NO está ocupado
        if (!slotsOcupados.has(slot)) {
          let textoHumano = ''

          if (diaOffset === 0) {
            textoHumano = `hoy a las ${hora}:00`
          } else if (diaOffset === 1) {
            textoHumano = `mañana a las ${hora}:00`
          } else {
            const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
            const nombreDia = diasSemana[fechaBusqueda.getDay()]
            textoHumano = `el ${nombreDia} ${fechaBusqueda.getDate()} a las ${hora}:00`
          }

          console.log(`✅ PRIMER HUECO ENCONTRADO: ${slot} (${textoHumano})`)

          return {
            success: true,
            hueco: {
              fecha: fechaString,
              hora: horaString,
              texto: textoHumano
            }
          }
        } else {
          console.log(`  ❌ Slot ocupado: ${slot}`)
        }
      }

      diaOffset++
    }

    // No se encontró ningún hueco en 14 días
    console.log('❌ No se encontró ningún hueco disponible en los próximos 14 días')
    return { success: false, error: 'No hay huecos disponibles' }
  } catch (error: any) {
    console.error('Error en encontrarPrimerHuecoDisponible:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// ACCIONES PARA LOGS
// ============================================

export async function registrarInteraccion(
  tipo: TipoInteraccion,
  citaId: string | null = null,
  mensaje: string,
  metadata?: Record<string, any>
) {
  try {
    const supabase = supabaseAdmin()

    const { error } = await supabase
      .from('interaction_logs')
      .insert({
        tipo_interaccion: tipo,
        cita_id: citaId,
        mensaje,
        metadata: metadata || {},
      })

    if (error) {
      console.error('Error al registrar interacción:', error)
    }

    return { success: !error }
  } catch (error) {
    console.error('Error en registrarInteraccion:', error)
    return { success: false }
  }
}
