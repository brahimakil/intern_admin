// Add/Edit Admin Form Page
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { ArrowLeft, UserCog, Save } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import styles from './AdminFormPage.module.css';

const AdminFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      fetchAdmin(id);
    }
  }, [id, isEdit]);

  const fetchAdmin = async (adminId: string) => {
    try {
      const data = await apiService.get<any>(`/admins/${adminId}`);
      
      setFormData({
        email: data.email || '',
        password: '', // Don't populate password for security
        fullName: data.fullName || '',
        status: data.status || 'active',
      });
    } catch (err) {
      console.error('Error fetching admin:', err);
      setError('Failed to load admin data');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEdit && !formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!isEdit && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = {
        email: formData.email,
        fullName: formData.fullName,
        status: formData.status,
        ...(formData.password && { password: formData.password }),
      };

      if (isEdit && id) {
        await apiService.put(`/admins/${id}`, submitData);
      } else {
        await apiService.post('/admins', submitData);
      }

      navigate('/admins');
    } catch (err: any) {
      console.error('Error saving admin:', err);
      setError(err.message || 'Failed to save admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/admins')}
          >
            <ArrowLeft size={20} />
            Back to Admins
          </button>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.formTitle}>
              <UserCog size={28} />
              <h2>{isEdit ? 'Edit Admin' : 'Add New Admin'}</h2>
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Basic Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Full Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <span className={styles.errorText}>{errors.fullName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                />
                {errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Password {!isEdit && <span className={styles.required}>*</span>}
                  {isEdit && <span className={styles.helperText}>(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isEdit ? 'Enter new password (optional)' : 'Enter password'}
                />
                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Status <span className={styles.required}>*</span>
                </label>
                <select
                  className={styles.select}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => navigate('/admins')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                <Save size={18} />
                {loading ? 'Saving...' : isEdit ? 'Update Admin' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFormPage;
