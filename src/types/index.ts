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

export interface Application {
  id: string;
  userId: string;
  studentId?: string;
  internshipId: string;
  companyId: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: Date;
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
}
