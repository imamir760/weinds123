'use server';
/**
 * @fileOverview AI flow to evaluate a candidate's skill test submission.
 *
 * - evaluateSkillTest - A function that analyzes a submission and generates a report.
 * - EvaluateSkillTestInput - The input type for the evaluateSkillTest function.
 * - EvaluateSkillTestOutput - The return type for the evaluateSkillTest function.
 */

import {ai} from '@/ai/genkit';
import {
  EvaluateSkillTestInputSchema,
  EvaluateSkillTestOutputSchema,
  type EvaluateSkillTestInput,
  type EvaluateSkillTestOutput,
} from '@/ai/schemas/evaluate-skill-test-schema';

export async function evaluateSkillTest(
  input: EvaluateSkillTestInput
): Promise<EvaluateSkillTestOutput> {
  return evaluateSkillTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateSkillTestPrompt',
  input: {schema: EvaluateSkillTestInputSchema},
  output: {schema: EvaluateSkillTestOutputSchema},
  prompt: `You are an expert technical evaluator. Your task is to analyze a candidate's skill test submission and provide a detailed evaluation.

**Candidate's Submission:**
{{#each submission}}
---
Question: {{{this.questionText}}}
Candidate's Answer: {{{this.candidateAnswer}}}
Correct Answer: {{{this.correctAnswer}}}
---
{{/each}}

**Instructions:**

1.  **Calculate Overall Score:** Evaluate the entire submission and provide a score from 0 to 100. Consider not only the number of correct multiple-choice answers but also the quality, accuracy, and completeness of the short-answer responses.
2.  **Write a Performance Summary:** Provide a concise, one-paragraph summary of the candidate's overall performance.
3.  **Identify Strengths:** List 2-3 specific topics or skills where the candidate demonstrated strong knowledge.
4.  **Identify Areas for Improvement:** List 2-3 specific topics or skills where the candidate should focus their learning.

Your output **MUST** conform to the specified JSON schema.`,
});

const evaluateSkillTestFlow = ai.defineFlow(
  {
    name: 'evaluateSkillTestFlow',
    inputSchema: EvaluateSkillTestInputSchema,
    outputSchema: EvaluateSkillTestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
