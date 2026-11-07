/**
 * Viento sobre la copa del arce (WebGL), sin dependencias: lo usan el
 * componente React del sitio y la vista previa estática.
 *
 * El desplazamiento crece con la distancia al tronco y con la altura: la base
 * queda fija, las ramas oscilan y las puntas un poco más; las hojas tienen un
 * aleteo propio con fase distinta (ruido continuo, sin cortes). No deforma la
 * silueta: el máximo es de unos pocos píxeles.
 */
export type Schedule = (callback: () => void) => () => void

/** Programador por defecto: un `requestAnimationFrame` propio. */
export const rafSchedule: Schedule = (callback) => {
  let id = 0
  const loop = () => {
    callback()
    id = requestAnimationFrame(loop)
  }
  id = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(id)
}

const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_trunk;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 uv = v_uv;
  float height = clamp(1.0 - uv.y, 0.0, 1.0);
  float reach = clamp(abs(uv.x - u_trunk) * 1.3 + height * 0.35, 0.0, 1.0);
  float w = reach * reach;
  float t = u_time;
  float sway = sin(t * 0.62 + uv.x * 1.7) * 0.65 + sin(t * 1.07 + uv.y * 3.3) * 0.35;
  vec2 offset = vec2(sway * 0.0068 * w, sin(t * 0.83 + uv.x * 2.4) * 0.0032 * w);
  vec4 base = texture2D(u_tex, uv + offset);
  float leaf = clamp((base.r - base.g * 0.55 - base.b) * 2.4, 0.0, 1.0);
  float phase = noise(uv * vec2(46.0, 24.0)) * 6.2831;
  offset += vec2(sin(t * 2.3 + phase), cos(t * 1.9 + phase * 1.3)) * 0.0014 * leaf * (0.35 + w);
  gl_FragColor = texture2D(u_tex, uv + offset);
}`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

/**
 * Monta el viento en `canvas` con la textura `src`. Llama a `onLive` cuando
 * el primer cuadro está dibujado (para ocultar la imagen fija de respaldo).
 * Devuelve la función de limpieza. Sin WebGL o con «reducir movimiento» no hace nada.
 */
export function mountCanopy(
  canvas: HTMLCanvasElement,
  {
    src,
    trunk = 0.8373,
    onLive,
    schedule = rafSchedule,
  }: {
    src: string
    trunk?: number
    onLive?: () => void
    schedule?: Schedule
  },
): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
  if (!gl) return () => {}

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return () => {}
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => {}
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  const uTime = gl.getUniformLocation(program, 'u_time')
  gl.uniform1f(gl.getUniformLocation(program, 'u_trunk'), trunk)

  let disposed = false
  let visible = true
  let ready = false
  const start = performance.now()

  function resize() {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))
    gl!.viewport(0, 0, canvas.width, canvas.height)
  }

  function draw() {
    if (!ready || !visible || disposed) return
    gl!.uniform1f(uTime, (performance.now() - start) / 1000)
    gl!.clearColor(0, 0, 0, 0)
    gl!.clear(gl!.COLOR_BUFFER_BIT)
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
  }

  const image = new Image()
  image.decoding = 'async'
  image.src = src
  image.onload = () => {
    if (disposed) return
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    resize()
    ready = true
    draw()
    onLive?.()
  }

  const stop = schedule(draw)
  const resizeObserver = new ResizeObserver(() => {
    resize()
    draw()
  })
  resizeObserver.observe(canvas)
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
  })
  visibility.observe(canvas)

  return () => {
    disposed = true
    stop()
    resizeObserver.disconnect()
    visibility.disconnect()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
