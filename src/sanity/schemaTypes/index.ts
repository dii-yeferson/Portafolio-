import type { SchemaTypeDefinition } from 'sanity'

import { ambientMusic } from './documents/ambientMusic'
import { certification } from './documents/certification'
import { likeCounter } from './documents/likeCounter'
import { project } from './documents/project'
import { recommendation } from './documents/recommendation'
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
  ambientMusic,
  recommendation,
  likeCounter,
  seo,
  sectionCopy,
  blockContent,
]

/** Documentos únicos: no se pueden crear, duplicar ni eliminar desde el Studio. */
export const SINGLETON_TYPES: ReadonlySet<string> = new Set([siteSettings.name, ambientMusic.name])

/** Tipos que el panel no permite crear a mano (llegan desde la API del sitio). */
export const API_ONLY_TYPES: ReadonlySet<string> = new Set([recommendation.name, likeCounter.name])

/** Acciones permitidas sobre un singleton. */
export const SINGLETON_ACTIONS: ReadonlySet<string> = new Set([
  'publish',
  'discardChanges',
  'restore',
])
