import {z} from 'genkit';

export const ReformatResumeInputSchema = z.object({
  rawText: z
    .string()
    .describe('The raw text content of the resume to be reformatted.'),
  templateName: z
    .string()
    .describe('The name of the template to use for reformatting the resume.'),
});
export type ReformatResumeInput = z.infer<typeof ReformatResumeInputSchema>;

export const ReformatResumeOutputSchema = z.object({
  formattedResume: z
    .string()
    .describe('The reformatted resume content in the specified template.'),
});
export type ReformatResumeOutput = z.infer<typeof ReformatResumeOutputSchema>;
