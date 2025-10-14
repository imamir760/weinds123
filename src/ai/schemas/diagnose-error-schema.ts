import {z} from 'genkit';

export const DiagnoseErrorInputSchema = z.object({
  errorMessage: z
    .string()
    .describe('The full error message, including any stack trace.'),
  codeSnippet: z
    .string()
    .describe('The relevant block of code where the error occurred.'),
  filePath: z.string().describe('The path to the file containing the code.'),
  context: z
    .string()
    .optional()
    .describe('Any additional context about what the user was trying to do.'),
});
export type DiagnoseErrorInput = z.infer<typeof DiagnoseErrorInputSchema>;

export const DiagnoseErrorOutputSchema = z.object({
  rootCause: z
    .string()
    .describe(
      'A clear and concise explanation of the most likely root cause of the error.'
    ),
  solution: z
    .string()
    .describe(
      'A step-by-step guide or corrected code snippet to resolve the error.'
    ),
});
export type DiagnoseErrorOutput = z.infer<typeof DiagnoseErrorOutputSchema>;
