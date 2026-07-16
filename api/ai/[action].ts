import { GeminiAIProvider } from '../../src/providers/GeminiAIProvider.js';

export default async function handler(req: any, res: any) {
  // CORS headers if needed
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action } = req.query;
  let payload = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      // Ignore parse error, maybe it's already an object somehow
    }
  }

  const geminiApiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  const geminiModel = process.env.VITE_GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  if (!geminiApiKey) {
    return res.status(500).json({ error: 'VITE_GEMINI_API_KEY is not set in environment variables.' });
  }

  const geminiProvider = new GeminiAIProvider(geminiApiKey, geminiModel);

  try {
    let result;

    if (action === 'generate-learning-content') {
      result = await geminiProvider.generateLearningContent(
        payload.word,
        payload.originalSentence,
        payload.dictionaryData
      );
    } else if (action === 'generate-more-usages') {
      result = await geminiProvider.generateMoreUsages(
        payload.word,
        payload.currentUsages
      );
    } else if (action === 'generate-more-quizzes') {
      result = await geminiProvider.generateMoreQuizzes(payload.word);
    } else if (action === 'generate-more-misconceptions') {
      result = await geminiProvider.generateMoreMisconceptions(
        payload.word,
        payload.currentMisconceptions
      );
    } else if (action === 'evaluate-translation') {
      result = await geminiProvider.evaluateTranslation(
        payload.word,
        payload.englishSentence,
        payload.userTranslation
      );
    } else {
      return res.status(404).json({ error: 'Unknown AI route action: ' + action });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('AI Request Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
