// API service for NestJS backend - Uses Firebase Auth token
import { auth } from '../firebase/config';
import type { DashboardStats } from '../types';

// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // Companies endpoints
  async getCompanies() {
    return this.request<any[]>('/companies');
  }

  // Internships endpoints
  async getInternships() {
    return this.request<any[]>('/internships');
  }

  // Applications endpoints
  async getApplications() {
    return this.request<any[]>('/applications');
  }

  // Generic CRUD methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Students endpoints
  async getStudents() {
    return this.request<any[]>('/students');
  }

  async getStudent(id: string) {
    return this.request<any>(`/students/${id}`);
  }

  async createStudent(data: any) {
    return this.post('/students', data);
  }

  async updateStudent(id: string, data: any) {
    return this.put(`/students/${id}`, data);
  }

  async deleteStudent(id: string) {
    return this.delete(`/students/${id}`);
  }

  // Companies endpoints (extended)
  async getCompany(id: string) {
    return this.request<any>(`/companies/${id}`);
  }

  async createCompany(data: any) {
    return this.post('/companies', data);
  }

  async updateCompany(id: string, data: any) {
    return this.put(`/companies/${id}`, data);
  }

  async deleteCompany(id: string) {
    return this.delete(`/companies/${id}`);
  }

  // Internships endpoints (extended)
  async getInternship(id: string) {
    return this.request<any>(`/internships/${id}`);
  }

  async getInternshipsByCompany(companyId: string) {
    return this.request<any[]>(`/internships/company/${companyId}`);
  }

  async createInternship(data: any) {
    return this.post('/internships', data);
  }

  async updateInternship(id: string, data: any) {
    return this.put(`/internships/${id}`, data);
  }

  async deleteInternship(id: string) {
    return this.delete(`/internships/${id}`);
  }

  // Applications endpoints (full CRUD)
  async getApplication(id: string) {
    return this.request<any>(`/applications/${id}`);
  }

  async getApplicationsByStudent(studentId: string) {
    return this.request<any[]>(`/applications/student/${studentId}`);
  }

  async createApplication(data: any) {
    return this.post('/applications', data);
  }

  async updateApplication(id: string, data: any) {
    return this.put(`/applications/${id}`, data);
  }

  async updateApplicationStatus(id: string, status: 'pending' | 'accepted' | 'rejected') {
    return this.patch(`/applications/${id}/status`, { status });
  }

  async deleteApplication(id: string) {
    return this.delete(`/applications/${id}`);
  }
}

export const apiService = new ApiService();
export const api = apiService;
