'use server';
/**
 * @fileOverview A central file for all AI flows.
 *
 * This file serves as an entry point for all AI-related functionalities,
 * making it easier to manage and import flows across the application.
 * By centralizing exports, we can avoid clutter in other parts of the
 * codebase and ensure a single source of truth for AI flow definitions.
 *
 * Each imported file represents a specific AI capability, such as
 * generating a learning roadmap, reformatting a resume, or creating a
 * job description. These flows are built using Genkit and can be
 * individually updated or extended.
 *
 * The exported functions, along with their input and output types,
 * provide a clear and typed interface for interacting with the AI models.
 * This structure enhances code readability, maintainability, and
 * developer experience when working with AI features.
 */
import {
  generateLearningRoadmap,
  GenerateLearningRoadmapInput,
  GenerateLearningRoadmapOutput,
} from './generate-learning-roadmap';

import {
  reformatResume,
  ReformatResumeInput,
  ReformatResumeOutput,
} from './reformat-resume';

import {
  generateJobDescription,
  GenerateJobDescriptionInput,
  GenerateJobDescriptionOutput,
} from './generate-job-description';

import {
  generateSpecializations,
  GenerateSpecializationsInput,
  GenerateSpecializationsOutput,
} from './generate-specializations';

import {
  conductAiInterview,
  ConductAiInterviewInput,
  ConductAiInterviewOutput,
} from './conduct-ai-interview';

import {
  matchJobCandidate,
  MatchJobCandidateInput,
  MatchJobCandidateOutput,
} from './match-job-candidate';

export {
  generateLearningRoadmap,
  reformatResume,
  generateJobDescription,
  generateSpecializations,
  conductAiInterview,
  matchJobCandidate,
};
export type {
  GenerateLearningRoadmapInput,
  GenerateLearningRoadmapOutput,
  ReformatResumeInput,
  ReformatResumeOutput,
  GenerateJobDescriptionInput,
  GenerateJobDescriptionOutput,
  GenerateSpecializationsInput,
  GenerateSpecializationsOutput,
  ConductAiInterviewInput,
  ConductAiInterviewOutput,
  MatchJobCandidateInput,
  MatchJobCandidateOutput,
};
