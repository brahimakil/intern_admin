// Register form component with validation - ADMIN ONLY
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  error: string;
  loading: boolean;
}

/**
 * RegisterForm Component
 * Handles ADMIN registration with email and password
 */
const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, error, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({ email: '', password: '', confirmPassword: '' });

    // Validate inputs
    let hasErrors = false;
    const errors = { email: '', password: '', confirmPassword: '' };

    if (!email.trim()) {
      errors.email = 'Email is required';
      hasErrors = true;
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email';
      hasErrors = true;
    }

    if (!password) {
      errors.password = 'Password is required';
      hasErrors = true;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      hasErrors = true;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      hasErrors = true;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    // Submit form
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Email Input */}
      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
          placeholder="admin@example.com"
          disabled={loading}
        />
        {validationErrors.email && (
          <span className={styles.errorText}>{validationErrors.email}</span>
        )}
      </div>

      {/* Password Input */}
      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
            placeholder="••••••••"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.togglePassword}
            disabled={loading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {validationErrors.password && (
          <span className={styles.errorText}>{validationErrors.password}</span>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Confirm Password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`${styles.input} ${validationErrors.confirmPassword ? styles.inputError : ''}`}
            placeholder="••••••••"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className={styles.togglePassword}
            disabled={loading}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {validationErrors.confirmPassword && (
          <span className={styles.errorText}>{validationErrors.confirmPassword}</span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
      </button>

      <p className={styles.infoText}>
        Creating an admin account for internship management
      </p>
    </form>
  );
};

export default RegisterForm;
