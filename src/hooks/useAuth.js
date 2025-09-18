import { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider // Make sure you have this in your firebase config
} from '../firebase/config';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  signInWithPopup 
} from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Email & password login
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Email & password registration with email verification
  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user); // Send OTP/email verification
    return userCredential;
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  // Forgot password
  const forgotPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Logout
  const logout = async () => {
    return signOut(auth);
  };

  return { 
    user, 
    loading, 
    login, 
    register, 
    loginWithGoogle, 
    forgotPassword, 
    logout 
  };
};
