import { defineQuery } from 'groq'

/**
 * Consultas GROQ del sitio público. `defineQuery` permite que Sanity TypeGen
 * genere el tipo exacto del resultado de cada una (`npm run typegen`).
 *
 * Solo se exponen proyectos con estado «Publicado»; los borradores y los
 * archivados nunca salen del Content Lake hacia el sitio.
 */

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    displayName,
    tagline,
    availability,
    summary,
    heroPhrases,
    heroBadges,
    heroPortrait{ asset, crop, hotspot, alt, "lqip": asset->metadata.lqip },
    "resume": resumeFile.asset->{ url, originalFilename, mimeType, size },
    contactEmail,
    education[]{
      _key,
      institution,
      program,
      startYear,
      endYear,
      description,
      image{ asset, crop, hotspot, alt }
    },
    skillGroups[]{ _key, title, skills },
    principles[]{ _key, title, description },
    aboutCopy{ label, title, description },
    projectsCopy{ label, title, description },
    certificationsCopy{ label, title, description },
    contactCopy{ label, title, description },
    seoMeta{
      metaTitle,
      metaDescription,
      keywords,
      twitterHandle,
      ogImage{ asset, crop, hotspot, alt }
    }
  }
`)

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project" && status == "published" && defined(slug.current)]
    | order(sortOrder asc, _createdAt desc){
      _id,
      title,
      "slug": slug.current,
      category,
      shortDescription,
      technologies,
      featured,
      demoUrl,
      codeUrl,
      coverImage{ asset, crop, hotspot, alt, "lqip": asset->metadata.lqip }
    }
`)

export const PROJECT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "project" && status == "published" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    category,
    shortDescription,
    problem,
    approach,
    solution,
    results,
    metrics[]{ _key, label, value, context },
    technologies,
    featured,
    demoUrl,
    codeUrl,
    coverImage{ asset, crop, hotspot, alt, "lqip": asset->metadata.lqip },
    gallery[]{ _key, asset, crop, hotspot, alt, caption, "lqip": asset->metadata.lqip }
  }
`)

export const PROJECT_SLUGS_QUERY = defineQuery(`
  *[_type == "project" && status == "published" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt
  }
`)

export const CERTIFICATIONS_QUERY = defineQuery(`
  *[_type == "certification"] | order(sortOrder asc, issueDate desc){
    _id,
    title,
    issuer,
    category,
    iconKey,
    issueDate,
    expiresAt,
    credentialId,
    verificationUrl,
    featured,
    certificateImage{ asset, crop, hotspot, alt, "lqip": asset->metadata.lqip }
  }
`)

export const SOCIAL_LINKS_QUERY = defineQuery(`
  *[_type == "socialLink" && visibility == true] | order(sortOrder asc){
    _id,
    platformName,
    url,
    iconKey,
    label
  }
`)

/**
 * Búsqueda con relevancia (FR-01). `$term` llega ya saneado desde
 * `buildSearchTerm` (tokens con comodín de prefijo, p. ej. `"centi* mine*"`).
 */
export const SEARCH_QUERY = defineQuery(`
  *[
    (_type == "project" && status == "published" && defined(slug.current)) ||
    _type == "certification"
  ]
  | score(
      boost(title match $term, 4),
      boost(technologies match $term, 2),
      boost(issuer match $term, 2),
      shortDescription match $term,
      category match $term
    )
  [_score > 0]
  | order(_score desc)[0...$limit]{
    _id,
    _type,
    title,
    _score,
    _type == "project" => { "slug": slug.current, shortDescription, category },
    _type == "certification" => { issuer, category, issueDate, verificationUrl }
  }
`)
