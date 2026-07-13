# aa-website

The site for [Agentic Assembly](https://a13y.org) — a bi-weekly Osaka meetup for engineers building with agentic coding tools. Astro 6 + MDX, Tailwind 4, Biome. Deploys to GitHub Pages on push to `master` (CNAME → `a13y.org`).

## Layout

- `src/content/assemblies/<YYDDMM-slug>/index.mdx` — one assembly per directory; first numeric segment is **YYDDMM** (date) plus a slug.
- `src/pages/` — `index.astro` (landing), `[n].astro` (assembly detail at `/1`, `/2`, …), `feedback.astro`, `sign.astro` (A4-landscape print sheet), `dev/screenshots/` (mobile/tablet/desktop captures for `/screenshots`).
- `src/components/` — shared building blocks (`Brand`, `Header`, `Footer`, `Haiku`, `HighlightRail`, …).
- `src/styles/global.css` — single global stylesheet. Don't add per-component CSS.
- `worker/` — Cloudflare Worker that ingests `/feedback` submissions and forwards them to the [`feedback` repo](https://github.com/agentic-assembly/feedback) for aggregation.
- `scripts/screenshots.mjs` — Playwright capture of `/`, `/2`, and `/feedback` across three viewports × dark/light into `dev-screenshots/` (gitignored).

## Scripts

```sh
npm run dev          # astro dev
npm run build        # astro build
npm run preview      # astro preview
npm run check        # astro check (typecheck)
npm run lint         # biome check
npm run fmt          # biome format --write
npm run fix          # biome check --write (lint + format)
npm run screenshots  # capture dev screenshots (requires `npm run dev` running)
```

## Slash-command skills

Living under `.claude/skills/`:

- **`/schedule`** — add the next upcoming assembly from a freetext one-liner. Parses date / location / topic, defaults from the most recent past entry, and waits for confirmation before writing.
- **`/news`** — compile what shipped in the agentic-coding space since the last assembly. Anchors Claude Code and Codex coverage on their GitHub releases pages, casts a wide unscoped net to discover unknown sources, and cross-references for buzz. Writes a marker-delimited section into the next upcoming assembly's `index.mdx`.
- **`/prepare`** — pre-meetup checklist.

## Design language

See [CLAUDE.md](./CLAUDE.md) for the rules: em-dashes as the only divider, exactly three colours (`--ink`, `--ink-dim`, `--accent`), mono font for structural text, sans for prose.
