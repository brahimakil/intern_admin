// Enrollment Form Page - Add/Edit Student-Internship Enrollment
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { ArrowLeft, Save, UserCheck } from 'lucide-react';
import styles from './EnrollmentFormPage.module.css';

const EnrollmentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    studentId: '',
    companyId: '',
    internshipId: '',
    status: 'pending' as 'pending' | 'accepted' | 'rejected',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (id) {
      fetchEnrollment(id);
    }
  }, [id]);

  useEffect(() => {
    // Filter internships by selected company
    if (formData.companyId) {
      setFilteredInternships(internships.filter(i => i.companyId === formData.companyId));
    } else {
      setFilteredInternships(internships);
    }
  }, [formData.companyId, internships]);

  const fetchData = async () => {
    try {
      const [studentsData, companiesData, internshipsData] = await Promise.all([
        api.get('/students'),
        api.get('/companies/list/minimal'),
        api.get('/internships'),
      ]);
      
      // Filter only active students
      const activeStudents = studentsData.filter((s: any) => s.status === 'active');
      
      // Filter only open internships
      const openInternships = internshipsData.filter((i: any) => i.status === 'open');
      
      setStudents(activeStudents);
      setCompanies(companiesData);
      setInternships(openInternships);
      setFilteredInternships(openInternships);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    }
  };

  const fetchEnrollment = async (enrollmentId: string) => {
    try {
      setLoading(true);
      const data = await api.get(`/enrollments/${enrollmentId}`);
      setFormData({
        studentId: data.studentId,
        companyId: data.companyId,
        internshipId: data.internshipId,
        status: data.status,
      });
    } catch (err: any) {
      console.error('Error fetching enrollment:', err);
      setError('Failed to load enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.internshipId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isEditMode) {
        await api.put(`/enrollments/${id}`, formData);
      } else {
        await api.post('/enrollments', formData);
      }

      navigate('/enrollments');
    } catch (err: any) {
      console.error('Error saving enrollment:', err);
      setError(err.message || 'Failed to save enrollment');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate('/enrollments')}>
          <ArrowLeft size={20} />
          Back to Enrollments
        </button>

        <div className={styles.header}>
          <h1 className={styles.title}>
            <UserCheck size={32} />
            {isEditMode ? 'Edit Enrollment' : 'Add New Enrollment'}
          </h1>
          <p className={styles.subtitle}>
            {isEditMode ? 'Update enrollment details' : 'Create a new student-internship enrollment'}
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="studentId" className={styles.label}>
              Student *
            </label>
            <select
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="companyId" className={styles.label}>
              Company (Optional Filter)
            </label>
            <select
              id="companyId"
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <p className={styles.hint}>Filter internships by company</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="internshipId" className={styles.label}>
              Internship *
            </label>
            <select
              id="internshipId"
              name="internshipId"
              value={formData.internshipId}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">Select an internship</option>
              {filteredInternships.map((internship) => (
                <option key={internship.id} value={internship.id}>
                  {internship.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="pending">⏳ Pending</option>
              <option value="accepted">✓ Accepted</option>
              <option value="rejected">✕ Rejected</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate('/enrollments')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              <Save size={20} />
              {loading ? 'Saving...' : isEditMode ? 'Update Enrollment' : 'Create Enrollment'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EnrollmentFormPage;
