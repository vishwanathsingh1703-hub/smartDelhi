export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ScoreComponentBreakdown {
  rawScore: number;
  normalizedScore: number;
  weight: number;
  weightedScore: number;
  description: string;
}

export interface AIScoreBreakdown {
  severity: ScoreComponentBreakdown;
  volume: ScoreComponentBreakdown;
  pendingPressure: ScoreComponentBreakdown;
  aging: ScoreComponentBreakdown;
  resolutionPerformance: ScoreComponentBreakdown;
}

export interface WardAIScoreResult {
  wardId: string;
  wardName: string;
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  averageAgeDays: number;
  resolutionRate: number;
  finalScore: number;
  priorityLevel: PriorityLevel;
  breakdown: AIScoreBreakdown;
}

export interface AIScoreSummary {
  overallScore: number;
  averageWardScore: number;
  totalWardsEvaluated: number;
  criticalWardCount: number;
  highPriorityWardCount: number;
  mediumPriorityWardCount: number;
  lowPriorityWardCount: number;
  totalComplaints: number;
  totalPendingComplaints: number;
}

export interface AIOverviewResponse {
  success: true;
  timestamp: string;
  summary: AIScoreSummary;
  rankings: WardAIScoreResult[];
}

export interface WardDetailResponse {
  success: true;
  timestamp: string;
  ward: WardAIScoreResult;
}

export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}