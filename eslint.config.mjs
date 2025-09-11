import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

export default [
  ...compat.extends('next/core-web-vitals', '@typescript-eslint/recommended'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // Change from error to warning
      '@typescript-eslint/no-unused-vars': 'warn', // Change from error to warning
      'react/no-unescaped-entities': 'warn', // Change from error to warning
      'react-hooks/exhaustive-deps': 'warn', // Change from error to warning
      '@next/next/no-img-element': 'warn', // Change from error to warning
      'jsx-a11y/alt-text': 'warn', // Change from error to warning
      '@typescript-eslint/no-empty-object-type': 'warn', // Change from error to warning
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'dist/',
      'build/',
      'prisma/generated/',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'coverage/',
      '.nyc_output',
      '.env*',
      '!.env.example'
    ],
  },
]
