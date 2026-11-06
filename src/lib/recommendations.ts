import { z } from 'zod'

import { RECOMMENDATION_RELATIONSHIPS } from './taxonomy'

export const RECOMMENDATION_LIMITS = {
  role: 80,
  organization: 80,
  message: { min: 40, max: 700 },
  bodyBytes: 8_000,
} as const

const relationships = RECOMMENDATION_RELATIONSHIPS.map((item) => item.value) as [
  (typeof RECOMMENDATION_RELATIONSHIPS)[number]['value'],
  ...(typeof RECOMMENDATION_RELATIONSHIPS)[number]['value'][],
]

const clean = (value: string) => value.replace(/\s+/g, ' ').trim()

/** Perfil público de LinkedIn: https://www.linkedin.com/in/usuario */
export const LINKEDIN_PROFILE_PATTERN =
  /^https:\/\/(?:[a-z]{2,3}\.)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%.]{3,100}\/?$/

export const recommendationSchema = z.object({
  relationship: z.enum(relationships),
  role: z.string().transform(clean).pipe(z.string().min(2).max(RECOMMENDATION_LIMITS.role)),
  organization: z
    .string()
    .optional()
    .transform((value) => (value ? clean(value) : ''))
    .pipe(z.string().max(RECOMMENDATION_LIMITS.organization)),
  profileUrl: z
    .string()
    .optional()
    .transform((value) => value?.trim() ?? '')
    .refine((value) => value === '' || LINKEDIN_PROFILE_PATTERN.test(value)),
  message: z
    .string()
    .transform((value) => value.trim().replace(/\n{3,}/g, '\n\n'))
    .pipe(z.string().min(RECOMMENDATION_LIMITS.message.min).max(RECOMMENDATION_LIMITS.message.max)),
  consent: z.literal(true),
  lang: z.enum(['es', 'en']),
})

export type RecommendationInput = z.infer<typeof recommendationSchema>
