# Portafolio profesional y CMS · Di Yeferson

**Big Data · Ciencia de Datos · IA Aplicada** — _Transformando datos en soluciones reales_

[![CI](https://github.com/dii-yeferson/Portafolio-/actions/workflows/ci.yml/badge.svg)](https://github.com/dii-yeferson/Portafolio-/actions/workflows/ci.yml)

Sitio público de alto rendimiento y CMS headless sin código: el propietario publica
proyectos, certificaciones, redes y CV desde `/studio` sin tocar el código.

| Capa            | Tecnología                                                        |
| --------------- | ----------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, React 19, TypeScript estricto, Turbopack) |
| CMS             | Sanity 6 (Studio embebido en `/studio`), GROQ y Sanity TypeGen    |
| Integración     | `@sanity/client` + `next-sanity` (Studio, webhooks e imágenes)    |
| Diseño          | Tailwind CSS 4 · sistema Aurora Graphite (ADN de Qurri y Mikuy)   |
| Movimiento      | Motion, animaciones CSS por scroll y globo de datos en Canvas 2D  |
| Validación      | Zod 4 (API) y reglas de Sanity con mensajes en español            |
| Calidad         | ESLint 9 (`eslint-config-next`), Prettier, Vitest 5, Playwright   |
| Hosting y CI/CD | Vercel + GitHub Actions + Dependabot                              |

---

## Arquitectura

```text
                    Navegador
                        │
                        ▼
        Next.js 16 · App Router (Vercel Edge)
   ┌────────────────────┼─────────────────────────┐
   │                    │                         │
   ▼                    ▼                         ▼
Páginas (ISR)      Rutas API (/api/*)       Sanity Studio (/studio)
   │                    │                         │
   └──── src/sanity/lib/data.ts (repositorio) ────┤
                        │                         │
                        ▼                         ▼
         Data Cache de Next.js ◄── revalidateTag ── Sanity Content Lake
           (etiquetas por _type)     ▲                     │
                                     └── /api/revalidate ◄─┘ webhook firmado (HMAC)
```

**Flujo de publicación (< 3 minutos):**

1. El propietario edita en `/studio` y pulsa **Publish**.
2. Sanity envía un webhook firmado a `/api/revalidate`.
3. La ruta verifica la firma, espera la consistencia del Content Lake y ejecuta
   `revalidateTag(<_type>, { expire: 0 })`.
4. La siguiente visita regenera la página con datos frescos (ISR). Como respaldo,
   todo el contenido se revalida además cada hora.

Si `NEXT_PUBLIC_SANITY_PROJECT_ID` no está definido, el sitio muestra el **contenido de
demostración** del diseño aprobado (`src/content/demo.ts`) con `noindex`: así se puede revisar
el diseño completo y probarlo en CI sin credenciales. Con el CMS conectado, todo el contenido
sale exclusivamente de Sanity.

## Interfaz

**Vidrio líquido + minimalismo** sobre el sistema «Aurora Graphite».

- **Dos temas:** grafito (oscuro, por defecto) y porcelana (claro). El botón sol / luna revela el
  tema nuevo en un círculo que nace del botón; la elección se recuerda y no hay parpadeo al
  cargar (script en `<head>`). El globo cambia de paleta con el tema.
- **Dos idiomas:** español en `/` e inglés en `/en`, con la misma página al cambiar (ES / EN),
  `hreflang`, sitemap bilingüe y textos del CMS en ambos idiomas (campos _English_; si un campo
  en inglés está vacío se usa el español).
- **Píldora de vidrio** en la barra superior con idioma y tema (también en el menú del celular).
- **Tipografía:** Nunito firme + **serif itálica de acento** (Instrument Serif) + mono en
  mayúsculas para anillos y etiquetas. En cualquier título del panel, lo que va entre asteriscos
  sale en serif itálica: `Proyectos que *resuelven algo.*`
- **Voz:** frases cortas en primera persona repartidas por la página. Sin rayas largas, sin
  comillas angulares y sin listas numeradas: la forma de trabajar es un **subtítulo vivo** en
  serif itálica que cambia solo.

| Sección / página    | Contenido                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Hero                | Tu foto (fondo transparente) delante del globo, **nombre que se arma letra por letra en 3D** y dos anillos de texto. |
| Sobre mí            | Una idea grande, subtítulo vivo, **trayectoria** (experiencia + formación) y con qué trabajas.                       |
| Proyectos           | Filtro segmentado, proyecto insignia, tarjetas con **me gusta** y tus **repositorios de GitHub** al final.           |
| Certificaciones     | Lista con ícono tecnológico, emisor, año y verificación oficial.                                                     |
| Recomendaciones     | Solo aparece cuando apruebas alguna: foto, nombre, cargo y sello **Verificado con LinkedIn**.                        |
| Cierre              | Pieza de movimiento sin nada que tocar: letras que se arman con el scroll y un anillo que gira, hacia el contacto.   |
| Contacto            | Formulario (ventana en computadora, hoja que se arrastra en el celular), CV y redes.                                 |
| `/proyectos/[slug]` | Estudio de caso + **me gusta** + **Publicar en LinkedIn** / copiar enlace / compartir.                               |
| `/recomendar`       | Enlace para que un docente deje su recomendación verificada con LinkedIn.                                            |

### Movimiento (criterios de Emil Kowalski y del recetario de scroll)

- **Lenis sobre el scroll nativo** (nunca virtual), solo con mouse o trackpad: `lerp: 0.09`,
  `syncTouch: false`; en el celular manda la inercia del dedo. Lenis corre dentro del mismo
  bucle de animación de Motion (un solo `requestAnimationFrame`).
- **`position: sticky`** para la escena del cierre (sin pin de JS) y animaciones CSS ligadas al
  scroll (`animation-timeline`), que corren fuera del hilo principal.
- **Solo `transform` y `opacity`.** Curvas fuertes de salida, nada aparece desde `scale(0)`,
  botones que ceden a `0.97`, hover solo con puntero fino y todo respeta «reducir movimiento».
- **Me gusta:** el corazón late, suelta partículas aurora, deja una onda y suena un «pop»
  cristalino sintetizado con Web Audio (sin archivos, volumen bajo).
- **Vaul** para la hoja inferior del formulario en el celular (curva tipo iOS, arrastrar para
  cerrar).
- **Por qué no hay partículas para el nombre:** el globo ya es un campo de partículas; repetir el
  recurso le quitaría fuerza. El nombre usa letras en 3D, que es más limpio.

## Estructura

```text
├── sanity.config.ts            # Studio: esquemas, singleton y herramientas
├── sanity.cli.ts               # CLI: proyecto, extracción de esquema y TypeGen
├── scripts/
│   ├── seed.ts                 # Contenido inicial del diseño (npm run seed)
│   └── generate-globe-mask.mjs # Máscara de continentes del globo
├── src/
│   ├── app/
│   │   ├── (site)/             # Portada, /proyectos, /certificaciones, /sobre-mi
│   │   ├── api/                # revalidate · cv · contact · search · health
│   │   ├── studio/[[...tool]]/ # Sanity Studio embebido
│   │   ├── layout.tsx          # Fuentes, metadatos globales (SEO / OG / Twitter)
│   │   ├── sitemap.ts · robots.ts
│   ├── components/             # UI: hero y globo, secciones, tarjetas, íconos, diálogos
│   ├── content/demo.ts         # Contenido de demostración (solo sin Sanity)
│   ├── lib/                    # Dominio: SEO, contacto, rate limit, búsqueda, URLs
│   └── sanity/
│       ├── env.ts              # Configuración desde variables de entorno
│       ├── lib/                # Cliente, fetch con caché, consultas GROQ, repositorio
│       ├── schemaTypes/        # Modelos CMS-01 … CMS-04
│       ├── structure.ts        # Navegación del Studio
│       └── types.ts            # Tipos generados por Sanity TypeGen (no editar)
└── tests/
    ├── unit/                   # Vitest: dominio, rutas API y contrato del CMS
    └── e2e/                    # Playwright: API + sitio (escritorio y móvil)
```

## Puesta en marcha

Requisitos: **Node.js ≥ 22.12** (ver `.nvmrc`) y npm.

```bash
npm ci
```

1. **Crea el proyecto de Sanity** en [sanity.io/manage](https://www.sanity.io/manage)
   (o con `npx sanity@latest init --bare`) y copia su _Project ID_.
2. **Configura el entorno:**

   ```bash
   cp .env.example .env.local
   ```

   Completa como mínimo `NEXT_PUBLIC_SANITY_PROJECT_ID` y `NEXT_PUBLIC_SANITY_DATASET`.

3. **Autoriza el Studio embebido:** en _sanity.io/manage → API → CORS origins_ agrega
   `http://localhost:3000` y tu dominio de producción con **Allow credentials** activado.
4. **(Opcional) Siembra el contenido del diseño** — textos, proyectos y certificaciones
   como borradores, y las redes (ocultas salvo GitHub) para completar y publicar en `/studio`:

   ```bash
   npx sanity login
   ```

   ```bash
   npm run seed
   ```

5. **Inicia el entorno de desarrollo:**

   ```bash
   npm run dev
   ```

   Sitio: <http://localhost:3000> · CMS: <http://localhost:3000/studio>

## Variables de entorno

| Variable                          | Obligatoria | Uso                                                                      |
| --------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`            | Producción  | URL canónica (SEO, Open Graph, sitemap). Respaldo: dominio de Vercel     |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`   | Sí          | Proyecto de Sanity                                                       |
| `NEXT_PUBLIC_SANITY_DATASET`      | Sí          | Dataset (por defecto `production`)                                       |
| `NEXT_PUBLIC_STUDIO_ADMIN_EMAILS` | Recomendado | Correos que pueden entrar al panel (separados por comas)                 |
| `NEXT_PUBLIC_SANITY_API_VERSION`  | No          | Versión fija de la API (por defecto `2026-10-01`)                        |
| `SANITY_REVALIDATE_SECRET`        | Producción  | Secreto compartido con el webhook (`openssl rand -hex 32`)               |
| `RESEND_API_KEY`                  | No          | Envío del formulario de contacto mediante [Resend](https://resend.com)   |
| `CONTACT_FROM_EMAIL`              | No          | Remitente verificado en Resend                                           |
| `CONTACT_TO_EMAIL`                | No          | Destinatario; si falta se usa el correo de _Configuración del sitio_     |
| `SANITY_API_WRITE_TOKEN`          | No          | Token _Editor_ de Sanity: activa los **me gusta** y las recomendaciones  |
| `AUTH_SECRET`                     | No          | Firma la sesión de LinkedIn (mín. 32 caracteres, `openssl rand -hex 32`) |
| `LINKEDIN_CLIENT_ID`              | No          | App de LinkedIn con «Sign In with LinkedIn using OpenID Connect»         |
| `LINKEDIN_CLIENT_SECRET`          | No          | Secreto de esa app                                                       |
| `GITHUB_TOKEN`                    | No          | Opcional: sube el límite de la API de GitHub (sin permisos)              |

Sin `RESEND_API_KEY`, el formulario responde `503` y la interfaz ofrece el enlace
`mailto:` como alternativa.

## Panel de administración (`/studio`)

Tu panel privado para editar todo el sitio desde el celular o la computadora, en español y con
la identidad del portafolio.

- **Entrar:** abre `https://TU-DOMINIO/studio` e inicia sesión con tu cuenta de Sanity (Google,
  GitHub o correo).
- **Solo tú:** en _sanity.io/manage → Members_ deja únicamente tu cuenta y define
  `NEXT_PUBLIC_STUDIO_ADMIN_EMAILS` con tu correo. Cualquier otra cuenta ve «Acceso restringido».
  El sitio público nunca enlaza al panel y `/studio` no se indexa.
- **Inicio del panel:** accesos rápidos a _Editar mi perfil_, _Nuevo proyecto_, _Nueva
  certificación_, _Nueva red social_ y _Ver el sitio_.
- **Qué puedes editar:** nombre, rol, frase, disponibilidad, foto, insignias del globo, CV en PDF,
  resumen, formación, habilidades, principios, **todos los textos de las secciones**, proyectos
  (portada, galería, estudio de caso, métricas, demo y código), certificaciones y redes.
- **Publicar:** pulsa _Publicar_ y el sitio se actualiza en segundos (webhook de revalidación).
  Cada proyecto tiene _Abrir vista previa_ para verlo en el sitio.

### Recomendaciones verificadas con LinkedIn

1. En [LinkedIn Developers](https://www.linkedin.com/developers/apps) crea una app y activa el
   producto **Sign In with LinkedIn using OpenID Connect**.
2. En _Auth → Authorized redirect URLs_ agrega `https://TU-DOMINIO/api/auth/linkedin/callback`.
3. Define `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `AUTH_SECRET` y
   `SANITY_API_WRITE_TOKEN` (en _sanity.io/manage → API → Tokens_, permiso _Editor_).
4. Comparte `https://TU-DOMINIO/recomendar` con tu docente. Inicia sesión con LinkedIn, escribe y
   la recomendación llega a _Recomendaciones → Pendiente_. Cámbiala a _Aprobada_ para publicarla.

Nadie puede firmar en nombre de otra persona: el nombre y la foto vienen de LinkedIn, no del
formulario. El correo de quien recomienda nunca se guarda. LinkedIn no entrega la URL del perfil
por esta vía, así que la persona puede pegarla (se valida que sea `linkedin.com/in/...`).

### GitHub y me gusta

- **GitHub:** escribe tu usuario en _Contacto y CV → Usuario de GitHub_ (o deja el enlace de
  GitHub en redes). Tus repositorios públicos aparecen solos, sin forks ni archivados, y se
  actualizan cada hora.
- **Me gusta:** con `SANITY_API_WRITE_TOKEN` el conteo se guarda en Sanity (documentos
  `likes-<slug>`, de solo lectura en el panel). Sin el token, el corazón funciona solo en el
  navegador de cada visitante.

## Modelo de contenido (CMS)

| Documento        | Requisito | Reglas de negocio                                                                                                                                                                                   |
| ---------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteSettings`   | CMS-01    | **Singleton** (no se puede crear, duplicar ni eliminar). Textos globales, retrato, frases del hero, formación, habilidades, principios, SEO y el **CV en PDF** activo (se valida la extensión).     |
| `project`        | CMS-02    | Estados **Borrador / Publicado / Archivado**: solo `Publicado` es público. Orden por `sortOrder` ascendente. Estructura de estudio de caso: problema, metodología, solución, resultados y métricas. |
| `certification`  | CMS-03    | URLs **solo HTTPS**; emisión obligatoria y no futura; vencimiento **opcional** y posterior a la emisión; exige URL de verificación o imagen.                                                        |
| `socialLink`     | CMS-04    | Interruptor de visibilidad; HTTPS para redes y `mailto:` para correo.                                                                                                                               |
| `recommendation` | Nuevo     | Llega desde `/recomendar` como **Pendiente**; solo **Aprobada** es pública. Nombre y foto de LinkedIn de solo lectura.                                                                              |
| `likeCounter`    | Nuevo     | Contador de me gusta por proyecto. Lo escribe solo la API.                                                                                                                                          |

Todas las imágenes exigen texto alternativo (accesibilidad). Las categorías y estados
viven en `src/lib/taxonomy.ts`, la única fuente de verdad para el Studio y los filtros.

Tras modificar un esquema o una consulta GROQ, regenera los tipos:

```bash
npm run typegen
```

## Revalidación con webhooks

En _sanity.io/manage → API → Webhooks → Create webhook_:

| Campo       | Valor                                                                                   |
| ----------- | --------------------------------------------------------------------------------------- |
| URL         | `https://TU-DOMINIO/api/revalidate`                                                     |
| Dataset     | `production`                                                                            |
| Trigger on  | Create, Update, Delete                                                                  |
| Filter      | `_type in ["siteSettings", "project", "certification", "socialLink", "recommendation"]` |
| Projection  | `{_type, _id}`                                                                          |
| HTTP method | `POST`                                                                                  |
| Drafts      | Desactivado                                                                             |
| Secret      | El mismo valor de `SANITY_REVALIDATE_SECRET`                                            |

Respuestas: `200` revalidado (o tipo ignorado, sin reintentos), `400` cuerpo inválido,
`401` firma inválida o ausente, `500` secreto no configurado.

## API

| Método | Ruta                                 | Descripción                                                                                                      |
| ------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/cv` · `/api/cv`                    | Descarga directa del CV (redirección `307` al CDN de Sanity con `?dl=CV-Nombre.pdf`); `404` si no hay CV.        |
| `POST` | `/api/contact`                       | Formulario de contacto. JSON validado con Zod, honeypot, mismo origen, límite de 10 KB y 5 envíos/10 min por IP. |
| `GET`  | `/api/search?q=`                     | Búsqueda con relevancia (GROQ `score`) en proyectos y certificaciones. 60 consultas/min por IP.                  |
| `POST` | `/api/revalidate`                    | Webhook de Sanity (ver arriba).                                                                                  |
| `GET`  | `/api/health`                        | Sonda de disponibilidad.                                                                                         |
| `GET`  | `/api/likes?slugs=`                  | Conteos de me gusta (`{ enabled, counts }`). 120 lecturas/min por IP.                                            |
| `POST` | `/api/likes`                         | `{ slug, action: "like" \| "unlike" }`, solo proyectos publicados. 30 votos/min por IP.                          |
| `GET`  | `/api/og` · `/api/og/project/[slug]` | Imágenes 1200 × 630 para compartir (portada y cada proyecto), en `?lang=es\|en`.                                 |
| `GET`  | `/api/auth/linkedin`                 | Inicia sesión con LinkedIn (OpenID Connect, `state` anti-CSRF).                                                  |
| `POST` | `/api/recommendations`               | Guarda una recomendación pendiente; exige la sesión firmada de LinkedIn. 3 envíos/10 min por IP.                 |

Los errores siguen el formato `{ "error": "codigo", "message": "…", ...detalles }`.

## Seguridad

- **Studio privado:** solo los miembros del proyecto en sanity.io/manage pueden iniciar
  sesión; deja como miembro únicamente al propietario. `/studio` envía
  `X-Robots-Tag: noindex` y está bloqueado en `robots.txt`.
- **Cabeceras:** `nosniff`, `SAMEORIGIN`, HSTS, `Referrer-Policy` y `Permissions-Policy`;
  sin `X-Powered-By`.
- **Entradas:** validación con Zod en el servidor, comprobación de origen, honeypot y
  límite de tamaño; los asuntos de correo se limpian para evitar inyección de cabeceras.
- **Enlaces:** el CMS solo acepta HTTPS y el sitio vuelve a filtrar esquemas inseguros;
  los enlaces externos usan `rel="noopener noreferrer"`. El CV solo redirige a
  `cdn.sanity.io` (sin redirecciones abiertas).
- **Rate limit:** ventana deslizante en memoria por instancia. Para un límite global
  multi-instancia, sustitúyelo por un almacén compartido (p. ej. Upstash Redis) con la
  misma interfaz (`src/lib/rate-limit.ts`). En Vercel, `x-forwarded-for` lo fija la
  plataforma; si alojas el sitio en otro lugar, asegúrate de que tu proxy lo sobrescriba.
- **Secretos:** solo en variables de entorno; `.env*.local` está ignorado por git.

## Calidad

| Script                   | Descripción                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `npm run dev`            | Servidor de desarrollo                                       |
| `npm run build`          | Build de producción                                          |
| `npm run check`          | Lint + tipos + formato + pruebas unitarias                   |
| `npm run lint`           | ESLint (Core Web Vitals, TypeScript y reglas de React Hooks) |
| `npm run typecheck`      | Tipos de rutas de Next.js + `tsc --noEmit`                   |
| `npm run format`         | Prettier                                                     |
| `npm test`               | Pruebas unitarias (Vitest)                                   |
| `npm run test:e2e`       | Pruebas E2E (Playwright) sobre el build de producción        |
| `npm run typegen`        | Extrae el esquema y regenera `src/sanity/types.ts`           |
| `npm run seed`           | Contenido inicial idempotente en Sanity                      |
| `npm run globe:generate` | Regenera la máscara de continentes del globo                 |

Las pruebas E2E levantan `next start` automáticamente; ejecuta antes el build:

```bash
npm run build && npm run test:e2e
```

## CI/CD y despliegue

**GitHub Actions** (`.github/workflows/ci.yml`) se ejecuta en cada _pull request_ y en `main`:

1. **Calidad:** ESLint, TypeScript, Prettier, verificación de que los tipos de Sanity
   están actualizados y pruebas unitarias.
2. **Build + E2E:** build de producción y Playwright en Chromium (escritorio y móvil),
   con el reporte como artefacto.

**Vercel:**

1. Importa el repositorio en Vercel (detecta Next.js automáticamente).
2. Define las variables de entorno de la tabla anterior para _Production_ y _Preview_.
3. Configura el dominio personalizado y actualiza `NEXT_PUBLIC_SITE_URL`.
4. Agrega el dominio en los **CORS origins** de Sanity y crea el **webhook** de revalidación.

Dependabot propone actualizaciones semanales agrupadas (Sanity, Next/React y tooling).

## Próximos pasos

1. Conectar Sanity, ejecutar `npm run seed` y completar en `/studio` tu retrato, CV, portadas,
   enlaces de redes y verificación de certificaciones; luego publicar.
2. Desplegar en Vercel con dominio propio y crear el webhook de revalidación.
3. Auditoría Lighthouse sobre el dominio final con el contenido real.
