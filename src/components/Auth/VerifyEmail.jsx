import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { auth } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { resendVerification, refreshUser, logout, user } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  // No auto polling; we check only on user action

  const handleResend = async () => {
    try {
      setSending(true);
      await resendVerification();
      toast.success('Verification email sent. Check your inbox (and spam).');
    } catch (e) {
      toast.error(e?.message || 'Failed to resend verification.');
    } finally {
      setSending(false);
    }
  };

  const [navigated, setNavigated] = useState(false);

  const handleIHaveVerified = async () => {
    try {
      setChecking(true);
      if (auth.currentUser) {
        await auth.currentUser.reload();
        await refreshUser();
      }
      if (auth.currentUser?.emailVerified) {
        if (!navigated) {
          setNavigated(true);
          if (typeof window !== 'undefined') {
            // Set a user-scoped flag to avoid leaking across sessions
            const key = auth.currentUser?.uid ? `emailJustVerified:${auth.currentUser.uid}` : null;
            if (key) window.localStorage.setItem(key, '1');
            // Also clean up any legacy global flag if present
            if (window.localStorage.getItem('emailJustVerified')) {
              window.localStorage.removeItem('emailJustVerified');
            }
          }
          navigate('/dashboard', { replace: true });
          toast.success('Email verified!');
        }
      } else {
        toast('Still not verified. Please click the link in your email.', { icon: 'ℹ️' });
      }
    } catch (e) {
      toast.error(e?.message || 'Could not refresh verification status.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out');
      navigate('/', { replace: true });
    } catch (e) {
      toast.error(e?.message || 'Sign out failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white/90 backdrop-blur-md shadow-xl p-8 text-center">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Verify your email
        </h1>
        {user ? (
          <p className="text-gray-700 mb-6">
            We sent a verification link to
            <span className="font-semibold"> {user?.email}</span>.
            Please verify your email to continue.
          </p>
        ) : (
          <p className="text-gray-700 mb-6">
            You are not signed in. Please sign in to continue.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleResend}
            disabled={sending}
            className="px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Resend verification email'}
          </button>
          <button
            onClick={handleIHaveVerified}
            disabled={checking}
            className="px-5 py-3 rounded-lg border-2 border-purple-500 text-purple-700 font-semibold disabled:opacity-60"
          >
            {checking ? 'Checking…' : "I've verified"}
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
