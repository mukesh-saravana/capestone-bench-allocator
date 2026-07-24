import type {
  Employee, Project, ProjectNeed, AllocationHistory, Recommendation, BenchMetrics, UtilizationMetrics,
} from '../types';

// ─── Employees ────────────────────────────────────────────────────────────────

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001', name: 'John Doe', email: 'john.doe@company.com', role: 'Senior Engineer',
    department: 'Frontend', experienceYears: 6, availability: 'available', utilizationPct: 0,
    benchSince: '2026-07-01',
    skills: [
      { skill: { id: 's1', name: 'React', category: 'Frontend' }, proficiency: 5 },
      { skill: { id: 's2', name: 'TypeScript', category: 'Frontend' }, proficiency: 5 },
      { skill: { id: 's3', name: 'AWS', category: 'Cloud' }, proficiency: 4 },
      { skill: { id: 's4', name: 'Python', category: 'Backend' }, proficiency: 3 },
    ],
  },
  {
    id: 'emp-002', name: 'Jane Smith', email: 'jane.smith@company.com', role: 'Engineer',
    department: 'Backend', experienceYears: 4, availability: 'available', utilizationPct: 20,
    benchSince: '2026-07-10',
    skills: [
      { skill: { id: 's5', name: 'React', category: 'Frontend' }, proficiency: 4 },
      { skill: { id: 's6', name: 'Node.js', category: 'Backend' }, proficiency: 5 },
      { skill: { id: 's3', name: 'AWS', category: 'Cloud' }, proficiency: 4 },
    ],
  },
  {
    id: 'emp-003', name: 'Bob Johnson', email: 'bob.j@company.com', role: 'Senior Engineer',
    department: 'Platform', experienceYears: 5, availability: 'available', utilizationPct: 10,
    benchSince: '2026-07-05',
    skills: [
      { skill: { id: 's1', name: 'React', category: 'Frontend' }, proficiency: 4 },
      { skill: { id: 's7', name: 'Docker', category: 'DevOps' }, proficiency: 5 },
      { skill: { id: 's8', name: 'Kubernetes', category: 'DevOps' }, proficiency: 4 },
    ],
  },
  {
    id: 'emp-004', name: 'Alice Chen', email: 'alice.chen@company.com', role: 'Tech Lead',
    department: 'Frontend', experienceYears: 8, availability: 'allocated', utilizationPct: 100,
    skills: [
      { skill: { id: 's1', name: 'React', category: 'Frontend' }, proficiency: 5 },
      { skill: { id: 's2', name: 'TypeScript', category: 'Frontend' }, proficiency: 5 },
      { skill: { id: 's9', name: 'Angular', category: 'Frontend' }, proficiency: 4 },
    ],
  },
  {
    id: 'emp-005', name: 'Carlos Rivera', email: 'carlos.r@company.com', role: 'Engineer',
    department: 'Data', experienceYears: 3, availability: 'allocated', utilizationPct: 80,
    skills: [
      { skill: { id: 's10', name: 'Python', category: 'Backend' }, proficiency: 5 },
      { skill: { id: 's11', name: 'PostgreSQL', category: 'Data' }, proficiency: 4 },
      { skill: { id: 's12', name: 'Spark', category: 'Data' }, proficiency: 3 },
    ],
  },
  {
    id: 'emp-006', name: 'Priya Nair', email: 'priya.n@company.com', role: 'QA Engineer',
    department: 'Platform', experienceYears: 4, availability: 'available', utilizationPct: 0,
    benchSince: '2026-07-15',
    skills: [
      { skill: { id: 's13', name: 'Selenium', category: 'QA' }, proficiency: 5 },
      { skill: { id: 's14', name: 'Cypress', category: 'QA' }, proficiency: 4 },
    ],
  },
  {
    id: 'emp-007', name: 'Sam Wilson', email: 'sam.w@company.com', role: 'Engineer',
    department: 'Backend', experienceYears: 5, availability: 'allocated', utilizationPct: 100,
    skills: [
      { skill: { id: 's15', name: 'Java', category: 'Backend' }, proficiency: 5 },
      { skill: { id: 's16', name: 'Spring Boot', category: 'Backend' }, proficiency: 5 },
    ],
  },
  {
    id: 'emp-008', name: 'Nina Patel', email: 'nina.p@company.com', role: 'Engineer',
    department: 'Frontend', experienceYears: 3, availability: 'on_leave', utilizationPct: 0,
    skills: [
      { skill: { id: 's1', name: 'React', category: 'Frontend' }, proficiency: 3 },
      { skill: { id: 's2', name: 'TypeScript', category: 'Frontend' }, proficiency: 3 },
    ],
  },
];

// ─── Projects ─────────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj-001', name: 'Alpha Commerce Platform', status: 'active', priority: 'high', startDate: '2026-06-01' },
  { id: 'proj-002', name: 'Beta Analytics Dashboard', status: 'active', priority: 'medium', startDate: '2026-05-15' },
  { id: 'proj-003', name: 'Gamma Mobile App', status: 'upcoming', priority: 'high', startDate: '2026-08-01' },
  { id: 'proj-004', name: 'Delta DevOps Pipeline', status: 'active', priority: 'low', startDate: '2026-04-01' },
  { id: 'proj-005', name: 'Epsilon Data Lake', status: 'completed', priority: 'medium', endDate: '2026-06-30' },
];

