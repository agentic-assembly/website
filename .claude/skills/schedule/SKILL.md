---
name: schedule
description: Schedule a new Agentic Assembly event from a freetext one-liner. Use whenever the user runs `/schedule` or asks to add/create/schedule an upcoming assembly, even without explicit slash-command syntax (e.g. "add an assembly for May 30 at Nakanoshima about evals"). Parses date, location, and topic, defaults location and time-of-day from the most recent past assembly, then shows the proposed entry and waits for explicit confirmation before writing.
---

# /schedule — create a new assembly entry

## What this skill does

Create a new entry in `src/content/assemblies/<YYDDMM-slug>/index.md` from freetext input. The user provides the freetext after `/schedule`; the rest is your job.

## Inputs

- **Freetext** (may be empty). May mention: a date or weekday, a venue, a topic line.
- The user's invocation may be `/schedule next saturday hommachi prompt caching`, `/schedule`, or natural language ("schedule something for May 30 at Nakanoshima").

## Rules

### 1. Read the floor

Before doing anything else, read `src/content/assemblies/*/index.md` to find:

- **Latest past entry** (`date < now`, sorted DESC) — its `location` and the time-of-day portion of its `date` are your defaults.
- **All existing dates** — to avoid filename collisions.

If there is no past entry, default location to `Hommachi` and time to `10:00:00+09:00` (assemblies are Saturdays 10:00 JST per the site hero).

### 2. Resolve the date

- If freetext names an explicit date (`May 30`, `2026-06-13`, `30/5`), use it.
- If freetext names a weekday (`next saturday`, `this sat`), compute it relative to today.
- Otherwise default to the **next Saturday** after today.
- Always attach the time-of-day from the latest past entry (default `10:00:00+09:00`).
- Always serialize as ISO 8601 with `+09:00` (JST). Example: `2026-05-30T10:00:00+09:00`.

### 3. Resolve location

- If freetext names a venue, use it verbatim (preserve case: `Hommachi`, `Nakanoshima`).
- If freetext says `tbd` / `unknown` / nothing about a venue, use the latest past entry's location (or `Location TBD` as a final fallback).

### 4. Resolve topic and title

- If freetext supplies a topic clause (after `about`, `on`, `topic:`, or just trailing prose), put the full phrase in `summary` and derive a short `title` (3–5 words, Title Case).
- If no topic, leave `summary` out entirely and set `title` to `AA<NN>` where `NN` is one greater than the highest existing `AA` number on the homepage (count = total entries in the collection + 1).

### 5. Compute filename

- `YYDDMM` is **year-day-month** (the project's existing convention; verify by looking at existing filenames like `261305-test-assembly` = 2026-05-13). Pad day and month to 2 digits.
- Slug: kebab-case from the title or topic, max 4 words, lowercase, ASCII only. Strip stopwords if needed. If the title is `AA<NN>`, slug is `aa<nn>` (lowercase).
- Final folder: `src/content/assemblies/<YYDDMM>-<slug>/`.
- If that folder already exists, append `-2`, `-3`, ... until unique.

### 6. Propose, then wait

**Never write the file before the user explicitly confirms.** Output a preview block exactly like:

```
Proposing:
  path: src/content/assemblies/<YYDDMM-slug>/index.md
  ---
  title: "<title>"
  date: <ISO date>
  location: "<location>"
  summary: "<summary>"    # omitted if not set
  ---

Defaults pulled from <latest-past-slug>: location=<...>, time-of-day=<HH:MM>.
Confirm to write, or tell me what to change.
```

Then stop and wait. Only proceed on an affirmative reply (`y`, `yes`, `go`, `lgtm`, `ship it`, etc.). On any edit instruction, regenerate and re-propose.

### 7. Write, then verify

After confirmation:

1. Create the folder and write `index.md` with the frontmatter shown.
2. Run `npm run lint` — Astro's content collection validates the frontmatter on build, but Biome will catch syntax issues fast.
3. Report the new path and the assigned `AA<NN>` ID it will display as.

## Schema reminder

The assemblies schema (`src/content.config.ts`) allows: `title` (required), `date` (required, coerced), `location?`, `summary?`, `references?`, `highlights?`. The schema is `.strict()` — extra fields will fail the build. Only emit fields the user has data for.

## Examples

**Input:** `/schedule next saturday hommachi about prompt caching for agents`

Most recent past entry: `Hommachi`, `10:00:00+09:00`. Today is Wednesday 2026-05-13. Next Saturday is 2026-05-16.

Proposed file: `src/content/assemblies/261605-prompt-caching/index.md`

```yaml
---
title: "Prompt Caching for Agents"
date: 2026-05-16T10:00:00+09:00
location: "Hommachi"
summary: "Prompt caching for agents."
---
```

**Input:** `/schedule`

No freetext. Default everything: next Saturday, location from last past entry, no topic, title `AA<NN>`.

**Input:** `/schedule June 6 Nakanoshima`

Date is given; location is given; no topic. Title = `AA<NN>`, summary omitted.

## Do not

- Do not write the file before the user confirms.
- Do not invent topics, attendees, or references.
- Do not include `references` or `highlights` — those get filled in later, via `/news` or by hand.
- Do not edit `src/pages/index.astro` — it now derives upcoming events from the collection automatically.
