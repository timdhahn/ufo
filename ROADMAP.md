# Global X-Files Initiative — Roadmap

Design direction: Deep Space + HUD (per provided visuals). Dark, cinematic starfield; cyan/teal neon accents; glassmorphism panels; minimal purple accent for focus states; soft atmospheric glow around the globe.

Goal: MVP with globe hero and 3–5 sample cases, plus core static pages (About, Methodology, Submissions, Privacy). Desktop-first cinematic experience that also performs smoothly on mobile.

---

## Phase 0 — Baseline setup
1. Initialize Next.js + TypeScript + Tailwind (App Router).
2. Establish folder structure for separation of concerns:
   - `src/models/` (TypeScript types & domain models)
   - `src/data/` (static JSON)
   - `src/services/` (data access, transformations)
   - `src/logic/` (domain logic utilities: filtering, formatting, selectors)
   - `src/ui/` (presentational components)
   - `src/app/` (routes, layout)
3. Define `@/` alias for `src/` imports.
4. Add base fonts and color tokens (CSS variables).

Deliverables:
- App builds successfully with TypeScript strict mode.
- Tailwind configured with design tokens.

---

## Phase 1 — Data model + sample content
1. Create `src/models/case.ts`:
   - `id`, `slug`, `title`, `date`, `location`, `coordinates`, `summary`, `severity`, `status`, `media`.
2. Create `src/data/cases.json` with 3–5 sample cases:
   - Include Phoenix Lights and 2–4 additional global examples.
3. Create `src/services/caseService.ts`:
   - `getCases()` returns typed list.
   - `getCaseBySlug(slug)` returns single case.
4. Add `src/logic/caseSelectors.ts`:
   - Sort by date.
   - Filter by severity/status.

Deliverables:
- Static data cleanly loaded and typed.
- Services and selectors tested in isolation (simple unit tests or quick dev checks).

---

## Phase 2 — Layout + visual system
1. App-wide layout in `src/app/layout.tsx`:
   - Global background (starfield + subtle noise).
   - Top-left HUD label: “GLOBAL X-FILES INITIATIVE.”
2. Define UI primitives in `src/ui/`:
   - `GlassPanel`, `NeonButton`, `HudLabel`, `DataPill`.
3. Typography:
   - Title font: display sci-fi (e.g., “Orbitron”).
   - Body font: clean sans (e.g., “Space Grotesk”).
4. Motion:
   - Page load fade + HUD elements stagger in.
   - Subtle pulsing on map markers.

Deliverables:
- Layout matches provided visual direction.
- UI primitives reusable across pages.

---

## Phase 3 — Globe hero (MVP focus)
1. Implement a `GlobeScene` component:
   - Dynamic import to avoid SSR WebGPU issues.
   - Use a WebGPU-first renderer (library choice to be finalized).
2. Render markers from `cases.json`:
   - Neon cyan pulsing dots.
   - Hover to show brief tooltip.
3. Case card overlay:
   - Glass panel with image/video placeholder.
   - “Read More” button linking to case detail.
4. Controls (minimal):
   - Rotate / zoom hints.
   - “Data Filters” button placeholder (non-functional for MVP).

Deliverables:
- Interactive globe with clickable markers.
- 1 selected case displayed in a glass panel overlay.
- Works on desktop and mobile with responsive layout.

---

## Phase 4 — Case detail page
1. Route: `src/app/cases/[slug]/page.tsx`
2. Layout inspired by attached case file mockup:
   - Title, date, location, classification.
   - Media panel (video placeholder).
   - Mission brief block.
   - “Return to Global Map” CTA.
3. Pull data from `caseService`.

Deliverables:
- Case detail page working with static JSON data.
- Styling aligned with HUD/glass aesthetic.

---

## Phase 5 — Static pages
1. `/about`: project overview + mission statement.
2. `/methodology`: how cases are curated + classification.
3. `/submissions`: stylized “redacted” form UI (non-functional).
4. `/privacy`: data + tracking policy placeholder.

Deliverables:
- All pages themed consistently.
- Navigation links available from header or footer.

---

## Phase 6 — Polish + performance
1. Mobile optimization:
   - Reduce globe resolution on small screens.
   - Reposition HUD elements to avoid overlap.
2. Performance:
   - Lazy-load globe.
   - Optimize image sizes with `next/image`.
3. Accessibility:
   - Contrast checks.
   - Focus states with neon outline.

Deliverables:
- Smooth interaction on mobile and desktop.
- Lighthouse baseline pass (no obvious perf regressions).

---

## Phase 7 — Vercel deployment
1. Ensure `AGENTS.md` Vercel setup is accurate.
2. Add `vercel.json` only if custom routing or headers are needed.
3. Deploy to Vercel; attach custom domain.

Deliverables:
- Production deployment live.
- Preview deployments enabled for branches.

---

## Open decisions (to finalize before build)
- WebGPU renderer/library choice (e.g., WebGPU-first engine vs custom renderer).
- Font pairings: Orbitron + Space Grotesk (recommended).
- Whether to include a minimal “stylized satellite toggle” for MVP (UI only).
