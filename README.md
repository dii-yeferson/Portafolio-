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

**Sistema «Aurora Graphite»**, con el mismo ADN de Qurri y Mikuy:

- **Grafito neutro** (`#09090b`, superficies `#121215` → `#212126`) en lugar de fondos teñidos.
- **Una sola firma luminosa**: degradado aurora menta → aqua → cielo → iris, reservado para lo
  importante (rol, botón principal, globo, cifras). **Champán** solo para distinciones.
- **Nunito** con pesos firmes (800–900) y tracking negativo en titulares; etiquetas pequeñas en
  mayúsculas.
- **Vidrio** `blur(22px) saturate(180%)` con brillo superior, radios de 22 px y píldoras.
- **Microinteracciones**: resorte suave, botones que ceden al presionar, luz que sigue al puntero
  en las tarjetas, barrido satinado en los titulares, cifras que cuentan al aparecer, control
  segmentado con indicador deslizante y hojas que suben desde abajo.

| Sección / página    | Contenido                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| Barra superior      | Píldora flotante de vidrio: monograma, navegación con sección activa, buscador (Ctrl/⌘ + K), CV.   |
| Hero                | Disponibilidad, nombre, rol, lema, CTA, cifras clave y **tu retrato con el globo girando detrás**. |
| Sobre mí            | Declaración principal y tres tarjetas: formación, stack técnico y forma de trabajo.                |
| Proyectos           | Filtro segmentado, proyecto insignia a todo lo ancho y grilla de casos.                            |
| Certificaciones     | Lista con ícono tecnológico, emisor, año, sello champán y verificación oficial.                    |
| Contacto            | Invitación, formulario en hoja de vidrio, CV y todas las redes en un solo lugar.                   |
| `/proyectos`        | Catálogo completo con filtros.                                                                     |
| `/proyectos/[slug]` | Estudio de caso: problema, metodología, solución, resultados, métricas, galería y relacionados.    |
| `/certificaciones`  | Catálogo filtrable por categoría y entidad emisora.                                                |
| `/sobre-mi`         | Perfil extendido: formación, habilidades y principios.                                             |

- **Sin repeticiones**: el nombre vive en el hero, las redes en contacto y el pie es mínimo.
- **Adaptable** a teléfono, tablet, laptop y monitores grandes (verificado de 390 a 1440 px y sin
  desbordamiento horizontal en ninguna página).
- **Globo de datos** (`src/components/hero/data-globe.tsx`): continentes como puntos a partir de
  una máscara de 4 KB (`npm run globe:generate`), arcos aurora desde Lima, se puede arrastrar, se
  pausa fuera de pantalla y respeta `prefers-reduced-motion`.
- **Tu foto:** súbela en _Configuración del sitio → Hero → Retrato_. Lo ideal es un PNG vertical
  con fondo transparente (mín. 1200 × 1500 px) para que el globo gire detrás de ti.
- **Sin imágenes todavía:** los proyectos muestran ilustraciones de marca hasta que subas
  portadas reales desde el Studio.

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

| Variable                         | Obligatoria | Uso                                                                    |
| -------------------------------- | ----------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Producción  | URL canónica (SEO, Open Graph, sitemap). Respaldo: dominio de Vercel   |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | Sí          | Proyecto de Sanity                                                     |
| `NEXT_PUBLIC_SANITY_DATASET`     | Sí          | Dataset (por defecto `production`)                                     |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No          | Versión fija de la API (por defecto `2026-10-01`)                      |
| `SANITY_REVALIDATE_SECRET`       | Producción  | Secreto compartido con el webhook (`openssl rand -hex 32`)             |
| `RESEND_API_KEY`                 | No          | Envío del formulario de contacto mediante [Resend](https://resend.com) |
| `CONTACT_FROM_EMAIL`             | No          | Remitente verificado en Resend                                         |
| `CONTACT_TO_EMAIL`               | No          | Destinatario; si falta se usa el correo de _Configuración del sitio_   |

Sin `RESEND_API_KEY`, el formulario responde `503` y la interfaz ofrece el enlace
`mailto:` como alternativa.

## Modelo de contenido (CMS)

| Documento       | Requisito | Reglas de negocio                                                                                                                                                                                   |
| --------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteSettings`  | CMS-01    | **Singleton** (no se puede crear, duplicar ni eliminar). Textos globales, retrato, frases del hero, formación, habilidades, principios, SEO y el **CV en PDF** activo (se valida la extensión).     |
| `project`       | CMS-02    | Estados **Borrador / Publicado / Archivado**: solo `Publicado` es público. Orden por `sortOrder` ascendente. Estructura de estudio de caso: problema, metodología, solución, resultados y métricas. |
| `certification` | CMS-03    | URLs **solo HTTPS**; emisión obligatoria y no futura; vencimiento **opcional** y posterior a la emisión; exige URL de verificación o imagen.                                                        |
| `socialLink`    | CMS-04    | Interruptor de visibilidad; HTTPS para redes y `mailto:` para correo.                                                                                                                               |

Todas las imágenes exigen texto alternativo (accesibilidad). Las categorías y estados
viven en `src/lib/taxonomy.ts`, la única fuente de verdad para el Studio y los filtros.

Tras modificar un esquema o una consulta GROQ, regenera los tipos:

```bash
npm run typegen
```

## Revalidación con webhooks

En _sanity.io/manage → API → Webhooks → Create webhook_:

| Campo       | Valor                                                                 |
| ----------- | --------------------------------------------------------------------- |
| URL         | `https://TU-DOMINIO/api/revalidate`                                   |
| Dataset     | `production`                                                          |
| Trigger on  | Create, Update, Delete                                                |
| Filter      | `_type in ["siteSettings", "project", "certification", "socialLink"]` |
| Projection  | `{_type, _id}`                                                        |
| HTTP method | `POST`                                                                |
| Drafts      | Desactivado                                                           |
| Secret      | El mismo valor de `SANITY_REVALIDATE_SECRET`                          |

Respuestas: `200` revalidado (o tipo ignorado, sin reintentos), `400` cuerpo inválido,
`401` firma inválida o ausente, `500` secreto no configurado.

## API

| Método | Ruta              | Descripción                                                                                                      |
| ------ | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/cv` · `/api/cv` | Descarga directa del CV (redirección `307` al CDN de Sanity con `?dl=CV-Nombre.pdf`); `404` si no hay CV.        |
| `POST` | `/api/contact`    | Formulario de contacto. JSON validado con Zod, honeypot, mismo origen, límite de 10 KB y 5 envíos/10 min por IP. |
| `GET`  | `/api/search?q=`  | Búsqueda con relevancia (GROQ `score`) en proyectos y certificaciones. 60 consultas/min por IP.                  |
| `POST` | `/api/revalidate` | Webhook de Sanity (ver arriba).                                                                                  |
| `GET`  | `/api/health`     | Sonda de disponibilidad.                                                                                         |

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
