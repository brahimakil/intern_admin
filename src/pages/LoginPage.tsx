// Login page component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import styles from './LoginPage.module.css';

/**
 * LoginPage Component
 * Main login page with form and branding
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (userData.role === 'company') {
        navigate('/company/internships', { replace: true });
      } else {
        setError('Invalid user role');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
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
          <h1 className={styles.title}>Internship Admin</h1>
          <p className={styles.subtitle}>Sign in to access your dashboard</p>
        </div>

        <LoginForm 
          onSubmit={handleLogin}
          error={error}
          loading={loading}
        />

      </div>
    </div>
  );
};

export default LoginPage;

