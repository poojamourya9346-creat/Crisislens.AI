/** Centralized application constants. */

export const APP_NAME = "CrisisLens AI";
export const APP_TAGLINE =
  "An Autonomous Multi-Agent Decision Intelligence Platform for Smarter Communities";

export const API_VERSION = "v1";

export const ROUTES = {
  ROOT: "/",
} as const;

export const QUERY_KEYS = {
  ROOT: ["crisislens"] as const,
} as const;

export const DEFAULT_STALE_TIME_MS = 60_000;
export const DEFAULT_GC_TIME_MS = 300_000;
