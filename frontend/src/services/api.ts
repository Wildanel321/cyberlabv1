// API Client for CyberGuard Lab

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('instructor_token');
  const participantToken = localStorage.getItem('participant_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (participantToken) {
    headers['X-Participant-Token'] = participantToken;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message || `HTTP Error ${response.status}`, response.status, data);
  }

  return data as T;
}

export const api = {
  // Instructor Auth
  register: (body: { name: string; email: string; password: string; password_confirmation: string }) =>
    request<{ user: any; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }),
  getProfile: () =>
    request<{ user: any }>('/auth/me'),

  // Instructor Sessions
  getSessions: () =>
    request<{ data: any[] }>('/instructor/sessions'),
  createSession: (body: { title: string; max_participants?: number; expires_in_minutes?: number }) =>
    request<{ data: any }>('/instructor/sessions', { method: 'POST', body: JSON.stringify(body) }),
  getSession: (id: string) =>
    request<{ data: any }>(`/instructor/sessions/${id}`),
  endSession: (id: string) =>
    request<{ message: string; data: any }>(`/instructor/sessions/${id}/end`, { method: 'POST' }),
  getSessionAnalytics: (id: string) =>
    request<{ data: any }>(`/instructor/sessions/${id}/analytics`),

  // Participant Gateway
  joinSession: (body: { code: string; nickname: string }) =>
    request<{
      data: {
        participant_id: string;
        participant_token: string;
        nickname: string;
        session: any;
      }
    }>('/participant/join', { method: 'POST', body: JSON.stringify(body) }),
  sendHeartbeat: () =>
    request<{ status: string }>('/participant/heartbeat', { method: 'POST' }),
  leaveSession: () =>
    request<{ message: string }>('/participant/leave', { method: 'POST' }),
  submitActivity: (body: {
    tool_name: string;
    risk_tier: string;
    score: number;
    duration_seconds: number;
    metadata?: Record<string, any>;
  }) =>
    request<{ data: any }>('/participant/activities', { method: 'POST', body: JSON.stringify(body) }),
  getParticipantHistory: () =>
    request<{ data: any[] }>('/participant/history'),
};
