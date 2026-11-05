import { expect, type Page, test } from '@playwright/test'

import { randomTestIp } from './constants'

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': randomTestIp() })
})

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024

test('la portada muestra hero, globo, secciones y pie con el año actual', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)

  await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty()
  await expect(page.locator('#inicio canvas')).toBeVisible()
  for (const name of ['Sobre mí', 'Proyectos', 'Certificaciones', '¿Trabajamos juntos?']) {
    await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: /Descargar CV/ }).first()).toBeVisible()
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
  await page.getByRole('button', { name: 'Contáctame' }).click()
  const dialog = page.getByRole('dialog', { name: '¿Trabajamos juntos?' })
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
  await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible()
})

test('sin desbordamiento horizontal', async ({ page }) => {
  for (const path of ['/', '/proyectos', '/certificaciones', '/sobre-mi']) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})
