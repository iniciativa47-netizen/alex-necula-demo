'use client'

import { useState, useEffect } from 'react'

interface PopupWhatsAppProps {
  mensaje: string
  onCerrar: () => void
}

export default function PopupWhatsApp({ mensaje, onCerrar }: PopupWhatsAppProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80)
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(onCerrar, 350)
    }, 9000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onCerrar])

  const cerrar = () => {
    setVisible(false)
    setTimeout(onCerrar, 350)
  }

  const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const fecha = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 bg-black/55 backdrop-blur-sm ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={cerrar}
    >
      <div
        className={`flex flex-col items-center gap-4 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Eyebrow */}
        <p className="text-white/60 text-[10.5px] font-semibold uppercase tracking-[0.12em]">
          Así lo recibe el paciente
        </p>

        {/* Phone mockup */}
        <div className="relative w-[300px] h-[610px] bg-[#1d1d1f] rounded-[52px] p-[8px] shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_0.5px_rgba(255,255,255,0.08)]">
          {/* Volume buttons */}
          <div className="absolute -left-[2.5px] top-[108px] w-[3px] h-[28px] bg-[#2a2a2c] rounded-l-sm" />
          <div className="absolute -left-[2.5px] top-[150px] w-[3px] h-[54px] bg-[#2a2a2c] rounded-l-sm" />
          <div className="absolute -left-[2.5px] top-[218px] w-[3px] h-[54px] bg-[#2a2a2c] rounded-l-sm" />
          {/* Power button */}
          <div className="absolute -right-[2.5px] top-[168px] w-[3px] h-[72px] bg-[#2a2a2c] rounded-r-sm" />

          {/* Screen */}
          <div className="h-full bg-black rounded-[44px] overflow-hidden relative">
            {/* Wallpaper */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b4b] via-[#1a2d6e] to-[#0a3d62]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,179,237,0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.1),transparent_50%)]" />

            {/* Dynamic island */}
            <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-20" />

            {/* Status bar */}
            <div className="relative z-10 px-6 pt-4 pb-0 flex justify-between items-center h-[50px]">
              <span className="text-white text-[12px] font-semibold">{hora}</span>
              <div className="w-[110px]" />
              <div className="flex items-center gap-[5px]">
                {/* Signal */}
                <div className="flex items-end gap-[2px]">
                  {[3, 5, 7, 9].map((h, i) => (
                    <div key={i} className="w-[3px] rounded-sm bg-white" style={{ height: h }} />
                  ))}
                </div>
                {/* Wifi */}
                <svg className="w-[15px] h-[11px] text-white" fill="currentColor" viewBox="0 0 20 15">
                  <path d="M10 12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0-4c1.8 0 3.4.7 4.6 1.9l-1.4 1.4A4.5 4.5 0 0 0 10 10c-1.2 0-2.3.5-3.1 1.3L5.4 9.9A6.5 6.5 0 0 1 10 8ZM10 4c3 0 5.7 1.2 7.7 3.2l-1.4 1.4A9.5 9.5 0 0 0 10 6a9.5 9.5 0 0 0-6.3 2.6L2.3 7.2A11.5 11.5 0 0 1 10 4Z" />
                </svg>
                {/* Battery */}
                <div className="relative flex items-center">
                  <div className="w-[22px] h-[11px] rounded-[2.5px] border border-white/80 relative flex items-center px-[1.5px]">
                    <div className="h-[7px] w-[16px] bg-white rounded-[1px]" />
                  </div>
                  <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-[5px] bg-white/60 rounded-r-sm" />
                </div>
              </div>
            </div>

            {/* Lock screen time */}
            <div className="relative z-10 text-center mt-7">
              <p className="text-white text-[58px] font-thin tracking-tight leading-none">{hora}</p>
              <p className="text-white/70 text-[14px] mt-2 capitalize">{fecha}</p>
            </div>

            {/* WhatsApp notification card */}
            <div className={`relative z-10 mx-3 mt-7 transition-all duration-500 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
              <div className="bg-white/[0.18] backdrop-blur-xl rounded-2xl border border-white/[0.22] overflow-hidden shadow-lg">
                {/* Card header */}
                <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
                  <div className="w-8 h-8 bg-[#25D366] rounded-[9px] flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-[18px] h-[18px] text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[12px] font-semibold leading-none">WhatsApp</p>
                    <p className="text-white/55 text-[10px] mt-[3px]">Clínica Dental Sonrisa · ahora</p>
                  </div>
                  <button onClick={cerrar} className="text-white/40 hover:text-white/70 transition-colors p-1 -mr-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 mx-3.5" />

                {/* Message */}
                <div className="px-3.5 py-3">
                  <p className="text-white text-[12.5px] leading-relaxed">{mensaje}</p>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <span className="text-white/40 text-[10px]">{hora}</span>
                    <svg className="w-4 h-4 text-[#53BDEB]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-4 h-4 text-[#53BDEB] -ml-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-dismiss progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#075E54]/40 overflow-hidden rounded-b-[44px]">
              {visible && <div className="h-full bg-[#25D366] animate-shrink-bar" />}
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 backdrop-blur-sm text-emerald-400 text-[11px] font-medium px-4 py-2 rounded-full">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          Enviado automáticamente · Agente de voz IA
        </div>
      </div>
    </div>
  )
}
