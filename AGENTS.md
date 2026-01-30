# AGENTS.md

This file documents how to deploy this project to Vercel and the expected configuration.

## Vercel setup (Next.js + TypeScript + SCSS)
- Framework preset: Next.js
- Root directory: repository root (.)
- Build command: `pnpm build`
- Output: `.next` (default)
- Install command: `pnpm install`
- Package manager: PNPM (ensure Vercel project uses PNPM)
- Styling: SCSS modules via `sass` package

## Required environment variables
None for the MVP (static JSON data).

## Optional environment variables (future)
- `NEXT_PUBLIC_APP_ENV`: `development` | `preview` | `production`
- `NEXT_PUBLIC_ANALYTICS_ID`: optional analytics ID

## Vercel project configuration
- Enable "Preview Deployments" for feature branches.
- Enable "Automatic Deployments" on main branch.
- If using Vercel Analytics, enable it in the Vercel project dashboard.

## Images and static assets
- Static assets live in `public/` and are served by Vercel CDN by default.
- For large media, consider Vercel Blob or an external CDN later.

## Routing
- App Router (`src/app`) with static pages:
  - `/` (landing/globe)
  - `/cases/[slug]` (case detail)
  - `/about`
  - `/methodology`
  - `/submissions`
  - `/privacy`

## CI/CD notes
- Keep TypeScript strict mode enabled.
- Use dynamic import for the globe component to avoid SSR issues with WebGL.
- Keep UI broken into reusable components under `src/ui/` and `src/ui/sections/`.

## Local dev commands (expected)
- `pnpm dev` for local development.
- `pnpm build` for production build.
- `pnpm start` for local production preview.

## Domain configuration
- Attach custom domain in Vercel dashboard after first production deployment.
