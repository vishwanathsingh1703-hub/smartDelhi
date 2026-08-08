import type { PriorityLevel } from './aiScoreTypes';

export const AI_SCORE_WEIGHTS = {
  SEVERITY: 0.25,
  VOLUME: 0.2,
  PENDING_PRESSURE: 0.25,
  AGING: 0.15,
  RESOLUTION_PERFORMANCE: 0.15,
} as const;

export const PRIORITY_THRESHOLDS: Record<
  PriorityLevel,
  { min: number; max: number }
> = {
  CRITICAL: {
    min: 80,
    max: 100,
  },
  HIGH: {
    min: 60,
    max: 79.99,
  },
  MEDIUM: {
    min: 40,
    max: 59.99,
  },
  LOW: {
    min: 0,
    max: 39.99,
  },
};

export const SCORING_CONSTANTS = {
  MAX_VOLUME_BASELINE: 100,
  MAX_AGE_DAYS_BASELINE: 30,
  MIN_SCORE: 0,
  MAX_SCORE: 100,
} as const;