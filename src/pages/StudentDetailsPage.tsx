// Student Details Page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  Users, 
  Mail,
  GraduationCap,
  Calendar,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import styles from './StudentDetailsPage.module.css';

interface StudentDetails {
  id: string;
  email: string;
  fullName: string;
  major: string;
  profilePhotoUrl?: string;
  cvUrl?: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

const StudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchStudentDetails(id);
    }
  }, [id]);

  const fetchStudentDetails = async (studentId: string) => {
    setLoading(true);
    setError('');

    try {
      const data = await apiService.get<any>(`/students/${studentId}`);
      
      if (!data) {
        setError('Student not found');
        setLoading(false);
        return;
      }

      setApplicationsCount(data.applicationsCount || 0);
      setStudent({
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        major: data.major,
        profilePhotoUrl: data.profilePhotoUrl,
        cvUrl: data.cvUrl,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    } catch (err: any) {
      console.error('Error fetching student details:', err);
      setError('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!student) return;

    if (window.confirm(`Are you sure you want to delete student "${student.fullName}"?`)) {
      try {
        await apiService.delete(`/students/${student.id}`);
        navigate('/students');
      } catch (err: any) {
        console.error('Error deleting student:', err);
        alert('Failed to delete student');
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      let date: Date;
      
      // Handle Firestore Timestamp with _seconds and _nanoseconds
      if (timestamp._seconds !== undefined) {
        date = new Date(timestamp._seconds * 1000);
      }
      // Handle Firestore Timestamp with seconds property
      else if (timestamp.seconds !== undefined) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Handle Firestore Timestamp object with toDate method
      else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      }
      // Handle ISO string or regular Date
      else {
        date = new Date(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading student details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !student) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error || 'Student not found'}</p>
            <button onClick={() => navigate('/students')} className={styles.backButton}>
              <ArrowLeft size={20} />
              Back to Students
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate('/students')}>
          <ArrowLeft size={20} />
          Back to Students
        </button>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {student.profilePhotoUrl ? (
              <img 
                src={student.profilePhotoUrl} 
                alt={student.fullName}
                className={styles.profilePhoto}
              />
            ) : (
              <div className={styles.profileAvatar}>
                {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            <div>
              <h1 className={styles.title}>{student.fullName}</h1>
              <div className={styles.emailInfo}>
                <Mail size={18} />
                <span>{student.email}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <span className={`${styles.statusBadge} ${styles[student.status]}`}>
              {student.status === 'active' ? '✓ Active' : '✕ Inactive'}
            </span>
            <button
              className={styles.editButton}
              onClick={() => navigate(`/students/edit/${student.id}`)}
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
            <GraduationCap size={24} />
            <div>
              <span className={styles.statLabel}>Major</span>
              <span className={styles.statValue}>{student.major}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <FileText size={24} />
            <div>
              <span className={styles.statLabel}>Applications</span>
              <span className={styles.statValue}>{applicationsCount}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <Calendar size={24} />
            <div>
              <span className={styles.statLabel}>Joined</span>
              <span className={styles.statValue}>{formatDate(student.createdAt)}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <Calendar size={24} />
            <div>
              <span className={styles.statLabel}>Last Updated</span>
              <span className={styles.statValue}>{formatDate(student.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Personal Information Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Users size={24} />
              Personal Information
            </h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Full Name:</span>
                <span className={styles.infoValue}>{student.fullName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email Address:</span>
                <span className={styles.infoValue}>{student.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Major:</span>
                <span className={styles.infoValue}>{student.major}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>CV/Resume:</span>
                {student.cvUrl ? (
                  <a 
                    href={student.cvUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.cvLink}
                  >
                    <FileText size={16} />
                    View CV
                  </a>
                ) : (
                  <span className={styles.infoValue}>Not uploaded</span>
                )}
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Account Status:</span>
                <span className={`${styles.statusBadge} ${styles[student.status]}`}>
                  {student.status === 'active' ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Applications Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FileText size={24} />
              Application History
            </h2>
            <div className={styles.applicationsInfo}>
              <p className={styles.applicationsCount}>
                Total Applications: <strong>{applicationsCount}</strong>
              </p>
              {applicationsCount === 0 ? (
                <p className={styles.noApplications}>This student hasn't applied to any internships yet.</p>
              ) : (
                <button
                  className={styles.viewApplicationsButton}
                  onClick={() => navigate(`/applications?student=${student.id}`)}
                >
                  View All Applications
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDetailsPage;

