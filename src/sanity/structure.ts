import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { CommentIcon } from '@sanity/icons/Comment'
import { CogIcon } from '@sanity/icons/Cog'
import { HeartIcon } from '@sanity/icons/Heart'
import { HomeIcon } from '@sanity/icons/Home'
import { LinkIcon } from '@sanity/icons/Link'
import { ProjectsIcon } from '@sanity/icons/Projects'
import type { StructureResolver } from 'sanity/structure'

import { PROJECT_STATUSES, RECOMMENDATION_STATUSES } from '../lib/taxonomy'
import { apiVersion } from './env'
import { StudioHome } from './studio/studio-home'

const bySortOrder = [{ field: 'sortOrder', direction: 'asc' as const }]

/** Estructura del panel: singleton arriba y proyectos agrupados por estado. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Inicio')
        .id('inicio')
        .icon(HomeIcon)
        .child(S.component(StudioHome).id('inicio-panel').title('Inicio')),
      S.divider(),
      S.listItem()
        .title('Mi perfil y textos')
        .id('siteSettings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Mi perfil y textos'),
        ),
      S.divider(),
      S.listItem()
        .title('Proyectos')
        .id('projects')
        .icon(ProjectsIcon)
        .child(
          S.list()
            .title('Proyectos')
            .items([
              S.listItem()
                .title('Todos')
                .id('projects-all')
                .icon(ProjectsIcon)
                .child(
                  S.documentTypeList('project')
                    .title('Todos los proyectos')
                    .apiVersion(apiVersion)
                    .defaultOrdering(bySortOrder),
                ),
              S.divider(),
              ...PROJECT_STATUSES.map(({ title, value }) =>
                S.listItem()
                  .title(title)
                  .id(`projects-${value}`)
                  .icon(ProjectsIcon)
                  .child(
                    S.documentTypeList('project')
                      .title(title)
                      .apiVersion(apiVersion)
                      .filter('_type == "project" && status == $status')
                      .params({ status: value })
                      .defaultOrdering(bySortOrder),
                  ),
              ),
            ]),
        ),
      S.documentTypeListItem('certification').title('Certificaciones').icon(CheckmarkCircleIcon),
      S.documentTypeListItem('socialLink').title('Redes sociales').icon(LinkIcon),
      S.divider(),
      S.listItem()
        .title('Recomendaciones')
        .id('recommendations')
        .icon(CommentIcon)
        .child(
          S.list()
            .title('Recomendaciones')
            .items(
              RECOMMENDATION_STATUSES.map(({ title, value }) =>
                S.listItem()
                  .title(title)
                  .id(`recommendations-${value}`)
                  .icon(CommentIcon)
                  .child(
                    S.documentTypeList('recommendation')
                      .title(title)
                      .apiVersion(apiVersion)
                      .filter('_type == "recommendation" && status == $status')
                      .params({ status: value }),
                  ),
              ),
            ),
        ),
      S.documentTypeListItem('likeCounter').title('Me gusta').icon(HeartIcon),
    ])
