'use client'

/**
 * Configuración de Sanity Studio, montado en la ruta `/studio`.
 * Solo los miembros del proyecto en sanity.io/manage pueden iniciar sesión.
 */
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId, studioBasePath } from './src/sanity/env'
import { SINGLETON_ACTIONS, SINGLETON_TYPES, schemaTypes } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'Di Yeferson · CMS',
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
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
})
