import { NextRequest, NextResponse } from 'next/server'
import { openai, SYSTEM_PROMPT, FUNCTIONS } from '@/lib/openai'

// Rate limiting en memoria — protección básica contra abuso en demo pública
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60_000 // 1 minuto
  const maxRequests = 20
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= maxRequests) return true
  entry.count++
  return false
}

// Todas las horas posibles de cita
const TODAS_LAS_HORAS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

// Normalizar fecha a YYYY-MM-DD desde cualquier formato
function normalizarFecha(fecha: string): string {
  // Ya es YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha
  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha)) {
    const [d, m, y] = fecha.split('/')
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  // YYYY-M-D (sin padding)
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(fecha)) {
    const [y, m, d] = fecha.split('-')
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return fecha
}

// Normalizar hora a HH:MM
function normalizarHora(hora: string): string {
  if (!hora) return hora
  // "18:00" → ok, "9:00" → "09:00"
  const parts = hora.split(':')
  if (parts.length === 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
  }
  return hora
}

function horasOcupadasPorFecha(citasExistentes: any[]): Record<string, string[]> {
  const mapa: Record<string, string[]> = {}
  if (!citasExistentes) return mapa
  for (const c of citasExistentes) {
    if (!c.fecha || !c.hora) continue
    const fechaNorm = normalizarFecha(c.fecha)
    const horaNorm = normalizarHora(c.hora)
    if (!mapa[fechaNorm]) mapa[fechaNorm] = []
    mapa[fechaNorm].push(horaNorm)
  }
  return mapa
}

function horasLibres(fecha: string, ocupadas: Record<string, string[]>, hoy: Date, fechaHoyISO: string): string[] {
  const horasOcupadas = ocupadas[fecha] || []
  let disponibles = TODAS_LAS_HORAS.filter(h => !horasOcupadas.includes(h))

  // Si es hoy, filtrar horas pasadas
  if (fecha === fechaHoyISO) {
    const horaActual = hoy.getHours()
    disponibles = disponibles.filter(h => {
      const hora = parseInt(h.split(':')[0])
      return hora > horaActual
    })
  }

  return disponibles
}

export async function POST(request: NextRequest) {
  try {
    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Espera un momento antes de continuar.' },
        { status: 429 }
      )
    }

    const { mensajes, datosPaciente, citasExistentes } = await request.json()

    // Fecha actual
    const hoy = new Date()
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    const fechaHoy = `${diasSemana[hoy.getDay()]} ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`
    const horaActual = `${hoy.getHours()}:${hoy.getMinutes().toString().padStart(2, '0')}`
    const fechaManana = new Date(hoy)
    fechaManana.setDate(fechaManana.getDate() + 1)
    const fechaMananaISO = `${fechaManana.getFullYear()}-${(fechaManana.getMonth() + 1).toString().padStart(2, '0')}-${fechaManana.getDate().toString().padStart(2, '0')}`
    const fechaHoyISO = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`

    const horaNum = hoy.getHours()
    const clinicaAbierta = horaNum >= 9 && horaNum < 20

    // Mapa de horas ocupadas por fecha
    const ocupadas = horasOcupadasPorFecha(citasExistentes || [])

    // Generar calendario de los próximos 14 días con disponibilidad REAL
    let calendario = ''
    for (let i = 0; i < 7; i++) {
      const d = new Date(hoy)
      d.setDate(d.getDate() + i)
      const diaNum = d.getDate()
      const mesNum = d.getMonth() + 1
      const diaSemana = diasSemana[d.getDay()]
      const esFinDeSemana = d.getDay() === 0 || d.getDay() === 6
      const fechaISO = `${d.getFullYear()}-${mesNum.toString().padStart(2, '0')}-${diaNum.toString().padStart(2, '0')}`

      if (esFinDeSemana) {
        calendario += `- ${diaSemana} ${diaNum}/${mesNum} (${fechaISO}) ❌ CERRADO\n`
      } else {
        const libres = horasLibres(fechaISO, ocupadas, hoy, fechaHoyISO)
        const ocupadasDia = ocupadas[fechaISO] || []
        if (libres.length === 0) {
          calendario += `- ${diaSemana} ${diaNum}/${mesNum} (${fechaISO}) ❌ COMPLETO (sin huecos)\n`
        } else if (ocupadasDia.length > 0) {
          calendario += `- ${diaSemana} ${diaNum}/${mesNum} (${fechaISO}) → OCUPADAS: ${ocupadasDia.join(', ')} | LIBRES: ${libres.join(', ')}\n`
        } else {
          calendario += `- ${diaSemana} ${diaNum}/${mesNum} (${fechaISO}) → TODAS las horas libres\n`
        }
      }
    }

    let contexto = SYSTEM_PROMPT + `

