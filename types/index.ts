// Tipos para la demo del agente de voz

export type MotivoConsulta =
  | 'Primera visita'
  | 'Higiene / limpieza'
  | 'Urgencia'
  | 'Ortodoncia'
  | 'Revisión'
  | 'Caries / Empaste'
  | 'Extracción'
  | 'Endodoncia'
  | 'Implantes'
  | 'Prótesis'
  | 'Estética dental'

export type EstadoCita = 'confirmada' | 'modificada' | 'cancelada' | 'completada'

export type TipoInteraccion = 'crear' | 'modificar' | 'cancelar' | 'consulta'

export interface Paciente {
  id: string
  nombre: string
  telefono: string
  created_at: string
  updated_at: string
}

export interface Cita {
  id: string
  paciente_id: string
  fecha: string
  hora: string
  motivo: MotivoConsulta
  notas?: string
  estado: EstadoCita
  created_at: string
  updated_at: string
  paciente?: Paciente
}

export interface InteractionLog {
  id: string
  cita_id?: string
  tipo_interaccion: TipoInteraccion
  mensaje?: string
  metadata?: Record<string, any>
  created_at: string
}

// Tipos para el flujo de la conversación
export interface Mensaje {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: Date
}

export interface EstadoConversacion {
  paso: 'inicio' | 'filtro' | 'datos_paciente' | 'motivo' | 'fecha' | 'confirmacion' | 'completado' | 'recopilando_datos' | 'listo_para_agendar'
  accion?: 'crear' | 'modificar' | 'cancelar'
  datosTemporales: {
    nombre?: string
    telefono?: string
    motivo?: MotivoConsulta
    notas?: string
    fecha?: string
    hora?: string
    citaId?: string
    necesitaApellido?: boolean
  }
}

// Tipos para mensajes de WhatsApp simulados
export interface MensajeWhatsApp {
  id: string
  contenido: string
  timestamp: Date
  enviado: boolean
}
