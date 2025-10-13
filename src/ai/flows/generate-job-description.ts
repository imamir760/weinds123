'use server';

/**
 * @fileOverview Job description generator.
 *
 * - generateJobDescription - A function that generates a job description from unstructured text.
 * - GenerateJobDescriptionInput - The input type for the generateJobDescription function.
 * - GenerateJobDescriptionOutput - The return type for the generateJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJobDescriptionInputSchema = z.object({
  text: z
    .string()
    .describe("Unstructured text containing information about the job."),
});
export type GenerateJobDescriptionInput = z.infer<typeof GenerateJobDescriptionInputSchema>;

const GenerateJobDescriptionOutputSchema = z.object({
  title: z.string().describe('The title of the job.'),
  responsibilities: z
    .string()
    .describe('The responsibilities of the job.'),
  skills: z.string().describe('The skills required for the job.'),
  metadata: z
    .string()
    .optional()
    .describe('Any relevant metadata for filtering the job.'),
});
export type GenerateJobDescriptionOutput = z.infer<typeof GenerateJobDescriptionOutputSchema>;

export async function generateJobDescription(
  input: GenerateJobDescriptionInput
): Promise<GenerateJobDescriptionOutput> {
  return generateJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJobDescriptionPrompt',
  input: {schema: GenerateJobDescriptionInputSchema},
  output: {schema: GenerateJobDescriptionOutputSchema},
  prompt: `You are an AI assistant designed to extract information from unstructured text and generate a job description.

  Extract the job title, responsibilities, and skills required from the following text.  If there is any other relevant metadata, extract that as well.

  Text: {{{text}}}

  Your output should conform to the JSON schema for GenerateJobDescriptionOutputSchema.
  `,
});

const generateJobDescriptionFlow = ai.defineFlow(
  {
    name: 'generateJobDescriptionFlow',
    inputSchema: GenerateJobDescriptionInputSchema,
    outputSchema: GenerateJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