--- FECHA Y HORA ACTUAL ---
HOY: ${fechaHoy} (${fechaHoyISO})
HORA: ${horaActual}
MAÑANA: ${fechaMananaISO}

HORARIO CLÍNICA: Lunes a Viernes, 9:00 - 21:00 (última cita a las 20:00). CERRADO sábados y domingos.
${clinicaAbierta ? `Puedes ofrecer cita HOY desde las ${horaNum + 1}:00 hasta las 20:00` : `NO ofrezcas cita para hoy, la clínica ya está cerrada`}

--- CALENDARIO Y DISPONIBILIDAD REAL (CONSULTA ESTO SIEMPRE) ---
${calendario}
REGLAS:
- Si el paciente pide una hora marcada como OCUPADA → dile que está cogida y ofrece las horas LIBRES más cercanas de ese día
- Si el paciente pide una hora marcada como LIBRE o un día con todas las horas libres → ofrécela directamente
- Si el día está CERRADO → ofrece el siguiente día laborable
- Si el día está COMPLETO → ofrece el siguiente día con huecos
- NUNCA ofrezcas una hora que aparece como OCUPADA
- Las citas son cada hora en punto: 9:00, 10:00, 11:00... hasta 20:00`

    if (citasExistentes && citasExistentes.length > 0) {
      contexto += `\n\n--- CITAS REGISTRADAS (pacientes conocidos) ---\n`
      for (const c of citasExistentes) {
        const fechaLegible = c.fecha ? c.fecha : '?'
        contexto += `- ${c.nombre} | ${c.motivo} | ${fechaLegible} a las ${c.hora}\n`
      }
      contexto += `IMPORTANTE: estos datos son CONOCIDOS. NUNCA preguntes al paciente información que ya aparece aquí (hora, fecha, motivo de su cita existente). Si el paciente tiene una cita registrada → ya sabes cuándo es. Úsalo directamente en la conversación sin preguntar.`
    }

    if (datosPaciente && Object.keys(datosPaciente).length > 0) {
      contexto += `\n\n--- DATOS YA RECOPILADOS ---\n`
      if (datosPaciente.nombre) contexto += `✓ Nombre: ${datosPaciente.nombre}\n`
      if (datosPaciente.telefono) contexto += `✓ Teléfono: ${datosPaciente.telefono}\n`
      if (datosPaciente.motivo) contexto += `✓ Motivo: ${datosPaciente.motivo}\n`
      if (datosPaciente.fecha) contexto += `✓ Fecha: ${datosPaciente.fecha}\n`
      if (datosPaciente.hora) contexto += `✓ Hora: ${datosPaciente.hora}\n`

      const tieneTodo = datosPaciente.nombre && datosPaciente.telefono && datosPaciente.motivo && datosPaciente.fecha && datosPaciente.hora
      if (tieneTodo) {
        contexto += `\n⚠️ TIENES TODOS LOS DATOS. Si el paciente acepta (dice ok/vale/sí/perfecto), LLAMA A confirmar_cita AHORA.`
      }
    }

    console.log('📅 Calendario enviado a la IA:\n', calendario)
    console.log('📋 Horas ocupadas:', JSON.stringify(ocupadas))

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: contexto },
        ...mensajes.map((m: any) => ({
          role: m.role === 'agent' ? 'assistant' : 'user',
          content: m.content,
        })),
      ],
      functions: FUNCTIONS,
      function_call: 'auto',
      temperature: 0.3,
      max_tokens: 200,
    })

    let respuestaIA = completion.choices[0]?.message
    let nuevosDatos = { ...datosPaciente }
    let citaConfirmada = false
    let citaReagendada = false
    let citaCancelada = false
    let reagendarData: any = null
    let cancelarData: any = null

    // Procesar function calls en bucle (puede haber encadenamiento: consultar_disponibilidad → confirmar_cita)
    let mensajesIA: any[] = [
      { role: 'system', content: contexto },
      ...mensajes.map((m: any) => ({
        role: m.role === 'agent' ? 'assistant' : 'user',
        content: m.content,
      })),
    ]

    // Retry automático: si el modelo generó texto de anuncio en vez de llamar a la función,
    // reintentamos a temperature=0 para forzar que use las herramientas.
    if (!respuestaIA?.function_call && respuestaIA?.content) {
      const c = respuestaIA.content.toLowerCase()
      const esAnuncio = ['voy a', 'un momento', 'déjame', 'déjame', 'vamos a', 'consultar', 'verificar', 'espera', 'ahora mismo'].some(p => c.includes(p))
      if (esAnuncio) {
        console.log('⚠️ Modelo anunció texto en lugar de llamar función. Reintentando con temperature=0...')
        const retry = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: mensajesIA,
          functions: FUNCTIONS,
          function_call: 'auto',
          temperature: 0,
          max_tokens: 200,
        })
        respuestaIA = retry.choices[0]?.message
      }
    }

    let iteraciones = 0
    const MAX_ITERACIONES = 4

    while (respuestaIA?.function_call && iteraciones < MAX_ITERACIONES) {
      iteraciones++
      const args = JSON.parse(respuestaIA.function_call.arguments)
      const functionName = respuestaIA.function_call.name

      console.log(`🔧 Function call #${iteraciones}: ${functionName}`, args)

      let functionResult: any = { success: true }
      let forzarTexto = false

      if (functionName === 'guardar_datos_paciente') {
        if (args.nombre) nuevosDatos.nombre = args.nombre
        if (args.telefono) nuevosDatos.telefono = args.telefono
        if (args.motivo) nuevosDatos.motivo = args.motivo
        if (args.fecha) nuevosDatos.fecha = args.fecha
        if (args.hora) nuevosDatos.hora = args.hora
        // Solo bloquear encadenamiento si aún faltan datos.
        // Si ya tenemos los 5 campos, dejar que el modelo llame a consultar_disponibilidad directamente.
        const tieneTodo = !!(nuevosDatos.nombre && nuevosDatos.telefono && nuevosDatos.motivo && nuevosDatos.fecha && nuevosDatos.hora)
        if (!tieneTodo) forzarTexto = true
      }

      if (functionName === 'consultar_disponibilidad') {
        const fechaConsulta = normalizarFecha(args.fecha)
        const horaConsulta = normalizarHora(args.hora)

        // Comprobar si es fin de semana
        const dateObj = new Date(fechaConsulta + 'T00:00:00')
        const diaSemana = dateObj.getDay()
        const diasNombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

        if (diaSemana === 0 || diaSemana === 6) {
          // Es fin de semana - buscar siguiente lunes
          const siguiente = new Date(dateObj)
          while (siguiente.getDay() === 0 || siguiente.getDay() === 6) {
            siguiente.setDate(siguiente.getDate() + 1)
          }
          const sigISO = `${siguiente.getFullYear()}-${(siguiente.getMonth() + 1).toString().padStart(2, '0')}-${siguiente.getDate().toString().padStart(2, '0')}`
          const libresLunes = horasLibres(sigISO, ocupadas, hoy, fechaHoyISO)
          functionResult = {
            disponible: false,
            motivo: `El ${fechaConsulta} es ${diasNombres[diaSemana]}, la clínica está CERRADA los fines de semana.`,
            alternativa: `El siguiente día laborable es ${diasNombres[siguiente.getDay()]} ${siguiente.getDate()}/${siguiente.getMonth() + 1} (${sigISO}). Pregunta al paciente qué hora le viene bien, NO enumeres horas.`,
          }
        } else if (horaConsulta === '00:00') {
          // Consulta de día entero
          const libres = horasLibres(fechaConsulta, ocupadas, hoy, fechaHoyISO)
          const ocupadasDia = ocupadas[fechaConsulta] || []
          if (libres.length === 0) {
            functionResult = {
              disponible: false,
              motivo: `El ${fechaConsulta} (${diasNombres[diaSemana]}) está COMPLETO, no hay huecos.`,
              alternativa: `Ofrece otro día.`,
            }
          } else {
            functionResult = {
              disponible: true,
              mensaje: `El ${fechaConsulta} (${diasNombres[diaSemana]}) tiene huecos libres. Pregunta al paciente qué hora prefiere. NO enumeres las horas. Cuando el paciente diga una hora, llama a consultar_disponibilidad con la hora concreta.`,
            }
          }
        } else {
          // Consulta de hora específica
          const horasOcupadasEseDia = ocupadas[fechaConsulta] || []
          const estaOcupada = horasOcupadasEseDia.includes(horaConsulta)

          if (estaOcupada) {
            const libres = horasLibres(fechaConsulta, ocupadas, hoy, fechaHoyISO)
            // Buscar las 2 horas libres más cercanas
            const horaNum = parseInt(horaConsulta.split(':')[0])
            const cercanas = libres.sort((a, b) => {
              const ha = parseInt(a.split(':')[0])
              const hb = parseInt(b.split(':')[0])
              return Math.abs(ha - horaNum) - Math.abs(hb - horaNum)
            }).slice(0, 2)

            functionResult = {
              disponible: false,
              motivo: `La hora ${horaConsulta} del ${fechaConsulta} (${diasNombres[diaSemana]}) está OCUPADA.`,
              alternativas: cercanas,
              nota: 'Ofrece SOLO estas 2 alternativas, no enumeres más horas.',
            }
          } else {
            // Verificar que está dentro del horario
            const h = parseInt(horaConsulta.split(':')[0])
            if (h < 9 || h > 20) {
              functionResult = {
                disponible: false,
                motivo: `La hora ${horaConsulta} está fuera del horario de la clínica (9:00-20:00).`,
              }
            } else {
              functionResult = {
                disponible: true,
                mensaje: `La hora ${horaConsulta} del ${fechaConsulta} (${diasNombres[diaSemana]}) está LIBRE.`,
                instruccion: 'LLAMA A confirmar_cita AHORA MISMO con todos los datos del paciente. NO respondas con texto, llama a la función directamente.',
              }
            }
          }
        }
      }

      if (functionName === 'confirmar_cita') {
        let telefonoFinal = args.telefono || nuevosDatos.telefono

        // Si no hay teléfono pero sí nombre, buscarlo en citas existentes del mismo paciente
        if (!telefonoFinal) {
          const nombreNorm = (args.nombre || nuevosDatos.nombre || '')
            .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          if (nombreNorm) {
            const match = (citasExistentes || []).find((c: any) => {
              const n = (c.nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              return n.includes(nombreNorm) || nombreNorm.includes(n)
            })
            if (match?.telefono) telefonoFinal = match.telefono
          }
        }

        if (!telefonoFinal) {
          functionResult = {
            success: false,
            error: 'TELÉFONO OBLIGATORIO. No tienes el teléfono del paciente. Pídelo AHORA antes de confirmar la cita.',
          }
          forzarTexto = true
        } else if (telefonoFinal.replace(/\D/g, '').replace(/^34/, '').length < 9) {
          functionResult = {
            success: false,
            error: `El teléfono "${telefonoFinal}" no tiene suficientes dígitos. Pide al paciente que repita su número de teléfono despacio.`,
          }
          forzarTexto = true
        } else {

        const fechaCita = normalizarFecha(args.fecha || nuevosDatos.fecha)
        const horaCita = normalizarHora(args.hora || nuevosDatos.hora)

        // VALIDACIÓN SERVER-SIDE
        const horasOcupadasEseDia = ocupadas[fechaCita] || []
        const estaOcupada = horasOcupadasEseDia.includes(horaCita)

        if (estaOcupada) {
          const libresEseDia = horasLibres(fechaCita, ocupadas, hoy, fechaHoyISO)
          functionResult = {
            success: false,
            error: `HORA OCUPADA. La ${horaCita} del ${fechaCita} ya está cogida. Horas libres: ${libresEseDia.join(', ')}. Ofrece alternativa.`,
          }
        } else {
          citaConfirmada = true
          nuevosDatos = {
            nombre: args.nombre || nuevosDatos.nombre,
            telefono: telefonoFinal,
            motivo: args.motivo || nuevosDatos.motivo,
            notas: args.notas || nuevosDatos.notas || '',
            fecha: fechaCita,
            hora: horaCita,
            accion: 'crear',
          }
          functionResult = { success: true }
        }
        } // close else (telefono present)
      }

      if (functionName === 'reagendar_cita') {
        citaReagendada = true
        reagendarData = {
          telefono: args.telefono || nuevosDatos.telefono,
          nombre: args.nombre || nuevosDatos.nombre,
          motivo: args.motivo,
          fecha_actual: args.fecha_actual ? normalizarFecha(args.fecha_actual) : undefined,
          nueva_fecha: normalizarFecha(args.nueva_fecha),
          nueva_hora: normalizarHora(args.nueva_hora),
        }
        nuevosDatos.accion = 'reagendar'
      }

      if (functionName === 'cancelar_cita') {
        citaCancelada = true
        cancelarData = {
          telefono: args.telefono || nuevosDatos.telefono,
          nombre: args.nombre || nuevosDatos.nombre,
          motivo: args.motivo,
          fecha: args.fecha ? normalizarFecha(args.fecha) : undefined,
        }
        nuevosDatos.accion = 'cancelar'
      }

      // Añadir la function call y su resultado al historial
      mensajesIA.push(respuestaIA)
      mensajesIA.push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult),
      })

      // Siguiente llamada - si forzarTexto, no permitir más function calls
      const siguienteLlamada = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: mensajesIA,
        functions: forzarTexto ? undefined : FUNCTIONS,
        function_call: forzarTexto ? undefined : 'auto',
        temperature: 0.3,
        max_tokens: 200,
      })

      respuestaIA = siguienteLlamada.choices[0]?.message
    }

    // Si la última respuesta es texto, devolverla
    if (respuestaIA?.content) {
      return NextResponse.json({
        respuesta: respuestaIA.content,
        datosPaciente: nuevosDatos,
        citaConfirmada,
        citaReagendada,
        citaCancelada,
        reagendarData,
        cancelarData,
      })
    }

    return NextResponse.json({
      respuesta: respuestaIA?.content || 'Perdona, ¿puedes repetir?',
      datosPaciente: nuevosDatos,
      citaConfirmada,
      citaReagendada,
      citaCancelada,
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar', details: error.message },
      { status: 500 }
    )
  }
}
