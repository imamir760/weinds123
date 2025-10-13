'use server';

/**
 * @fileOverview A learning roadmap generator AI agent.
 *
 * - generateLearningRoadmap - A function that handles the generation of a learning roadmap.
 * - GenerateLearningRoadmapInput - The input type for the generateLearningRoadmap function.
 * - GenerateLearningRoadmapOutput - The return type for the generateLearningRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLearningRoadmapInputSchema = z.object({
  specialization: z
    .string()
    .describe('The specific career specialization to generate a learning roadmap for.'),
  userCareerGoals: z.string().describe('The user career goals.'),
});
export type GenerateLearningRoadmapInput = z.infer<
  typeof GenerateLearningRoadmapInputSchema
>;

const GenerateLearningRoadmapOutputSchema = z.object({
  roadmap: z.string().describe('The generated learning roadmap.'),
  resources: z.string().describe('The learning resources.'),
});
export type GenerateLearningRoadmapOutput = z.infer<
  typeof GenerateLearningRoadmapOutputSchema
>;

export async function generateLearningRoadmap(
  input: GenerateLearningRoadmapInput
): Promise<GenerateLearningRoadmapOutput> {
  return generateLearningRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLearningRoadmapPrompt',
  input: {schema: GenerateLearningRoadmapInputSchema},
  output: {schema: GenerateLearningRoadmapOutputSchema},
  prompt: `You are an AI career mentor. Generate a learning roadmap for the user, so that they can achieve their goals.

User Career Goals: {{{userCareerGoals}}}
Specific Specialization: {{{specialization}}}

Roadmap:
Resources:`,
});

const generateLearningRoadmapFlow = ai.defineFlow(
  {
    name: 'generateLearningRoadmapFlow',
    inputSchema: GenerateLearningRoadmapInputSchema,
    outputSchema: GenerateLearningRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
