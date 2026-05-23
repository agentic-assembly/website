#!/usr/bin/env node
// Screenshot /demo and diff against a reference PNG on disk.
//
//   URL=http://localhost:4321/demo \
//   REF=dev-screenshots/generic.png \
//   node scripts/diff-png.mjs
//
// Writes left.png (live), right.png (ref), diff.png into ./diff-out.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "diff-out");

const URL = process.env.URL ?? "http://localhost:4321/demo";
const REF = path.resolve(ROOT, process.env.REF ?? "dev-screenshots/generic.png");
const THRESHOLD = Number(process.env.DIFF_THRESHOLD ?? 0.1);

const refBuf = await readFile(REF);
const ref = PNG.sync.read(refBuf);
const WIDTH = ref.width;
const HEIGHT = ref.height;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });
await page.evaluate(() => document.fonts?.ready);
const liveBuf = await page.screenshot({ fullPage: false });
await browser.close();

const live = PNG.sync.read(liveBuf);

function fit(src, w, h) {
  if (src.width === w && src.height === h) return src;
  const out = new PNG({ width: w, height: h });
  out.data.fill(0);
  const cw = Math.min(src.width, w);
  const ch = Math.min(src.height, h);
  for (let y = 0; y < ch; y++) {
    src.data.copy(out.data, y * w * 4, y * src.width * 4, y * src.width * 4 + cw * 4);
  }
  return out;
}

const left = fit(live, WIDTH, HEIGHT);
const right = fit(ref, WIDTH, HEIGHT);
const diff = new PNG({ width: WIDTH, height: HEIGHT });
const mismatch = pixelmatch(left.data, right.data, diff.data, WIDTH, HEIGHT, {
  threshold: THRESHOLD,
  includeAA: false,
});

await mkdir(OUT_DIR, { recursive: true });
await Promise.all([
  writeFile(path.join(OUT_DIR, "left.png"), PNG.sync.write(left)),
  writeFile(path.join(OUT_DIR, "right.png"), PNG.sync.write(right)),
  writeFile(path.join(OUT_DIR, "diff.png"), PNG.sync.write(diff)),
]);

const total = WIDTH * HEIGHT;
const pct = ((mismatch / total) * 100).toFixed(3);
console.log(`URL   ${URL}`);
console.log(`REF   ${path.relative(ROOT, REF)}`);
console.log(`size  ${WIDTH} × ${HEIGHT}`);
console.log(`diff  ${mismatch} px — ${pct}% mismatch`);
console.log(`out   ${path.relative(ROOT, OUT_DIR)}/`);
