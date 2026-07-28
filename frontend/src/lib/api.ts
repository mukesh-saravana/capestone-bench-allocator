import apiClient from './apiClient';
import type {
  AllocationHistory,
  AllocationsSummary,
  AssignRequest,
  BenchMetrics,
  ChatQueryRequest,
  ChatQueryResponse,
  CandidateImportResult,
  DataSetSummary,
  Employee,
  LoginResponse,
  ProjectNeed,
  RagReindexResponse,
  RagStatusResponse,
  RecommendationRequest,
  RecommendationResponse,
  SkillTag,
  User,
  UtilizationMetrics,
} from '../types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/login', { email, password });
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}

export async function me(): Promise<User> {
  const { data } = await apiClient.get<User>('/api/auth/me');
  return data;
}

export async function getBenchMetrics(): Promise<BenchMetrics> {
  const { data } = await apiClient.get<BenchMetrics>('/api/dashboard/bench');
  return data;
}

export async function getUtilizationMetrics(): Promise<UtilizationMetrics> {
  const { data } = await apiClient.get<UtilizationMetrics>('/api/dashboard/utilization');
  return data;
}

export async function getAllocationsSummary(): Promise<AllocationsSummary> {
  const { data } = await apiClient.get<AllocationsSummary>('/api/dashboard/allocations');
  return data;
}

export async function getProjectNeeds(): Promise<ProjectNeed[]> {
  const { data } = await apiClient.get<ProjectNeed[]>('/api/project-needs');
  return data;
}

export async function getEmployees(): Promise<Employee[]> {
  const { data } = await apiClient.get<Employee[]>('/api/employees');
  return data;
}

export async function getAllocationHistory(): Promise<AllocationHistory[]> {
  const { data } = await apiClient.get<AllocationHistory[]>('/api/allocation-history');
  return data;
}

export async function queryChat(payload: ChatQueryRequest): Promise<ChatQueryResponse> {
  const { data } = await apiClient.post<ChatQueryResponse>('/api/chat/query', payload);
  return data;
}

export async function getRecommendations(payload: RecommendationRequest): Promise<RecommendationResponse> {
  const { data } = await apiClient.post<RecommendationResponse>('/api/recommendations', payload);
  return data;
}

export async function createAllocation(payload: AssignRequest): Promise<AllocationHistory> {
  const { data } = await apiClient.post<AllocationHistory>('/api/allocations', payload);
  return data;
}

export async function getDataSummary(): Promise<DataSetSummary[]> {
  const { data } = await apiClient.get<DataSetSummary[]>('/api/data/summary');
  return data;
}

export async function importCandidates(file: File): Promise<CandidateImportResult> {
  return importDataset('candidate_profiles', file);
}

export async function importDataset(datasetKey: string, file: File): Promise<CandidateImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<CandidateImportResult>(`/api/import/${datasetKey}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function exportCandidates(): Promise<Blob> {
  const response = await apiClient.get('/api/export/candidates', { responseType: 'blob' });
  return response.data as Blob;
}

export async function getSkillTags(): Promise<SkillTag[]> {
  const { data } = await apiClient.get<SkillTag[]>('/api/settings/skills');
  return data;
}

export async function createSkillTag(payload: { name: string; category: string }): Promise<SkillTag> {
  const { data } = await apiClient.post<SkillTag>('/api/settings/skills', payload);
  return data;
}

export async function updateSkillTag(skillId: string, payload: { name: string; category: string }): Promise<SkillTag> {
  const { data } = await apiClient.put<SkillTag>(`/api/settings/skills/${skillId}`, payload);
  return data;
}

export async function deleteSkillTag(skillId: string): Promise<void> {
  await apiClient.delete(`/api/settings/skills/${skillId}`);
}

export async function getRagStatus(): Promise<RagStatusResponse> {
  const { data } = await apiClient.get<RagStatusResponse>('/api/rag/status');
  return data;
}

export async function reindexRag(): Promise<RagReindexResponse> {
  const { data } = await apiClient.post<RagReindexResponse>('/api/rag/reindex');
  return data;
}
