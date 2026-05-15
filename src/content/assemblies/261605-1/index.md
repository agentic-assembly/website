---
title: "Hello, AA"
date: 2026-05-16T10:00:00+09:00
location: "The DECK"
references:
  - title: "Anthropic — Agent SDK on your Claude plan (June 15 split)"
    url: "https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan"
  - title: "Simon Willison — The Unreasonable Effectiveness of HTML"
    url: "https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/"
  - title: "Claude Code changelog"
    url: "https://code.claude.com/docs/en/changelog"
---

> Receipts come for code — whatever was there gets loud — HTML wins.

## Suggested Topics

1. **How are you using coding agents?** — round-the-table opener. Which tools, which loops, what's actually shipped vs. what's still vibes? What got dropped this week and why?
2. **Agent SDK billing split (June 15)** — production `claude -p` cron jobs and GitHub Actions come off the subscription pool onto a separate monthly credit at standard API rates. Who's running what, and what does the math look like at Pro $20 / Max $100–$200 / Team $100 per seat?
3. **Claude Code commands** — what custom slash commands has everyone built, which ones earned their keep, and which ones got deleted in a week?
4. **DORA on AI ROI (Robert)** — Robert brings the two DORA reports. The amplifier thesis, the J-curve, the −$344k stability tax. Does the room buy it? Where do our own setups fall on the loose/tight-coupling axis?
5. **The unreasonable effectiveness of HTML** — Simon's case for asking Claude for HTML over Markdown — SVG diagrams, widgets, sliders. Is anyone using this in real workflows?
6. **CAD agent demo** — member demo — [Adam-CAD/CADAM](https://github.com/Adam-CAD/CADAM).

## Show and Tell

### Reports — DORA (via Robert)
- **DORA — ROI of AI-assisted Software Development** (Google Cloud, updated 2026-04-22) — [report](https://dora.dev/ai/roi/report/) · [calculator](https://dora.dev/ai/) — TLDR: AI is an *amplifier*; the ROI comes from platform quality, workflow clarity, and team alignment, not the tool. Models a J-curve (productivity dip before upside) and ships an interactive calculator — run conservative / realistic / optimistic and present finance a range. The catch: AI adoption correlates with *increased* delivery instability — the sample calc shows a **−$344k downtime hit** from change-failure rate going 5% → 6%. Fix it with automated testing, CI, and small batches.
- **DORA — State of AI-assisted Software Development 2025** (Google Cloud, 2025) — [report](https://dora.dev/dora-report-2025/) · [PDF](https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf) — TLDR: 90% of devs use AI at work, 80%+ say it raises productivity, but 30% have little or no trust in the generated code. Same amplifier thesis: teams in loosely-coupled architectures with fast feedback loops capture the gains; tightly-coupled / slow-process teams see little or none. Identifies seven org capabilities that magnify AI's impact — foundational eng practices, healthy data ecosystem, quality internal platform, etc.

### Member picks
- **Simon Willison — "The Unreasonable Effectiveness of HTML"** (2026-05-08) — ask Claude for HTML instead of Markdown and you get SVG diagrams, widgets, and interactive explanations — [post](https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/)
- **CAD agent — `Adam-CAD/CADAM`** — the repo behind today's demo — [github.com](https://github.com/Adam-CAD/CADAM)

### Around town
- **OKTech — Kitchen Robots & State of AI** — Sat 30 May, 17:00–19:30, Cybozu Osaka (35F Hankyu Bldg). Robotics in the home + AI in web dev. — [oktech.jp](https://oktech.jp/events/313772796-may-event-tbd)
- **State of Web Dev AI (Devographics)** — TLDR: the same crew behind State of JS / CSS now run a survey on how web developers actually use AI — model providers, coding assistants, spend, pain points — and deliberately include the AI-skeptics so the picture isn't a hype curve. Worth filling in. — [stateofai.dev](https://stateofai.dev/en-US)

<!-- news:start -->
## Run [/news](https://github.com/agentic-assembly/website/blob/master/.claude/skills/news/SKILL.md) skill

_Floor: 2026-05-09 (no prior entry — defaulted to 7-day window). Generated 2026-05-16._

### Claude Code
- [2026-05-13] Claude Code 2.1.141 — hooks gain `terminalSequence` (desktop notifications, window titles, bells) and `CLAUDE_CODE_PLUGIN_PREFER_HTTPS` for plugin clones — [changelog](https://code.claude.com/docs/en/changelog)
- [2026-05] `claude agents` — single list of every Claude Code session running, blocked on you, or done — [release notes](https://support.claude.com/en/articles/12138966-release-notes)
- [2026-05] `/goal` — set a completion condition and Claude keeps working across turns until it's met — [release notes](https://support.claude.com/en/articles/12138966-release-notes)
- [2026-05] Anthropic announces June 15 split — Agent SDK, `claude -p`, GitHub Actions, and third-party Agent-SDK apps move onto a separate monthly credit pool — [Anthropic help](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)

### Codex
- [2026-05-07] Codex CLI 0.129.0 — vim mode in the TUI, redesigned resume/fork picker, `/hooks` browser, plugin sharing — [changelog](https://developers.openai.com/codex/changelog)
- [2026-05-07] Codex for Chrome — parallel work across tabs, per-site access controls — [changelog](https://developers.openai.com/codex/changelog)
- [2026-05-08] Codex CLI 0.130.0 — Bedrock auth with AWS login, thread pagination, image-resolution fixes — [changelog](https://developers.openai.com/codex/changelog)

### Adjacent tools
- [2026-05-11] Cursor — Bugbot effort levels (default/high/custom) and Cursor in Microsoft Teams — [changelog](https://cursor.com/changelog)
- [2026-05-13] Cursor — multi-repo cloud agent environments, Dockerfile-based setup with build secrets — [changelog](https://cursor.com/changelog)

### Notable posts
- [2026-05-14] Simon Willison — "Not so locked in any more" — LLM-assisted language migration changes the cost calculus for picking a stack — [post](https://simonwillison.net/2026/May/14/not-so-locked-in/)
- [2026-05-11] Simon Willison — Thoughts on GitLab's workforce reduction in the agentic era — [post](https://simonwillison.net/2026/May/11/gitlab-act-2/)

### Research & papers
- [2026-05-07] Constraint Decay — agent performance drops sharply in convention-heavy frameworks (FastAPI, Django) vs minimal ones (Flask) — [arxiv](https://arxiv.org/abs/2605.06445)
- [2026-05-07] VibeServe — an agentic loop that generates whole LLM serving stacks end-to-end — [arxiv](https://arxiv.org/abs/2605.06068)
<!-- news:end -->
