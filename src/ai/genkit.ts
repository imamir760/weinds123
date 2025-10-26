import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {Genkit as GenkitType} from 'genkit/lib/genkit';

// Memoize the AI instance to prevent re-initialization during Next.js build process,
// which can cause errors.
let aiInstance: GenkitType | undefined = undefined;
function getAi(): GenkitType {
  if (aiInstance) {
    return aiInstance;
  }
  aiInstance = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-flash',
  });
  return aiInstance;
}

export const ai = getAi();
