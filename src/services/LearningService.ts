import type { StorageProvider, DictionaryProvider, AIProvider, WordEntry, Chapter, AIData, UsageItem, QuizItem, MisconceptionItem } from '../core/domain';

export class LearningService {
  private storageProvider: StorageProvider;
  private dictionaryProvider: DictionaryProvider;
  private aiProvider: AIProvider;

  constructor(
    storageProvider: StorageProvider,
    dictionaryProvider: DictionaryProvider,
    aiProvider: AIProvider
  ) {
    this.storageProvider = storageProvider;
    this.dictionaryProvider = dictionaryProvider;
    this.aiProvider = aiProvider;
  }

  private getTodayChapterId(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Adds a new word to the learning book.
   * 1. Lookup lexical data from DictionaryProvider.
   * 2. Generate conceptual content from AIProvider.
   * 3. Save to today's chapter.
   */
  async addWord(word: string, originalSentence: string, learningSource: string): Promise<WordEntry> {
    let dictionaryData = await this.dictionaryProvider.lookupWord(word, originalSentence);
    if (!dictionaryData) {
      dictionaryData = {
        definition: 'Not found in dictionary.',
        partOfSpeech: 'unknown'
      };
    }

    const aiData = await this.aiProvider.generateLearningContent(word, originalSentence, dictionaryData);

    const chapterId = this.getTodayChapterId();
    let chapter = await this.storageProvider.getChapterById(chapterId);
    if (!chapter) {
      chapter = { id: chapterId, date: new Date().toISOString() };
      await this.storageProvider.createChapter(chapter);
    }

    const wordEntry: WordEntry = {
      id: this.generateId(),
      chapterId: chapter.id,
      word,
      originalSentence,
      learningSource,
      dictionaryData,
      aiData,
      createdAt: Date.now()
    };

    await this.storageProvider.saveWord(wordEntry);
    return wordEntry;
  }

  /**
   * Deletes a single WordEntry.
   * If the parent chapter becomes empty after deletion, the chapter is also deleted.
   */
  async deleteWord(id: string): Promise<void> {
    const entry = await this.storageProvider.getWordById(id);
    if (!entry) return;

    await this.storageProvider.deleteWord(id);

    // Auto-remove the chapter if it has no more words
    const remaining = await this.storageProvider.getWordsByChapter(entry.chapterId);
    if (remaining.length === 0) {
      await this.storageProvider.deleteChapter(entry.chapterId);
    }
  }

  /**
   * Generates a new batch of usage examples (one per usage label),
   * appends them to the word's usages in the DB, and returns the updated usages.
   */
  async generateMoreUsages(wordId: string): Promise<UsageItem[]> {
    const entry = await this.storageProvider.getWordById(wordId);
    if (!entry?.aiData) throw new Error('Word not found');

    const currentUsages = entry.aiData.usages ?? [];
    if (currentUsages.length === 0) return [];

    // Lấy ra các label duy nhất từ danh sách hiện tại (đây là số lượng item mỗi slide)
    const uniqueLabels = Array.from(new Set(currentUsages.map(u => u.label)));
    const baseLabels = uniqueLabels.map(label => ({ label }));

    const newExamples = await this.aiProvider.generateMoreUsages(entry.word, baseLabels);

    const updatedUsages = [...currentUsages, ...newExamples];
    const updatedAiData: AIData = { ...entry.aiData, usages: updatedUsages };
    await this.storageProvider.updateWordAiData(wordId, updatedAiData);
    return updatedUsages;
  }

  /**
   * Generates a new set of quiz questions, appends to the word's quiz list,
   * and returns the full updated quiz array.
   */
  async generateMoreQuizzes(wordId: string): Promise<QuizItem[]> {
    const entry = await this.storageProvider.getWordById(wordId);
    if (!entry?.aiData) throw new Error('Word not found');

    const newQuizzes = await this.aiProvider.generateMoreQuizzes(entry.word);
    const updatedQuizzes = [...(entry.aiData.quiz ?? []), ...newQuizzes];

    const updatedAiData: AIData = { ...entry.aiData, quiz: updatedQuizzes };
    await this.storageProvider.updateWordAiData(wordId, updatedAiData);
    return updatedQuizzes;
  }

  /**
   * Evaluates a user's translation for a quiz item.
   */
  async evaluateTranslation(
    word: string,
    englishSentence: string,
    userTranslation: string
  ): Promise<{ score: number; feedback: string; suggestedTranslation: string }> {
    return this.aiProvider.evaluateTranslation(word, englishSentence, userTranslation);
  }

  async generateMoreMisconceptions(wordId: string): Promise<MisconceptionItem[]> {
    const entry = await this.storageProvider.getWordById(wordId);
    if (!entry?.aiData) throw new Error('Word not found');

    const newItems = await this.aiProvider.generateMoreMisconceptions(
      entry.word,
      (entry.aiData.commonMisconceptions ?? []).map(m => ({ incorrect: m.incorrect }))
    );

    const updated = [...(entry.aiData.commonMisconceptions ?? []), ...newItems];
    const updatedAiData: AIData = { ...entry.aiData, commonMisconceptions: updated };
    await this.storageProvider.updateWordAiData(wordId, updatedAiData);
    return updated;
  }

  async getChapters(): Promise<Chapter[]> {
    return this.storageProvider.getChapters();
  }

  async getWordsByChapter(chapterId: string): Promise<WordEntry[]> {
    return this.storageProvider.getWordsByChapter(chapterId);
  }

  async getWordById(id: string): Promise<WordEntry | null> {
    return this.storageProvider.getWordById(id);
  }
}
