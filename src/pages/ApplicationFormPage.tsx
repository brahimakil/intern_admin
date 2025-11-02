// Add/Edit Application Form Page
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { ArrowLeft, FileText } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import styles from './ApplicationFormPage.module.css';

interface Student {
  id: string;
  fullName: string;
  email: string;
}

interface Company {
  id: string;
  name: string;
}

interface Internship {
  id: string;
  title: string;
  companyId: string;
}

const ApplicationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingApplication, setFetchingApplication] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([]);
  
  const [formData, setFormData] = useState({
    studentId: '',
    companyId: '',
    internshipId: '',
    status: 'pending' as 'pending' | 'accepted' | 'rejected',
    coverLetter: '',
    resumeUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    projectDescription: '',
    notes: '',
  });

  useEffect(() => {
    // Fetch dropdown data and application data in parallel for edit mode
    if (isEdit && id) {
      Promise.all([fetchInitialData(), fetchApplication(id)]);
    } else {
      fetchInitialData();
    }
  }, [id, isEdit]);

  useEffect(() => {
    // Filter internships by selected company
    if (formData.companyId) {
      const filtered = internships.filter(
        (internship) => internship.companyId === formData.companyId
      );
      setFilteredInternships(filtered);
      
      // Reset internship selection if it doesn't belong to selected company
      if (formData.internshipId) {
        const isValid = filtered.some((i) => i.id === formData.internshipId);
        if (!isValid) {
          setFormData((prev) => ({ ...prev, internshipId: '' }));
        }
      }
    } else {
      setFilteredInternships(internships);
    }
  }, [formData.companyId, internships]);

  const fetchInitialData = async () => {
    setInitialLoading(true);
    console.log('🔄 Fetching dropdown data...');
    const startTime = performance.now();
    
    try {
      // Use minimal endpoints for faster loading
      const [studentsData, companiesData, internshipsData] = await Promise.all([
        apiService.get<Student[]>('/students/list/minimal'),
        apiService.get<Company[]>('/companies/list/minimal'),
        apiService.get<Internship[]>('/internships/list/minimal'),
      ]);
      
      const endTime = performance.now();
      console.log(`✅ Dropdown data loaded in ${(endTime - startTime).toFixed(0)}ms`);
      console.log(`📊 Students: ${studentsData.length}, Companies: ${companiesData.length}, Internships: ${internshipsData.length}`);
      
      setStudents(studentsData);
      setCompanies(companiesData);
      setInternships(internshipsData);
    } catch (err) {
      console.error('❌ Error fetching initial data:', err);
      setError('Failed to load form data');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchApplication = async (applicationId: string) => {
    console.log(`🔄 Fetching application ${applicationId}...`);
    setFetchingApplication(true);
    const startTime = performance.now();
    
    try {
      // Use minimal endpoint for editing (no joins needed)
      const data = await apiService.get(`/applications/${applicationId}/edit`);
      const endTime = performance.now();
      console.log(`✅ Application loaded in ${(endTime - startTime).toFixed(0)}ms`);
      console.log('📝 Application data:', data);
      
      setFormData({
        studentId: data.studentId || '',
        companyId: data.companyId || '',
        internshipId: data.internshipId || '',
        status: data.status || 'pending',
        coverLetter: data.coverLetter || '',
        resumeUrl: data.resumeUrl || '',
        githubUrl: data.githubUrl || '',
        portfolioUrl: data.portfolioUrl || '',
        projectDescription: data.projectDescription || '',
        notes: data.notes || '',
      });
    } catch (err) {
      console.error('❌ Error fetching application:', err);
      setError('Failed to load application data');
    } finally {
      setFetchingApplication(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.studentId || !formData.companyId || !formData.internshipId) {
      setError('Please select student, company, and internship');
      setLoading(false);
      return;
    }

    if (!formData.coverLetter || !formData.projectDescription || !formData.resumeUrl) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const applicationData = {
        studentId: formData.studentId,
        companyId: formData.companyId,
        internshipId: formData.internshipId,
        status: formData.status,
        coverLetter: formData.coverLetter,
        resumeUrl: formData.resumeUrl,
        githubUrl: formData.githubUrl || undefined,
        portfolioUrl: formData.portfolioUrl || undefined,
        projectDescription: formData.projectDescription,
        notes: formData.notes || undefined,
      };

      if (isEdit && id) {
        await apiService.updateApplication(id, applicationData);
      } else {
        await apiService.createApplication(applicationData);
      }

      navigate('/applications');
    } catch (err: any) {
      console.error('Error saving application:', err);
      setError(err.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate('/applications')} className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Applications
          </button>
        </div>

        {initialLoading || fetchingApplication ? (
          <div className={styles.formCard}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>
                {initialLoading && 'Loading form data...'}
                {fetchingApplication && !initialLoading && 'Loading application...'}
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <FileText size={32} />
              <div>
                <h1 className={styles.title}>
                  {isEdit ? 'Edit Application' : 'Add New Application'}
                </h1>
                <p className={styles.subtitle}>
                  {isEdit
                    ? 'Update application details'
                    : 'Manually create an application for a student'}
                </p>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
            {/* Application Target Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📋 Application Target</h3>
              <div className={styles.grid}>
                {/* Student Selection */}
                <div className={styles.formGroup}>
                  <label htmlFor="studentId" className={styles.label}>
                    Student <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={styles.select}
                    required
                    disabled={isEdit}
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName} ({student.email})
                      </option>
                    ))}
                  </select>
                  {isEdit && <p className={styles.hint}>Cannot change student after creation</p>}
                </div>

                {/* Company Selection */}
                <div className={styles.formGroup}>
                  <label htmlFor="companyId" className={styles.label}>
                    Company <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="companyId"
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    className={styles.select}
                    required
                    disabled={isEdit}
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  {isEdit && <p className={styles.hint}>Cannot change company after creation</p>}
                </div>

                {/* Internship Selection */}
                <div className={styles.formGroup}>
                  <label htmlFor="internshipId" className={styles.label}>
                    Internship <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="internshipId"
                    name="internshipId"
                    value={formData.internshipId}
                    onChange={handleChange}
                    className={styles.select}
                    required
                    disabled={isEdit || !formData.companyId}
                  >
                    <option value="">
                      {formData.companyId
                        ? 'Select an internship'
                        : 'Select a company first'}
                    </option>
                    {filteredInternships.map((internship) => (
                      <option key={internship.id} value={internship.id}>
                        {internship.title}
                      </option>
                    ))}
                  </select>
                  {formData.companyId && filteredInternships.length === 0 && (
                    <p className={styles.hint}>⚠️ No internships available for this company</p>
                  )}
                  {isEdit && <p className={styles.hint}>Cannot change internship after creation</p>}
                </div>

                {/* Status */}
                <div className={styles.formGroup}>
                  <label htmlFor="status" className={styles.label}>
                    Status <span className={styles.required}>*</span>
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
                    <option value="accepted">✅ Accepted</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Application Content Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>✍️ Application Content</h3>
              
              {/* Cover Letter */}
              <div className={styles.formGroup}>
                <label htmlFor="coverLetter" className={styles.label}>
                  Cover Letter <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={6}
                  placeholder="Enter cover letter..."
                  required
                />
                <p className={styles.charCount}>{formData.coverLetter.length} characters</p>
              </div>

              {/* Project Description */}
              <div className={styles.formGroup}>
                <label htmlFor="projectDescription" className={styles.label}>
                  Project Description <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={6}
                  placeholder="Describe relevant projects or experience..."
                  required
                />
                <p className={styles.charCount}>{formData.projectDescription.length} characters</p>
              </div>
            </div>

            {/* Links & Resources Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🔗 Links & Resources</h3>
              <div className={styles.grid}>
                {/* Resume URL */}
                <div className={styles.formGroup}>
                  <label htmlFor="resumeUrl" className={styles.label}>
                    📄 Resume URL <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="url"
                    id="resumeUrl"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="https://example.com/resume.pdf"
                    required
                  />
                </div>

                {/* GitHub URL (Optional) */}
                <div className={styles.formGroup}>
                  <label htmlFor="githubUrl" className={styles.label}>
                    💻 GitHub URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="https://github.com/username"
                  />
                </div>

                {/* Portfolio URL (Optional) */}
                <div className={styles.formGroup}>
                  <label htmlFor="portfolioUrl" className={styles.label}>
                    🌐 Portfolio URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="portfolioUrl"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="https://portfolio.com"
                  />
                </div>
              </div>
            </div>

            {/* Admin Notes Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📝 Admin Notes</h3>
              <div className={styles.formGroup}>
                <label htmlFor="notes" className={styles.label}>
                  Internal Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={4}
                  placeholder="Add any internal notes about this application..."
                />
                <p className={styles.hint}>💡 These notes are for internal use only and won't be visible to students</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => navigate('/applications')}
                className={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading
                  ? 'Saving...'
                  : isEdit
                  ? 'Update Application'
                  : 'Create Application'}
              </button>
            </div>
          </form>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationFormPage;
