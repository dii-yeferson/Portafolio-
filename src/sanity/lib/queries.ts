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
    "tagline": select($lang == "en" => coalesce(taglineEn, tagline), tagline),
    "availability": select($lang == "en" => coalesce(availabilityEn, availability), availability),
    "summary": select($lang == "en" => coalesce(summaryEn, summary), summary),
    "heroPhrases": select($lang == "en" && count(heroPhrasesEn) > 0 => heroPhrasesEn, heroPhrases),
    "heroBadges": select($lang == "en" && count(heroBadgesEn) > 0 => heroBadgesEn, heroBadges),
    heroPortrait{ asset, crop, hotspot, alt, "lqip": asset->metadata.lqip },
    "resume": resumeFile.asset->{ url, originalFilename, mimeType, size },
    contactEmail,
    githubUsername,
    education[]{
      _key,
      institution,
      "program": select($lang == "en" => coalesce(programEn, program), program),
      startYear,
      endYear,
      "description": select($lang == "en" => coalesce(descriptionEn, description), description),
      image{ asset, crop, hotspot, alt }
    },
    experience[]{
      _key,
      kind,
      "role": select($lang == "en" => coalesce(roleEn, role), role),
      organization,
      startDate,
      endDate,
      "description": select($lang == "en" => coalesce(descriptionEn, description), description)
    },
    skillGroups[]{ _key, "title": select($lang == "en" => coalesce(titleEn, title), title), skills },
    principles[]{ _key, "title": select($lang == "en" => coalesce(titleEn, title), title), "description": select($lang == "en" => coalesce(descriptionEn, description), description) },
    aboutCopy{ "label": select($lang == "en" => coalesce(labelEn, label), label), "title": select($lang == "en" => coalesce(titleEn, title), title), "description": select($lang == "en" => coalesce(descriptionEn, description), description) },
    projectsCopy{ "label": select($lang == "en" => coalesce(labelEn, label), label), "title": select($lang == "en" => coalesce(titleEn, title), title), "description": select($lang == "en" => coalesce(descriptionEn, description), description) },
    certificationsCopy{ "label": select($lang == "en" => coalesce(labelEn, label), label), "title": select($lang == "en" => coalesce(titleEn, title), title), "description": select($lang == "en" => coalesce(descriptionEn, description), description) },
    contactCopy{ "label": select($lang == "en" => coalesce(labelEn, label), label), "title": select($lang == "en" => coalesce(titleEn, title), title), "description": select($lang == "en" => coalesce(descriptionEn, description), description) },
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
      "title": select($lang == "en" => coalesce(titleEn, title), title),
      "slug": slug.current,
      category,
      "shortDescription": select($lang == "en" => coalesce(shortDescriptionEn, shortDescription), shortDescription),
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
    "title": select($lang == "en" => coalesce(titleEn, title), title),
    "slug": slug.current,
    category,
    "shortDescription": select($lang == "en" => coalesce(shortDescriptionEn, shortDescription), shortDescription),
    "problem": select($lang == "en" && count(problemEn) > 0 => problemEn, problem),
    "approach": select($lang == "en" && count(approachEn) > 0 => approachEn, approach),
    "solution": select($lang == "en" && count(solutionEn) > 0 => solutionEn, solution),
    "results": select($lang == "en" && count(resultsEn) > 0 => resultsEn, results),
    metrics[]{ _key, "label": select($lang == "en" => coalesce(labelEn, label), label), value, "context": select($lang == "en" => coalesce(contextEn, context), context) },
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
    "label": select($lang == "en" => coalesce(labelEn, label), label)
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
    _type == "project" => {
      "title": select($lang == "en" => coalesce(titleEn, title), title),
      "slug": slug.current,
      "shortDescription": select($lang == "en" => coalesce(shortDescriptionEn, shortDescription), shortDescription),
      category
    },
    _type == "certification" => { issuer, category, issueDate, verificationUrl }
  }
`)

/** Recomendaciones aprobadas (verificadas con LinkedIn). */
export const RECOMMENDATIONS_QUERY = defineQuery(`
  *[_type == "recommendation" && status == "approved" && defined(authorName) && defined(message)]
    | order(sortOrder asc, submittedAt desc){
      _id,
      authorName,
      authorPhoto{ asset, crop, hotspot },
      relationship,
      role,
      organization,
      profileUrl,
      message,
      language
    }
`)
