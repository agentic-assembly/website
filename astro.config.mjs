import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://a13y.org",
  integrations: [mdx()],
});
