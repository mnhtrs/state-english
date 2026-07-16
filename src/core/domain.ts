// src/core/domain.ts

// ==========================================
// ENTITIES
// ==========================================

export interface Chapter {
  id: string; // date string e.g. "20260715"
  date: string;
}

export interface WordEntry {
  id: string;
  chapterId: string;
  word: string;
  originalSentence: string;
  learningSource: string;
  dictionaryData: DictionaryData;
  aiData: AIData | null;
  createdAt: number;
}

export interface DictionaryData {
  definition: string;
  partOfSpeech: string;
  phonetics?: string;
  examples?: string[];
}

export interface AIData {
  /** Bilingual explanation: English first, Vietnamese below. Must be concise (1–2 sentences each). */
  vietnameseExplanation: string;

  /** Multi-usage breakdown for polysemous words (e.g. "will", "get", "have"). */
  usages?: UsageItem[];

  /** Common mistakes — each with wrong/correct example + Vietnamese translation. */
  commonMisconceptions?: MisconceptionItem[];

  /** Conceptually related words with brief hint each. */
  relatedConcepts: string[];

  /** Quiz questions. Can grow via "generate more". */
  quiz?: QuizItem[];
}

/**
 * A single common misconception block.
 */
export interface MisconceptionItem {
  incorrect: string;  // English sentence that is wrong
  whyWrong: string;   // Basic English — why it's wrong
  whyWrongTranslation?: string; // Vietnamese translation of whyWrong
  correct: string;    // Correct English alternative
  difference: string; // Basic English — key difference
  translation?: string; // Vietnamese — translate the correct sentence + difference
}

/**
 * For polysemous words: each usage labeled, with Vietnamese situation + natural translation.
 */
export interface UsageItem {
  label: string;            // Short Vietnamese label e.g. "Vượt qua bệnh tật"
  situation: string;        // Vietnamese — describe the scene
  sentence: string;         // English sentence
  naturalVietnamese: string; // Natural Vietnamese — NOT word-for-word
}

export interface QuizItem {
  type?: 'translation' | 'multiple_choice' | 'context' | 'situation';
  question: string; // Câu tiếng Anh cần dịch (hoặc câu hỏi cũ)
  context?: string; // Ngữ cảnh (tình huống)

  // Legacy fields for backward compatibility
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

// ==========================================
// PROVIDER INTERFACES
// ==========================================

export interface StorageProvider {
  getChapters(): Promise<Chapter[]>;
  getChapterById(id: string): Promise<Chapter | null>;
  createChapter(chapter: Chapter): Promise<void>;
  deleteChapter(id: string): Promise<void>;

  getWordsByChapter(chapterId: string): Promise<WordEntry[]>;
  getWordById(id: string): Promise<WordEntry | null>;
  saveWord(wordEntry: WordEntry): Promise<void>;
  deleteWord(id: string): Promise<void>;
  updateWordAiData(id: string, aiData: AIData): Promise<void>;
}

export interface DictionaryProvider {
  lookupWord(word: string, contextSentence: string): Promise<DictionaryData | null>;
}

export interface AIProvider {
  generateLearningContent(
    word: string,
    originalSentence: string,
    dictionaryData: DictionaryData
  ): Promise<AIData>;

  generateMoreUsages(
    word: string,
    currentUsages: { label: string }[]
  ): Promise<UsageItem[]>;

  generateMoreQuizzes(word: string, currentQuizzes: QuizItem[]): Promise<QuizItem[]>;

  generateMoreMisconceptions(
    word: string,
    currentMisconceptions: { incorrect: string }[]
  ): Promise<MisconceptionItem[]>;

  evaluateTranslation(
    word: string,
    englishSentence: string,
    userTranslation: string
  ): Promise<{
    score: number;
    feedback: string;
    suggestedTranslation: string;
  }>;
}
