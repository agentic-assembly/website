interface Env {
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  ALLOWED_ORIGINS: string;
  GITHUB_TOKEN: string;
  SUBMISSIONS: KVNamespace;
}

interface Submission {
  ratings?: Record<string, number>;
  message?: string;
  name?: string;
  email?: string;
  honeypot?: string;
}

const RATING_KEYS = ["overall", "venue", "discussion"] as const;
const MAX_MESSAGE = 4000;
const MAX_FIELD = 200;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get("Origin") ?? "";
    const allowed = env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim())
      .includes(origin);
    const corsHeaders: Record<string, string> = allowed
      ? {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          Vary: "Origin",
        }
      : {};

    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (req.method !== "POST")
      return json({ error: "method not allowed" }, 405, corsHeaders);
    if (!allowed) return json({ error: "origin not allowed" }, 403, corsHeaders);

    let body: Submission;
    try {
      body = (await req.json()) as Submission;
    } catch {
      return json({ error: "invalid json" }, 400, corsHeaders);
    }

    if (body.honeypot && body.honeypot.length > 0) {
      return json({ ok: true }, 200, corsHeaders);
    }

    const message = (body.message ?? "").trim().slice(0, MAX_MESSAGE);
    const name = (body.name ?? "").trim().slice(0, MAX_FIELD);
    const email = (body.email ?? "").trim().slice(0, MAX_FIELD);
    const ratings: Record<string, number> = {};
    for (const key of RATING_KEYS) {
      const raw = body.ratings?.[key];
      if (typeof raw === "number" && raw >= 1 && raw <= 5) {
        ratings[key] = Math.round(raw);
      }
    }

    if (!message && Object.keys(ratings).length === 0) {
      return json({ error: "empty submission" }, 400, corsHeaders);
    }

    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, "-").replace("Z", "");
    const slug = crypto.randomUUID().slice(0, 8);
    const path = `submissions/${stamp}-${slug}.md`;

    const ip = req.headers.get("CF-Connecting-IP") ?? "";
    const ipHash = ip ? await sha256(ip).then((h) => h.slice(0, 12)) : "";

    const frontmatter: Record<string, unknown> = {
      ts: now.toISOString(),
      ratings,
      ...(name && { name }),
      ...(email && { email }),
      ...(ipHash && { ip_hash: ipHash }),
    };

    const fileBody =
      "---\n" +
      Object.entries(frontmatter)
        .map(([k, v]) => `${k}: ${yaml(v)}`)
        .join("\n") +
      "\n---\n\n" +
      (message || "_(no message)_") +
      "\n";

    try {
      await env.SUBMISSIONS.put(path, fileBody, {
        metadata: { ts: frontmatter.ts, ratings },
      });
    } catch (err) {
      console.error("KV backup failed", err);
    }

    const gh = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "aa-feedback-worker",
        },
        body: JSON.stringify({
          message: `feedback: ${stamp}`,
          content: btoa(unescape(encodeURIComponent(fileBody))),
        }),
      },
    );

    if (!gh.ok) {
      const detail = await gh.text();
      return json(
        { error: "could not record submission", status: gh.status, detail },
        502,
        corsHeaders,
      );
    }

    return json({ ok: true }, 200, corsHeaders);
  },
};

function json(data: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function yaml(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v && typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return `{ ${entries.map(([k, vv]) => `${k}: ${yaml(vv)}`).join(", ")} }`;
  }
  return JSON.stringify(v);
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
