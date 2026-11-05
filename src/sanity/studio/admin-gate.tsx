import Link from 'next/link'
import { type LayoutProps, useCurrentUser } from 'sanity'

import { studioAdminEmails } from '../env'
import { isStudioAdmin, parseAdminEmails } from '../lib/admin-access'

const ALLOWED = parseAdminEmails(studioAdminEmails)

/** Bloquea el panel a cualquier cuenta que no esté en NEXT_PUBLIC_STUDIO_ADMIN_EMAILS. */
export function AdminGate(props: LayoutProps) {
  const user = useCurrentUser()
  if (isStudioAdmin(user?.email, ALLOWED)) return props.renderDefault(props)

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#09090b',
        color: '#f4f4f2',
        fontFamily: 'Nunito, ui-sans-serif, system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#6b6b75',
          }}
        >
          Acceso restringido
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', margin: '12px 0' }}>
          Este panel es privado
        </h1>
        <p style={{ color: '#a1a1aa', lineHeight: 1.6 }}>
          La cuenta {user?.email ? <strong>{user.email}</strong> : 'actual'} no tiene permiso para
          administrar el portafolio.
        </p>
        <Link
          href="/"
          style={{ display: 'inline-block', marginTop: 20, color: '#6bdeee', fontWeight: 800 }}
        >
          Volver al sitio
        </Link>
      </div>
    </main>
  )
}