// ─── Project Needs ────────────────────────────────────────────────────────────

export const MOCK_PROJECT_NEEDS: ProjectNeed[] = [
  {
    id: 'need-001', projectId: 'proj-001', projectName: 'Alpha Commerce Platform',
    roleTitle: 'Frontend Lead', openSlots: 1, requiredSkills: ['React', 'TypeScript'],
    startDate: '2026-08-01', status: 'open', priority: 'high',
  },
  {
    id: 'need-002', projectId: 'proj-003', projectName: 'Gamma Mobile App',
    roleTitle: 'Full-Stack Engineer', openSlots: 2, requiredSkills: ['React', 'Node.js', 'AWS'],
    startDate: '2026-08-01', status: 'open', priority: 'high',
  },
  {
    id: 'need-003', projectId: 'proj-004', projectName: 'Delta DevOps Pipeline',
    roleTitle: 'DevOps Engineer', openSlots: 1, requiredSkills: ['Docker', 'Kubernetes'],
    startDate: '2026-07-20', status: 'open', priority: 'low',
  },
];

// ─── Allocation History ───────────────────────────────────────────────────────

export const MOCK_ALLOCATIONS: AllocationHistory[] = [
  {
    id: 'alloc-001', employeeId: 'emp-004', employeeName: 'Alice Chen',
    projectId: 'proj-001', projectName: 'Alpha Commerce Platform',
    role: 'Tech Lead', startDate: '2026-06-01', outcome: 'ongoing',
  },
  {
    id: 'alloc-002', employeeId: 'emp-007', employeeName: 'Sam Wilson',
    projectId: 'proj-002', projectName: 'Beta Analytics Dashboard',
    role: 'Senior Engineer', startDate: '2026-05-15', outcome: 'ongoing',
  },
  {
    id: 'alloc-003', employeeId: 'emp-001', employeeName: 'John Doe',
    projectId: 'proj-005', projectName: 'Epsilon Data Lake',
    role: 'Frontend Engineer', startDate: '2026-02-01', endDate: '2026-06-30', outcome: 'completed',
  },
  {
    id: 'alloc-004', employeeId: 'emp-003', employeeName: 'Bob Johnson',
    projectId: 'proj-005', projectName: 'Epsilon Data Lake',
    role: 'DevOps Engineer', startDate: '2026-03-01', endDate: '2026-06-30', outcome: 'completed',
  },
];

// ─── Recommendations ──────────────────────────────────────────────────────────

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-001', rank: 1, score: 9.2,
    scoreBreakdown: { skillMatch: 6.0, projectExperience: 2.2, availability: 1.0 },
    reasons: ['3+ years React experience', 'Previous AWS architecture work', 'Currently on bench'],
    evidenceSnippets: ['John worked on Epsilon Data Lake as Frontend Engineer (Feb–Jun 2026)'],
    employee: MOCK_EMPLOYEES[0],
  },
  {
    id: 'rec-002', rank: 2, score: 8.7,
    scoreBreakdown: { skillMatch: 5.5, projectExperience: 2.0, availability: 1.2 },
    reasons: ['Strong React and Node.js skills', 'Cloud experience on AWS'],
    evidenceSnippets: [],
    employee: MOCK_EMPLOYEES[1],
  },
  {
    id: 'rec-003', rank: 3, score: 7.5,
    scoreBreakdown: { skillMatch: 4.5, projectExperience: 2.0, availability: 1.0 },
    reasons: ['React proficiency', 'Strong DevOps background'],
    evidenceSnippets: ['Bob worked on Epsilon Data Lake as DevOps Engineer (Mar–Jun 2026)'],
    employee: MOCK_EMPLOYEES[2],
  },
];

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export const MOCK_BENCH_METRICS: BenchMetrics = {
  totalOnBench: 4,
  trend: [
    { date: '2026-06-24', count: 8 }, { date: '2026-07-01', count: 7 },
    { date: '2026-07-08', count: 6 }, { date: '2026-07-15', count: 5 },
    { date: '2026-07-22', count: 4 },
  ],
  byDepartment: [
    { department: 'Frontend', count: 2 },
    { department: 'Platform', count: 1 },
    { department: 'Backend', count: 1 },
  ],
};

export const MOCK_UTILIZATION_METRICS: UtilizationMetrics = {
  averagePct: 76,
  trend: [
    { date: '2026-06-24', pct: 68 }, { date: '2026-07-01', pct: 70 },
    { date: '2026-07-08', pct: 73 }, { date: '2026-07-15', pct: 74 },
    { date: '2026-07-22', pct: 76 },
  ],
  byDepartment: [
    { department: 'Frontend', pct: 60 },
    { department: 'Backend', pct: 90 },
    { department: 'Platform', pct: 70 },
    { department: 'Data', pct: 80 },
  ],
};
