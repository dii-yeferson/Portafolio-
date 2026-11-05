/**
 * Pruebas de contrato del CMS: verifican que los esquemas de Sanity cumplen
 * los campos y reglas de negocio de la sección 3.2 del PRD (CMS-01 a CMS-04).
 */
import { describe, expect, it, vi } from 'vitest'

vi.mock('sanity', () => ({
  defineType: <T>(value: T) => value,
  defineField: <T>(value: T) => value,
  defineArrayMember: <T>(value: T) => value,
  defineConfig: <T>(value: T) => value,
  buildLegacyTheme: () => ({}),
  useCurrentUser: () => null,
}))
vi.mock('sanity/router', () => ({ IntentLink: () => null }))
vi.mock('@sanity/locale-es-es', () => ({ esESLocale: () => ({ name: 'es-ES' }) }))
vi.mock('sanity/structure', () => ({ structureTool: () => ({ name: 'structure' }) }))
vi.mock('@sanity/vision', () => ({ visionTool: () => ({ name: 'vision' }) }))

const { schemaTypes, SINGLETON_TYPES } = await import('@/sanity/schemaTypes')
const { PROJECT_CATEGORIES, PROJECT_STATUSES } = await import('@/lib/taxonomy')
const { default: studioConfig } = await import('../../sanity.config')

type Field = {
  name: string
  type: string
  initialValue?: unknown
  validation?: (rule: unknown) => unknown
}
type DocumentType = { name: string; fields: Field[]; validation?: (rule: unknown) => unknown }

function getDocument(name: string): DocumentType {
  const type = schemaTypes.find((schemaType) => schemaType.name === name)
  if (!type) throw new Error(`No existe el esquema ${name}`)
  return type as unknown as DocumentType
}

function getField(documentName: string, fieldName: string): Field {
  const field = getDocument(documentName).fields.find((item) => item.name === fieldName)
  if (!field) throw new Error(`No existe ${documentName}.${fieldName}`)
  return field
}

/** Ejecuta una regla de validación de Sanity y registra los métodos invocados. */
function recordRule(validation: Field['validation']) {
  const calls: { method: string; args: unknown[] }[] = []
  const rule: Record<string, unknown> = new Proxy(
    {},
    {
      get:
        (_target, method) =>
        (...args: unknown[]) => {
          calls.push({ method: String(method), args })
          return rule
        },
    },
  )
  validation?.(rule)
  return calls
}

const fieldNames = (name: string) => getDocument(name).fields.map((field) => field.name)

describe('CMS-01 · siteSettings', () => {
  it('incluye los campos del PRD', () => {
    expect(fieldNames('siteSettings')).toEqual(
      expect.arrayContaining([
        'displayName',
        'tagline',
        'summary',
        'heroPortrait',
        'heroPhrases',
        'resumeFile',
        'contactEmail',
        'seoMeta',
      ]),
    )
  })

  it('es un singleton: no se puede crear ni eliminar desde el Studio', () => {
    expect(SINGLETON_TYPES.has('siteSettings')).toBe(true)

    const config = studioConfig as unknown as {
      schema: { templates: (templates: { schemaType: string }[]) => { schemaType: string }[] }
      document: {
        actions: (
          actions: { action?: string }[],
          context: { schemaType: string },
        ) => { action?: string }[]
      }
    }
    const templates = config.schema.templates([
      { schemaType: 'siteSettings' },
      { schemaType: 'project' },
    ])
    expect(templates).toEqual([{ schemaType: 'project' }])

    const all = ['publish', 'unpublish', 'delete', 'duplicate', 'discardChanges', 'restore'].map(
      (action) => ({ action }),
    )
    expect(
      config.document.actions(all, { schemaType: 'siteSettings' }).map((a) => a.action),
    ).toEqual(['publish', 'discardChanges', 'restore'])
    expect(config.document.actions(all, { schemaType: 'project' })).toHaveLength(all.length)
  })

  it('el CV acepta solo PDF', () => {
    const field = getField('siteSettings', 'resumeFile') as Field & {
      options?: { accept?: string }
    }
    expect(field.type).toBe('file')
    expect(field.options?.accept).toBe('application/pdf')
  })
})

describe('CMS-02 · project', () => {
  it('incluye los campos del PRD', () => {
    expect(fieldNames('project')).toEqual(
      expect.arrayContaining([
        'title',
        'slug',
        'category',
        'shortDescription',
        'problem',
        'approach',
        'results',
        'technologies',
        'coverImage',
        'gallery',
        'demoUrl',
        'codeUrl',
        'featured',
        'status',
        'sortOrder',
      ]),
    )
  })

  it('estados Borrador / Publicado / Archivado con borrador por defecto', () => {
    expect(PROJECT_STATUSES.map((status) => status.title)).toEqual([
      'Borrador',
      'Publicado',
      'Archivado',
    ])
    expect(getField('project', 'status').initialValue).toBe('draft')
  })

  it('categorías de filtrado del PRD', () => {
    expect(PROJECT_CATEGORIES.map((category) => category.title)).toEqual([
      'Machine Learning',
      'Big Data',
      'Power BI',
      'Aplicaciones web',
      'Tesis',
    ])
  })

  it.each(['demoUrl', 'codeUrl'])('%s exige HTTPS', (name) => {
    const calls = recordRule(getField('project', name).validation)
    expect(calls).toContainEqual({ method: 'uri', args: [{ scheme: ['https'] }] })
  })
})

describe('CMS-03 · certification', () => {
  it('incluye los campos del PRD', () => {
    expect(fieldNames('certification')).toEqual(
      expect.arrayContaining([
        'title',
        'issuer',
        'category',
        'issueDate',
        'expiresAt',
        'credentialId',
        'verificationUrl',
        'certificateImage',
        'featured',
        'sortOrder',
      ]),
    )
  })

  it('verificationUrl exige HTTPS estricto', () => {
    const calls = recordRule(getField('certification', 'verificationUrl').validation)
    expect(calls).toContainEqual({ method: 'uri', args: [{ scheme: ['https'] }] })
  })

  it('la fecha de vencimiento no es obligatoria y la de emisión sí', () => {
    const expiresCalls = recordRule(getField('certification', 'expiresAt').validation)
    expect(expiresCalls.map((call) => call.method)).not.toContain('required')
    const issueCalls = recordRule(getField('certification', 'issueDate').validation)
    expect(issueCalls.map((call) => call.method)).toContain('required')
  })

  it('exige URL de verificación o imagen del certificado', () => {
    const calls = recordRule(getDocument('certification').validation)
    const custom = calls.find((call) => call.method === 'custom')?.args[0] as (
      doc: unknown,
    ) => true | string
    expect(custom({ _id: 'c1' })).toMatch(/URL de verificación o una imagen/)
    expect(custom({ verificationUrl: 'https://example.com/v/1' })).toBe(true)
    expect(custom({ certificateImage: { asset: { _ref: 'image-1' } } })).toBe(true)
  })
})

describe('CMS-04 · socialLink', () => {
  it('incluye los campos del PRD', () => {
    expect(fieldNames('socialLink')).toEqual(
      expect.arrayContaining([
        'platformName',
        'url',
        'iconKey',
        'label',
        'visibility',
        'sortOrder',
      ]),
    )
  })

  it('la visibilidad es un interruptor activado por defecto', () => {
    const field = getField('socialLink', 'visibility')
    expect(field.type).toBe('boolean')
    expect(field.initialValue).toBe(true)
  })
})
