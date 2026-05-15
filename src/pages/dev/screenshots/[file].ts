import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { APIRoute, GetStaticPaths } from "astro";

const SHOT_DIR = path.resolve("dev-screenshots");

export const getStaticPaths: GetStaticPaths = async () => {
  let files: string[] = [];
  try {
    files = (await readdir(SHOT_DIR)).filter((f) => f.endsWith(".png"));
  } catch {
    files = [];
  }
  return files.map((file) => ({ params: { file } }));
};

export const GET: APIRoute = async ({ params }) => {
  const name = params.file;
  if (!name || !/^[a-z0-9._-]+\.png$/i.test(name)) {
    return new Response("Not found", { status: 404 });
  }
  const fp = path.join(SHOT_DIR, name);
  let body: Buffer;
  try {
    body = await readFile(fp);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "image/png",
      "cache-control": "no-store",
    },
  });
};
