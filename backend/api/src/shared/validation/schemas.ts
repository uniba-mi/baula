import { z } from 'zod';

/**
 * Common validation schemas for request validation
 */

// User ID schema (ObjectId or shibId)
export const userIdSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200),
  filters: z.record(z.string(), z.any()).optional(),
});

// Semester schema (format: 2024w or 2024s)
export const semesterSchema = z.string().regex(/^\d{4}[ws]$/, 'Semester must be in format YYYYw or YYYYs');

// Module feedback schema
export const moduleFeedbackSchema = z.object({
  acronym: z.string().min(1).max(50, 'Acronym too long'),
  similarmods: z.number().min(0).max(5).optional(),
  similarchair: z.number().min(0).max(5).optional(),
  priorknowledge: z.number().min(0).max(5).optional(),
  contentmatch: z.number().min(0).max(5).optional(),
});

// User settings schema
export const userSettingsSchema = z.object({
  dashboardSettings: z.array(z.object({
    key: z.string(),
    visible: z.boolean(),
  })).optional(),
  timetableSettings: z.array(z.object({
    timetableId: z.enum(['dashboard', 'semesterplan']),
    showWeekends: z.boolean(),
    selectedView: z.string(),
  })).optional(),
  studyPlanSettings: z.object({
    displayGrades: z.boolean().optional(),
    displayProgressBar: z.boolean().optional(),
  }).optional(),
  favouriteModulesAcronyms: z.array(z.string().max(50)).optional(),
  excludedModulesAcronyms: z.array(z.string().max(50)).optional(),
});

// Study plan schema
export const studyPlanSchema = z.object({
  name: z.string().min(1).max(100),
  status: z.boolean().optional(),
  semesterPlans: z.array(z.object({
    semester: z.string().regex(/^\d{4}[ws]$/),
    isPastSemester: z.boolean(),
    modules: z.array(z.string()),
    userGeneratedModules: z.array(z.object({
      name: z.string().max(1000),
      acronym: z.string().max(100),
      ects: z.number().min(0).max(30),
      notes: z.string().max(1000).optional(),
      status: z.enum(['taken', 'failed', 'passed', 'open']),
      flexNowImported: z.boolean().optional(),
    })),
    courses: z.array(z.object({
      id: z.string(),
      name: z.string(),
      status: z.string(),
      ects: z.number(),
      sws: z.number(),
      contributeTo: z.string().optional(),
      contributeAs: z.string().optional(),
    })),
    aimedEcts: z.number().min(0).max(210),
    summedEcts: z.number().min(0).max(210),
    expanded: z.boolean().optional(),
  })),
});

// Topic schema
export const topicSchema = z.object({
  name: z.string().min(1).max(100),
  keywords: z.array(z.string().max(50)).optional(),
  description: z.string().max(5000).optional(),
  parentId: z.string().optional(),
});

// Job schema
export const jobSchema = z.object({
  title: z.string().min(1).max(1000),
  description: z.string().max(2000).optional(),
  keywords: z.array(z.string().max(50)).optional(),
  inputMode: z.enum(['url', 'mock']),
});

// Evaluation schema
export const evaluationSchema = z.object({
  spId: z.string(),
  jobEvaluations: z.array(z.object({
    jobId: z.string(),
    candidates: z.array(z.object({
      acronym: z.string(),
    })),
    rankedModules: z.array(z.object({
      acronym: z.string(),
      ranking: z.number().min(0).max(100),
    })),
    comment: z.string().max(1000).optional(),
  })),
});

// Recommendation schema
export const recommendationSchema = z.object({
  recommendedMods: z.array(z.object({
    acronym: z.string(),
    source: z.array(z.object({
      type: z.enum(['job', 'topic', 'interest', 'cohort', 'feedback_similarmods']),
      identifier: z.string(),
      score: z.number().min(0).max(1),
    })),
    weight: z.number().min(0).max(10).optional(),
    position: z.number().min(0).max(100).optional(),
  })),
});
