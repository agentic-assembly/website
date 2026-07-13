---
name: news
description: Compile news in the agentic-coding space (Claude Code, OpenAI Codex, Cursor, Cline, Aider, and adjacent tools / research / notable posts) that broke AFTER the most recent past Agentic Assembly — i.e. new material since the last event that hasn't been discussed yet. Use whenever the user runs `/news` or asks for "what's new since the last assembly", "what should we cover next", or "news roundup for the upcoming meetup". Writes the digest into the next upcoming assembly's `index.md` so it's ready for Saturday.
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

If there is no past entry, set the floor to `now - 14 days` (bi-weekly cadence). If there is no upcoming entry, stop and tell the user to run `/schedule` first.

### 2. Cast a wide net first

**Before any scoped search**, fish for unknown sources. The point is to *discover* the source landscape for this week — not to retrieve everything from a list of domains you already trust. Outlets, individual newsletters, surprise blog posts, and one-off threads will not show up in `site:` queries you didn't write.

Run several broad `WebSearch` queries in parallel, all *unscoped*. Vary the phrasing — different wordings pull different domains:

- `agentic coding news <Month> <Year>`
- `AI coding tools updates this week <Month> <Year>`
- `Claude Code OR Codex OR Cursor release <Month> <Year>`
- `LLM software engineering news <Month> <Year>`
- `what shipped in AI coding <Month> <Year>`
- `agentic AI weekly roundup <Month> <Year>`

Substitute `<Month>` and `<Year>` from today's date.

From the combined results, harvest:

- Any **dated** post (publication date strictly after the floor).
- The **source domains** themselves — a domain you didn't expect (e.g. a Substack, a personal blog, a new newsletter, a YouTube channel transcript) is a finding in its own right. Add it to the candidate pool for step 4's targeted gap-filling.
- Any **named feature or release** mentioned in passing — these become cross-reference seeds in step 5.

Apply the same notability filter that step 3 uses (behavioural change > bug fix). Don't try to be comprehensive yet; this step is recall-oriented.

### 3. Pull primary release notes from GitHub

Claude Code and the OpenAI Codex CLI both publish authoritative, dated, structured changelogs on GitHub. **Anchor your Claude Code / Codex coverage here** — these are the ground truth, not press coverage. `WebFetch` them in parallel:

| Tool | Releases URL |
| --- | --- |
| **Claude Code** | `https://github.com/anthropics/claude-code/releases` |
| **Codex CLI** | `https://github.com/openai/codex/releases` |

For each releases page:

- Extract every release entry on the page (tag, publish date, title, body).
- **Keep only entries with `publish_date > floor`**. Discard anything dated on or before the floor — those were already discussable.
- From each kept release, pull out **notable line items** from the changelog body. A line is notable if it describes a *behavioural* change: new tool, new flag/command, new model wiring, new permission model, new SDK surface, new UI affordance, new MCP capability, new sub-agent type, billing change, model deprecation. Skip pure bug fixes, dependency bumps, lint/format/CI tweaks, internal refactors, and typos.
- **Specifically harvest new or expanded slash commands, `claude ...` subcommands, AND important new features** for Claude Code — e.g. `/goal`, `/loop`, `/ultrareview`, `claude agents`, `claude plugin details`, but also default-model changes (Fast mode → Opus 4.7), new hook surfaces (`terminalSequence`), new rewind options, projected context-cost displays. These go into a dedicated `### New Claude Code commands & features` bucket that appears **first** in the output (right after the floor line) — the room cares about what they can now do at the prompt more than about plumbing fixes or industry-deal news. Treat the same way for Codex when it adds commands or features (`/hooks`, `codex remote-control`, etc.) — surface those at the top of the Codex bucket.
- Preserve the version tag so you can attribute the claim (e.g. "claude-code@1.0.34 — added /resume").

If a release page paginates and the floor predates the visible window, follow the "Older" pagination once. Don't recurse deeper than two pages — that's already weeks of history.

### 4. Fill gaps with targeted scoped searches

Now lean on domains you already know are reliable. Use these as a **safety net** to catch anything the wide-net pass missed — not as your primary source list. Run `WebSearch` queries in parallel:

| Bucket | Search hints |
| --- | --- |
| **Claude Code blog/docs** | `site:code.claude.com whats-new`, `site:claude.com blog claude-code <Month> <Year>` (catches feature posts that don't appear in the GitHub changelog) |
| **Codex blog/docs** | `site:developers.openai.com codex changelog`, `site:openai.com codex <Month> <Year>` |
| **Adjacent tools** | `Cursor changelog <Month> <Year>`, `Cline release <Month> <Year>`, `Aider release <Month> <Year>` |
| **Simon Willison** | `site:simonwillison.net <Month> <Year>` — Simon publishes nearly every day and is a primary signal for what the LLM-tools community is paying attention to. Always check him separately. |
| **Research & papers** | `arxiv agentic coding <Month> <Year>`, `arxiv LLM software engineering <Month> <Year>` |
| **Notable posts** | `Hacker News agentic coding <Month> <Year>`, vendor blogs not covered above, named author write-ups surfaced in step 2 |

Also follow up on any **new source domains** that the wide-net step surfaced — if step 2 turned up a Substack you didn't know existed, fetch it directly and scan for dated posts.

Substitute `<Month>` and `<Year>` from today's date. Apply the same date-floor and notability filter as steps 2 and 3.

### 5. Cross-reference to find the important ones

Raw changelogs over-report — every release dumps a dozen items, most of which won't matter to the room. The signal you want is: **which of these features are people actually talking about?**

For each candidate Claude Code or Codex feature from step 3, run a focused `WebSearch` for the feature name (e.g. `"claude code subagents"`, `"codex --full-auto"`, `"claude code MCP resources"`) restricted to the same time window. Reuse the wide-net hits from step 2 as evidence too — anything that *already* surfaced in an unscoped search is itself a signal of buzz. Then weight:

- **High signal** — covered by Simon Willison, Hacker News front page, a dedicated blog post, multiple independent write-ups, or surfaced naturally in step 2's wide net. Likely worth a discussion slot.
- **Medium signal** — mentioned in one secondary write-up, or generates obvious Twitter/X chatter.
- **Low signal** — appears only in the official release notes. Still worth a one-line mention in its bucket; not a topic slot.

Dedupe across steps 2–5 by canonical URL and by claim — the same feature often appears in the GitHub release, a vendor blog, a wide-net hit, and a Simon Willison roundup. Keep the most primary source (GitHub release > vendor blog > third-party coverage).

### 6. Pick the standouts

Choose **3 items** that are the highest-signal under the cross-reference weighting from step 5 — the ones most worth a 5-minute discussion slot. Prefer items where the *primary source* is a Claude Code or Codex GitHub release AND there is independent coverage confirming people care. These also become the `references:` in the frontmatter — link to the GitHub release tag URL when that's the primary source.

### 7. Write into the target file

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

### New Claude Code commands & features
- **`/command` or feature name** (v.X.Y.Z, YYYY-MM-DD) — one-line description of what it does and when you'd use it — [release](url)

### Claude Code — other notes
- [YYYY-MM-DD] short claim about industry / billing / partnerships / non-feature release notes — [source](url)

### Codex
- [YYYY-MM-DD] short claim — [source](url)

### Adjacent tools
- [YYYY-MM-DD] short claim — [source](url)

### Simon says
- [YYYY-MM-DD] short claim — [post](https://simonwillison.net/...)

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

### 8. Verify

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
