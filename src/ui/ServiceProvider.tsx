import React, { createContext, useContext, useMemo } from 'react';
import { IndexedDBStorageProvider } from '../providers/IndexedDBStorageProvider';
import { FreeDictionaryProvider } from '../providers/FreeDictionaryProvider';
import { HttpAIProvider } from '../providers/HttpAIProvider';
import { LearningService } from '../services/LearningService';
// Note: AI model name is configured via VITE_GEMINI_MODEL in .env.
// It is consumed server-side in vite.config.ts and passed to GeminiAIProvider there.

// ==========================================
// PROVIDER WIRING
// ==========================================
// UI never directly instantiates or calls Gemini, IndexedDB, or any external API.
// All provider implementations are wired here and injected into the service layer.
//
// AI MIGRATION PATH:
//   Currently: HttpAIProvider → local Vite dev-server plugin → GeminiAIProvider (server-side)
//   Future:    HttpAIProvider → VITE_API_BASE_URL → real backend
//   The UI and LearningService require ZERO changes for that migration.
// ==========================================

interface Services {
  learningService: LearningService;
}

const ServiceContext = createContext<Services | null>(null);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const services = useMemo(() => {
    // Base URL for the AI API. Empty string = same-origin (local dev server plugin).
    // Set VITE_API_BASE_URL in .env to point to a real backend when deploying.
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

    const storageProvider = new IndexedDBStorageProvider();
    const dictionaryProvider = new FreeDictionaryProvider();

    // HttpAIProvider is used at all times.
    // In local dev, /api/ai/* is handled by the Vite plugin (see vite.config.ts).
    // In production, /api/ai/* is handled by your real backend.
    const aiProvider = new HttpAIProvider(apiBaseUrl);

    const learningService = new LearningService(storageProvider, dictionaryProvider, aiProvider);

    return { learningService };
  }, []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};
