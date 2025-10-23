// Company Internships page placeholder
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import styles from './PlaceholderPage.module.css';

const CompanyInternshipsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>My Internships</h1>
        <p className={styles.description}>
          Manage your company's internship postings.
        </p>
        <div className={styles.placeholder}>
          <p>This page is under construction.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyInternshipsPage;

