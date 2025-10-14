'use server';

/**
 * @fileOverview Implements a conversational AI interview flow for candidate screening.
 *
 * - conductAiInterview - A function to initiate and manage the AI interview process.
 * - ConductAiInterviewInput - The input type for the conductAiInterview function.
 * - ConductAiInterviewOutput - The return type for the conductAiInterview function, including the semantic score.
 */

import {ai} from '@/ai/genkit';
import {
  ConductAiInterviewInputSchema,
  ConductAiInterviewOutputSchema,
  type ConductAiInterviewInput,
  type ConductAiInterviewOutput,
} from '@/ai/schemas/conduct-ai-interview-schema';

export async function conductAiInterview(input: ConductAiInterviewInput): Promise<ConductAiInterviewOutput> {
  return conductAiInterviewFlow(input);
}

const interviewPrompt = ai.definePrompt({
  name: 'interviewPrompt',
  input: {schema: ConductAiInterviewInputSchema},
  output: {schema: ConductAiInterviewOutputSchema},
  prompt: `You are an AI interviewer evaluating candidates based on their profile and the job description.

Candidate Profile: {{{candidateProfile}}}
Job Description: {{{jobDescription}}}

Previous Responses: {{{previousResponses}}}

Question: {{{question}}}

Generate a response to the interview question and provide a semantic score (0-100) indicating the candidate\'s suitability for the role.
Response:
`, // Ensure output includes both response and semantic score
});

const conductAiInterviewFlow = ai.defineFlow(
  {
    name: 'conductAiInterviewFlow',
    inputSchema: ConductAiInterviewInputSchema,
    outputSchema: ConductAiInterviewOutputSchema,
  },
  async input => {
    const {output} = await interviewPrompt(input);
    return output!;
  }
);
