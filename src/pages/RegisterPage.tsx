// Register page component - ADMIN ONLY
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RegisterForm from '../components/auth/RegisterForm';
import styles from './RegisterPage.module.css';

/**
 * RegisterPage Component
 * Admin registration page
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (email: string, password: string) => {
    setError('');
    setLoading(true);

    try {
      await register(email, password);
      // Always redirect to admin dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundAnimation}>
        <div className={styles.gradient1}></div>
        <div className={styles.gradient2}></div>
        <div className={styles.gradient3}></div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>IMS</div>
          </div>
          <h1 className={styles.title}>Create Admin Account</h1>
          <p className={styles.subtitle}>Register as admin for Internship Management</p>
        </div>

        <RegisterForm 
          onSubmit={handleRegister}
          error={error}
          loading={loading}
        />

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/" className={styles.footerLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
