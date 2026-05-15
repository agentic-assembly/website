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
- Mono font for any structural/UI text (nav, eyebrows, IDs, metadata); sans for body prose.

## Colour palette — three colours only

Every visible element draws from exactly three colours: **base**, **dim**, **accent** (plus the background).

| Token | Role | Dark | Light |
|---|---|---|---|
| `--ink` | base (body text, headings) | `#e8e3d6` | `#1a1815` |
| `--ink-dim` | dim (secondary text, **all lines and borders**) | `#c8bfac` | `#4a4438` |
| `--accent` | accent (lime — links on hover, highlights, brand mark) | `oklch(0.85 0.20 130)` | `oklch(0.55 0.18 130)` |

`--line` is the only derived value: `color-mix(in oklch, var(--ink-dim), var(--bg) 75%)` — i.e. dim blended toward the background so hairlines stay quiet. It's not a fourth palette colour. Do not introduce additional greys, "muted" variants, "accent-dim", or warning colours; if a new shade feels needed, push back on the design instead.

## Print pages

`/sign` is an A4-landscape print page — light mode, self-contained styles (does not import `global.css`). Print via the browser: File → Print → A4 → Landscape, margins off.
