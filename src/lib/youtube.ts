/**
 * Extrae el ID de un video de YouTube de cualquier enlace habitual:
 * youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, /live/ID y music.youtube.com.
 */
const ID = /^[A-Za-z0-9_-]{11}$/

export function parseYouTubeId(value: string | null | undefined): string | null {
  const input = value?.trim()
  if (!input) return null
  let url: URL
  try {
    url = new URL(input)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.replace(/^(www|m|music)\./, '')
  let id: string | null = null
  if (host === 'youtu.be') id = url.pathname.split('/')[1] ?? null
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const [, first, second] = url.pathname.split('/')
    if (first === 'watch') id = url.searchParams.get('v')
    else if (first === 'embed' || first === 'shorts' || first === 'live' || first === 'v')
      id = second ?? null
  }
  return id && ID.test(id) ? id : null
}
