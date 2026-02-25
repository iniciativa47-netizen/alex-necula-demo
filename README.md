# Demo Agente de Voz para Clínica Dental 🦷

Demo comercial de un agente de voz con IA para la gestión de citas en clínicas dentales.

## 📋 Descripción

Esta es una demostración visual que simula cómo un agente de voz puede atender llamadas y gestionar citas de manera automática.

**IMPORTANTE:** Todo es simulado - no hay llamadas reales ni WhatsApp real.

## ✨ Características

- **Agente de voz simulado**: Conversación natural con IA (OpenAI GPT-4)
- **Gestión completa de citas**: Crear, modificar y cancelar
- **CRM visual**: Visualización en tiempo real de todas las citas
- **Mensajes WhatsApp simulados**: Confirmaciones automáticas

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **IA**: OpenAI GPT-4
- **Deploy**: Vercel (recomendado)

## 🚀 Instalación y Configuración

### 1. Aplicar el esquema de base de datos

Primero, necesitas crear las tablas en Supabase:

1. Ve a [Supabase](https://app.supabase.com) y abre tu proyecto
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido del archivo `../supabase-schema.sql`
5. Ejecuta el script

Ver instrucciones detalladas en [`../INSTRUCCIONES-SUPABASE.md`](../INSTRUCCIONES-SUPABASE.md)

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Las variables de entorno ya están configuradas en el archivo `.env.local`. Si necesitas cambiarlas:

```env
# OpenAI
OPENAI_API_KEY=tu_api_key_aqui

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ajdlaiefewijunfzzmfb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Cómo usar la demo

### Flujo para crear una cita:

1. **Haz clic en "Iniciar Llamada"**
2. **Usa los botones de acción rápida** o escribe: "Quiero crear una nueva cita"
3. **Proporciona los datos** cuando el agente los solicite:
   - Nombre del paciente
   - Teléfono
   - Motivo de la cita (Primera visita, Higiene/limpieza, Urgencia, Ortodoncia, Revisión)
4. **Confirma la cita** con el botón "Confirmar y Crear Cita"
5. **Observa** cómo la cita aparece en el CRM y se envía un mensaje de WhatsApp simulado

### Ejemplo de conversación:

```
Agente: Hola, bienvenido a la Clínica Dental. ¿En qué puedo ayudarte hoy?

Tú: Quiero crear una nueva cita

Agente: ¡Perfecto! ¿Cuál es tu nombre completo?

Tú: María García

Agente: Gracias María. ¿Cuál es tu número de teléfono?

Tú: +34600111222

Agente: ¿Cuál es el motivo de tu consulta?

Tú: Limpieza dental

[El agente procesará y confirmará la cita]
```

## 🗂️ Estructura del Proyecto

```
dental-agent-demo/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # API para conversación con OpenAI
│   ├── actions.ts              # Server actions (Supabase)
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Página principal
│   └── globals.css             # Estilos globales
├── components/
│   ├── PanelLlamada.tsx        # Panel de conversación
│   ├── PanelCRM.tsx            # Panel de gestión de citas
│   └── PanelWhatsApp.tsx       # Panel de mensajes simulados
├── lib/
│   ├── supabase.ts             # Cliente de Supabase
│   └── openai.ts               # Cliente de OpenAI
├── types/
│   └── index.ts                # Tipos TypeScript
└── ...
```

## 🎯 Workflow del Agente

1. **Filtro inicial**: ¿Crear, modificar o cancelar cita?
2. **Recopilación de datos**:
   - Nombre del paciente
   - Teléfono
   - Motivo (solo para crear)
   - Fecha y hora
3. **Confirmación**: Se crea/modifica/cancela en la base de datos
4. **Notificación**: Mensaje de WhatsApp simulado

## 🚢 Deploy en Vercel

1. Crea un nuevo proyecto en [Vercel](https://vercel.com)
2. Importa este repositorio
3. Configura las variables de entorno:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy automático

## ⚠️ Limitaciones (por diseño)

- **No hay llamadas de voz reales**: Solo texto simulado
- **No hay WhatsApp real**: Solo visualización de mensajes
- **No hay autenticación**: Es una demo abierta
- **No hay validación avanzada**: Validación básica de datos

## 📝 Próximas mejoras (opcional)

- [ ] Integración con Twilio para llamadas reales
- [ ] Integración con WhatsApp Business API
- [ ] Sistema de autenticación para clínicas
- [ ] Dashboard con métricas y analytics
- [ ] Recordatorios automáticos de citas
- [ ] Soporte multi-idioma

## 🤝 Soporte

Para preguntas o problemas, contacta con el equipo de desarrollo.

---

**Desarrollado para demostración comercial**
