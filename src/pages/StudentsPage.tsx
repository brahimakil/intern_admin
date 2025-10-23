// Students Management Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { apiService } from '../services/api';
import { Users, Plus, Eye, Edit, Trash2, Search, Filter } from 'lucide-react';
import styles from './StudentsPage.module.css';

interface Student {
  id: string;
  email: string;
  fullName: string;
  major: string;
  profilePhotoUrl?: string;
  status: 'active' | 'inactive';
  createdAt: any;
  applicationsCount?: number;
}

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.get<Student[]>('/students');
      
      // Sort by creation date (newest first)
      const sortedStudents = data.sort((a: any, b: any) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds;
        }
        return 0;
      });

      setStudents(sortedStudents);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"?`)) {
      try {
        await apiService.delete(`/students/${id}`);
        fetchStudents(); // Refresh list
      } catch (err: any) {
        console.error('Error deleting student:', err);
        alert('Failed to delete student');
      }
    }
  };

  // Filter students based on search and status
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <Users size={32} />
              Students Management
            </h1>
            <p className={styles.subtitle}>
              Manage all registered students in the system
            </p>
          </div>
          <button 
            className={styles.addButton}
            onClick={() => navigate('/students/add')}
          >
            <Plus size={20} />
            Add New Student
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterBox}>
            <Filter size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Students</span>
            <span className={styles.statValue}>{students.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Active Students</span>
            <span className={styles.statValue}>
              {students.filter(s => s.status === 'active').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Inactive Students</span>
            <span className={styles.statValue}>
              {students.filter(s => s.status === 'inactive').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Applications</span>
            <span className={styles.statValue}>
              {students.reduce((sum, s) => sum + (s.applicationsCount || 0), 0)}
            </span>
          </div>
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading students...</p>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && filteredStudents.length === 0 && (
          <div className={styles.empty}>
            <Users size={64} />
            <h3>No students found</h3>
            <p>
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first student'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                className={styles.emptyButton}
                onClick={() => navigate('/students/add')}
              >
                <Plus size={20} />
                Add First Student
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredStudents.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Major</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className={styles.studentCell}>
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
                        <span className={styles.studentName}>{student.fullName}</span>
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>
                      <span className={styles.majorBadge}>{student.major}</span>
                    </td>
                    <td>
                      <span className={styles.applicationsBadge}>
                        {student.applicationsCount || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[student.status]}`}>
                        {student.status === 'active' ? '✓ Active' : '✕ Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => navigate(`/students/${student.id}`)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => navigate(`/students/edit/${student.id}`)}
                          title="Edit Student"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(student.id, student.fullName)}
                          title="Delete Student"
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

export default StudentsPage;

