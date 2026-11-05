import { IntentLink } from 'sanity/router'

type Action = {
  title: string
  description: string
  intent: 'edit' | 'create'
  params: Record<string, string>
}

const ACTIONS: Action[] = [
  {
    title: 'Editar mi perfil',
    description:
      'Nombre, foto, frase, disponibilidad, CV, formación, habilidades y textos del sitio.',
    intent: 'edit',
    params: { id: 'siteSettings', type: 'siteSettings' },
  },
  {
    title: 'Nuevo proyecto',
    description: 'Portada, galería, estudio de caso, métricas, demo y repositorio.',
    intent: 'create',
    params: { type: 'project' },
  },
  {
    title: 'Nueva certificación',
    description: 'Emisor, fecha, enlace de verificación e imagen del certificado.',
    intent: 'create',
    params: { type: 'certification' },
  },
  {
    title: 'Nueva red social',
    description: 'LinkedIn, GitHub, YouTube… actívala u ocúltala con un interruptor.',
    intent: 'create',
    params: { type: 'socialLink' },
  },
]

const card: React.CSSProperties = {
  display: 'block',
  padding: '18px 20px',
  borderRadius: 18,
  border: '1px solid var(--card-border-color, rgba(255,255,255,0.1))',
  background: 'var(--card-bg2-color, rgba(255,255,255,0.03))',
  color: 'inherit',
  textDecoration: 'none',
}

/** Pantalla de inicio del panel: accesos rápidos a lo que más se edita. */
export function StudioHome() {
  return (
    <div style={{ padding: 'clamp(20px, 4vw, 40px)', maxWidth: 880, fontFamily: 'inherit' }}>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          opacity: 0.6,
        }}
      >
        Panel de administración
      </p>
      <h1
        style={{
          margin: '10px 0 6px',
          fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        ¿Qué quieres actualizar hoy?
      </h1>
      <p style={{ margin: '0 0 28px', opacity: 0.7, lineHeight: 1.6 }}>
        Edita, pulsa <strong>Publicar</strong> y el sitio se actualiza en segundos. Solo los
        proyectos con estado «Publicado» se muestran al público.
      </p>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {ACTIONS.map((action) => (
          <IntentLink key={action.title} intent={action.intent} params={action.params} style={card}>
            <strong style={{ display: 'block', fontSize: 17, marginBottom: 6 }}>
              {action.title} →
            </strong>
            <span style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
              {action.description}
            </span>
          </IntentLink>
        ))}
        <a href="/" target="_blank" rel="noopener noreferrer" style={card}>
          <strong style={{ display: 'block', fontSize: 17, marginBottom: 6 }}>
            Ver el sitio ↗
          </strong>
          <span style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
            Abre el portafolio público en otra pestaña.
          </span>
        </a>
      </div>
    </div>
  )
}
