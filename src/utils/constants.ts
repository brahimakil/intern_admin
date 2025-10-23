// Application constants

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  COMPANIES: 'companies',
  STUDENTS: 'students',
  INTERNSHIPS: 'internships',
  APPLICATIONS: 'applications',
} as const;

// User roles
export const ROLES = {
  ADMIN: 'admin',
  COMPANY: 'company',
  STUDENT: 'student',
} as const;

// Application status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

// Company status
export const COMPANY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// Internship status
export const INTERNSHIP_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
} as const;

