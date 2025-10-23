// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCN7ySeUsVXChjGwL8uteMqSTe3ai395sI",
  authDomain: "internshipsystem-43e2c.firebaseapp.com",
  projectId: "internshipsystem-43e2c",
  storageBucket: "internshipsystem-43e2c.firebasestorage.app",
  messagingSenderId: "33734669598",
  appId: "1:33734669598:web:334184b82ceab5eba1850f",
  measurementId: "G-XZN75N2SZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

