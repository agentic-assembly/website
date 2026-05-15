---
name: news
description: Compile news in the agentic-coding space (Claude Code, OpenAI Codex, Cursor, Cline, Aider, and adjacent tools / research / notable posts) that broke AFTER the most recent past Agentic Assembly — i.e. this week's new material that hasn't been discussed yet. Use whenever the user runs `/news` or asks for "what's new since the last assembly", "what should we cover this week", or "news roundup for the upcoming meetup". Writes the digest into the next upcoming assembly's `index.md` so it's ready for Saturday.
---

# /news — fresh news for the next assembly

## What this skill does

Find news in the agentic-coding space published **after the most recent past assembly's date**, write a structured digest into the **next upcoming assembly's** `index.md`, and populate that entry's `references:` frontmatter with the standout links.

## Inputs

None. The skill is parameterless — it derives everything from the current state of `src/content/assemblies/`.

## Rules

### 1. Establish the floor and target

Read every `src/content/assemblies/*/index.md`. Compute:

- **Floor date** — the `date` of the most recent entry with `date < now`. This is the cutoff: any news item dated on or before the floor is OUT.
- **Target file** — the `index.md` of the entry with the smallest `date >= now`. This is where the digest gets written.

If there is no past entry, set the floor to `now - 7 days`. If there is no upcoming entry, stop and tell the user to run `/schedule` first.

### 2. Search the canonical sources

Run `WebSearch` queries that lean on these domains and dated content. Make these queries in parallel where possible:

| Bucket | Search hints |
| --- | --- |
| **Claude Code** | `site:code.claude.com whats-new`, `site:claude.com blog claude-code`, `site:github.com/anthropics/claude-code releases`, `Claude Code release <Month> <Year>` |
| **Codex / OpenAI** | `site:developers.openai.com codex changelog`, `site:openai.com codex <Month>`, `OpenAI Codex release <Month> <Year>` |
| **Adjacent tools** | `Cursor changelog <Month> <Year>`, `Cline release <Month> <Year>`, `Aider release <Month> <Year>`, `agentic coding news <Month> <Year>` |
| **Research & papers** | `arxiv agentic coding <Month> <Year>`, `arxiv LLM software engineering <Month> <Year>` |
| **Notable posts** | `simonwillison.net <Month> <Year>`, `site:sdtimes.com AI updates <Month> <Year>` |

Substitute `<Month>` and `<Year>` from today's date.

### 3. Filter

For each result:

- **Keep only if** there is an explicit publication date strictly after the floor.
- Drop minor patch notes ("fixed a typo", "bumped dependency"). Keep behavioural changes, new features, model releases, papers, partnerships, or write-ups likely to spark discussion at a Saturday meetup.
- Dedupe by canonical URL and by claim (the same news often appears across several outlets — keep the most primary source).

### 4. Pick the standouts

Choose **3 items** that are the highest-signal — the ones most worth a 5-minute discussion slot. These also become the `references:` in the frontmatter.

### 5. Write into the target file

Open the target file (next-upcoming entry).

**Frontmatter:** add or replace a `references:` array with the 3 standouts:

```yaml
references:
  - title: "<short claim>"
    url: "<canonical url>"
```

Preserve all other frontmatter fields. Keep field order stable: `title`, `date`, `location`, `summary`, `references`.

**Body:** append (or replace, if it already exists) a section delimited by these exact markers so a re-run can find and replace it cleanly:

```markdown
<!-- news:start -->
## News since last assembly

_Floor: <floor-date> (<floor-entry-id>). Generated <today>._

### Claude Code
- [YYYY-MM-DD] short claim — [source](url)

### Codex
- [YYYY-MM-DD] short claim — [source](url)

### Adjacent tools
- [YYYY-MM-DD] short claim — [source](url)

### Research & papers
- [YYYY-MM-DD] short claim — [source](url)

### Notable posts
- [YYYY-MM-DD] short claim — [source](url)

### Topics worth a 5-min slot
1. <topic> — why it matters in one line.
2. <topic> — why it matters in one line.
3. <topic> — why it matters in one line.
<!-- news:end -->
```

On re-run: if the file already contains the `<!-- news:start -->` … `<!-- news:end -->` block, replace it in place. Do not duplicate.

Omit a bucket entirely if there are no items in it. Do not pad with low-signal entries.

### 6. Verify

Run `npm run lint`. Report the target path and a one-line summary of the digest (e.g. `Wrote 7 items across 4 buckets to 262305-shape-of-a-useful-eval/index.md`).

## Item formatting

- **Date**: ISO `YYYY-MM-DD`, the publication date of the item, not today.
- **Claim**: imperative, ≤12 words. "Anthropic shipped Dreaming for cross-session memory." not "Anthropic announced today that they've decided to ship..."
- **Link**: prefer primary sources (vendor blog, changelog, release notes, arXiv) over aggregators.

## Do not

- Do not invent items or dates. If WebSearch returns nothing material, write a digest with empty buckets and say so explicitly.
- Do not include items dated on or before the floor — even if they're great. Those were available at the last assembly.
- Do not touch any file other than the target upcoming entry.
- Do not write the digest if no upcoming entry exists — instead, tell the user to run `/schedule` first.
- Do not change `title`, `date`, `location`, or `summary` of the target. Only `references` and the body marker block.
