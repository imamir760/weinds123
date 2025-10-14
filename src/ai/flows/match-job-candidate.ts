'use server';

/**
 * @fileOverview AI flow to match a candidate's profile with a job description.
 *
 * - matchJobCandidate - A function that calculates a match score and suggests skills.
 * - MatchJobCandidateInput - The input type for the matchJobCandidate function.
 * - MatchJobCandidateOutput - The return type for the matchJobCandidate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchJobCandidateInputSchema = z.object({
  candidateProfile: z
    .string()
    .describe('The full profile of the candidate, including skills, experience, and education.'),
  jobDescription: z
    .string()
    .describe('The full job description, including title, responsibilities, and required skills.'),
});
export type MatchJobCandidateInput = z.infer<
  typeof MatchJobCandidateInputSchema
>;

const MatchJobCandidateOutputSchema = z.object({
  matchScore: z
    .number()
    .describe('A percentage score (0-100) indicating how well the candidate profile matches the job description.'),
  justification: z
    .string()
    .describe('A brief, one-sentence justification for the match score.'),
  recommendedSkills: z
    .array(z.string())
    .describe('A list of 3-5 key skills from the job description that the candidate seems to be lacking or could strengthen.'),
});
export type MatchJobCandidateOutput = z.infer<
  typeof MatchJobCandidateOutputSchema
>;

export async function matchJobCandidate(
  input: MatchJobCandidateInput
): Promise<MatchJobCandidateOutput> {
  return matchJobCandidateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchJobCandidatePrompt',
  input: {schema: MatchJobCandidateInputSchema},
  output: {schema: MatchJobCandidateOutputSchema},
  prompt: `You are an expert AI recruitment assistant. Your task is to analyze a candidate's profile against a job description and provide a compatibility score.

**Candidate Profile:**
{{{candidateProfile}}}

**Job Description:**
{{{jobDescription}}}

**Instructions:**
1.  **Calculate a Match Score:** Based on the alignment of skills, experience, and education, provide a match score from 0 to 100. A score of 100 means a perfect match.
2.  **Provide Justification:** Write a single, concise sentence explaining the reasoning behind your score.
3.  **Recommend Skills:** Identify 3 to 5 crucial skills mentioned in the job description that are either missing from the candidate's profile or could be highlighted more strongly.

Your output must conform to the specified JSON schema.`,
});

const matchJobCandidateFlow = ai.defineFlow(
  {
    name: 'matchJobCandidateFlow',
    inputSchema: MatchJobCandidateInputSchema,
    outputSchema: MatchJobCandidateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
