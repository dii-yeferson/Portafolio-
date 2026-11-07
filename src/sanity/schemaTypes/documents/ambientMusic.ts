import { PlayIcon } from '@sanity/icons/Play'
import { defineField, defineType } from 'sanity'

import { parseYouTubeId } from '../../../lib/youtube'

/**
 * Música ambiental del sitio (documento único, solo editable desde tu panel).
 * Pega un enlace de YouTube o sube un audio; si hay audio, tiene prioridad
 * porque arranca más rápido y no depende de YouTube.
 */
export const ambientMusic = defineType({
  name: 'ambientMusic',
  title: 'Música ambiental',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'enabled',
      title: 'Activar música ambiental',
      description: 'Apágalo para quitar la música y el botón de sonido del sitio.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'Enlace de YouTube',
      description:
        'Pega el enlace del video, p. ej. https://youtu.be/aIMhtT52fi8. Puedes cambiarlo cuando quieras.',
      type: 'url',
      validation: (rule) =>
        rule
          .uri({ scheme: ['https'] })
          .custom((value) =>
            !value || parseYouTubeId(value) ? true : 'No reconozco ese enlace de YouTube.',
          ),
    }),
    defineField({
      name: 'audioFile',
      title: 'Archivo de audio (opcional)',
      description: 'MP3 u OGG. Si lo subes, se usa en lugar de YouTube.',
      type: 'file',
      options: { accept: 'audio/*' },
    }),
    defineField({
      name: 'volume',
      title: 'Volumen inicial',
      description: 'De 0 a 100. Recomendado: bajo (15–25) para que acompañe sin molestar.',
      type: 'number',
      initialValue: 20,
      validation: (rule) => rule.min(0).max(100).integer(),
    }),
  ],
  preview: {
    select: { enabled: 'enabled', url: 'youtubeUrl' },
    prepare: ({ enabled, url }) => ({
      title: 'Música ambiental',
      subtitle: `${enabled ? 'Activa' : 'Apagada'}${url ? ` · ${url}` : ''}`,
    }),
  },
})
