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
    .describe('Unstructured text containing information about the job.'),
});
export type GenerateJobDescriptionInput = z.infer<
  typeof GenerateJobDescriptionInputSchema
>;

const GenerateJobDescriptionOutputSchema = z.object({
  title: z.string().describe('The title of the job.'),
  responsibilities: z.string().describe('The responsibilities of the job.'),
  skills: z.string().describe('The skills required for the job, comma-separated.'),
  salary: z.string().optional().describe('The estimated salary or salary range for the role.'),
  location: z.string().optional().describe('The physical location for the job (e.g., "San Francisco, CA", "Remote").'),
  workMode: z.enum(['Remote', 'Hybrid', 'On-site']).optional().describe('The work mode (Remote, Hybrid, or On-site).'),
  education: z.string().optional().describe('The required or preferred educational background.'),
});
export type GenerateJobDescriptionOutput = z.infer<
  typeof GenerateJobDescriptionOutputSchema
>;

export async function generateJobDescription(
  input: GenerateJobDescriptionInput
): Promise<GenerateJobDescriptionOutput> {
  return generateJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJobDescriptionPrompt',
  input: {schema: GenerateJobDescriptionInputSchema},
  output: {schema: GenerateJobDescriptionOutputSchema},
  prompt: `You are an AI assistant designed to extract structured information from unstructured text to generate a job description.

  Analyze the following text and extract the following details:
  - Job Title
  - Key Responsibilities
  - Required Skills (as a comma-separated string)
  - Salary or Salary Range
  - Location
  - Work Mode (classify as "Remote", "Hybrid", or "On-site")
  - Education requirements

  Text: {{{text}}}

  Your output must conform to the JSON schema for GenerateJobDescriptionOutputSchema.
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
