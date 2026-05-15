/// <reference types="astro/client" />

import type { Highlight } from "./lib/icons";

declare global {
  namespace App {
    interface Locals {
      highlights?: Map<string, Highlight>;
    }
  }
}

export {};
