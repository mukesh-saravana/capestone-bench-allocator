// ─── Domain Types ────────────────────────────────────────────────────────────

export type AvailabilityStatus = 'available' | 'allocated' | 'on_leave' | 'exiting';
export type Priority = 'high' | 'medium' | 'low';
export type ProjectStatus = 'active' | 'upcoming' | 'completed' | 'on_hold';
export type UserRole = 'admin' | 'resource_manager' | 'delivery_manager' | 'project_lead';
export type AllocationOutcome = 'completed' | 'transferred' | 'early_exit' | 'ongoing';

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface EmployeeSkill {
  skill: Skill;
  proficiency: 1 | 2 | 3 | 4 | 5;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  experienceYears: number;
  availability: AvailabilityStatus;
  utilizationPct: number;
  benchSince?: string;
  skills: EmployeeSkill[];
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  priority: Priority;
}

export interface ProjectNeed {
  id: string;
  projectId: string;
  projectName: string;
  roleTitle: string;
  openSlots: number;
  requiredSkills: string[];
  startDate?: string;
  status: 'open' | 'filled' | 'cancelled';
  priority: Priority;
}

export interface AllocationHistory {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  role: string;
  startDate: string;
  endDate?: string;
  outcome: AllocationOutcome;
  notes?: string;
}

export interface ScoreBreakdown {
  skillMatch: number;
  projectExperience: number;
  availability: number;
  historicalFit?: number;
}

export interface Recommendation {
  id: string;
  employee: Employee;
  rank: number;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  reasons: string[];
  evidenceSnippets?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Recommendation[];
  evidenceSnippets?: string[];
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ─── Dashboard Metric Types ───────────────────────────────────────────────────

export interface BenchMetrics {
  totalOnBench: number;
  trend: { date: string; count: number }[];
  byDepartment: { department: string; count: number }[];
}

export interface UtilizationMetrics {
  averagePct: number;
  trend: { date: string; pct: number }[];
  byDepartment: { department: string; pct: number }[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
}

export interface ChatQueryRequest {
  query: string;
  strategy?: 'skill_first' | 'utilization_first' | 'hybrid';
  filters?: { skills?: string[]; department?: string };
}

export interface ChatQueryResponse {
  answer: string;
  recommendations: Recommendation[];
  evidenceSnippets: string[];
  messageId: string;
}

export interface AssignRequest {
  employeeId: string;
  projectNeedId: string;
  role: string;
  startDate: string;
  notes?: string;
}
