// Enrollments Management Page - Student-Internship Direct Relationships
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { UserCheck, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import styles from './EnrollmentsPage.module.css';

interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  status: 'pending' | 'accepted' | 'rejected';
  enrolledDate: string;
}

const EnrollmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get<any[]>('/enrollments');
      setEnrollments(data);
    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
      setError(err.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to delete enrollment for "${studentName}"?`)) {
      try {
        await api.delete(`/enrollments/${id}`);
        setEnrollments(enrollments.filter(e => e.id !== id));
      } catch (err: any) {
        console.error('Error deleting enrollment:', err);
        alert('Failed to delete enrollment');
      }
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.internshipTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <UserCheck size={32} />
              Student Enrollments
            </h1>
            <p className={styles.subtitle}>
              Manage student-internship enrollments and their statuses
            </p>
          </div>
          <button
            className={styles.addButton}
            onClick={() => navigate('/enrollments/add')}
          >
            <Plus size={20} />
            Add Enrollment
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by student, internship, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.statusFilter}>
            <Filter size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Enrollments</span>
            <span className={styles.statValue}>{enrollments.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pending</span>
            <span className={styles.statValue}>
              {enrollments.filter(e => e.status === 'pending').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Accepted</span>
            <span className={styles.statValue}>
              {enrollments.filter(e => e.status === 'accepted').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Rejected</span>
            <span className={styles.statValue}>
              {enrollments.filter(e => e.status === 'rejected').length}
            </span>
          </div>
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading enrollments...</p>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && filteredEnrollments.length === 0 && (
          <div className={styles.empty}>
            <UserCheck size={64} />
            <h3>No enrollments found</h3>
            <p>
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first enrollment'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                className={styles.emptyButton}
                onClick={() => navigate('/enrollments/add')}
              >
                <Plus size={20} />
                Add First Enrollment
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredEnrollments.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Internship</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Enrolled Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>
                      <div className={styles.studentCell}>
                        {enrollment.studentName}
                      </div>
                    </td>
                    <td>{enrollment.internshipTitle}</td>
                    <td>{enrollment.companyName}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[enrollment.status]}`}>
                        {enrollment.status === 'pending' && '⏳ Pending'}
                        {enrollment.status === 'accepted' && '✓ Accepted'}
                        {enrollment.status === 'rejected' && '✕ Rejected'}
                      </span>
                    </td>
                    <td>{formatDate(enrollment.enrolledDate)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => navigate(`/enrollments/edit/${enrollment.id}`)}
                          title="Edit Enrollment"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteAction}`}
                          onClick={() => handleDelete(enrollment.id, enrollment.studentName)}
                          title="Delete Enrollment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EnrollmentsPage;
