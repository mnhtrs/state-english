import type { AIProvider, AIData, DictionaryData, UsageItem, QuizItem, MisconceptionItem } from '../core/domain';

/**
 * HttpAIProvider
 *
 * A backend-ready AIProvider implementation that calls a local API route.
 * In V1, these routes are Vite dev-server middlewares that forward to Gemini.
 *
 * When you migrate to a real backend (Node.js / Cloudflare Workers / Vercel Functions),
 * only the API endpoint URL needs to change — no UI or service logic is affected.
 */
export class HttpAIProvider implements AIProvider {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    // Empty string means same-origin (relative URL), suitable for local dev.
    this.baseUrl = baseUrl;
  }

  private async post<T>(path: string, body: object): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI request failed: ${response.status} — ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  async generateLearningContent(
    word: string,
    originalSentence: string,
    dictionaryData: DictionaryData
  ): Promise<AIData> {
    return this.post<AIData>('/api/ai/generate-learning-content', { word, originalSentence, dictionaryData });
  }

  async generateMoreUsages(
    word: string,
    currentUsages: { label: string }[]
  ): Promise<UsageItem[]> {
    return this.post<UsageItem[]>('/api/ai/generate-more-usages', { word, currentUsages });
  }

  async generateMoreQuizzes(word: string): Promise<QuizItem[]> {
    return this.post<QuizItem[]>('/api/ai/generate-more-quizzes', { word });
  }

  async generateMoreMisconceptions(
    word: string,
    currentMisconceptions: { incorrect: string }[]
  ): Promise<MisconceptionItem[]> {
    return this.post<MisconceptionItem[]>('/api/ai/generate-more-misconceptions', { word, currentMisconceptions });
  }

  async evaluateTranslation(
    word: string,
    englishSentence: string,
    userTranslation: string
  ): Promise<{ score: number; feedback: string; suggestedTranslation: string }> {
    return this.post<{ score: number; feedback: string; suggestedTranslation: string }>('/api/ai/evaluate-translation', { word, englishSentence, userTranslation });
  }
}
