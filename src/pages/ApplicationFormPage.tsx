// Add/Edit Application Form Page
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { ArrowLeft, FileText } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import styles from './ApplicationFormPage.module.css';

const ApplicationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingApplication, setFetchingApplication] = useState(false);
  const [error, setError] = useState('');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    enrollmentId: '',
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



  const fetchInitialData = async () => {
    setInitialLoading(true);
    console.log('🔄 Fetching enrollments...');
    const startTime = performance.now();
    
    try {
      // Fetch only enrollments
      const enrollmentsData = await apiService.get<any[]>('/enrollments');
      
      const endTime = performance.now();
      console.log(`✅ Enrollments loaded in ${(endTime - startTime).toFixed(0)}ms`);
      console.log(`📊 Total enrollments: ${enrollmentsData.length}`);
      
      // Filter enrollments: only accepted status
      const filteredEnrollments = enrollmentsData.filter((enrollment: any) => 
        enrollment.status === 'accepted'
      );
      console.log(`✅ Accepted enrollments: ${filteredEnrollments.length}`);
      setEnrollments(filteredEnrollments);
    } catch (err) {
      console.error('❌ Error fetching enrollments:', err);
      setError('Failed to load enrollments');
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
        enrollmentId: data.enrollmentId || '',
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

    if (!formData.coverLetter || !formData.projectDescription) {
      setError('Please fill in cover letter and project description');
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
            {/* Select Enrollment - REQUIRED */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📋 Select Enrollment</h3>
              <div className={styles.formGroup}>
                <label htmlFor="enrollmentId" className={styles.label}>
                  Enrollment <span className={styles.required}>*</span>
                </label>
                <select
                  id="enrollmentId"
                  name="enrollmentId"
                  value={formData.enrollmentId}
                  onChange={(e) => {
                    const enrollmentId = e.target.value;
                    if (enrollmentId) {
                      const enrollment = enrollments.find(en => en.id === enrollmentId);
                      if (enrollment) {
                        setFormData(prev => ({
                          ...prev,
                          enrollmentId: enrollmentId,
                          studentId: enrollment.studentId,
                          companyId: enrollment.companyId,
                          internshipId: enrollment.internshipId,
                        }));
                      }
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        enrollmentId: '',
                        studentId: '',
                        companyId: '',
                        internshipId: '',
                      }));
                    }
                  }}
                  className={styles.select}
                  required
                  disabled={isEdit}
                >
                  <option value="">-- Select an enrollment --</option>
                  {enrollments.map((enrollment) => (
                    <option key={enrollment.id} value={enrollment.id}>
                      {enrollment.studentName} → {enrollment.internshipTitle} ({enrollment.companyName})
                    </option>
                  ))}
                </select>
                <p className={styles.hint}>
                  💡 Select a student-internship enrollment to create an application task
                </p>
                {isEdit && <p className={styles.hint}>Cannot change enrollment after creation</p>}
                {!isEdit && enrollments.length === 0 && (
                  <p className={styles.hint} style={{ color: '#ef4444' }}>
                    ⚠️ No accepted enrollments available. Please create an enrollment first.
                  </p>
                )}
              </div>
              
              {/* Status */}
              <div className={styles.formGroup}>
                <label htmlFor="status" className={styles.label}>
                  Application Status <span className={styles.required}>*</span>
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
              <h3 className={styles.sectionTitle}>🔗 Links & Resources (Optional)</h3>
              <div className={styles.grid}>
                {/* Resume URL */}
                <div className={styles.formGroup}>
                  <label htmlFor="resumeUrl" className={styles.label}>
                    📄 Resume URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="resumeUrl"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="https://example.com/resume.pdf"
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
