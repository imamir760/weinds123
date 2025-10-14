import {z} from 'genkit';

export const GenerateJobDescriptionInputSchema = z.object({
  text: z
    .string()
    .describe('Unstructured text containing information about the job.'),
});
export type GenerateJobDescriptionInput = z.infer<
  typeof GenerateJobDescriptionInputSchema
>;

export const GenerateJobDescriptionOutputSchema = z.object({
  title: z.string().describe('The title of the job.'),
  responsibilities: z
    .string()
    .describe(
      'The responsibilities of the job as a newline-separated and numbered list. It should contain at least 5 points. For example: "1. Do a thing.\\n2. Do another thing."'
    ),
  skills: z.string().describe('The skills required for the job, comma-separated.'),
  experience: z
    .string()
    .optional()
    .describe('The required years of experience (e.g., "0-2 years", "5+ years", "Senior Level").'),
  salary: z
    .string()
    .optional()
    .describe('The estimated salary or salary range for the role.'),
  location: z
    .string()
    .optional()
    .describe('The physical location for the job (e.g., "San Francisco, CA", "Remote").'),
  workMode: z
    .enum(['Remote', 'Hybrid', 'On-site'])
    .optional()
    .describe('The work mode (Remote, Hybrid, or On-site).'),
  education: z
    .string()
    .optional()
    .describe('The required or preferred educational background.'),
});
export type GenerateJobDescriptionOutput = z.infer<
  typeof GenerateJobDescriptionOutputSchema
>;
