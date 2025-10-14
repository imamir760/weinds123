'use server';

/**
 * @fileOverview An AI flow to diagnose application errors and suggest solutions.
 *
 * - diagnoseError - A function that analyzes an error and provides a root cause and resolution.
 * - DiagnoseErrorInput - The input type for the diagnoseError function.
 * - DiagnoseErrorOutput - The return type for the diagnoseError function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const DiagnoseErrorInputSchema = z.object({
  errorMessage: z.string().describe('The full error message, including any stack trace.'),
  codeSnippet: z.string().describe('The relevant block of code where the error occurred.'),
  filePath: z.string().describe('The path to the file containing the code.'),
  context: z.string().optional().describe('Any additional context about what the user was trying to do.')
});
export type DiagnoseErrorInput = z.infer<typeof DiagnoseErrorInputSchema>;

export const DiagnoseErrorOutputSchema = z.object({
  rootCause: z.string().describe('A clear and concise explanation of the most likely root cause of the error.'),
  solution: z.string().describe('A step-by-step guide or corrected code snippet to resolve the error.'),
});
export type DiagnoseErrorOutput = z.infer<typeof DiagnoseErrorOutputSchema>;

export async function diagnoseError(
  input: DiagnoseErrorInput
): Promise<DiagnoseErrorOutput> {
  return diagnoseErrorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseErrorPrompt',
  input: {schema: DiagnoseErrorInputSchema},
  output: {schema: DiagnoseErrorOutputSchema},
  prompt: `You are an expert AI software developer and debugger for a Next.js application using React, TypeScript, Firebase, and Genkit.
  
Your task is to analyze the provided error details and furnish a clear root cause analysis and an actionable solution.

**Error Details:**
- File Path: {{{filePath}}}
- Error Message:
\`\`\`
{{{errorMessage}}}
\`\`\`
- Code Snippet:
\`\`\`typescript
{{{codeSnippet}}}
\`\`\`
{{#if context}}
- User Context: {{{context}}}
{{/if}}

**Instructions:**
1.  **Analyze the Root Cause:** Based on all the information, determine the single most likely reason for the error. Consider common issues like race conditions, incorrect API usage, security rule violations, or simple syntax errors.
2.  **Propose a Solution:** Provide a clear, step-by-step solution. If applicable, include a corrected code snippet. The solution should be easy for a developer to understand and implement.

Your output must conform to the specified JSON schema.`,
});

const diagnoseErrorFlow = ai.defineFlow(
  {
    name: 'diagnoseErrorFlow',
    inputSchema: DiagnoseErrorInputSchema,
    outputSchema: DiagnoseErrorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
