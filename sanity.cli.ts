import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineCliConfig({
  api: { projectId, dataset },
  schemaExtraction: {
    path: './src/sanity/extract.json',
    enforceRequiredFields: true,
  },
  typegen: {
    path: './src/**/*.{ts,tsx}',
    schema: './src/sanity/extract.json',
    generates: './src/sanity/types.ts',
    overloadClientMethods: true,
  },
})
