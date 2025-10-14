import {z} from 'genkit';

export const GenerateLearningRoadmapInputSchema = z.object({
  specialization: z
    .string()
    .describe(
      'The specific career specialization to generate a learning roadmap for.'
    ),
  userCareerGoals: z.string().describe('The user career goals.'),
});
export type GenerateLearningRoadmapInput = z.infer<
  typeof GenerateLearningRoadmapInputSchema
>;

export const GenerateLearningRoadmapOutputSchema = z.object({
  roadmap: z.string().describe('The generated learning roadmap.'),
  resources: z.string().describe('The learning resources.'),
});
export type GenerateLearningRoadmapOutput = z.infer<
  typeof GenerateLearningRoadmapOutputSchema
>;
