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
    let response: Response;
    const userKey = localStorage.getItem('statelish_user_gemini_key') || '';
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(userKey ? { 'X-User-Gemini-Key': userKey } : {})
        },
        body: JSON.stringify(body),
      });
    } catch (e: any) {
      const msg = String(e).toLowerCase();
      if (msg.includes('fetch failed') || msg.includes('network error') || msg.includes('econnrefused')) {
        throw new Error('Lỗi mạng khi kết nối tới máy chủ. Vui lòng kiểm tra lại đường truyền Internet.');
      }
      throw new Error(`Lỗi kết nối: ${e.message}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      const msg = errorText.toLowerCase();

      let friendlyError = 'Đã có lỗi xảy ra khi xử lý yêu cầu AI. Vui lòng thử lại.';
      
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('overloaded')) {
        friendlyError = 'Hệ thống Google AI đang bị quá tải (503 High Demand). Vui lòng chờ vài phút rồi thử lại.';
      } else if (msg.includes('quota') || msg.includes('429')) {
        friendlyError = 'Đã hết dung lượng sử dụng API (Quota Exceeded) hoặc gửi request quá nhanh. Vui lòng chờ một chút hoặc thử lại vào ngày mai.';
      } else if (msg.includes('400') || msg.includes('api key not valid') || msg.includes('invalid api key')) {
        friendlyError = 'API Key không hợp lệ. Vui lòng kiểm tra lại cấu hình API Key của bạn.';
      } else if (msg.includes('403') || msg.includes('permission_denied')) {
        friendlyError = 'API Key không có quyền truy cập hoặc đã bị khóa (403 Forbidden).';
      } else if (msg.includes('timeout')) {
        friendlyError = 'Yêu cầu tới AI bị quá thời gian chờ (Timeout). Vui lòng thử lại.';
      } else if (msg.includes('safety') || msg.includes('blocked')) {
        friendlyError = 'Nội dung bị chặn bởi bộ lọc an toàn của Google (Safety Filter). Vui lòng thử với từ vựng/câu khác.';
      } else if (msg.includes('json')) {
        friendlyError = 'AI trả về định dạng dữ liệu không hợp lệ (Lỗi JSON). Vui lòng thử lại.';
      } else {
        // Fallback
        friendlyError = `Lỗi hệ thống AI: ${errorText.slice(0, 150)}...`;
      }

      throw new Error(friendlyError);
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

  async generateMoreQuizzes(word: string, currentQuizzes: QuizItem[]): Promise<QuizItem[]> {
    return this.post<QuizItem[]>('/api/ai/generate-more-quizzes', { word, currentQuizzes });
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
