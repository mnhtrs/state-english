/**
 * userApiKey — simple localStorage helper for the user's personal Gemini API key.
 *
 * Key is stored per-browser, never sent to other users.
 * If absent, the server falls back to the system key in .env.
 */

const STORAGE_KEY = 'statelish_user_gemini_key';

export const userApiKey = {
  get(): string {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  },
  set(key: string): void {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
  has(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  },
};
