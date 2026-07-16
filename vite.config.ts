import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Connect, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

// ==========================================
// LOCAL DEV API ROUTE PLUGIN
// ==========================================
// Bridges HttpAIProvider (browser) → GeminiAIProvider (server-side, Node process).
// The API key never reaches the browser bundle.
//
// MIGRATION PATH TO REAL BACKEND:
// 1. Deploy equivalent handler logic to your backend (Vercel Functions, Cloudflare, etc.)
// 2. Set VITE_API_BASE_URL in .env to point to that backend.
// 3. Remove or disable this plugin.
// HttpAIProvider in the UI requires zero changes.
// ==========================================

function localAIApiPlugin(geminiApiKey: string, geminiModel: string) {
  return {
    name: 'local-ai-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        if (!req.url?.startsWith('/api/ai/')) {
          return next();
        }

        if (!geminiApiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'VITE_GEMINI_API_KEY is not set in .env' }));
          return;
        }

        const { GeminiAIProvider } = await import('./src/providers/GeminiAIProvider.js');
        const geminiProvider = new GeminiAIProvider(geminiApiKey, geminiModel);

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body);
            let result;

            if (req.url === '/api/ai/generate-learning-content') {
              result = await geminiProvider.generateLearningContent(
                payload.word,
                payload.originalSentence,
                payload.dictionaryData
              );
            } else if (req.url === '/api/ai/generate-more-usages') {
              result = await geminiProvider.generateMoreUsages(
                payload.word,
                payload.currentUsages
              );
            } else if (req.url === '/api/ai/generate-more-quizzes') {
              result = await geminiProvider.generateMoreQuizzes(payload.word, payload.currentQuizzes ?? []);
            } else if (req.url === '/api/ai/generate-more-misconceptions') {
              result = await geminiProvider.generateMoreMisconceptions(
                payload.word,
                payload.currentMisconceptions
              );
            } else if (req.url === '/api/ai/evaluate-translation') {
              result = await geminiProvider.evaluateTranslation(
                payload.word,
                payload.englishSentence,
                payload.userTranslation
              );
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Unknown AI route' }));
              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: message }));
          }
        });
      });
    },
  };
}

// Use the functional form of defineConfig so loadEnv runs at config time.
// loadEnv reads .env files properly regardless of process.env.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiApiKey = env.VITE_GEMINI_API_KEY ?? '';
  const geminiModel = env.VITE_GEMINI_MODEL || 'gemini-3.5-flash';

  return {
    plugins: [react(), localAIApiPlugin(geminiApiKey, geminiModel)],
  };
});
