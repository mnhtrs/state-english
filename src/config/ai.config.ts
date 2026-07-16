/**
 * AI configuration layer.
 *
 * Model name is read from environment variable VITE_GEMINI_MODEL.
 * Future upgrades only require changing the .env value — zero code changes needed.
 *
 * Default: gemini-3.5-flash
 * Upgrade example: VITE_GEMINI_MODEL=gemini-4.0-flash
 */

// NOTE: This module runs in the browser context (import.meta.env).
// For server-side (Vite plugin), the model name is read via process.env in vite.config.ts.
export const AI_CONFIG = {
  geminiModel: (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-3.5-flash',
} as const;
