#!/usr/bin/env node
// Captures dev screenshots used by /screenshots.
// Run while `astro dev` is up: `npm run screenshots`.

import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "dev-screenshots");
const BASE = process.env.SCREENSHOT_BASE ?? "http://localhost:4321";

const targets = [
  { slug: "home", url: "/", label: "Home — /" },
  { slug: "test-assembly", url: "/2", label: "Test assembly — /2" },
  { slug: "feedback", url: "/feedback", label: "Feedback — /feedback" },
];

const viewports = [
  { slug: "mobile", width: 390, height: 844, label: "Mobile — 390 × 844" },
  { slug: "tablet", width: 820, height: 1180, label: "Tablet — 820 × 1180" },
  { slug: "desktop", width: 1440, height: 900, label: "Desktop — 1440 × 900" },
];

const themes = ["dark", "light"];

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const theme of themes) {
      for (const viewport of viewports) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: 2,
          colorScheme: theme === "light" ? "light" : "dark",
        });
        await context.addInitScript((t) => {
          try {
            localStorage.setItem("theme", t);
          } catch {}
        }, theme);

        for (const target of targets) {
          const page = await context.newPage();
          const url = new URL(target.url, BASE).toString();
          await page.goto(url, { waitUntil: "networkidle" });
          // Let fonts settle so widths don't reflow mid-snap.
          await page.evaluate(() => document.fonts?.ready);
          // Hide the Astro dev toolbar so it doesn't appear in shots.
          await page.addStyleTag({
            content: "astro-dev-toolbar { display: none !important; }",
          });
          const file = `${target.slug}--${viewport.slug}--${theme}.png`;
          await page.screenshot({
            path: path.join(OUT_DIR, file),
            fullPage: true,
          });
          console.log(`captured ${file}`);
          await page.close();
        }

        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
