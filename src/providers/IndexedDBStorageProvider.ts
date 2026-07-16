import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { StorageProvider, Chapter, WordEntry } from '../core/domain';

const DB_NAME = 'statelish_db';
const DB_VERSION = 1;

export class IndexedDBStorageProvider implements StorageProvider {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('chapters')) {
          db.createObjectStore('chapters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('words')) {
          const wordStore = db.createObjectStore('words', { keyPath: 'id' });
          wordStore.createIndex('by-chapter', 'chapterId');
        }
      },
    });
  }

  async getChapters(): Promise<Chapter[]> {
    const db = await this.dbPromise;
    const chapters = await db.getAll('chapters');
    return chapters.sort((a, b) => b.date.localeCompare(a.date)); // Sort descending
  }

  async getChapterById(id: string): Promise<Chapter | null> {
    const db = await this.dbPromise;
    const chapter = await db.get('chapters', id);
    return chapter || null;
  }

  async createChapter(chapter: Chapter): Promise<void> {
    const db = await this.dbPromise;
    await db.put('chapters', chapter);
  }

  async getWordsByChapter(chapterId: string): Promise<WordEntry[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('words', 'by-chapter', chapterId);
  }

  async getWordById(id: string): Promise<WordEntry | null> {
    const db = await this.dbPromise;
    const word = await db.get('words', id);
    return word || null;
  }

  async saveWord(wordEntry: WordEntry): Promise<void> {
    const db = await this.dbPromise;
    await db.put('words', wordEntry);
  }

  async deleteWord(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('words', id);
  }

  async deleteChapter(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('chapters', id);
  }

  async updateWordAiData(id: string, aiData: import('../core/domain').AIData): Promise<void> {
    const db = await this.dbPromise;
    const word = await db.get('words', id);
    if (word) {
      word.aiData = aiData;
      await db.put('words', word);
    }
  }
}
