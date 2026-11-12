import { expect, type Page, test } from '@playwright/test'

import { randomTestIp } from './constants'
import { FAKE_YOUTUBE_API } from './fake-youtube'

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': randomTestIp() })
})

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024

test('la portada muestra hero, globo, secciones y pie con el año actual', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)

  await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty()
  // Los estilos cargaron: grafito cálido y Geist.
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 17, 15)')
  await expect(page.locator('body')).toHaveCSS('font-family', /geist/i)
  await expect(page.locator('#inicio canvas')).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Diego Yeferson', exact: true }),
  ).toBeVisible()
  for (const name of [
    'Me gusta que los números cuenten algo.',
    'Proyectos que resuelven algo.',
    'Certificaciones',
    '¿Tienes datos y una pregunta? Hablemos.',
  ]) {
    await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible()
  }
  // El retrato real va delante del globo y nunca hay recomendaciones inventadas.
  await expect(page.getByRole('img', { name: 'Retrato de Diego Yeferson' })).toBeVisible()
  await expect(page.locator('#recomendaciones')).toHaveCount(0)
  // Sin CV cargado en el panel no se ofrece un botón que no descarga nada.
  await expect(page.getByRole('link', { name: /Descargar CV/ })).toHaveCount(0)
  await expect(page.locator('footer')).toContainText(`© ${new Date().getFullYear()}`)
})

test('navegación: menú de escritorio o menú móvil', async ({ page }) => {
  await page.goto('/')
  if (isDesktop(page)) {
    const nav = page.getByRole('navigation', { name: 'Principal' })
    await expect(nav).toBeVisible()
    await nav.getByRole('link', { name: 'Proyectos' }).click()
    await expect(page).toHaveURL(/#proyectos$/)
  } else {
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    const menu = page.getByRole('dialog', { name: 'Menú de navegación' })
    await expect(menu).toBeVisible()
    await menu.getByRole('link', { name: 'Certificaciones' }).click()
    await expect(menu).toBeHidden()
    await expect(page).toHaveURL(/#certificaciones$/)
  }
})

test('metadatos SEO, Open Graph y JSON-LD', async ({ page, request }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/\S/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /\S/)
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', /summary/)
  // La portada es canónica en la raíz del sitio (Next.js omite la barra final).
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /^https?:\/\/[^/]+\/?$/,
  )

  // Sin CMS se muestra contenido de demostración y nunca se indexa.
  const { sanity } = (await (await request.get('/api/health')).json()) as { sanity: string }
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    sanity === 'configured' ? /index, follow/ : /noindex/,
  )

  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
  expect(JSON.parse(jsonLd ?? '{}')).toMatchObject({ '@type': 'Person' })
})

