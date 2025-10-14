'use server';

/**
 * @fileOverview Job description generator.
 *
 * - generateJobDescription - A function that generates a job description from unstructured text.
 * - GenerateJobDescriptionInput - The input type for the generateJobDescription function.
 * - GenerateJobDescriptionOutput - The return type for the generateJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateJobDescriptionInputSchema,
  GenerateJobDescriptionOutputSchema,
  type GenerateJobDescriptionInput,
  type GenerateJobDescriptionOutput,
} from '@/ai/schemas/generate-job-description-schema';

export async function generateJobDescription(
  input: GenerateJobDescriptionInput
): Promise<GenerateJobDescriptionOutput> {
  return generateJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJobDescriptionPrompt',
  input: {schema: GenerateJobDescriptionInputSchema},
  output: {schema: GenerateJobDescriptionOutputSchema},
  prompt: `You are an AI assistant that creates structured job descriptions from raw text.
  
Analyze the provided text and extract the following information. You must provide a value for every field. If a value is not explicitly mentioned, make a reasonable assumption based on the context (e.g., assume a location is "Remote" if not specified, estimate a salary range based on the title, assume "2-3 years" experience if not clear).

- Job Title
- Key Responsibilities (as a newline-separated and numbered string, with at least 5 distinct points. For example: "1. Do a thing.\\n2. Do another thing.")
- Required Skills (as a comma-separated string)
- Experience Level (e.g., "Entry Level", "2-4 years", "Senior")
- Salary or Salary Range
- Location (e.g., "San Francisco, CA", "Remote")
- Work Mode (classify as "Remote", "Hybrid", or "On-site")
- Education requirements

Text: {{{text}}}

Your output must conform to the JSON schema and include all fields.
`,
});

const generateJobDescriptionFlow = ai.defineFlow(
  {
    name: 'generateJobDescriptionFlow',
    inputSchema: GenerateJobDescriptionInputSchema,
    outputSchema: GenerateJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
