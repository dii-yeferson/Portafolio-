import { expect, test } from '@playwright/test'

import { randomTestIp } from './constants'

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': randomTestIp() })
})

test('la portada muestra hero, navegación, contacto y pie con el año actual', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)

  await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty()
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '¿Trabajamos juntos?' })).toBeVisible()
  await expect(page.locator('footer')).toContainText(`© ${new Date().getFullYear()}`)
})

test('metadatos SEO, Open Graph y JSON-LD', async ({ page }) => {
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

  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
  expect(JSON.parse(jsonLd ?? '{}')).toMatchObject({ '@type': 'Person' })
})

test('el formulario de contacto informa la alternativa si no hay proveedor', async ({ page }) => {
  await page.goto('/#contacto')
  await page.getByLabel('Nombre').fill('Visitante E2E')
  await page.getByLabel('Correo').fill('visitante@example.com')
  await page.getByLabel('Mensaje').fill('Hola, me interesa conversar sobre un proyecto de datos.')
  await page.getByRole('button', { name: 'Contáctame' }).click()
  await expect(page.getByRole('status')).toContainText('no está disponible')
})

test('el buscador consulta la API y muestra el estado', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Buscar' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Término de búsqueda').fill('python')
  await expect(dialog.getByText(/Sin resultados|Proyecto|Certificación/).first()).toBeVisible()
})

test('un proyecto inexistente responde 404', async ({ page }) => {
  const response = await page.goto('/proyectos/proyecto-que-no-existe')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible()
})

test('sin desbordamiento horizontal', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
