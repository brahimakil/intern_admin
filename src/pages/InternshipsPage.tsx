// Internships Management Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { apiService } from '../services/api';
import { Briefcase, Plus, Eye, Edit, Trash2, Search, Filter } from 'lucide-react';
import styles from './InternshipsPage.module.css';

interface Internship {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  logoUrl?: string;
  requiredSkills: string[];
  duration: string;
  location: string;
  locationType: 'remote' | 'onsite' | 'hybrid';
  status: 'open' | 'closed';
  applicationsCount?: number;
  currentStudentsCount?: number;
  createdAt: any;
}

const InternshipsPage: React.FC = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.get<Internship[]>('/internships');
      
      // Sort by creation date (newest first)
      const sortedInternships = data.sort((a: any, b: any) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds;
        }
        return 0;
      });

      setInternships(sortedInternships);
    } catch (err: any) {
      console.error('Error fetching internships:', err);
      setError('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await apiService.delete(`/internships/${id}`);
        fetchInternships(); // Refresh list
      } catch (err: any) {
        console.error('Error deleting internship:', err);
        alert('Failed to delete internship');
      }
    }
  };

  // Filter internships based on search and status
  const filteredInternships = internships.filter((internship) => {
    const matchesSearch = 
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.requiredSkills.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = 
      filterStatus === 'all' || internship.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <Briefcase size={32} />
              Internships Management
            </h1>
            <p className={styles.subtitle}>
              Manage all internship opportunities across companies
            </p>
          </div>
          <button 
            className={styles.addButton}
            onClick={() => navigate('/internships/add')}
          >
            <Plus size={20} />
            Add New Internship
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by title, company, or skills..."
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
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Internships</span>
            <span className={styles.statValue}>{internships.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Open Positions</span>
            <span className={styles.statValue}>
              {internships.filter(i => i.status === 'open').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Closed Positions</span>
            <span className={styles.statValue}>
              {internships.filter(i => i.status === 'closed').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Applications</span>
            <span className={styles.statValue}>
              {internships.reduce((sum, i) => sum + (i.applicationsCount || 0), 0)}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Students</span>
            <span className={styles.statValue}>
              {internships.reduce((sum, i) => sum + (i.currentStudentsCount || 0), 0)}
            </span>
          </div>
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading internships...</p>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && filteredInternships.length === 0 && (
          <div className={styles.empty}>
            <Briefcase size={64} />
            <h3>No internships found</h3>
            <p>
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first internship'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                className={styles.emptyButton}
                onClick={() => navigate('/internships/add')}
              >
                <Plus size={20} />
                Add First Internship
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredInternships.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Required Skills</th>
                  <th>Duration</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInternships.map((internship) => (
                  <tr key={internship.id}>
                    <td>
                      <div className={styles.logoCell}>
                        {internship.logoUrl ? (
                          <img 
                            src={internship.logoUrl} 
                            alt={internship.title}
                            className={styles.internshipLogo}
                          />
                        ) : (
                          <div className={styles.internshipPlaceholder}>
                            <Briefcase size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.titleCell}>
                        <span className={styles.internshipTitle}>{internship.title}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.companyCell}>
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
                        <span>{internship.companyName}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.skillsCell}>
                        {internship.requiredSkills.slice(0, 3).map((skill, index) => (
                          <span key={index} className={styles.skillBadge}>
                            {skill}
                          </span>
                        ))}
                        {internship.requiredSkills.length > 3 && (
                          <span className={styles.skillBadge}>
                            +{internship.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{internship.duration} {internship.duration === '1' ? 'Month' : 'Months'}</td>
                    <td>
                      <span className={`${styles.locationBadge} ${styles[internship.locationType]}`}>
                        {internship.locationType === 'remote' ? '🏠 Remote' : 
                         internship.locationType === 'onsite' ? '🏢 On-site' : 
                         '🔄 Hybrid'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[internship.status]}`}>
                        {internship.status === 'open' ? '✓ Open' : '✕ Closed'}
                      </span>
                    </td>
                    <td>
                      <span className={styles.applicantsBadge}>
                        {internship.applicationsCount || 0}
                      </span>
                    </td>
                    <td>
                      <span className={styles.applicantsBadge}>
                        {internship.currentStudentsCount || 0}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => navigate(`/internships/${internship.id}`)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => navigate(`/internships/edit/${internship.id}`)}
                          title="Edit Internship"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(internship.id, internship.title)}
                          title="Delete Internship"
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

export default InternshipsPage;
