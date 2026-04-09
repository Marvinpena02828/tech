# Mytechon B2B Platform

Next.js 16 + TypeScript + Supabase application for public catalog and admin CMS operations.

## Stack

- Next.js App Router
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4
- Supabase
- Zod

## Requirements

- Node.js 20+
- npm 10+
- Supabase project and environment variables

## Setup

1. Install dependencies:
   npm install
2. Configure environment variables in local env file.
3. Start development server:
   npm run dev

## Scripts

- npm run dev: Start local development
- npm run build: Build for production
- npm run start: Start production server
- npm run lint: Run ESLint
- npm run optimize-images: Optimize image assets
- npm run optimize-images:dry-run: Preview image optimization changes
- npm run convert-to-avif: Convert supported images to AVIF
- npm run migrate-products: Run product migration helper script

## Architecture Summary

- src/app: Route composition and page entry points
- src/features: Feature-first domain modules (incremental migration in progress)
- src/components: Shared/presentation components
- src/lib: Cross-cutting platform integrations and utilities
- src/actions: Shared server actions

Refer to ARCHITECTURE.md for module boundaries and migration direction.

## Quality Gates

- TypeScript strict mode enabled
- ESLint configured with AppImage import policy
- New code should avoid explicit any in server/data paths

## Contributing

Read CONTRIBUTING.md before opening a pull request.
