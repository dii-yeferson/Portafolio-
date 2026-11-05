/**
 * Sanity Studio embebido en `/studio` (CMS privado). Cualquier subruta la
 * resuelve esta ruta catch-all. El acceso exige iniciar sesión en Sanity
 * con una cuenta que sea miembro del proyecto.
 */
import { NextStudio } from 'next-sanity/studio'

import { isSanityConfigured } from '@/sanity/env'

import config from '../../../../sanity.config'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-6">
        <p className="font-mono text-sm text-champagne">Sanity Studio</p>
        <h1 className="font-display text-3xl font-extrabold">El CMS aún no está configurado</h1>
        <p className="text-muted">
          Define <code className="font-mono text-foreground">NEXT_PUBLIC_SANITY_PROJECT_ID</code> y{' '}
          <code className="font-mono text-foreground">NEXT_PUBLIC_SANITY_DATASET</code> (ver{' '}
          <code className="font-mono text-foreground">.env.example</code>) y vuelve a desplegar.
        </p>
      </main>
    )
  }

  return <NextStudio config={config} />
}
