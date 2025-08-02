import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import Analytics from './components/Analytics/Analytics';
import Compete from './components/Compete/Compete';
import Settings from './components/Settings/Settings';
import { gsap } from 'gsap';
import { Toaster } from 'react-hot-toast';

function App() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // useEffect(() => {
  //   // Animate background
  //   gsap.to('.bg-gradient', {
  //     backgroundPosition: '400% 0%',
  //     duration: 8,
  //     repeat: -1,
  //     yoyo: true,
  //     ease: "sine.inOut"
  //   });
  // }, []);

  useEffect(() => {
    // Initialize user in database when they first login
    if (user) {
      initializeUser();
    }
  }, [user]);

  const initializeUser = async () => {
    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
        }),
      });
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="bg-gradient min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 bg-[length:400%_400%] flex items-center justify-center p-4">
          <div className="w-full max-w-6xl flex items-center justify-center gap-12">
            {/* Hero Section */}
            <div className="hidden lg:block flex-1 text-white">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ONE FOCUS
              </h1>
              <p className="text-xl mb-8 text-white/80 leading-relaxed">
                Transform your study habits with AI-powered focus tracking, 
                distraction-free learning, and gamified productivity.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>AI-powered focus detection with webcam</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Distraction-free YouTube player with video gallery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Smart study analytics and progress tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Compete with friends and climb leaderboards</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span>AI chatbot for instant study assistance</span>
                </div>
              </div>
            </div>

            {/* Auth Form */}
            {/* <div className="flex-shrink-0">
              {isLogin ? (
                <Login onToggle={() => setIsLogin(false)} />
              ) : (
                <Register onToggle={() => setIsLogin(true)} />
              )}
            </div> */}
            {/* Auth Wrapper */}
<div className="flex-shrink-0 w-full max-w-md p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-xl space-y-6 text-center">
  <div>
    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
      {isLogin ? 'Welcome back' : 'Join OneFocus'}
    </h2>
    <p className="text-white/70 mt-2 text-sm">
      {isLogin ? 'Login to your productivity dashboard' : 'Create your OneFocus account'}
    </p>
  </div>

  {isLogin ? (
    <Login onToggle={() => setIsLogin(false)} />
  ) : (
    <Register onToggle={() => setIsLogin(true)} />
  )}
</div>

          </div>
        </div>
      </>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'analytics':
        return <Analytics />;
      case 'compete':
        return <Compete currentUser={user} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="bg-gradient min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 bg-[length:400%_400%]">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="min-h-[calc(100vh-4rem)]">
          {renderActiveTab()}
        </main>
      </div>
    </>
  );
}

export default App;
