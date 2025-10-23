// Companies management page
import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Eye, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { apiService } from '../services/api';
import styles from './CompaniesPage.module.css';

interface Company {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  industry?: string;
  location?: string;
  description?: string;
  logoUrl?: string;
  createdAt: any;
  internshipsCount?: number;
}

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiService.get<Company[]>('/companies');
      setCompanies(data);
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await apiService.delete(`/companies/${id}`);
        fetchCompanies();
      } catch (err: any) {
        console.error('Error deleting company:', err);
        setError('Failed to delete company');
      }
    }
  };

  const handleViewInternships = (companyId: string) => {
    navigate(`/internships?company=${companyId}`);
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Building2 size={32} />
              Companies Management
            </h1>
            <p className={styles.subtitle}>Manage all registered companies</p>
          </div>
          <button 
            className={styles.addButton}
            onClick={() => navigate('/companies/add')}
          >
            <Plus size={20} />
            Add New Company
          </button>
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className={styles.empty}>
            <Building2 size={64} />
            <h3>No companies yet</h3>
            <p>Start by adding your first company</p>
            <button 
              className={styles.addButton}
              onClick={() => navigate('/companies/add')}
            >
              <Plus size={20} />
              Add New Company
            </button>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Email</th>
                  <th>Industry</th>
                  <th>Location</th>
                  <th>Internships</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>
                      <div className={styles.companyName}>
                        {company.logoUrl ? (
                          <img 
                            src={company.logoUrl} 
                            alt={company.name}
                            className={styles.companyLogo}
                          />
                        ) : (
                          <div className={styles.companyAvatar}>
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{company.name}</span>
                      </div>
                    </td>
                    <td>{company.email}</td>
                    <td>{company.industry || 'N/A'}</td>
                    <td>{company.location || 'N/A'}</td>
                    <td>
                      <span className={styles.internshipsBadge}>
                        {company.internshipsCount || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[company.status]}`}>
                        {company.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => navigate(`/companies/${company.id}`)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => navigate(`/companies/edit/${company.id}`)}
                          title="Edit Company"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleViewInternships(company.id)}
                          title="View Internships"
                        >
                          <Briefcase size={18} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => setDeleteConfirm(company.id)}
                          title="Delete Company"
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className={styles.modal} onClick={() => setDeleteConfirm(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3>Delete Company?</h3>
              <p>Are you sure you want to delete this company? This action cannot be undone.</p>
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelBtn}
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button 
                  className={styles.confirmDeleteBtn}
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompaniesPage;
