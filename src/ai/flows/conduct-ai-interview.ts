'use server';

/**
 * @fileOverview Implements a conversational AI interview flow for candidate screening.
 *
 * - conductAiInterview - A function to initiate and manage the AI interview process.
 * - ConductAiInterviewInput - The input type for the conductAiInterview function.
 * - ConductAiInterviewOutput - The return type for the conductAiInterview function, including the semantic score.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConductAiInterviewInputSchema = z.object({
  candidateProfile: z.string().describe('The candidate profile including skills and experience.'),
  jobDescription: z.string().describe('The job description for the role.'),
  question: z.string().describe('The interview question to ask the candidate.'),
  previousResponses: z.string().optional().describe('The candidate\'s previous responses in the interview.'),
});
export type ConductAiInterviewInput = z.infer<typeof ConductAiInterviewInputSchema>;

const ConductAiInterviewOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the interview question.'),
  semanticScore: z.number().describe('A semantic score indicating the suitability of the candidate based on the interview.'),
});
export type ConductAiInterviewOutput = z.infer<typeof ConductAiInterviewOutputSchema>;

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
