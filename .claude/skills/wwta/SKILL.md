---
name: wwta
description: Add a topic to the current (or latest) assembly's "What we talked about" section, live during the event. Use whenever the user runs `/wwta <topic>` or says things like "add X to what we talked about", "log Y to wwta", "we just talked about Z". Does quick research to find a canonical link, writes a house-style discussion-seed paragraph, creates the WWTA section if it doesn't exist yet, then commits and pushes so the live site updates.
---

# /wwta — log a topic to "What we talked about"

## What this skill does

Append a single `### Topic` entry to the **What we talked about** section of the assembly that's happening now (or the most recent one), do a quick web lookup to find a canonical link, write it in the house discussion-seed style, then commit and push so the change shows up live during the meetup.

This is a **fast, live** skill. Do not ask for confirmation — write, commit, push, report. The whole point is to keep up with the room in real time.

## Inputs

Freetext after `/wwta`. Two shapes:

- `/wwta <topic>` — just a topic. e.g. `/wwta cline`
- `/wwta <topic> - <note>` — topic plus a freetext note/attribution/detail to weave in. e.g. `/wwta somesoftware - john said it even works on raspi`

### Parsing topic vs note

Split on the **first** ` - ` (space-hyphen-space), ` — ` (space-em-dash-space), or ` : ` separator. Everything before is the **topic**; everything after is the **note**.

- The topic itself may contain hyphens with no surrounding spaces (`A4-landscape`, `timestamp-based`) — those don't count as separators. Only a spaced ` - ` splits.
- If there's no separator, the whole string is the topic and there's no note.
- A user may also paste an explicit URL anywhere in the input — if so, use it as the link and skip the research step.

## Rules

### 1. Find the target assembly

Read every `src/content/assemblies/*/index.md*` (files are `.mdx`). Pick the target in this priority order:

1. An entry whose `date` falls on the **same calendar day as today** (the live event). This is the normal case — you're doing this during the meetup.
2. Otherwise the **most recent past entry** (largest `date < now`).
3. Otherwise the **nearest upcoming entry** (smallest `date >= now`).

If there are no entries at all, stop and tell the user to run `/schedule` first.

### 2. Research a link (skip if the user supplied a URL)

Run **one or two** quick `WebSearch` queries to find the canonical home for the topic — official site and/or GitHub repo. Keep it light; this is live, not a research project.

- Prefer the **official homepage** and the **primary GitHub repo**. Two links max, joined by ` — `.
- Use the project's real casing for the name (`HeyGen`, `Cline`, `Remotion`, `pgvector`).
- If you genuinely can't find a credible link in one pass, write the entry **without** a link strip rather than guessing or linking an aggregator. A linkless entry is fine (see the `Timestamp-based cutting` entry in aa04 for precedent).

### 3. Write the entry in house style

Match the existing entries in the target's **What we talked about** section exactly. The format is a **discussion seed, not a write-up**:

- A `### Heading` — the topic name in its canonical casing (proper nouns as-is; otherwise sentence case).
- **One short paragraph**, three to six lines: name the *what*, tie it into the room's other threads where natural, and **end with a question** worth 30 seconds at the table.
- If a **note** was supplied, weave it into the paragraph naturally — as attribution ("John flagged it runs even on a Raspberry Pi") or as the detail that makes the point. Don't bolt it on as a separate sentence fragment.
- Links go in a **single ` — `-separated strip at the very end** of the paragraph, never mid-sentence. Every divider is a space-em-dash-space ` — ` per the house design language. No `·`, `|`, `/`.

Example shape (from aa04):

```markdown
### Cline

Back to coding harnesses — Cline as the open-source, VS Code-native agent, often paired with whatever model you bring. Slotted into the Claude Code vs Codex comparison as the BYO-model, fully-in-editor option. Round-the-table on who's running it, and whether open + editor-native wins out over the polish of the hosted harnesses. — [github.com/cline/cline](https://github.com/cline/cline) — [cline.bot](https://cline.bot/)
```

### 4. Place the entry

**If the target already has a `## What we talked about` section:**

- If a `### <topic>` heading already exists in it (case-insensitive match), **augment** that entry — fold the new note/link into the existing paragraph rather than adding a duplicate heading.
- Otherwise append the new `### Topic` block at the **end** of the section (just before the next `##` heading — usually `## Announcements` or the `{/* news:start */}` block).

**If the target has no `## What we talked about` section yet (generate it):**

Insert a new `## What we talked about` section followed by your entry. Placement, in order of preference:

1. Immediately **before `## Announcements`** if that heading exists.
2. Else immediately **before the `{/* news:start */}`** block if present.
3. Else **append to the end** of the file.

Put one blank line above and below the new section, matching the spacing of the rest of the file.

> Note: this is `.mdx`. Comment blocks use JSX comments `{/* ... */}`, not HTML `<!-- -->`. Don't break MDX — keep the section as plain Markdown headings and paragraphs.

### 5. Commit and push — automatically, every single time

After **each** addition, commit and push immediately. This is non-negotiable and unconditional: the live site must reflect every topic the moment it's logged during the event. Never batch multiple topics into one push, never leave a change sitting uncommitted, and never ask whether to push — just do it.

```
git add -A && git commit -m "<target-id>: wwta — <topic>" && git push
```

Use the assembly's display ID (e.g. `AA04`) or folder slug as the prefix. End the commit body with the standard `Co-Authored-By` trailer. If the push fails (e.g. remote moved on), `git pull --rebase` once and push again, then report the result.

### 6. Report

One line: the topic added, the link(s) found (or "no link"), and that it's pushed. e.g. `Added "Cline" to AA04 — linked cline.bot + repo — pushed.`

## Do not

- Do not ask for confirmation — this is a live, fast path.
- Do not invent links or link to aggregators/search results. A linkless entry beats a wrong one.
- Do not write an essay — one short paragraph ending in a question.
- Do not touch any file other than the target assembly's `index.mdx`.
- Do not use `·`, `|`, `/`, or `-` as dividers in the link strip — only ` — `.
