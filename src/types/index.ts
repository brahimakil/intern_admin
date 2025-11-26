// TypeScript interfaces for the application

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'company' | 'student';
  createdAt: Date;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  industry?: string;
  location?: string;
  description?: string;
  logoUrl?: string;
  createdAt: Date;
}

export interface Internship {
  id: string;
  companyId: string;
  companyName?: string;
  title: string;
  description: string;
  status: 'open' | 'closed';
  location: string;
  locationType: 'remote' | 'onsite' | 'hybrid';
  duration: string;
  requiredSkills: string[];
  logoUrl?: string;
  createdAt: Date;
}

export interface Student {
  id: string;
  email: string;
  fullName: string;
  major: string;
  profilePhotoUrl?: string;
  status: 'active' | 'inactive';
  role: 'student';
  createdAt: Date;
}

export interface Admin {
  id: string;
  email: string;
  fullName: string;
  status: 'active' | 'inactive';
  role: 'admin';
  createdAt: Date;
}

export interface Application {
  id: string;
  studentId: string;
  internshipId: string;
  companyId: string;
  status: 'pending' | 'accepted' | 'rejected';
  coverLetter: string;
  resumeUrl: string;
  githubUrl?: string;
  portfolioUrl?: string;
  projectDescription: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Populated fields from backend
  student?: {
    id: string;
    fullName: string;
    email: string;
  };
  internship?: {
    id: string;
    title: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

export interface CreateApplicationDto {
  studentId: string;
  internshipId: string;
  companyId: string;
  status?: 'pending' | 'accepted' | 'rejected';
  coverLetter: string;
  resumeUrl: string;
  githubUrl?: string;
  portfolioUrl?: string;
  projectDescription: string;
  notes?: string;
}

export interface UpdateApplicationDto {
  status?: 'pending' | 'accepted' | 'rejected';
  coverLetter?: string;
  resumeUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  projectDescription?: string;
  notes?: string;
}

export interface AuthContextType {
  user: User | null;
  role: 'admin' | 'company' | 'student' | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

export interface DashboardStats {
  totalStudents: number;
  activeCompanies: number;
  openInternships: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  recentApplications: number;
  totalEnrollments: number;
  pendingEnrollments: number;
  acceptedEnrollments: number;
  rejectedEnrollments: number;
  recentActivities: RecentActivity[];
  applicationTrends: number[];
  trendLabels: string[];
}

export interface RecentActivity {
  id: string;
  type: string;
  studentName: string;
  internshipTitle: string;
  status: string;
  date: string;
}
