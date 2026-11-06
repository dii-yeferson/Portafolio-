import '../globals.css'

/** Raíz del panel (`/studio`): documento propio, separado del sitio público bilingüe. */
export default function StudioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-theme="dark">
      <body>{children}</body>
    </html>
  )
}
