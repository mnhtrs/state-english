import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { AIProvider, AIData, DictionaryData, UsageItem, QuizItem } from '../core/domain.js';

const DEFAULT_MODEL = 'gemini-3.5-flash';

export class GeminiAIProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  /**
   * @param apiKey     Gemini API key
   * @param modelName  Model to use. Defaults to gemini-3.5-flash.
   *                   Override via VITE_GEMINI_MODEL env variable.
   */
  constructor(apiKey: string, modelName: string = DEFAULT_MODEL) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generateLearningContent(
    word: string,
    originalSentence: string,
    dictionaryData: DictionaryData
  ): Promise<AIData> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            vietnameseExplanation: { type: SchemaType.STRING },
            instantRecallHook: { type: SchemaType.STRING },
            relatedConcepts: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            },
            commonMisconceptions: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  incorrect: { type: SchemaType.STRING },
                  whyWrong: { type: SchemaType.STRING },
                  whyWrongTranslation: { type: SchemaType.STRING },
                  correct: { type: SchemaType.STRING },
                  difference: { type: SchemaType.STRING },
                  translation: { type: SchemaType.STRING }
                },
                required: ['incorrect', 'whyWrong', 'whyWrongTranslation', 'correct', 'difference', 'translation']
              }
            },
            examples: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  situation: { type: SchemaType.STRING },
                  sentence: { type: SchemaType.STRING },
                  translation: { type: SchemaType.STRING }
                },
                required: ['situation', 'sentence', 'translation']
              }
            },
            usages: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  label: { type: SchemaType.STRING },
                  situation: { type: SchemaType.STRING },
                  sentence: { type: SchemaType.STRING },
                  naturalVietnamese: { type: SchemaType.STRING }
                },
                required: ['label', 'situation', 'sentence', 'naturalVietnamese']
              }
            },
            quiz: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  type: { type: SchemaType.STRING },
                  question: { type: SchemaType.STRING },
                  context: { type: SchemaType.STRING }
                },
                required: ['type', 'question', 'context']
              }
            }
          },
          required: [
            'vietnameseExplanation',
            'instantRecallHook',
            'relatedConcepts',
            'examples',
            'quiz'
          ]
        }
      }
    });

    const prompt = `
Bạn là một giáo viên tiếng Anh người Việt đang dạy từ "${word}" cho một học viên Việt Nam.
Ngữ cảnh người học gặp từ này: "${originalSentence}"

Dữ liệu từ điển (chỉ để xác định nghĩa đúng với ngữ cảnh, KHÔNG sao chép vào output):
${dictionaryData.definition}

====================================================
NGUYÊN TẮC BẮT BUỘC
====================================================

Bạn dạy khái niệm, không dạy từ điển.
TẤT CẢ GIẢI THÍCH PHẢI ĐƯỢC VIẾT BẰNG TIẾNG ANH ĐỜI THƯỜNG, CƠ BẢN NHẤT CÓ THỂ.
KHÔNG viết giải thích bằng tiếng Việt (ngoại trừ translation của example).

--- FIELD: vietnameseExplanation ---
Giải thích NGẮN GỌN XÚC TÍCH, đi thẳng vào vấn đề. Chỉ nêu ý chính (1-2 câu).
Dòng 1: Viết bằng TIẾNG ANH ĐỜI THƯỜNG (BASIC EVERYDAY ENGLISH). Trả lời câu hỏi "Chuyện gì đang xảy ra?".
Dòng 2: Dịch lại dòng 1 sang tiếng Việt một cách TỰ NHIÊN NHẤT (không dịch word-by-word).
BẮT BUỘC NGĂN CÁCH 2 DÒNG NÀY BẰNG DẤU XUỐNG DÒNG (\n).
Ví dụ TỐT:
It's the feeling of being stuck in a negative emotion. When you finally escape it and your mind feels light — that's get over.
Đó là cảm giác bị kẹt trong một cảm xúc tiêu cực. Khi bạn thoát khỏi nó và thấy nhẹ nhõm — đó gọi là get over.

--- FIELD: instantRecallHook ---
1–2 câu bằng TIẾNG ANH ĐỜI THƯỜNG. Cực kỳ dễ nhớ.
Ví dụ: "Stuck in an emotion → get over is when you finally escape it."

--- FIELD: examples ---
Bắt buộc tạo 3 example objects. Mỗi object PHẢI có đủ 3 field với nội dung thực sự:

  situation: [Một câu tiếng Anh mô tả tình huống cụ thể. KHÔNG để trống.]
  sentence:  [Câu tiếng Anh dùng từ "${word}" trong tình huống đó. KHÔNG để trống.]
  translation: [Một câu tiếng Việt tự nhiên giải thích câu tiếng Anh trong ngữ cảnh đó. KHÔNG dịch từng chữ.]

Ví dụ hợp lệ:
  situation: "You failed the university entrance exam and still feel sad a year later."
  sentence: "I still can't get over that exam result."
  translation: "Mình vẫn chưa qua được chuyện thi trượt đó."

KHÔNG được để situation, sentence, hay translation là chuỗi rỗng.

--- FIELD: commonMisconceptions ---
Chỉ điền nếu có hiểu lầm phổ biến thật sự. BẮT BUỘC ĐƯA RA HẲN VÍ DỤ DÙNG SAI TỪ VÀ SỬA LẠI THÀNH ĐÚNG.
Mỗi item phải có:
  incorrect: Câu tiếng Anh sai hoặc dùng sai ngữ cảnh (ví dụ áp dụng sai bối cảnh, sai trường hợp).
  whyWrong: Tiếng Anh cơ bản — giải thích cực ngắn gọn tại sao câu trên là sai.
  whyWrongTranslation: Bản dịch tiếng Việt của câu whyWrong. Tuyệt đối KHÔNG TỰ THÊM DẤU NGOẶC ĐƠN.
  correct: Câu tiếng Anh đúng hoặc từ phù hợp hơn cho bối cảnh đó.
  difference: Tiếng Anh cơ bản — chốt lại sự khác biệt bằng 1 câu dễ hiểu.
  translation: Bản dịch tiếng Việt tự nhiên của câu difference. Tuyệt đối KHÔNG TỰ THÊM DẤU NGOẶC ĐƠN. Ví dụ: "Sử dụng 'pass' cho bài thi, và 'get over' để hồi phục cảm xúc"

--- FIELD: usages ---
CHỈ điền nếu từ "${word}" có nhiều cách dùng THẬT SỰ KHÁC NHAU về ý nghĩa (như "will", "can", "get").
Nếu từ chỉ có một nghĩa chính thì để usages là mảng rỗng [].
Mỗi item: label (tiếng Việt ngắn), situation (VN), sentence (EN), naturalVietnamese (VN tự nhiên, không dịch từng chữ).

--- FIELD: relatedConcepts ---
3–5 từ tiếng Anh liên quan, mỗi từ kèm gợi ý ngắn tiếng Việt.
Ví dụ: "recover (hồi phục thể chất)", "move on (tiến về phía trước)"

--- FIELD: quiz ---
1 bài tập DỊCH THUẬT thực tế. Bắt buộc type="translation".
Mỗi item:
  question: Câu tiếng Anh thực tế có chứa từ "${word}".
  context: Ngữ cảnh tiếng Việt ngắn gọn (giúp người học dễ hình dung tình huống để dịch).
Ví dụ:
  question: "I can't get over how cheap the food is here!"
  context: "Bạn rất ngạc nhiên vì đồ ăn rẻ."

Trả về đúng JSON schema. Tất cả giải thích bằng tiếng Việt.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as AIData;
  }

  async generateMoreUsages(word: string, currentUsages: { label: string }[]): Promise<UsageItem[]> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              label: { type: SchemaType.STRING },
              situation: { type: SchemaType.STRING },
              sentence: { type: SchemaType.STRING },
              naturalVietnamese: { type: SchemaType.STRING }
            },
            required: ['label', 'situation', 'sentence', 'naturalVietnamese']
          }
        }
      }
    });
    const labels = currentUsages.map(u => u.label).join(', ');
    const prompt = `Bạn là giáo viên tiếng Anh. Học viên đang học từ "${word}". Họ muốn xem THÊM ví dụ mới cho các cách dùng sau: [${labels}]. Hãy sinh ra 1 ví dụ MỚI HOÀN TOÀN cho MỖI cách dùng. Tuyệt đối không lặp lại các ví dụ cũ. Mỗi item: label (giữ nguyên), situation (tiếng Việt), sentence (tiếng Anh mới), naturalVietnamese (dịch). Trả về mảng JSON.`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async generateMoreQuizzes(word: string): Promise<QuizItem[]> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: { type: SchemaType.STRING },
              question: { type: SchemaType.STRING },
              context: { type: SchemaType.STRING }
            },
            required: ['type', 'question', 'context']
          }
        }
      }
    });
    const prompt = `Học viên đang ôn tập từ "${word}". Hãy sinh ra 2 bài tập DỊCH THUẬT thực tế MỚI HOÀN TOÀN. Bắt buộc type="translation". Trả về mảng JSON gồm 2 câu (question: câu tiếng Anh, context: ngữ cảnh tiếng Việt).`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async evaluateTranslation(
    word: string,
    englishSentence: string,
    userTranslation: string
  ): Promise<{ score: number; feedback: string; suggestedTranslation: string }> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            feedback: { type: SchemaType.STRING },
            suggestedTranslation: { type: SchemaType.STRING }
          },
          required: ['score', 'feedback', 'suggestedTranslation']
        }
      }
    });

    const prompt = `
