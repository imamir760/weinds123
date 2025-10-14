'use server';

/**
 * @fileOverview AI flow to generate a unique skill test for a candidate.
 *
 * - generateSkillTest - A function that creates a 20-question test.
 * - GenerateSkillTestInput - The input type for the generateSkillTest function.
 * - GenerateSkillTestOutput - The return type for the generateSkillTest function.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateSkillTestInputSchema,
  GenerateSkillTestOutputSchema,
  type GenerateSkillTestInput,
  type GenerateSkillTestOutput,
} from '@/ai/schemas/generate-skill-test-schema';

export async function generateSkillTest(
  input: GenerateSkillTestInput
): Promise<GenerateSkillTestOutput> {
  return generateSkillTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSkillTestPrompt',
  input: {schema: GenerateSkillTestInputSchema},
  output: {schema: GenerateSkillTestOutputSchema},
  prompt: `You are an expert technical assessor responsible for creating skill tests for job candidates. Your task is to generate a unique 20-question test based on the provided job description and candidate's skills.

**Job Description:**
{{{jobDescription}}}

**Candidate's Skills:**
{{#each candidateSkills}}
- {{{this}}}
{{/each}}

**Instructions:**

1.  **Generate Exactly 20 Questions:** The output must contain a JSON array of exactly 20 question objects.
2.  **Question Types:**
    *   Create exactly 15 "multiple-choice" questions.
    *   Create exactly 5 "short-answer" questions.
3.  **Question Sourcing:**
    *   Generate 15 questions directly related to the key responsibilities and required skills mentioned in the **Job Description**.
    *   Generate 5 questions based on the **Candidate's Skills**.
4.  **Difficulty Distribution:** Distribute the difficulty of the 20 questions as follows:
    *   2 to 5 questions must be "easy".
    *   2 to 5 questions must be "intermediate".
    *   The remaining questions must be "hard".
5.  **Uniqueness:** Ensure the questions are unique for each generation. Do not repeat questions.
6.  **Multiple-Choice Format:** For each "multiple-choice" question, provide exactly 4 options and clearly indicate the correct answer.
7.  **Short-Answer Format:** For "short-answer" questions, provide a concise and accurate answer.

Your output **MUST** conform to the specified JSON schema.
`,
});

const generateSkillTestFlow = ai.defineFlow(
  {
    name: 'generateSkillTestFlow',
    inputSchema: GenerateSkillTestInputSchema,
    outputSchema: GenerateSkillTestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
