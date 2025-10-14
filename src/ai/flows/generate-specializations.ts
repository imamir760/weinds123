'use server';

/**
 * @fileOverview Generates potential career specializations based on user interests and skills.
 *
 * - generateSpecializations - A function that generates career specializations.
 * - GenerateSpecializationsInput - The input type for the generateSpecializations function.
 * - GenerateSpecializationsOutput - The return type for the generateSpecializations function.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateSpecializationsInputSchema,
  GenerateSpecializationsOutputSchema,
  type GenerateSpecializationsInput,
  type GenerateSpecializationsOutput,
} from '@/ai/schemas/generate-specializations-schema';

export async function generateSpecializations(
  input: GenerateSpecializationsInput
): Promise<GenerateSpecializationsOutput> {
  return generateSpecializationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpecializationsPrompt',
  input: {schema: GenerateSpecializationsInputSchema},
  output: {schema: GenerateSpecializationsOutputSchema},
  prompt: `You are a career advisor. Given the following interests and skills of a user, suggest a few potential career specializations.

Interests: {{{interests}}}
Skills: {{{skills}}}

Suggest career specializations that align with their interests and skills. Return the specializations as a JSON array of strings. Only include career specializations that are realistic given the provided inputs, and don't be afraid to suggest specializations that may not be immediately obvious but could be a good fit.

Output format: { specializations: string[] }`,
});

const generateSpecializationsFlow = ai.defineFlow(
  {
    name: 'generateSpecializationsFlow',
    inputSchema: GenerateSpecializationsInputSchema,
    outputSchema: GenerateSpecializationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
