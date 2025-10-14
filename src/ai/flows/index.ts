'use server';

/**
 * @fileoverview A central file for all AI flows.
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
import { generateLearningRoadmap } from './generate-learning-roadmap';
import { reformatResume } from './reformat-resume';
import { generateJobDescription } from './generate-job-description';
import { generateSpecializations } from './generate-specializations';
import { conductAiInterview } from './conduct-ai-interview';
import { matchJobCandidate } from './match-job-candidate';
import { diagnoseError } from './diagnose-error';
import { generateSkillTest } from './generate-skill-test';

import type {
  GenerateLearningRoadmapInput,
  GenerateLearningRoadmapOutput,
} from '../schemas/generate-learning-roadmap-schema';
import type {
  ReformatResumeInput,
  ReformatResumeOutput,
} from '../schemas/reformat-resume-schema';
import type {
  GenerateJobDescriptionInput,
  GenerateJobDescriptionOutput,
} from '../schemas/generate-job-description-schema';
import type {
  GenerateSpecializationsInput,
  GenerateSpecializationsOutput,
} from '../schemas/generate-specializations-schema';
import type {
  ConductAiInterviewInput,
  ConductAiInterviewOutput,
} from '../schemas/conduct-ai-interview-schema';
import type {
  MatchJobCandidateInput,
  MatchJobCandidateOutput,
} from '../schemas/match-job-candidate-schema';
import type {
  DiagnoseErrorInput,
  DiagnoseErrorOutput,
} from '../schemas/diagnose-error-schema';
import type {
  GenerateSkillTestInput,
  GenerateSkillTestOutput,
} from '../schemas/generate-skill-test-schema';

export {
  generateLearningRoadmap,
  reformatResume,
  generateJobDescription,
  generateSpecializations,
  conductAiInterview,
  matchJobCandidate,
  diagnoseError,
  generateSkillTest,
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
  GenerateSkillTestInput,
  GenerateSkillTestOutput,
};
