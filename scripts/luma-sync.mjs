// Mirror upcoming assemblies to Luma — one-way sync, frontmatter is the
// source of truth. Creates a Luma event for every upcoming entry that has no
// `lumaId` yet (and writes `lumaId` + `lumaUrl` back into the frontmatter),
// and pushes name/time/location changes to Luma for entries that have one.
// Past events are never touched.
//
// Requires LUMA_API_KEY (a calendar API key — Settings → Developer on the
// Luma calendar; needs Luma Plus). Run: node scripts/luma-sync.mjs

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://public-api.luma.com";
const SITE = "https://a13y.org";
const TIMEZONE = "Asia/Tokyo";
const EVENT_MS = 2 * 60 * 60 * 1000; // assemblies run 10:00 ~ 12:00
const ONGOING_GRACE_MS = 4 * 60 * 60 * 1000; // keep syncing while the meetup is on

// Full street addresses for known venues — frontmatter only carries the name.
const VENUES = {
  "The DECK": "The DECK — 1F, 2-1-1 Minamihonmachi, Chuo-ku, Osaka",
};

const KEY = process.env.LUMA_API_KEY;
if (!KEY) {
  console.error("LUMA_API_KEY is not set");
  process.exit(1);
}

const ROOT = fileURLToPath(new URL("../src/content/assemblies/", import.meta.url));

async function luma(method, route, body) {
  const res = await fetch(`${API}${route}`, {
    method,
    headers: {
      "x-luma-api-key": KEY,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${route} — ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// Reads only top-level scalar keys (title, date, location, lumaId, …) — the
// nested blocks (references, highlights) are irrelevant to the sync and are
// left byte-for-byte untouched when writing back.
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv || kv[2] === "") continue;
    fm[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1");
  }
  return fm;
}

function upsertFrontmatterKeys(raw, pairs) {
  let out = raw;
  const pending = [];
  for (const [key, value] of Object.entries(pairs)) {
    const line = `${key}: ${value}`;
    const existing = new RegExp(`^${key}:.*$`, "m");
    if (existing.test(out.match(/^---\r?\n[\s\S]*?\r?\n---/)[0])) {
      out = out.replace(existing, line);
    } else {
      pending.push(line);
    }
  }
  if (pending.length > 0) {
    out = out.replace(/^(---\r?\n[\s\S]*?)(\r?\n---)/, `$1\n${pending.join("\n")}$2`);
  }
  return out;
}

// e.g. 2026-08-01T12:00:00+09:00 — Luma wants an explicit offset, and JST
// keeps the payload readable next to the frontmatter.
function toJstIso(epochMs) {
  return `${new Date(epochMs + 9 * 60 * 60 * 1000).toISOString().slice(0, 19)}+09:00`;
}

function eventName(title, aaId) {
  return /^aa\d+$/i.test(title ?? "")
    ? `Agentic Assembly — ${aaId}`
    : `Agentic Assembly ${aaId} — ${title}`;
}

function eventUrl(url) {
  return /^https?:\/\//.test(url) ? url : `https://luma.com/${url.replace(/^\//, "")}`;
}

const dirs = (await readdir(ROOT, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const entries = [];
for (const dir of dirs) {
  for (const name of ["index.mdx", "index.md"]) {
    const file = path.join(ROOT, dir, name);
    const raw = await readFile(file, "utf8").catch(() => null);
    if (raw === null) continue;
    const fm = parseFrontmatter(raw);
    if (!fm?.date) throw new Error(`${dir}/${name} — missing or unparsable frontmatter date`);
    entries.push({ dir, file, raw, fm, start: new Date(fm.date).getTime() });
    break;
  }
}

// AA numbering is chronological position in the full list — same rule as
// src/pages/[n].astro.
entries.sort((a, b) => a.start - b.start);

const now = Date.now();
let changed = 0;

for (const [i, entry] of entries.entries()) {
  const n = i + 1;
  const aaId = `AA${String(n).padStart(3, "0")}`;
  const label = `${aaId} (${entry.dir})`;

  if (entry.start < now - ONGOING_GRACE_MS) continue;

  const desired = {
    name: eventName(entry.fm.title, aaId),
    start_at: toJstIso(entry.start),
    end_at: toJstIso(entry.start + EVENT_MS),
    timezone: TIMEZONE,
    ...(entry.fm.location
      ? {
          geo_address_json: {
            type: "manual",
            address: VENUES[entry.fm.location] ?? `${entry.fm.location} — Osaka`,
          },
        }
      : {}),
  };

  let lumaId = entry.fm.lumaId;

  if (!lumaId) {
    const created = await luma("POST", "/v1/events/create", {
      ...desired,
      description_md: [
        "A casual Saturday meetup in Osaka — for engineers comparing notes on building with AI coding tools.",
        "",
        `Free Talk Round Table Discussion — free to attend — notes at ${SITE}/${n}`,
      ].join("\n"),
    });
    lumaId = created.id;
    console.log(`${label} — created ${lumaId}`);
  }

  const remote = await luma("GET", `/v1/events/get?event_id=${encodeURIComponent(lumaId)}`);

  const drifted =
    remote.name !== desired.name ||
    new Date(remote.start_at).getTime() !== entry.start ||
    new Date(remote.end_at).getTime() !== entry.start + EVENT_MS ||
    (desired.geo_address_json &&
      remote.geo_address_json?.address !== desired.geo_address_json.address);

  if (entry.fm.lumaId && drifted) {
    await luma("POST", "/v1/events/update", { event_id: lumaId, ...desired });
    console.log(`${label} — updated ${lumaId}`);
  }

  const url = eventUrl(remote.url);
  if (entry.fm.lumaId !== lumaId || entry.fm.lumaUrl !== url) {
    await writeFile(entry.file, upsertFrontmatterKeys(entry.raw, { lumaId, lumaUrl: url }));
    changed += 1;
    console.log(`${label} — frontmatter → ${url}`);
  }
}

console.log(changed > 0 ? `done — ${changed} file(s) changed` : "done — everything in sync");
