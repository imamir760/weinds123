import {z} from 'genkit';

export const GenerateSkillTestInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The full job description, including responsibilities and skills.'),
  candidateSkills: z
    .array(z.string())
    .describe("An array of the candidate's skills."),
});

export type GenerateSkillTestInput = z.infer<
  typeof GenerateSkillTestInputSchema
>;

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the question.'),
  questionType: z
    .enum(['multiple-choice', 'short-answer'])
    .describe('The type of the question.'),
  options: z
    .array(z.string())
    .optional()
    .describe(
      'An array of 4 possible answers for multiple-choice questions.'
    ),
  correctAnswer: z
    .string()
    .describe('The correct answer for the question.'),
  topic: z
    .string()
    .describe(
      'The skill or concept this question is testing (e.g., "React", "Data Structures").'
    ),
  difficulty: z
    .enum(['easy', 'intermediate', 'hard'])
    .describe('The difficulty level of the question.'),
});

export const GenerateSkillTestOutputSchema = z.object({
  questions: z
    .array(QuestionSchema)
    .length(20)
    .describe('An array of exactly 20 skill test questions.'),
});

export type GenerateSkillTestOutput = z.infer<
  typeof GenerateSkillTestOutputSchema
>;
