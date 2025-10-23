// Add/Edit Student Form Page
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { apiService } from '../services/api';
import { ArrowLeft, Users, Upload, X } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import styles from './StudentFormPage.module.css';

const StudentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    major: '',
    profilePhotoUrl: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchStudent(id);
    }
  }, [id, isEdit]);

  const fetchStudent = async (studentId: string) => {
    try {
      const data = await apiService.get<any>(`/students/${studentId}`);
      
      setFormData({
        email: data.email || '',
        password: '', // Don't populate password for security
        fullName: data.fullName || '',
        major: data.major || '',
        profilePhotoUrl: data.profilePhotoUrl || '',
        status: data.status || 'active',
      });
      if (data.profilePhotoUrl) {
        setPhotoPreview(data.profilePhotoUrl);
      }
    } catch (err) {
      console.error('Error fetching student:', err);
      setError('Failed to load student data');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setFormData({ ...formData, profilePhotoUrl: '' });
  };

  const uploadPhoto = async (studentId: string): Promise<string> => {
    if (!photoFile) return formData.profilePhotoUrl;

    setUploading(true);
    try {
      const fileExtension = photoFile.name.split('.').pop();
      const fileName = `students/${studentId}/profile.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, photoFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (err) {
      console.error('Error uploading photo:', err);
      throw new Error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.fullName || !formData.major) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isEdit && !formData.password) {
      setError('Password is required for new students');
      setLoading(false);
      return;
    }

    if (!isEdit && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      let studentId = isEdit && id ? id : formData.email.replace(/[@.]/g, '_');
      
      // Upload photo if new file selected
      let profilePhotoUrl = formData.profilePhotoUrl;
      if (photoFile) {
        profilePhotoUrl = await uploadPhoto(studentId);
      }

      const studentData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        major: formData.major,
        profilePhotoUrl,
        status: formData.status,
      };

      if (isEdit && id) {
        // Update existing student
        await apiService.put(`/students/${id}`, studentData);
      } else {
        // Create new student via API
        await apiService.post('/students', studentData);
      }

      navigate('/students');
    } catch (err: any) {
      console.error('Error saving student:', err);
      setError(err.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate('/students')}>
          <ArrowLeft size={20} />
          Back to Students
        </button>

        <div className={styles.header}>
          <h1 className={styles.title}>
            <Users size={32} />
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? 'Update student information' : 'Fill in the details to register a new student'}
          </p>
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Profile Photo Upload Section */}
          <div className={styles.photoSection}>
            <label className={styles.label}>Profile Photo</label>
            <div className={styles.photoUpload}>
              {photoPreview ? (
                <div className={styles.photoPreviewContainer}>
                  <img src={photoPreview} alt="Profile" className={styles.photoPreview} />
                  <button
                    type="button"
                    className={styles.removePhoto}
                    onClick={handleRemovePhoto}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label htmlFor="photo" className={styles.uploadBox}>
                  <Upload size={32} />
                  <span>Click to upload photo</span>
                  <span className={styles.uploadHint}>PNG, JPG up to 2MB</span>
                </label>
              )}
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className={styles.fileInput}
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.label}>
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={styles.input}
                placeholder="John Doe"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="student@example.com"
                required
                disabled={isEdit}
              />
            </div>

            {!isEdit && (
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Min. 6 characters"
                  required={!isEdit}
                  minLength={6}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="major" className={styles.label}>
                Major *
              </label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g., Computer Science"
                required
              />
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
                className={styles.input}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate('/students')}
              disabled={loading || uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || uploading}
            >
              {uploading ? 'Uploading...' : loading ? 'Saving...' : isEdit ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default StudentFormPage;

