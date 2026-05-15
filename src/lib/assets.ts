import fs from "node:fs/promises";
import path from "node:path";

export interface Asset {
  name: string;
  url: string;
  size: number;
  ext: string;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const assetUrls = import.meta.glob<string>("/src/content/assemblies/*/assets/*", {
  eager: true,
  query: "?url",
  import: "default",
});

export async function loadAssemblyAssets(entryId: string): Promise<Asset[]> {
  const prefix = `/src/content/assemblies/${entryId}/assets/`;
  const matches = Object.entries(assetUrls).filter(([key]) => key.startsWith(prefix));

  const assets = await Promise.all(
    matches.map(async ([key, url]) => {
      const name = key.slice(prefix.length);
      const stat = await fs.stat(path.join(process.cwd(), key.slice(1)));
      return {
        name,
        url,
        size: stat.size,
        ext: path.extname(name).slice(1).toLowerCase(),
      };
    }),
  );

  return assets.sort((a, b) => a.name.localeCompare(b.name));
}
