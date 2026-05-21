# Project rules — liteapi-supplier-quality-demo

## Deployment

- **Live URL (production, public):** https://dashboard-sandy-theta-24.vercel.app
- **Protected aliases (Vercel SSO required):** https://dashboard-mario-mineiros-projects.vercel.app
- **Vercel project:** `mario-mineiros-projects/dashboard` (id `prj_fOsxJVjFqCAdRG2zcQcgiP7QmMgI`)
- **Production branch:** `master`
- **Root Directory setting:** ⚠️ currently `.` — MUST be `dashboard` for push-to-deploy to work. Change at https://vercel.com/mario-mineiros-projects/dashboard/settings → Root Directory → `dashboard` → Save.
- **Auto-deploy on push:** broken until Root Directory is fixed (or until `.github/workflows/deploy.yml` is wired up with a `VERCEL_TOKEN` repo secret — workflow file is in the repo, just needs the secret).
- **Manual deploy (works today):** the CLI's `vercel deploy --prod` from a clean Windows shell sometimes hangs during upload. Reliable workaround: `vercel redeploy <last-good-url> --target production` rebuilds the last successful deploy in place.

## Dashboard (`dashboard/`) — mobile-first & accessible by default

The Next.js dashboard is a user-facing portal. Any change to it must follow the global portal rules (see user-level `~/.claude/CLAUDE.md`) and the project-specific notes below.

### Known gaps to fix as you touch each area

The existing dashboard was built desktop-only. When you edit a page, leave it more mobile-friendly than you found it. Specifically:

- `app/layout.tsx` renders `<Sidebar />` next to `<main>` in a permanent flex row with `padding: "20px 36px 36px"`. Below `md` (768px) the sidebar must collapse to a drawer triggered by a header hamburger.
- `components/sidebar.tsx` has no `aria-current`, no `<nav>` landmark, and the LIVE/MOCK/DIFF/VISION badges convey state by color only — add text-equivalent semantics.
- `app/globals.css` has zero `@media` queries. Add a small set of breakpoint tokens there rather than scattering inline media queries.
- Data tables on `/pricing`, `/supply-quality`, `/daily-360`, etc. are fixed-width. Wrap in `overflow-x: auto` containers and consider card-reflow below `sm`.
- Inline `style={{}}` is pervasive. When you touch a component, migrate its layout styles to CSS modules or utility classes so responsive variants are possible.

### Definition of done for any dashboard PR

- Renders correctly at 320px, 375px, 768px, 1280px (manual check or Playwright viewport test).
- Tab through the page: every interactive element is reachable, focus is visible, order is logical.
- Lighthouse accessibility score ≥ 95 on the affected page, or a documented reason why not.
- No new fixed pixel widths on layout containers; no new color-only state indicators.

### Python agents (`supplier_quality.py`, `price_competitiveness.py`)

Stdlib-only by design — don't add dependencies. Live calls hit the LiteAPI sandbox; cache responses to `dashboard/public/data/*.json` rather than re-hitting the API from the dashboard at runtime.
