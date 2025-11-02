// Main App component with routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyFormPage from './pages/CompanyFormPage';
import InternshipsPage from './pages/InternshipsPage';
import InternshipFormPage from './pages/InternshipFormPage';
import InternshipDetailsPage from './pages/InternshipDetailsPage';
import StudentsPage from './pages/StudentsPage';
import StudentFormPage from './pages/StudentFormPage';
import StudentDetailsPage from './pages/StudentDetailsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import CompanyInternshipsPage from './pages/CompanyInternshipsPage';

/**
 * Main App Component
 * Sets up routing and authentication context
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CompaniesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/add"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CompanyFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CompanyFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CompanyFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internships"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InternshipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internships/add"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InternshipFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internships/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InternshipFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internships/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InternshipDetailsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Students Management */}
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/add"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentDetailsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/applications"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/new"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ApplicationFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ApplicationFormPage />
              </ProtectedRoute>
            }
          />

          {/* Company Routes */}
          <Route
            path="/company/internships"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyInternshipsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