test('los filtros de proyectos actualizan la galería sin recargar', async ({ page }) => {
  await page.goto('/proyectos')
  const filters = page.getByRole('group', { name: 'Filtrar proyectos por categoría' })
  const cards = page.locator('main article')
  const total = await cards.count()
  expect(total).toBeGreaterThan(0)

  await filters.getByRole('button', { name: 'Aplicaciones web' }).click()
  await expect(filters.getByRole('button', { name: 'Aplicaciones web' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect.poll(() => cards.count()).toBeLessThanOrEqual(total)

  await filters.getByRole('button', { name: 'Todos' }).click()
  await expect.poll(() => cards.count()).toBe(total)
})

test('el formulario de contacto (ventana) informa la alternativa si no hay proveedor', async ({
  page,
}) => {
  await page.goto('/#contacto')
  await page.getByRole('button', { name: 'Escríbeme' }).click()
  // Computadora: ventana centrada. Celular: hoja inferior (Vaul).
  const dialog = page.getByRole('dialog', { name: 'Hablemos' })
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Nombre').fill('Visitante E2E')
  await dialog.getByLabel('Correo').fill('visitante@example.com')
  await dialog.getByLabel('Mensaje').fill('Hola, me interesa conversar sobre un proyecto de datos.')
  await dialog.getByRole('button', { name: 'Enviar mensaje' }).click()
  await expect(dialog.getByRole('status')).toContainText('no está disponible')
})

test('el buscador consulta la API y muestra resultados', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Buscar proyectos y certificaciones' }).click()
  const dialog = page.getByRole('dialog', { name: 'Buscar proyectos y certificaciones' })
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Término de búsqueda').fill('python')
  await expect(dialog.getByText(/Sin resultados|Proyecto|Certificación/).first()).toBeVisible()
})

test('páginas internas: proyectos, certificaciones y perfil', async ({ page }) => {
  for (const [path, title] of [
    ['/proyectos', 'Proyectos'],
    ['/certificaciones', 'Certificaciones'],
    ['/sobre-mi', 'Sobre mí'],
  ] as const) {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  }
})

test('un proyecto inexistente responde 404', async ({ page }) => {
  const response = await page.goto('/proyectos/proyecto-que-no-existe')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeVisible()
})

test('sin desbordamiento horizontal', async ({ page }) => {
  for (const path of ['/', '/en', '/proyectos', '/certificaciones', '/sobre-mi', '/recomendar']) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})

test('versión en inglés bajo /en con hreflang y cambio de idioma', async ({ page }) => {
  const response = await page.goto('/en')
  expect(response?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(
    page.getByRole('heading', { level: 2, name: 'Projects that solve something.' }),
  ).toBeVisible()
  await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute(
    'href',
    /^https?:\/\/[^/]+\/?$/,
  )

  await page.goto('/proyectos/qurri')
  await page.getByRole('link', { name: 'English' }).first().click()
  await expect(page).toHaveURL(/\/en\/proyectos\/qurri$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.getByRole('link', { name: 'Español' }).first().click()
  await expect(page).toHaveURL(/\/proyectos\/qurri$/)
})

test('/es responde y declara como canónica la URL sin prefijo', async ({ page }) => {
  const response = await page.goto('/es/proyectos')
  expect(response?.status()).toBe(200)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /[^/]\/proyectos$/)
})

test('modo claro y oscuro: se aplica al instante y se recuerda', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: 'Cambiar a modo claro' }).first().click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 242, 236)')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).first().click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('me gusta: el corazón se marca y se recuerda en este navegador', async ({ page }) => {
  await page.goto('/proyectos/centinela-minero')
  const heart = page.getByRole('button', { name: 'Me gusta Centinela Minero' })
  // Arranca en el número inicial del panel y suma el voto.
  await expect(heart).toContainText('125')
  await heart.click()
  const liked = page.getByRole('button', { name: 'Quitar me gusta de Centinela Minero' })
  await expect(liked).toHaveAttribute('aria-pressed', 'true')
  await expect(liked).toContainText('126')
  await page.reload()
  await expect(liked).toHaveAttribute('aria-pressed', 'true')
  await liked.click()
  await expect(heart).toHaveAttribute('aria-pressed', 'false')
})

test('cada proyecto tiene imagen para compartir y botón de LinkedIn', async ({ page, request }) => {
  await page.goto('/proyectos/qurri')
  await expect(page.getByRole('button', { name: 'Publicar en LinkedIn' })).toBeVisible()
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
  expect(ogImage).toContain('/api/og/project/qurri')
  const image = await request.get(new URL(ogImage ?? '').pathname + '?lang=es')
  expect(image.status()).toBe(200)
  expect(image.headers()['content-type']).toContain('image/png')
})

test('recomendaciones: sin LinkedIn configurado se explica que se activan pronto', async ({
  page,
}) => {
  const response = await page.goto('/recomendar')
  expect(response?.status()).toBe(200)
  await expect(page.getByText('Las recomendaciones se activan muy pronto.')).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})

test.describe('música ambiental', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://www.youtube.com/iframe_api', (route) =>
      route.fulfill({ contentType: 'text/javascript', body: FAKE_YOUTUBE_API }),
    )
  })

  test('si el navegador bloquea el sonido, ofrece «Activar sonido» y luego se puede pausar', async ({
    page,
  }) => {
    await page.goto('/')
    const prompt = page.getByRole('button', { name: 'Activar sonido' }).last()
    await expect(prompt).toBeVisible({ timeout: 8000 })
    await prompt.click()
    const toggle = page.getByRole('button', { name: 'Pausar música' }).first()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await toggle.click()
    await expect(page.getByRole('button', { name: 'Reproducir música' }).first()).toBeVisible()
    // La pausa se recuerda: en la próxima visita no vuelve a sonar sola.
    await page.reload()
    await expect(page.getByRole('button', { name: 'Reproducir música' }).first()).toBeVisible()
    await expect(page.getByText('Activar sonido')).toHaveCount(0)
  })

  test('si el navegador lo permite, suena sola y el botón muestra el ecualizador', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      ;(window as unknown as { __ytAutoplay: boolean }).__ytAutoplay = true
    })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Pausar música' }).first()).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
