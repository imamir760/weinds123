import {z} from 'genkit';

export const MatchJobCandidateInputSchema = z.object({
  candidateProfile: z
    .string()
    .describe(
      'The full profile of the candidate, including skills, experience, and education.'
    ),
  jobDescription: z
    .string()
    .describe(
      'The full job description, including title, responsibilities, and required skills.'
    ),
});
export type MatchJobCandidateInput = z.infer<
  typeof MatchJobCandidateInputSchema
>;

export const MatchJobCandidateOutputSchema = z.object({
  matchScore: z
    .number()
    .describe(
      'A percentage score (0-100) indicating how well the candidate profile matches the job description.'
    ),
  justification: z
    .string()
    .describe('A brief, one-sentence justification for the match score.'),
  recommendedSkills: z
    .array(z.string())
    .describe(
      'A list of 3-5 key skills from the job description that the candidate seems to be lacking or could strengthen.'
    ),
});
export type MatchJobCandidateOutput = z.infer<
  typeof MatchJobCandidateOutputSchema
>;
