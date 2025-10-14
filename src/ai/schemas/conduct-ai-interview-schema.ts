import {z} from 'genkit';

export const ConductAiInterviewInputSchema = z.object({
  candidateProfile: z.string().describe('The candidate profile including skills and experience.'),
  jobDescription: z.string().describe('The job description for the role.'),
  question: z.string().describe('The interview question to ask the candidate.'),
  previousResponses: z.string().optional().describe('The candidate\'s previous responses in the interview.'),
});
export type ConductAiInterviewInput = z.infer<typeof ConductAiInterviewInputSchema>;

export const ConductAiInterviewOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the interview question.'),
  semanticScore: z.number().describe('A semantic score indicating the suitability of the candidate based on the interview.'),
});
export type ConductAiInterviewOutput = z.infer<typeof ConductAiInterviewOutputSchema>;
