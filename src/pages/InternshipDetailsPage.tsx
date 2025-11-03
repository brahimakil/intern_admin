// Internship Details Page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  Briefcase, 
  Building2, 
  MapPin, 
  Clock, 
  Calendar,
  Users,
  Edit,
  Trash2
} from 'lucide-react';
import styles from './InternshipDetailsPage.module.css';

interface InternshipDetails {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyEmail: string;
  companyLogo?: string;
  requiredSkills: string[];
  duration: string;
  location: string;
  locationType: 'remote' | 'onsite' | 'hybrid';
  status: 'open' | 'closed';
  logoUrl?: string;
  createdAt: any;
  updatedAt: any;
}

const InternshipDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [internship, setInternship] = useState<InternshipDetails | null>(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [currentStudentsCount, setCurrentStudentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchInternshipDetails(id);
    }
  }, [id]);

  const fetchInternshipDetails = async (internshipId: string) => {
    setLoading(true);
    setError('');

    try {
      const data = await apiService.get<any>(`/internships/${internshipId}`);
      
      if (!data) {
        setError('Internship not found');
        setLoading(false);
        return;
      }

      setApplicationsCount(data.applicationsCount || 0);
      setCurrentStudentsCount(data.currentStudentsCount || 0);
      setInternship({
        id: data.id,
        title: data.title,
        description: data.description,
        companyId: data.companyId,
        companyName: data.companyName || 'Unknown Company',
        companyEmail: data.companyEmail || '',
        companyLogo: data.companyLogo || '',
        requiredSkills: data.requiredSkills || [],
        duration: data.duration,
        location: data.location,
        locationType: data.locationType,
        status: data.status,
        logoUrl: data.logoUrl,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    } catch (err: any) {
      console.error('Error fetching internship details:', err);
      setError('Failed to load internship details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!internship) return;

    if (window.confirm(`Are you sure you want to delete "${internship.title}"?`)) {
      try {
        await apiService.delete(`/internships/${internship.id}`);
        navigate('/internships');
      } catch (err: any) {
        console.error('Error deleting internship:', err);
        alert('Failed to delete internship');
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firestore Timestamp object
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      
      // Handle ISO string or regular Date
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading internship details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !internship) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error || 'Internship not found'}</p>
            <button onClick={() => navigate('/internships')} className={styles.backButton}>
              <ArrowLeft size={20} />
              Back to Internships
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate('/internships')}>
          <ArrowLeft size={20} />
          Back to Internships
        </button>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {internship.logoUrl && (
              <img 
                src={internship.logoUrl} 
                alt={internship.title}
                className={styles.internshipLogo}
              />
            )}
            <div>
              <h1 className={styles.title}>{internship.title}</h1>
              <div className={styles.companyInfo}>
                {internship.companyLogo ? (
                  <img 
                    src={internship.companyLogo} 
                    alt={internship.companyName}
                    className={styles.companyLogo}
                  />
                ) : (
                  <div className={styles.companyAvatar}>
                    {internship.companyName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={styles.companyName}>{internship.companyName}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <span className={`${styles.statusBadge} ${styles[internship.status]}`}>
              {internship.status === 'open' ? '✓ Open' : '✕ Closed'}
            </span>
            <button
              className={styles.editButton}
              onClick={() => navigate(`/internships/edit/${internship.id}`)}
            >
              <Edit size={18} />
              Edit
            </button>
            <button
              className={styles.deleteButton}
              onClick={handleDelete}
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Clock size={24} />
            <div>
              <span className={styles.statLabel}>Duration</span>
              <span className={styles.statValue}>
                {internship.duration} {internship.duration === '1' ? 'Month' : 'Months'}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <MapPin size={24} />
            <div>
              <span className={styles.statLabel}>Location</span>
              <span className={styles.statValue}>
                {internship.locationType === 'remote' ? '🏠 Remote' : 
                 internship.locationType === 'onsite' ? '🏢 On-site' : 
                 '🔄 Hybrid'}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <Users size={24} />
            <div>
              <span className={styles.statLabel}>Applications</span>
              <span className={styles.statValue}>{applicationsCount}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <Users size={24} />
            <div>
              <span className={styles.statLabel}>Current Students</span>
              <span className={styles.statValue}>{currentStudentsCount}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <Calendar size={24} />
            <div>
              <span className={styles.statLabel}>Posted</span>
              <span className={styles.statValue}>{formatDate(internship.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Description Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Briefcase size={24} />
              Description
            </h2>
            <p className={styles.description}>{internship.description}</p>
          </div>

          {/* Required Skills Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Building2 size={24} />
              Required Skills
            </h2>
            <div className={styles.skillsGrid}>
              {internship.requiredSkills.map((skill, index) => (
                <div key={index} className={styles.skillBadge}>
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Location Details */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <MapPin size={24} />
              Location Details
            </h2>
            <div className={styles.locationDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>City/Region:</span>
                <span className={styles.detailValue}>{internship.location}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Work Type:</span>
                <span className={`${styles.locationBadge} ${styles[internship.locationType]}`}>
                  {internship.locationType === 'remote' ? '🏠 Remote' : 
                   internship.locationType === 'onsite' ? '🏢 On-site' : 
                   '🔄 Hybrid'}
                </span>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Building2 size={24} />
              Company Information
            </h2>
            <div className={styles.companyDetails}>
              <div className={styles.companyHeader}>
                {internship.companyLogo ? (
                  <img 
                    src={internship.companyLogo} 
                    alt={internship.companyName}
                    className={styles.companyLogoLarge}
                  />
                ) : (
                  <div className={styles.companyAvatarLarge}>
                    {internship.companyName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className={styles.companyTitle}>{internship.companyName}</h3>
                  {internship.companyEmail && (
                    <p className={styles.companyEmail}>{internship.companyEmail}</p>
                  )}
                </div>
              </div>
              <button
                className={styles.viewCompanyButton}
                onClick={() => navigate(`/companies/${internship.companyId}`)}
              >
                View Company Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InternshipDetailsPage;

