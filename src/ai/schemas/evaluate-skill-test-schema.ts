import {z} from 'genkit';

const SubmissionItemSchema = z.object({
  questionText: z.string(),
  candidateAnswer: z.string(),
  correctAnswer: z.string(),
});

export const EvaluateSkillTestInputSchema = z.object({
  submission: z
    .array(SubmissionItemSchema)
    .describe("An array of the candidate's answers for the skill test."),
});
export type EvaluateSkillTestInput = z.infer<
  typeof EvaluateSkillTestInputSchema
>;

export const EvaluateSkillTestOutputSchema = z.object({
  score: z
    .number()
    .describe(
      'A score from 0 to 100 evaluating the entire submission, based on correctness and quality of answers.'
    ),
  summary: z
    .string()
    .describe(
      'A concise, one-paragraph summary of the candidate\'s performance, highlighting overall strengths and weaknesses.'
    ),
  strengths: z
    .array(z.string())
    .describe(
      'A list of 2-3 specific topics or skills where the candidate demonstrated strong knowledge.'
    ),
  areasForImprovement: z
    .array(z.string())
    .describe(
      'A list of 2-3 specific topics or skills where the candidate should focus on improving.'
    ),
});
export type EvaluateSkillTestOutput = z.infer<
  typeof EvaluateSkillTestOutputSchema
>;
