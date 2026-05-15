---
name: prepare
description: Prepare next week's Agentic Assembly entry. Mirrors the most recent past entry's format into a new folder, runs the /news skill to refresh the digest, and asks the user what to drop into Show and Tell. Use whenever the user runs `/prepare` or asks to "draft this week's meetup notes", "prep next Saturday", "set up the next assembly", etc.
---

# /prepare — draft the next assembly entry

## What this skill does

Create a new entry under `src/content/assemblies/<YYDDMM-slug>/index.md` for the next assembly. The skill is **format-agnostic**: it does not know what sections an assembly has. It mirrors whatever the most recent past entry looks like, refreshes the time-bound parts (news, Show and Tell), and lets the user finish the human-voice sections by hand.

If the format changes in any past entry, the next `/prepare` follows automatically. Do not re-encode section names, headings, intro style, or block markers in this file.

## Inputs

- **Freetext** (may be empty). May name a date or weekday (`next saturday`, `2026-06-06`, `30/5`).

## Rules

### 1. Find the template

Read every `src/content/assemblies/*/index.{md,mdx}`. The **template** is the entry with the largest `date < now`.

If there is no past entry, stop and tell the user to scaffold one manually first — `/prepare` needs an exemplar.

### 2. Compute the target

- **Date** — explicit if the freetext provides one; otherwise the next Saturday after today. Time-of-day = template's time-of-day (default `10:00:00+09:00`). Serialize as ISO 8601 with `+09:00`.
- **Folder** — `src/content/assemblies/<YYDDMM>-<slug>/`. `YYDDMM` is the project's year-day-month convention (verify against existing folders). Slug: copy the template's slugging style — if the template ends in a number (e.g. `261605-1`), use `<N+1>`; otherwise default to lowercase `aa<NN>` where `NN` is total entries + 1.
- If the folder already exists, append `-2`, `-3`, … until unique.

### 3. Mirror the template

Read the template's `index.md`. Build the new file by copying it **verbatim**, then making only these targeted edits:

1. **Frontmatter** — keep field order and field names from the template. Update:
   - `title` — set to the next-numbered title in the template's pattern (`AA<NN>`, or copy the template's literal style).
   - `date` — target ISO date.
   - `location` — keep the template's value.
   - `references` — drop the existing list (will be repopulated by `/news`).
   - Any other content-specific fields (`summary`, etc.) — blank the value, keep the key.
2. **Body** — keep verbatim. Do **not** try to detect what's "time-bound" automatically. Steps 4 and 5 refresh the parts that need refreshing; everything else is flagged for a manual pass in step 6.

### 4. Run the `/news` skill

Invoke [[news]]. It detects the new upcoming entry, replaces the `<!-- news:start --> … <!-- news:end -->` block (or the MDX equivalent `{/* news:start */} … {/* news:end */}`), and fills `references:`.

### 5. Draft a haiku (only if the template has a `<Haiku />` component)

If the template's body uses a `<Haiku lines={[...]} />` component (or any equivalent block clearly meant as the week's haiku), propose a draft for the user to edit. **Skip this step entirely if the template has no haiku block** — the user removed it on purpose and `/prepare` should not put it back.

Structure — one item from each bucket, drawn from the freshly-written `/news` digest:

| Line | Syllables | Bucket |
| --- | --- | --- |
| 1 | 5 | **Claude feature** — something from the week's Claude Code release notes / changelog |
| 2 | 7 | **Industry news** — anything else from the digest: other vendors, partnerships, big shifts, papers, mobile / cloud / multi-agent moves |
| 3 | 5 | **Wordplay** — a witty closer; can riff on a theme but should not just enumerate news. The haiku earns the read with this line. |

For each line also draft a one-sentence "why" tying it to the specific news item it's pointing at. Do **not** prefix the "why" with the bucket name (no leading `Claude Feature —`, `Industry News —`, etc.) — the bucket is internal scaffolding for the draft, not user-facing copy.

**Verify syllable counts before proposing.** Read each line aloud (mentally) and count. Fix anything that doesn't sit at 5-7-5. The form is the joke; it can't be off by one.

Show the draft and ask the user to confirm or rewrite. They get final say — treat the lines as their voice, the draft is just a starting block.

### 6. Ask about Show and Tell

Ask the user, verbatim:

> Anything for Show and Tell this week? Drop in member demos, recommended posts/reports, around-town events, anything brought by a specific person. One per line, free form. Reply `none` to skip.

For each non-skipped item, append it under whatever section in the template currently houses Show and Tell — find it by matching the template's headings (do **not** hard-code the heading text). If the template has subsections (member picks, around town, reports, …), drop each item into the best-fitting one; if no good fit, use the most generic-looking one. Preserve attribution: if the user names who brought it, include it in parentheses on the heading or inline.

If the template has no Show-and-Tell-style section at all, append a new section using the template's heading style and ask the user once whether the heading text is right before writing.

### 7. Propose, then write

Show a preview block:

```
Proposing:
  path: src/content/assemblies/<YYDDMM-slug>/index.md
  Template: <template-folder>
  News: <one-line summary from /news>
  Haiku: <line 1> / <line 2> / <line 3>   (or "skipped" if the template has none)
  Show and Tell: <count> items, or "none"

Heads-up — these sections were copied verbatim from the template and likely need a manual pass:
  - <heading 1>
  - <heading 2>
  ...
  (everything that wasn't refreshed by /news, the haiku, or Show and Tell)

Confirm to write, or tell me what to change.
```

Wait for explicit confirmation (`y`, `yes`, `go`, `lgtm`, `ship it`, …). On any edit instruction, regenerate and re-propose.

### 8. After writing

1. Run `npm run lint` for fast schema/Biome validation.
2. Print the new path and remind the user which sections they need to author by hand.

## Do not

- Do not encode any section names, headings, intro style, or block markers in this skill file (other than the haiku-bucket structure in step 5, which the user has chosen as a recurring shape). Read everything else from the template.
- Do not invent prose for the human-voice sections beyond the haiku draft (intros, weekly opener lines, suggested topic prose, etc.). Flag them in the "needs manual pass" list and let the human write them.
- Do not draft a haiku if the template has no `<Haiku />` component — that's an explicit removal signal.
- Do not skip running `/news`.
- Do not skip the Show-and-Tell question.
- Do not write the file before the user confirms.
