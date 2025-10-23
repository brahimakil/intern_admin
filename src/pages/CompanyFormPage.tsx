// Add/Edit Company Form Page
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { apiService } from '../services/api';
import { ArrowLeft, Building2, Upload, X } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import styles from './CompanyFormPage.module.css';

const CompanyFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    location: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    logoUrl: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchCompany(id);
    }
  }, [id, isEdit]);

  const fetchCompany = async (companyId: string) => {
    try {
      const data = await apiService.get<any>(`/companies/${companyId}`);
      
      setFormData({
        name: data.name || '',
        email: data.email || '',
        industry: data.industry || '',
        location: data.location || '',
        description: data.description || '',
        status: data.status || 'active',
        logoUrl: data.logoUrl || '',
      });
      if (data.logoUrl) {
        setLogoPreview(data.logoUrl);
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      setError('Failed to load company data');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData({ ...formData, logoUrl: '' });
  };

  const uploadLogo = async (companyId: string): Promise<string> => {
    if (!logoFile) return formData.logoUrl;

    setUploading(true);
    try {
      const fileExtension = logoFile.name.split('.').pop();
      const fileName = `companies/${companyId}/logo.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, logoFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw new Error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const companyId = isEdit && id ? id : formData.email.replace(/[@.]/g, '_');
      
      // Upload logo if new file selected
      let logoUrl = formData.logoUrl;
      if (logoFile) {
        logoUrl = await uploadLogo(companyId);
      }

      const companyData = {
        ...formData,
        logoUrl,
      };

      if (isEdit && id) {
        // Update existing company
        await apiService.put(`/companies/${id}`, companyData);
      } else {
        // Add new company
        await apiService.post('/companies', companyData);
      }

      navigate('/companies');
    } catch (err: any) {
      console.error('Error saving company:', err);
      setError(err.message || 'Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate('/companies')}>
          <ArrowLeft size={20} />
          Back to Companies
        </button>

        <div className={styles.header}>
          <h1 className={styles.title}>
            <Building2 size={32} />
            {isEdit ? 'Edit Company' : 'Add New Company'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? 'Update company information' : 'Fill in the details to add a new company'}
          </p>
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Logo Upload Section */}
          <div className={styles.logoSection}>
            <label className={styles.label}>Company Logo</label>
            <div className={styles.logoUpload}>
              {logoPreview ? (
                <div className={styles.logoPreviewContainer}>
                  <img src={logoPreview} alt="Company Logo" className={styles.logoPreview} />
                  <button
                    type="button"
                    className={styles.removeLogo}
                    onClick={handleRemoveLogo}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label htmlFor="logo" className={styles.uploadBox}>
                  <Upload size={32} />
                  <span>Click to upload logo</span>
                  <span className={styles.uploadHint}>PNG, JPG up to 2MB</span>
                </label>
              )}
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                className={styles.fileInput}
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Company Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="Tech Corp"
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
                placeholder="contact@techcorp.com"
                required
                disabled={isEdit}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="industry" className={styles.label}>
                Industry
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className={styles.input}
                placeholder="Technology"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.label}>
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={styles.input}
                placeholder="San Francisco, CA"
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

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Brief description about the company..."
              rows={4}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate('/companies')}
              disabled={loading || uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || uploading}
            >
              {uploading ? 'Uploading...' : loading ? 'Saving...' : isEdit ? 'Update Company' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CompanyFormPage;