Bạn là giáo viên. Học viên dịch câu tiếng Anh sau sang tiếng Việt:
Từ khóa đang học: "${word}"
Câu gốc: "${englishSentence}"
Bản dịch của học viên: "${userTranslation}"

Đánh giá bản dịch:
1. Có diễn đạt đúng BỐI CẢNH và TRẠNG THÁI của câu không? Không cần dịch sát từng chữ (word-by-word). Nếu ý tứ tự nhiên, đúng hoàn cảnh là được.
2. Từ "${word}" được dịch hợp lý chưa?

Trả về JSON:
- score: 0 - 100.
- feedback: Nhận xét ngắn gọn 1-2 câu tiếng Việt. Chỉ ra chỗ hay, chỗ chưa tự nhiên, hoặc khen ngợi.
- suggestedTranslation: Câu đề xuất dịch của bạn (tự nhiên, dân dã như người Việt hay nói).
    `;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async generateMoreMisconceptions(
    word: string,
    currentMisconceptions: { incorrect: string }[]
  ): Promise<import('../core/domain.js').MisconceptionItem[]> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              incorrect: { type: SchemaType.STRING },
              whyWrong: { type: SchemaType.STRING },
              whyWrongTranslation: { type: SchemaType.STRING },
              correct: { type: SchemaType.STRING },
              difference: { type: SchemaType.STRING },
              translation: { type: SchemaType.STRING }
            },
            required: ['incorrect', 'whyWrong', 'whyWrongTranslation', 'correct', 'difference', 'translation']
          }
        }
      }
    });

    const existing = currentMisconceptions.map(m => `"${m.incorrect}"`).join(', ');
    const prompt = `Học viên đang ôn tập từ "${word}". Các ví dụ dùng sai đã có: [${existing}].
Hãy sinh 1-2 ví dụ hay bị hiểu sai MỚI HOÀN TOÀN, khác ngữ cảnh.
Mỗi item:
  incorrect: Câu tiếng Anh dùng sai bối cảnh.
  whyWrong: Tiếng Anh cơ bản — tại sao sai.
  whyWrongTranslation: Tiếng Việt tự nhiên của whyWrong. KHÔNG tự thêm dấu ngoặc đơn.
  correct: Câu đúng.
  difference: Tiếng Anh — chốt khác biệt 1 câu.
  translation: Tiếng Việt tự nhiên của difference. KHÔNG tự thêm dấu ngoặc đơn.
Trả về mảng JSON.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }
}
