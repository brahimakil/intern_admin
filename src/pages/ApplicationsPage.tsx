// Applications Management Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { apiService } from '../services/api';
import type { Application } from '../types';
import { FileText, Plus, Eye, Edit, Trash2, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import styles from './ApplicationsPage.module.css';

interface ApplicationDetailsModalProps {
  application: Application;
  onClose: () => void;
  onStatusUpdate: (id: string, status: 'pending' | 'accepted' | 'rejected') => void;
  onEdit: (id: string) => void;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({ 
  application, 
  onClose, 
  onStatusUpdate,
  onEdit 
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: '#fbbf24', icon: Clock, bg: '#fef3c7', text: 'Pending Review' },
      accepted: { color: '#10b981', icon: CheckCircle, bg: '#d1fae5', text: 'Accepted' },
      rejected: { color: '#ef4444', icon: XCircle, bg: '#fee2e2', text: 'Rejected' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <span 
        style={{ 
          padding: '8px 16px', 
          borderRadius: '8px', 
          backgroundColor: config.bg, 
          color: config.color,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '700',
          fontSize: '1rem',
        }}
      >
        <Icon size={20} />
        {config.text}
      </span>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header with Status */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <h2>📋 Application Details</h2>
            {getStatusBadge(application.status)}
          </div>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          {/* Applicant Card */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3>👤 Applicant Information</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Full Name</span>
                  <span className={styles.infoValue}>{application.student?.fullName || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email Address</span>
                  <span className={styles.infoValue}>
                    <a href={`mailto:${application.student?.email}`}>{application.student?.email || 'N/A'}</a>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Position Card */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3>💼 Position Details</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Internship Title</span>
                  <span className={styles.infoValue}>{application.internship?.title || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Company</span>
                  <span className={styles.infoValue}>{application.company?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Content */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3>✍️ Cover Letter</h3>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.textContent}>{application.coverLetter}</p>
            </div>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3>🚀 Project Description</h3>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.textContent}>{application.projectDescription}</p>
            </div>
          </div>

          {/* Links & Resources */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3>🔗 Links & Resources</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.linksGrid}>
                {application.resumeUrl && (
                  <a 
                    href={application.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.linkButton}
                  >
                    <span className={styles.linkIcon}>📄</span>
                    <span className={styles.linkText}>View Resume</span>
                  </a>
                )}
                {application.githubUrl && (
                  <a 
                    href={application.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.linkButton}
                  >
                    <span className={styles.linkIcon}>💻</span>
                    <span className={styles.linkText}>GitHub Profile</span>
                  </a>
                )}
                {application.portfolioUrl && (
                  <a 
                    href={application.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.linkButton}
                  >
                    <span className={styles.linkIcon}>🌐</span>
                    <span className={styles.linkText}>Portfolio Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {application.notes && (
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <h3>📝 Admin Notes</h3>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.textContent}>{application.notes}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3>⏰ Timeline</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineIcon}>📅</span>
                  <div>
                    <span className={styles.timelineLabel}>Submitted</span>
                    <span className={styles.timelineValue}>
                      {new Date(application.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineIcon}>🔄</span>
                  <div>
                    <span className={styles.timelineLabel}>Last Updated</span>
                    <span className={styles.timelineValue}>
                      {new Date(application.updatedAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.modalActions}>
          <button 
            className={styles.editButtonModal}
            onClick={() => onEdit(application.id)}
          >
            <Edit size={18} />
            Edit Application
          </button>
          {application.status !== 'rejected' && (
            <button 
              className={styles.rejectButton}
              onClick={() => onStatusUpdate(application.id, 'rejected')}
            >
              <XCircle size={18} />
              Reject
            </button>
          )}
          {application.status !== 'accepted' && (
            <button 
              className={styles.acceptButton}
              onClick={() => onStatusUpdate(application.id, 'accepted')}
            >
              <CheckCircle size={18} />
              Accept Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.getApplications();
      setApplications(data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to delete the application from "${studentName}"?`)) {
      try {
        await apiService.deleteApplication(id);
        fetchApplications();
      } catch (err: any) {
        console.error('Error deleting application:', err);
        alert('Failed to delete application');
      }
    }
  };

  const handleStatusUpdate = async (id: string, status: 'pending' | 'accepted' | 'rejected') => {
    try {
      await apiService.updateApplicationStatus(id, status);
      fetchApplications();
      setSelectedApplication(null);
    } catch (err: any) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: '#fbbf24', icon: Clock, bg: '#fef3c7' },
      accepted: { color: '#10b981', icon: CheckCircle, bg: '#d1fae5' },
      rejected: { color: '#ef4444', icon: XCircle, bg: '#fee2e2' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <span 
        style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          backgroundColor: config.bg, 
          color: config.color,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.875rem',
          fontWeight: '600',
          textTransform: 'capitalize'
        }}
      >
        <Icon size={14} />
        {status}
      </span>
    );
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.internship?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <FileText size={32} />
              Applications Management
            </h1>
            <p className={styles.subtitle}>
              Review and manage all internship applications
            </p>
          </div>
          <button 
            className={styles.addButton}
            onClick={() => navigate('/applications/new')}
          >
            <Plus size={20} />
            Add New Application
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className={styles.controls}>
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
          
          <div className={styles.filterBox}>
            <Filter size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Applications</span>
            <span className={styles.statValue}>{applications.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pending</span>
            <span className={styles.statValue} style={{ color: '#fbbf24' }}>
              {applications.filter(a => a.status === 'pending').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Accepted</span>
            <span className={styles.statValue} style={{ color: '#10b981' }}>
              {applications.filter(a => a.status === 'accepted').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Rejected</span>
            <span className={styles.statValue} style={{ color: '#ef4444' }}>
              {applications.filter(a => a.status === 'rejected').length}
            </span>
          </div>
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className={styles.loading}>Loading applications...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : filteredApplications.length === 0 ? (
          <div className={styles.empty}>
            <FileText size={48} />
            <p>No applications found</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Internship</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.student?.fullName || 'N/A'}</td>
                    <td>{app.student?.email || 'N/A'}</td>
                    <td>{app.internship?.title || 'N/A'}</td>
                    <td>{app.company?.name || 'N/A'}</td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => setSelectedApplication(app)}
                          className={styles.viewButton}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/applications/${app.id}/edit`)}
                          className={styles.editButton}
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id, app.student?.fullName || 'this student')}
                          className={styles.deleteButton}
                          title="Delete"
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

        {/* Details Modal */}
        {selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onStatusUpdate={handleStatusUpdate}
            onEdit={(id) => {
              setSelectedApplication(null);
              navigate(`/applications/${id}/edit`);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationsPage;

