// Add/Edit Internship Form Page
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { apiService } from '../services/api';
import { ArrowLeft, Briefcase, Upload, X, Plus } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import styles from './InternshipFormPage.module.css';

interface Company {
  id: string;
  name: string;
  email: string;
  logoUrl?: string;
}

const InternshipFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [skillInput, setSkillInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyId: '',
    requiredSkills: [] as string[],
    duration: '',
    location: '',
    locationType: 'remote' as 'remote' | 'onsite' | 'hybrid',
    status: 'open' as 'open' | 'closed',
    logoUrl: '',
  });

  useEffect(() => {
    fetchCompanies();
    if (isEdit && id) {
      fetchInternship(id);
    }
  }, [id, isEdit]);

  const fetchCompanies = async () => {
    try {
      const data = await apiService.get<Company[]>('/companies');
      const companiesList: Company[] = data.map((company: any) => ({
        id: company.id,
        name: company.name,
        email: company.email,
        logoUrl: company.logoUrl,
      }));
      
      setCompanies(companiesList);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchInternship = async (internshipId: string) => {
    try {
      const data = await apiService.get<any>(`/internships/${internshipId}`);
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        companyId: data.companyId || '',
        requiredSkills: data.requiredSkills || [],
        duration: data.duration || '',
        location: data.location || '',
        locationType: data.locationType || 'remote',
        status: data.status || 'open',
        logoUrl: data.logoUrl || '',
      });
      if (data.logoUrl) {
        setLogoPreview(data.logoUrl);
      }
    } catch (err) {
      console.error('Error fetching internship:', err);
      setError('Failed to load internship data');
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

  const uploadLogo = async (internshipId: string): Promise<string> => {
    if (!logoFile) return formData.logoUrl;

    setUploading(true);
    try {
      const fileExtension = logoFile.name.split('.').pop();
      const fileName = `internships/${internshipId}/logo.${fileExtension}`;
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

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.companyId) {
      setError('Please select a company');
      setLoading(false);
      return;
    }

    if (formData.requiredSkills.length === 0) {
      setError('Please add at least one required skill');
      setLoading(false);
      return;
    }

    try {
      const internshipId = isEdit && id ? id : `${formData.companyId}_${Date.now()}`;
      
      // Upload logo if new file selected
      let logoUrl = formData.logoUrl;
      if (logoFile) {
        logoUrl = await uploadLogo(internshipId);
      }

      const internshipData = {
        ...formData,
        logoUrl,
      };

      if (isEdit && id) {
        // Update existing internship
        await apiService.put(`/internships/${id}`, internshipData);
      } else {
        // Add new internship
        await apiService.post('/internships', internshipData);
      }

      navigate('/internships');
    } catch (err: any) {
      console.error('Error saving internship:', err);
      setError(err.message || 'Failed to save internship');
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
        <button className={styles.backButton} onClick={() => navigate('/internships')}>
          <ArrowLeft size={20} />
          Back to Internships
        </button>

        <div className={styles.header}>
          <h1 className={styles.title}>
            <Briefcase size={32} />
            {isEdit ? 'Edit Internship' : 'Add New Internship'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? 'Update internship details' : 'Fill in the details to create a new internship opportunity'}
          </p>
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Logo Upload Section */}
          <div className={styles.logoSection}>
            <label className={styles.label}>Internship Logo (Optional)</label>
            <div className={styles.logoUpload}>
              {logoPreview ? (
                <div className={styles.logoPreviewContainer}>
                  <img src={logoPreview} alt="Internship Logo" className={styles.logoPreview} />
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
              <label htmlFor="title" className={styles.label}>
                Internship Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g., Software Engineering Intern"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="companyId" className={styles.label}>
                Company *
              </label>
              <select
                id="companyId"
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                className={styles.input}
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
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="duration" className={styles.label}>
                Duration (Months) *
              </label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={styles.input}
                required
              >
                <option value="">Select duration</option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
                <option value="4">4 Months</option>
                <option value="5">5 Months</option>
                <option value="6">6 Months</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.label}>
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g., San Francisco, CA"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="locationType" className={styles.label}>
                Location Type *
              </label>
              <select
                id="locationType"
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
                className={styles.input}
                required
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
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
                className={styles.input}
                required
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Describe the internship role, responsibilities, and requirements..."
              rows={6}
              required
            />
          </div>

          {/* Required Skills */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Required Skills *</label>
            <div className={styles.skillsInput}>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className={styles.input}
                placeholder="Type a skill and press Enter or click Add"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className={styles.addSkillButton}
              >
                <Plus size={20} />
                Add
              </button>
            </div>
            <div className={styles.skillsList}>
              {formData.requiredSkills.map((skill, index) => (
                <div key={index} className={styles.skillTag}>
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className={styles.removeSkillButton}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            {formData.requiredSkills.length === 0 && (
              <p className={styles.hint}>Add at least one required skill</p>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate('/internships')}
              disabled={loading || uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || uploading}
            >
              {uploading ? 'Uploading...' : loading ? 'Saving...' : isEdit ? 'Update Internship' : 'Add Internship'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default InternshipFormPage;

