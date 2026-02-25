import { NextRequest, NextResponse } from 'next/server'
import { EdgeTTS } from '@andresaya/edge-tts'

// Voz femenina española de España (neural, natural)
const VOZ_LAURA = 'es-ES-XimenaNeural'

export async function POST(request: NextRequest) {
  try {
    const { texto } = await request.json()

    if (!texto) {
      return NextResponse.json({ error: 'Falta texto' }, { status: 400 })
    }

    const tts = new EdgeTTS()
    await tts.synthesize(texto, VOZ_LAURA, {
      rate: '+15%',
      volume: '+0%',
      pitch: '+0Hz',
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    })

    const audioBuffer = tts.toBuffer()
    const uint8 = new Uint8Array(audioBuffer)

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': uint8.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('TTS Error:', error)
    return NextResponse.json({ error: 'Error generando audio' }, { status: 500 })
  }
}
