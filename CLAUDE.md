# Agentic Assembly — website

Astro 6 + Tailwind 4 + MDX. Dark-mode marketing site for a weekly Osaka meetup. Content lives in `src/content/assemblies/*.mdx`.

## Design language — em-dashes

We lean into em-dashes. Hard. They are the house dividers — for titles, metadata strips, eyebrows, footers, signage, anything. Where you'd normally reach for a middle dot (`·`), a slash, a pipe, or a comma — use ` — ` (space, em-dash, space) instead. Taking the piss is the point.

Rules:

- Every divider is an em-dash. Use ` — `, never `·`, `|`, `/`, or `-` for separating items in a list-of-three style strip.
- Hyphens stay hyphens (`A4-landscape`, `light-mode`). Ranges stay tildes or en-dashes per existing convention (`10:00 ~ 12:00`).
- If something already uses an em-dash (e.g. the page `<title>`), don't downgrade it.
- Printed signage follows the same rule — em-dashes on the sign too.

## Conventions

- Styles live in `src/styles/global.css` — single global stylesheet, not per-component.
- The accent colour is `oklch(0.85 0.20 130)` (lime) on dark mode, slightly desaturated for light contexts (e.g. the sign).
- Mono font for any structural/UI text (nav, eyebrows, IDs, metadata); sans for body prose.

## Print pages

`/sign` is an A4-landscape print page — light mode, self-contained styles (does not import `global.css`). Print via the browser: File → Print → A4 → Landscape, margins off.
