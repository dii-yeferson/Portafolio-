import type { CertificationView } from '@/components/certifications/certifications-grid'
import type { CertificationItem } from '@/sanity/lib/data'

import { formatMonthYear, isExpired } from './format'

/**
 * Prepara las certificaciones para la interfaz. El vencimiento y la fecha
 * legible se calculan en el servidor para evitar diferencias de hidratación.
 */
export function toCertificationViews(items: CertificationItem[]): CertificationView[] {
  return items.map((item) => ({
    ...item,
    expired: isExpired(item.expiresAt),
    issuedLabel: formatMonthYear(item.issueDate),
  }))
}
