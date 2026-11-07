import { describe, expect, it } from 'vitest'

import { parseYouTubeId } from '@/lib/youtube'

describe('parseYouTubeId', () => {
  it('reconoce los formatos habituales de enlace', () => {
    expect(parseYouTubeId('https://youtu.be/aIMhtT52fi8?si=u77pR_J9nLMpOsaH')).toBe('aIMhtT52fi8')
    expect(parseYouTubeId('https://www.youtube.com/watch?v=aIMhtT52fi8&t=30')).toBe('aIMhtT52fi8')
    expect(parseYouTubeId('https://m.youtube.com/watch?v=aIMhtT52fi8')).toBe('aIMhtT52fi8')
    expect(parseYouTubeId('https://music.youtube.com/watch?v=aIMhtT52fi8')).toBe('aIMhtT52fi8')
    expect(parseYouTubeId('https://www.youtube.com/embed/aIMhtT52fi8')).toBe('aIMhtT52fi8')
    expect(parseYouTubeId('https://youtube.com/shorts/aIMhtT52fi8')).toBe('aIMhtT52fi8')
  })

  it('rechaza enlaces que no son de YouTube o IDs inválidos', () => {
    expect(parseYouTubeId('https://vimeo.com/123')).toBeNull()
    expect(parseYouTubeId('https://youtu.be/corto')).toBeNull()
    expect(parseYouTubeId('javascript:alert(1)')).toBeNull()
    expect(parseYouTubeId('no es un enlace')).toBeNull()
    expect(parseYouTubeId(null)).toBeNull()
  })
})
