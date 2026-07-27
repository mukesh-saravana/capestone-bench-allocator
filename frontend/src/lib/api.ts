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
  RecommendationRequest,
  RecommendationResponse,
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
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<CandidateImportResult>('/api/import/candidates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function exportCandidates(): Promise<Blob> {
  const response = await apiClient.get('/api/export/candidates', { responseType: 'blob' });
  return response.data as Blob;
}
