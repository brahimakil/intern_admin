// Dashboard page with statistics
import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, FileText } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import type { DashboardStats } from '../types';
import { api } from '../services/api';
import styles from './DashboardPage.module.css';

/**
 * DashboardPage Component
 * Main dashboard with statistics cards
 */
const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCompanies: 0,
    openInternships: 0,
    totalApplications: 0,
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

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome to your admin dashboard</p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

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
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
