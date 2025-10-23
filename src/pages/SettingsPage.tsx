// Settings page placeholder
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import styles from './PlaceholderPage.module.css';

const SettingsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.description}>
          Configure your account and application settings.
        </p>
        <div className={styles.placeholder}>
          <p>This page is under construction.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

