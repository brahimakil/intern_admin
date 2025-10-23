// Applications page placeholder
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import styles from './PlaceholderPage.module.css';

const ApplicationsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>Applications</h1>
        <p className={styles.description}>
          Review and manage all internship applications.
        </p>
        <div className={styles.placeholder}>
          <p>This page is under construction.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationsPage;

