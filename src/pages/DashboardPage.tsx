// Dashboard page with statistics
import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Briefcase, FileText, 
  Clock, CheckCircle, XCircle, TrendingUp,
  UserPlus, Plus, Eye, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import type { DashboardStats } from '../types';
import { api } from '../services/api';
import styles from './DashboardPage.module.css';

/**
 * DashboardPage Component
 * Main dashboard with statistics cards, charts, and quick actions
 */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCompanies: 0,
    openInternships: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    recentApplications: 0,
    recentActivities: [],
    applicationTrends: [0, 0, 0, 0, 0],
    trendLabels: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.getDashboardStats();
      console.log('Dashboard stats received:', data);
      console.log('Recent activities:', data.recentActivities);
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bgColor: '#ede9fe',
    },
    {
      title: 'Active Companies',
      value: stats.activeCompanies,
      icon: Building2,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      bgColor: '#fce7f3',
    },
    {
      title: 'Open Internships',
      value: stats.openInternships,
      icon: Briefcase,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      bgColor: '#dbeafe',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      bgColor: '#d1fae5',
    },
  ];

  const statusCards = [
    {
      title: 'Pending',
      value: stats.pendingApplications,
      icon: Clock,
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      title: 'Accepted',
      value: stats.acceptedApplications,
      icon: CheckCircle,
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    {
      title: 'Rejected',
      value: stats.rejectedApplications,
      icon: XCircle,
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
    {
      title: 'Last 7 Days',
      value: stats.recentApplications,
      icon: TrendingUp,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
    },
  ];

  const quickActions = [
    {
      title: 'Add Student',
      icon: UserPlus,
      color: '#667eea',
      action: () => navigate('/students/add'),
    },
    {
      title: 'Add Company',
      icon: Building2,
      color: '#f093fb',
      action: () => navigate('/companies/add'),
    },
    {
      title: 'Add Internship',
      icon: Plus,
      color: '#4facfe',
      action: () => navigate('/internships/add'),
    },
    {
      title: 'View Applications',
      icon: Eye,
      color: '#43e97b',
      action: () => navigate('/applications'),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const maxTrendValue = Math.max(...stats.applicationTrends, 1);

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Welcome to your admin dashboard</p>
          </div>
          <button className={styles.refreshButton} onClick={fetchDashboardStats} disabled={loading}>
            <Calendar size={18} />
            Refresh Data
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Main Stats Grid */}
        <div className={styles.statsGrid}>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            
            return (
              <div key={index} className={styles.statCard}>
                {loading ? (
                  <div className={styles.skeleton}></div>
                ) : (
                  <>
                    <div 
                      className={styles.iconWrapper}
                      style={{ background: card.gradient }}
                    >
                      <Icon className={styles.icon} size={24} />
                    </div>
                    
                    <div className={styles.statContent}>
                      <h3 className={styles.statTitle}>{card.title}</h3>
                      <p className={styles.statValue}>{card.value}</p>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Status Cards */}
        <div className={styles.statusSection}>
          <h2 className={styles.sectionTitle}>📊 Application Status</h2>
          <div className={styles.statusGrid}>
            {statusCards.map((card, index) => {
              const Icon = card.icon;
              
              return (
                <div key={index} className={styles.statusCard}>
                  {loading ? (
                    <div className={styles.skeleton}></div>
                  ) : (
                    <>
                      <div 
                        className={styles.statusIcon}
                        style={{ backgroundColor: card.bgColor }}
                      >
                        <Icon size={24} style={{ color: card.color }} />
                      </div>
                      <div className={styles.statusInfo}>
                        <p className={styles.statusValue}>{card.value}</p>
                        <p className={styles.statusTitle}>{card.title}</p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart and Quick Actions Row */}
        <div className={styles.dashboardRow}>
          {/* Application Trends Chart */}
          <div className={styles.chartCard}>
            <h2 className={styles.sectionTitle}>📈 Application Trends (Last 5 Weeks)</h2>
            {loading ? (
              <div className={styles.skeleton} style={{ height: '250px' }}></div>
            ) : (
              <div className={styles.chartContainer}>
                <div className={styles.chart}>
                  {stats.applicationTrends.map((value, index) => {
                    const heightPercent = maxTrendValue > 0 
                      ? Math.max((value / maxTrendValue) * 80, value > 0 ? 15 : 5)
                      : 5;
                    
                    const label = stats.trendLabels && stats.trendLabels[index] 
                      ? stats.trendLabels[index] 
                      : `W${index + 1}`;
                    
                    return (
                      <div key={index} className={styles.chartBar}>
                        <div 
                          className={styles.bar}
                          style={{ 
                            height: `${heightPercent}%`,
                            background: value > 0 
                              ? 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)'
                              : 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
                            minHeight: '30px'
                          }}
                        >
                          <span className={styles.barValue}>{value}</span>
                        </div>
                        <span className={styles.barLabel}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActionsCard}>
            <h2 className={styles.sectionTitle}>⚡ Quick Actions</h2>
            <div className={styles.quickActionsGrid}>
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                
                return (
                  <button
                    key={index}
                    className={styles.quickActionButton}
                    onClick={action.action}
                    disabled={loading}
                  >
                    <Icon size={24} style={{ color: action.color }} />
                    <span>{action.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className={styles.activitiesSection}>
          <h2 className={styles.sectionTitle}>🕒 Recent Activities</h2>
          {loading ? (
            <div className={styles.skeleton} style={{ height: '300px' }}></div>
          ) : (
            <div className={styles.activitiesCard}>
              {stats.recentActivities.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText size={48} color="#cbd5e1" />
                  <p>No recent activities</p>
                </div>
              ) : (
                <div className={styles.activitiesList}>
                  {stats.recentActivities.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        <FileText size={20} color="#667eea" />
                      </div>
                      <div className={styles.activityContent}>
                        <p className={styles.activityText}>
                          <strong>{activity.studentName}</strong> applied for{' '}
                          <strong>{activity.internshipTitle}</strong>
                        </p>
                        <div className={styles.activityMeta}>
                          <span 
                            className={styles.activityStatus}
                            style={{ 
                              color: getStatusColor(activity.status),
                              backgroundColor: `${getStatusColor(activity.status)}20`
                            }}
                          >
                            {activity.status}
                          </span>
                          <span className={styles.activityDate}>
                            {formatDate(activity.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
