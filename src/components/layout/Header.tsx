// Header component
import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick: () => void;
}

/**
 * Header Component
 * Top navigation bar with menu toggle and user info
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button 
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className={styles.right}>
        <div className={styles.userInfo}>
          <span className={styles.userEmail}>{user?.email}</span>
          <span className={styles.userRole}>{user?.role}</span>
        </div>
        
        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;

