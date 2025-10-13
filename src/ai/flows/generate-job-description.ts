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
  responsibilities: z.string().describe('The responsibilities of the job as a newline-separated and numbered list. It should contain at least 5 points. For example: "1. Do a thing.\n2. Do another thing."'),
  skills: z.string().describe('The skills required for the job, comma-separated.'),
  experience: z.string().optional().describe('The required years of experience (e.g., "0-2 years", "5+ years", "Senior Level").'),
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
  prompt: `You are an AI assistant that creates structured job descriptions from raw text.
  
Analyze the provided text and extract the following information. You must provide a value for every field. If a value is not explicitly mentioned, make a reasonable assumption based on the context (e.g., assume a location is "Remote" if not specified, estimate a salary range based on the title, assume "2-3 years" experience if not clear).

- Job Title
- Key Responsibilities (as a newline-separated and numbered string, with at least 5 distinct points. For example: "1. Do a thing.\n2. Do another thing.")
- Required Skills (as a comma-separated string)
- Experience Level (e.g., "Entry Level", "2-4 years", "Senior")
- Salary or Salary Range
- Location (e.g., "San Francisco, CA", "Remote")
- Work Mode (classify as "Remote", "Hybrid", or "On-site")
- Education requirements

Text: {{{text}}}

Your output must conform to the JSON schema and include all fields.
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
