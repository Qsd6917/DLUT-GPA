
export type CourseType = '必修' | '选修' | '任选';

export interface Course {
  id: string;
  name: string;
  credits: number;
  score: number;
  gpa: number;
  isActive: boolean;
  semester: string;
  type: CourseType;
}

export enum CalculationMethod {
  SUBTRACTIVE = 'SUBTRACTIVE', // 5.0 (Score - 50) / 10
  LINEAR = 'LINEAR', // 5.0 (Score / 20)
  WES = 'WES', // WES 5.0
  STD_4_0 = 'STD_4_0', // Standard 4.0 (90-100=4.0, 80-89=3.0...)
  PKU_4_0 = 'PKU_4_0', // Peking Univ 4.0 Formula
  SCALE_4_5 = 'SCALE_4_5', // 4.5 Scale
}

export interface GpaStats {
  totalCredits: number;
  weightedGpa: number;
  weightedAverageScore: number;
  courseCount: number;
  scoreDistribution: { name: string; value: number }[];
  
  // New fields for compulsory courses
  compulsoryCredits: number;
  compulsoryWeightedGpa: number;
}

export interface SemesterTrend {
  semester: string;
  gpa: number;
  credits: number;
}

export interface AiAdviceResponse {
  analysis: string;
  suggestions: string[];
  projectedGpa?: number;
}

export interface GraduationRequirements {
  total: number;
  compulsory: number;
  elective: number; // 选修
  optional: number; // 任选
}
