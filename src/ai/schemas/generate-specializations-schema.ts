import {z} from 'genkit';

export const GenerateSpecializationsInputSchema = z.object({
  interests: z
    .string()
    .describe('The interests of the user, comma separated.'),
  skills: z.string().describe('The skills of the user, comma separated.'),
});

export type GenerateSpecializationsInput = z.infer<
  typeof GenerateSpecializationsInputSchema
>;

export const GenerateSpecializationsOutputSchema = z.object({
  specializations: z
    .array(z.string())
    .describe('An array of potential career specializations.'),
});

export type GenerateSpecializationsOutput = z.infer<
  typeof GenerateSpecializationsOutputSchema
>;
