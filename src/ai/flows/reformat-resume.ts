'use server';

/**
 * @fileOverview AI-powered resume reformatting flow.
 *
 * - reformatResume - Reformats raw text resumes into professional templates.
 * - ReformatResumeInput - Input type for the reformatResume function.
 * - ReformatResumeOutput - Return type for the reformatResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReformatResumeInputSchema = z.object({
  rawText: z
    .string()
    .describe('The raw text content of the resume to be reformatted.'),
  templateName: z
    .string()
    .describe('The name of the template to use for reformatting the resume.'),
});
export type ReformatResumeInput = z.infer<typeof ReformatResumeInputSchema>;

const ReformatResumeOutputSchema = z.object({
  formattedResume: z
    .string()
    .describe('The reformatted resume content in the specified template.'),
});
export type ReformatResumeOutput = z.infer<typeof ReformatResumeOutputSchema>;

export async function reformatResume(input: ReformatResumeInput): Promise<ReformatResumeOutput> {
  return reformatResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reformatResumePrompt',
  input: {schema: ReformatResumeInputSchema},
  output: {schema: ReformatResumeOutputSchema},
  prompt: `You are an AI resume expert. Please reformat the following resume text into a professional format using the {{templateName}} template.\n\nResume Text:\n{{{rawText}}}`,
});

const reformatResumeFlow = ai.defineFlow(
  {
    name: 'reformatResumeFlow',
    inputSchema: ReformatResumeInputSchema,
    outputSchema: ReformatResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
