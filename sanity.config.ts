'use client'

/**
 * Configuración de Sanity Studio, montado en la ruta `/studio`.
 * Solo los miembros del proyecto en sanity.io/manage pueden iniciar sesión.
 */
import { esESLocale } from '@sanity/locale-es-es'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId, studioBasePath } from './src/sanity/env'
import { SINGLETON_ACTIONS, SINGLETON_TYPES, schemaTypes } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'
import { AdminGate } from './src/sanity/studio/admin-gate'
import { StudioIcon } from './src/sanity/studio/studio-icon'
import { studioTheme } from './src/sanity/studio/theme'

/** URL pública de un documento, para el botón «Abrir vista previa». */
function siteUrlFor(document: { _type: string; slug?: { current?: string } }) {
  if (typeof window === 'undefined') return undefined
  const origin = window.location.origin
  if (document._type === 'project' && document.slug?.current)
    return `${origin}/proyectos/${document.slug.current}`
  if (document._type === 'certification') return `${origin}/certificaciones`
  return `${origin}/`
}

export default defineConfig({
  name: 'default',
  title: 'Di Yeferson · Panel',
  icon: StudioIcon,
  theme: studioTheme,
  basePath: studioBasePath,
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Los singletons no aparecen en «Crear documento».
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    // Los singletons solo se pueden publicar, descartar cambios o restaurar.
    actions: (actions, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : actions,
    productionUrl: async (previous, { document }) =>
      siteUrlFor(document as { _type: string; slug?: { current?: string } }) ?? previous,
  },
  studio: {
    components: { layout: AdminGate },
  },
  plugins: [
    structureTool({ structure, title: 'Contenido' }),
    visionTool({ defaultApiVersion: apiVersion, title: 'Consultas' }),
    esESLocale(),
  ],
})
