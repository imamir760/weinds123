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
import { generateLearningRoadmap } from './flows/generate-learning-roadmap';
import { reformatResume } from './flows/reformat-resume';
import { generateJobDescription } from './flows/generate-job-description';
import { generateSpecializations } from './flows/generate-specializations';
import { conductAiInterview } from './flows/conduct-ai-interview';
import { matchJobCandidate } from './flows/match-job-candidate';
import { diagnoseError } from './flows/diagnose-error';

import type {
  GenerateLearningRoadmapInput,
  GenerateLearningRoadmapOutput,
} from './schemas/generate-learning-roadmap-schema';
import type {
  ReformatResumeInput,
  ReformatResumeOutput,
} from './schemas/reformat-resume-schema';
import type {
  GenerateJobDescriptionInput,
  GenerateJobDescriptionOutput,
} from './schemas/generate-job-description-schema';
import type {
  GenerateSpecializationsInput,
  GenerateSpecializationsOutput,
} from './schemas/generate-specializations-schema';
import type {
  ConductAiInterviewInput,
  ConductAiInterviewOutput,
} from './schemas/conduct-ai-interview-schema';
import type {
  MatchJobCandidateInput,
  MatchJobCandidateOutput,
} from './schemas/match-job-candidate-schema';
import type {
  DiagnoseErrorInput,
  DiagnoseErrorOutput,
} from './schemas/diagnose-error-schema';

export {
  generateLearningRoadmap,
  reformatResume,
  generateJobDescription,
  generateSpecializations,
  conductAiInterview,
  matchJobCandidate,
  diagnoseError,
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
  DiagnoseErrorInput,
  DiagnoseErrorOutput,
};
