import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // En @sanity/icons v5 la raíz ya no exporta íconos (sus tipos son `never`).
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@sanity/icons',
              message:
                "Importa cada ícono desde su subruta, p. ej. import { CogIcon } from '@sanity/icons/Cog'.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
    'src/sanity/types.ts',
  ]),
])

export default eslintConfig
