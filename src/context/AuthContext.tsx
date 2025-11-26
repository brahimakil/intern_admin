// Authentication context - Firebase Auth + NestJS APIs
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { loginWithEmail, registerWithEmail, logoutUser } from '../firebase/auth';
import type { AuthContextType, User } from '../types';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Uses Firebase for authentication, NestJS for data APIs
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'company' | 'student' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen to Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Try fetching by UID first (backend created users)
          let userDocRef = doc(db, 'users', firebaseUser.uid);
          let userDoc = await getDoc(userDocRef);

          // If not found, try by email (frontend created users - legacy)
          if (!userDoc.exists() && firebaseUser.email) {
            userDocRef = doc(db, 'users', firebaseUser.email);
            userDoc = await getDoc(userDocRef);
          }
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Check if user is inactive - logout immediately
            if (data.status === 'inactive') {
              await logoutUser();
              setUser(null);
              setRole(null);
              setLoading(false);
              return;
            }
            
            const userData: User = {
              uid: firebaseUser.uid,
              email: data.email,
              role: data.role,
              createdAt: data.createdAt?.toDate() || new Date(),
            };
            setUser(userData);
            setRole(data.role);
          } else {
            // User authenticated but no Firestore document
            setUser(null);
            setRole(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setRole(null);
        }
      } else {
        // User is signed out
        setUser(null);
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Login function - Firebase Auth
   */
  const login = async (email: string, password: string): Promise<User> => {
    try {
      await loginWithEmail(email, password);
      
      const uid = auth.currentUser!.uid;
      
      // Try fetching by UID first (backend created users)
      let userDocRef = doc(db, 'users', uid);
      let userDoc = await getDoc(userDocRef);
      
      // If not found, try by email (frontend created users - legacy)
      if (!userDoc.exists()) {
        userDocRef = doc(db, 'users', email);
        userDoc = await getDoc(userDocRef);
      }
      
      if (userDoc.exists()) {
        // User document exists - use the data from Firestore
        const data = userDoc.data();
        
        console.log('User data from Firestore:', data);
        console.log('Status field:', data.status);
        
        // Check if user is inactive - LOGOUT AND REJECT IMMEDIATELY
        if (data.status && data.status === 'inactive') {
          console.log('User is INACTIVE - logging out');
          await logoutUser();
          setUser(null);
          setRole(null);
          throw new Error('Your account has been deactivated.');
        }
        
        console.log('User is active or no status field - allowing login');
        
        const userData: User = {
          uid: uid,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
        
        setUser(userData);
        setRole(userData.role);
        
        return userData;
      } else {
        // User document doesn't exist - allow login with default admin role
        const userData: User = {
          uid: uid,
          email: email,
          role: 'admin',
          createdAt: new Date(),
        };
        
        setUser(userData);
        setRole(userData.role);
        
        return userData;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Register function - Firebase Auth, ADMIN ONLY
   */
  const register = async (email: string, password: string): Promise<User> => {
    try {
      await registerWithEmail(email, password);
      
      // Fetch user role from Firestore
      const userDocRef = doc(db, 'users', email);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User data not found after registration');
      }
      
      const data = userDoc.data();
      const userData: User = {
        uid: auth.currentUser!.uid,
        email: data.email,
        role: 'admin', // ALWAYS ADMIN
        createdAt: data.createdAt?.toDate() || new Date(),
      };
      
      setUser(userData);
      setRole('admin');
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout function
   */
  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      setUser(null);
      setRole(null);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    role,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
