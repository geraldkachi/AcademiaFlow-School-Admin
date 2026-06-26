import apiClient from './client';
import type { AuthResponse, Student, Staff, Exam, Notification } from '../types';

// ─── Auth ──────────────────────────────────────────────
export const authApi = {
  login: (d: { email: string; password: string; remember_me?: boolean }) =>
    apiClient.post<AuthResponse>('/admin/auth/login', d).then(r => r.data),
  forgotPassword: (email: string) => apiClient.post('/admin/auth/forgot-password', { email }).then(r => r.data),
  verifyCode: (email: string, code: string) => apiClient.post('/admin/auth/verify-code', { email, code }).then(r => r.data),
  resetPassword: (d: { email: string; code: string; password: string; password_confirmation: string }) =>
    apiClient.post('/admin/auth/reset-password', d).then(r => r.data),
  logout: () => apiClient.post('/admin/auth/logout').then(r => r.data),
};

// ─── Onboarding ────────────────────────────────────────
export const onboardingApi = {
  submitSchool: (d: any) => apiClient.post('/onboarding/school', d).then(r => r.data),
  uploadDocuments: (d: FormData) => apiClient.post('/onboarding/documents', d, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  createAdmin: (d: any) => apiClient.post('/onboarding/admin', d).then(r => r.data),
  setupAcademics: (d: any) => apiClient.post('/onboarding/academics', d).then(r => r.data),
  selectPlan: (d: any) => apiClient.post('/onboarding/plan', d).then(r => r.data),
  processPayment: () => apiClient.post('/onboarding/payment').then(r => r.data),
};

// ─── Dashboard ─────────────────────────────────────────
export const dashboardApi = {
  getStats: () => apiClient.get('/admin/dashboard/stats').then(r => r.data),
  getUpcomingExams: () => apiClient.get('/admin/dashboard/upcoming-exams').then(r => r.data),
  getRecentResults: () => apiClient.get('/admin/dashboard/results').then(r => r.data),
  getActivities: () => apiClient.get('/admin/dashboard/activities').then(r => r.data),
  getNotifications: () => apiClient.get<Notification[]>('/admin/notifications').then(r => r.data),
};

// ─── Students ──────────────────────────────────────────
export const studentsApi = {
  getAll: (filters?: Record<string, string>) => apiClient.get<{ students: Student[]; stats: any }>('/admin/students', { params: filters }).then(r => r.data),
  getById: (id: string) => apiClient.get(`/admin/students/${id}`).then(r => r.data),
  create: (d: FormData) => apiClient.post('/admin/students', d, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  update: (id: string, d: any) => apiClient.put(`/admin/students/${id}`, d).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/admin/students/${id}`).then(r => r.data),
  uploadDocument: (id: string, name: string, file: File) => {
    const fd = new FormData(); fd.append('file', file); fd.append('name', name);
    return apiClient.post(`/admin/students/${id}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  deleteDocument: (studentId: string, docId: string) => apiClient.delete(`/admin/students/${studentId}/documents/${docId}`).then(r => r.data),
};

// ─── Staffs ────────────────────────────────────────────
export const staffsApi = {
  getAll: () => apiClient.get<Staff[]>('/admin/staffs').then(r => r.data),
  create: (d: any) => apiClient.post('/admin/staffs', d).then(r => r.data),
  update: (id: string, d: any) => apiClient.put(`/admin/staffs/${id}`, d).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/admin/staffs/${id}`).then(r => r.data),
};

// ─── Academics ─────────────────────────────────────────
export const academicsApi = {
  getAll: () => apiClient.get('/admin/academics').then(r => r.data),
  createClass: (d: any) => apiClient.post('/admin/academics/classes', d).then(r => r.data),
  updateClass: (id: string, d: any) => apiClient.put(`/admin/academics/classes/${id}`, d).then(r => r.data),
  deleteClass: (id: string) => apiClient.delete(`/admin/academics/classes/${id}`).then(r => r.data),
};

// ─── Exams ─────────────────────────────────────────────
export const examsApi = {
  getAll: () => apiClient.get<Exam[]>('/admin/exams').then(r => r.data),
  approve: (id: string) => apiClient.post(`/admin/exams/${id}/approve`).then(r => r.data),
  reject: (id: string, reason: string) => apiClient.post(`/admin/exams/${id}/reject`, { reason }).then(r => r.data),
};

// ─── Results ───────────────────────────────────────────
export const resultsApi = {
  getAll: () => apiClient.get('/admin/results').then(r => r.data),
  publish: (id: string) => apiClient.post(`/admin/results/${id}/publish`).then(r => r.data),
};

// ─── Assignments ───────────────────────────────────────
export const assignmentsApi = {
  getAll: () => apiClient.get('/admin/assignments').then(r => r.data),
};

// ─── Notifications ─────────────────────────────────────
export const notificationsApi = {
  getAll: () => apiClient.get<Notification[]>('/admin/notifications').then(r => r.data),
  create: (d: any) => apiClient.post('/admin/notifications', d).then(r => r.data),
  resend: (id: string) => apiClient.post(`/admin/notifications/${id}/resend`).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/admin/notifications/${id}`).then(r => r.data),
};

// ─── Settings ──────────────────────────────────────────
export const settingsApi = {
  getProfile: () => apiClient.get('/admin/settings/profile').then(r => r.data),
  getNotifications: () => apiClient.get('/admin/settings/notifications').then(r => r.data),
  updateNotifications: (d: any) => apiClient.put('/admin/settings/notifications', d).then(r => r.data),
  updatePassword: (d: any) => apiClient.put('/admin/settings/security', d).then(r => r.data),
  getPreferences: () => apiClient.get('/admin/settings/preferences').then(r => r.data),
  updatePreferences: (d: any) => apiClient.put('/admin/settings/preferences', d).then(r => r.data),
  getSubscription: () => apiClient.get('/admin/settings/subscription').then(r => r.data),
};
