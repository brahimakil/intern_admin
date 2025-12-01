// Admins Management Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { apiService } from '../services/api';
import { UserCog, Plus, Edit, Trash2, Search } from 'lucide-react';
import styles from './AdminsPage.module.css';

interface Admin {
  id: string;
  email: string;
  fullName: string;
  createdAt: any;
}

const AdminsPage: React.FC = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.get<Admin[]>('/admins');
      
      // Sort by creation date (newest first)
      const sortedAdmins = data.sort((a: any, b: any) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds;
        }
        return 0;
      });

      setAdmins(sortedAdmins);
    } catch (err: any) {
      console.error('Error fetching admins:', err);
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete admin "${name}"?`)) {
      try {
        await apiService.delete(`/admins/${id}`);
        fetchAdmins(); // Refresh list
      } catch (err: any) {
        console.error('Error deleting admin:', err);
        alert('Failed to delete admin');
      }
    }
  };

  // Filter admins based on search and status
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = 
      (admin.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (admin.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
   
    return matchesSearch ;
  });

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <UserCog size={32} />
              Admin Management
            </h1>
            <p className={styles.subtitle}>
              Manage administrator accounts in the system
            </p>
          </div>
          <button 
            className={styles.addButton}
            onClick={() => navigate('/admins/add')}
          >
            <Plus size={20} />
            Add New Admin
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
        
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Admins</span>
            <span className={styles.statValue}>{admins.length}</span>
          </div>
         
         
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.loading}>Loading admins...</div>
        )}

        {/* Error State */}
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {/* Admins Table */}
        {!loading && !error && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.noData}>
                      No admins found
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.email || 'N/A'}</td>
                      <td>
                        {admin.createdAt ? 
                          new Date(
                            (admin.createdAt.seconds || admin.createdAt._seconds || 0) * 1000
                          ).toLocaleDateString() :
                          'N/A'
                        }
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionButton}
                            onClick={() => navigate(`/admins/edit/${admin.id}`)}
                            title="Edit Admin"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(admin.id, admin.email)}
                            title="Delete Admin"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminsPage;
