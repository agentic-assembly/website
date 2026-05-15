# aa-feedback worker

Receives `/feedback` form POSTs from a13y.org and writes each submission as a
Markdown file into the `agentic-assembly/feedback` repo. No database; the repo
is the database.

## One-time setup

1. **Create the private repo** that will hold submissions:

   ```sh
   gh repo create agentic-assembly/feedback --private --description "Feedback submissions from a13y.org"
   gh api -X PUT repos/agentic-assembly/feedback/contents/submissions/.gitkeep \
     -f message="init" -f content="$(printf '' | base64)"
   ```

2. **Mint a fine-grained PAT** at https://github.com/settings/personal-access-tokens/new
   - Resource owner: `agentic-assembly`
   - Repository access: only `agentic-assembly/feedback`
   - Permissions → Repository → Contents: **Read and write**
   - Expiration: pick something (max 1 year, set a reminder)

3. **Deploy the worker** from this directory:

   ```sh
   cd worker
   npm install
   npx wrangler login            # browser flow
   npx wrangler secret put GITHUB_TOKEN   # paste the PAT
   npm run deploy
   ```

   Wrangler prints the worker URL (e.g. `https://aa-feedback.<account>.workers.dev`).
   Update the form's `FEEDBACK_ENDPOINT` constant in `src/pages/feedback.astro`
   with that URL.

## Local testing

```sh
echo "GITHUB_TOKEN=<pat>" > .dev.vars
npm run dev          # http://localhost:8787
```

POST a JSON body like:

```json
{
  "ratings": { "overall": 5, "venue": 4, "discussion": 5 },
  "message": "good vibes",
  "name": "k",
  "email": ""
}
```

A new file lands at `submissions/<ts>-<slug>.md` in the feedback repo.

## Notes

- CORS allow-list is in `wrangler.toml` under `ALLOWED_ORIGINS`.
- The worker hashes the submitter IP (truncated SHA-256) for spam triage
  without storing PII.
- A non-empty `honeypot` field is silently dropped (returns 200 to the bot).
