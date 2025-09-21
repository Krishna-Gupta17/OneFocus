import { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider,
  facebookProvider,
  linkedinProvider
} from '../firebase/config';
import { 
  onAuthStateChanged,
  onIdTokenChanged, 
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
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    const unsubToken = onIdTokenChanged(auth, (u) => {
      // Keep user in sync when ID token refreshes (e.g., after reload())
      setUser(u);
    });
    return () => {
      unsubAuth();
      unsubToken();
    };
  }, []);

  // Email & password login
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred.user.emailVerified) {
      try {
        await sendEmailVerification(cred.user);
      } catch (_) {
        // ignore send errors; we'll still block login
      }
      const err = new Error('Please verify your email. We just sent you a verification link.');
      err.code = 'auth/email-not-verified';
      throw err;
    }
    return cred;
  };

  // Email & password registration with email verification
  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: false
    };
    await sendEmailVerification(userCredential.user, actionCodeSettings);
    // Sign out to ensure unverified users don't remain authenticated
    await signOut(auth);
    return userCredential;
  };

  // Resend email verification
  const resendVerification = async (email, password) => {
    // If user is logged in but unverified
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
      return true;
    }
    // If no current user, optionally sign in silently to send
    if (email && password) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      try {
        await sendEmailVerification(cred.user);
      } finally {
        await signOut(auth);
      }
      return true;
    }
    const err = new Error('Please sign in first or provide email and password to resend verification.');
    err.code = 'auth/resend-requires-auth';
    throw err;
  };

  // Explicitly refresh the current user and sync context
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      return auth.currentUser;
    }
    return null;
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  // Sign in with Facebook
  const loginWithFacebook = async () => {
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  };

  // Sign in with LinkedIn (via OIDC provider configured in Firebase)
  const loginWithLinkedIn = async () => {
    const result = await signInWithPopup(auth, linkedinProvider);
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
    loginWithFacebook,
    loginWithLinkedIn,
    resendVerification,
    refreshUser,
    forgotPassword, 
    logout 
  };
};
