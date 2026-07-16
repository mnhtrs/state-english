import type { DictionaryProvider, DictionaryData } from '../core/domain';

export class FreeDictionaryProvider implements DictionaryProvider {
  async lookupWord(word: string, _contextSentence: string): Promise<DictionaryData | null> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Dictionary API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) return null;

      const entry = data[0];
      
      // Free Dictionary API returns multiple meanings. 
      // In a more advanced version, we could use the contextSentence to disambiguate.
      // For V1, we will take the first meaning as a fallback, but we should ideally pass all definitions 
      // to Gemini so Gemini can select the correct one based on context.
      // Let's extract the first meaning for now, but we will collect all definitions to let AI disambiguate if needed.
      
      // Actually, the prompt says "Determine the correct dictionary sense based on the original sentence". 
      // So we should return the definitions to Gemini. But our interface expects a single `definition` and `partOfSpeech`.
      // Let's modify our approach: we'll return a combined string or just the first one, and let Gemini do its job.
      // Or we can return all definitions as a single string.
      
      const meanings = entry.meanings || [];
      if (meanings.length === 0) return null;

      // To keep the DictionaryData simple as requested but allow Gemini to disambiguate,
      // we can compile all definitions into a structured string.
      const compiledDefinition = meanings.map((m: any) => {
        const partOfSpeech = m.partOfSpeech;
        const defs = m.definitions.map((d: any) => d.definition).join('; ');
        return `[${partOfSpeech}] ${defs}`;
      }).join('\n');

      // Phonetics
      let phoneticsStr = '';
      if (entry.phonetics && entry.phonetics.length > 0) {
        const p = entry.phonetics.find((p: any) => p.text);
        if (p) phoneticsStr = p.text;
      } else if (entry.phonetic) {
        phoneticsStr = entry.phonetic;
      }

      // Examples
      const examples: string[] = [];
      meanings.forEach((m: any) => {
        m.definitions.forEach((d: any) => {
          if (d.example) examples.push(d.example);
        });
      });

      return {
        definition: compiledDefinition,
        partOfSpeech: meanings[0]?.partOfSpeech || 'unknown',
        phonetics: phoneticsStr,
        examples: examples.slice(0, 3) // take up to 3 examples
      };

    } catch (error) {
      console.error('Failed to lookup word in dictionary:', error);
      throw error;
    }
  }
}
