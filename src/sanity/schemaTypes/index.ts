import type { SchemaTypeDefinition } from 'sanity'

import { certification } from './documents/certification'
import { project } from './documents/project'
import { siteSettings } from './documents/siteSettings'
import { socialLink } from './documents/socialLink'
import { blockContent } from './objects/blockContent'
import { sectionCopy } from './objects/sectionCopy'
import { seo } from './objects/seo'

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  project,
  certification,
  socialLink,
  seo,
  sectionCopy,
  blockContent,
]

/** Documentos únicos: no se pueden crear, duplicar ni eliminar desde el Studio. */
export const SINGLETON_TYPES: ReadonlySet<string> = new Set([siteSettings.name])

/** Acciones permitidas sobre un singleton. */
export const SINGLETON_ACTIONS: ReadonlySet<string> = new Set([
  'publish',
  'discardChanges',
  'restore',
])
