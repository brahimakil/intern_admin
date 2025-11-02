// Sidebar navigation component
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase,
  Users,
  FileText, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar Component
 * Navigation sidebar with links and user profile
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Companies', icon: Building2, path: '/companies' },
    { name: 'Internships', icon: Briefcase, path: '/internships' },
    { name: 'Students', icon: Users, path: '/students' },
    { name: 'Applications', icon: FileText, path: '/applications' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}></div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>IMS</div>
          <span className={styles.logoText}>Internship Admin</span>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <Icon className={styles.navIcon} size={20} />
                <span className={styles.navText}>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.email?.split('@')[0] || 'Admin'}</div>
              <div className={styles.userRole}>{user?.role || 'Admin'}</div>
            </div>
          </div>
          
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

