import React, { useState, useEffect } from 'react';
import StudyTimer from './StudyTimer';
import TodoList from './TodoList';
import YouTubePlayer from './YouTubePlayer';
import FocusTracker from './FocusTracker';
import MusicPlayer from './MusicPlayer';
import Leaderboard from './Leaderboard';
import AIChat from './AIchat';
import { gsap } from 'gsap';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [focusLevel, setFocusLevel] = useState(85);
  const [autoStartFocusTracker, setAutoStartFocusTracker] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [studyStats, setStudyStats] = useState({
    totalStudyTime: 0,
    sessionsCompleted: 0,
    points: 0
  });

  useEffect(() => {
    // Animate dashboard load
    gsap.fromTo('.dashboard-card', 
      { y: 100, opacity: 0, rotationX: -15 },
      { y: 0, opacity: 1, rotationX: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.7)" }
    );
    
    // Floating animation for cards
    // gsap.to('.dashboard-card', {
    //   y: -5,
    //   duration: 3,
    //   yoyo: true,
    //   repeat: -1,
    //   ease: 'sine.inOut',
    //   stagger: 0.5
    // });
    
    // Particle effect animation
    gsap.to('.particle', {
      y: -20,
      x: 'random(-10, 10)',
      opacity: 0,
      duration: 2,
      repeat: -1,
      stagger: 0.2,
      ease: 'power2.out'
    });
    
    // Load user data
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${user.uid}`);
      if (response.ok) {
        const userData = await response.json();
        setTasks(userData.tasks || []);
        setStudyStats(userData.studyStats || { totalStudyTime: 0, sessionsCompleted: 0, points: 0 });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSessionComplete = (sessionData) => {
    // Animate completion
    gsap.to('.completion-celebration', {
      scale: 1.2,
      rotation: 360,
      duration: 0.5,
      ease: 'back.out(1.7)'
    });
    
    setStudyStats(prev => ({
      totalStudyTime: prev.totalStudyTime + sessionData.duration,
      sessionsCompleted: prev.sessionsCompleted + 1,
      points: prev.points + Math.floor(sessionData.duration / 60) * 10
    }));
  };

  const handleFocusChange = (newFocusLevel) => {
    setFocusLevel(newFocusLevel);
  };

  const handleFocusThresholdReached = () => {
    // This is called when focus drops below threshold and timer is paused
    console.log('Focus threshold reached, timer paused');
    
    // Shake animation for low focus
    gsap.to('.focus-warning', {
      x: -10,
      duration: 0.1,
      yoyo: true,
      repeat: 5,
      ease: 'power2.inOut'
    });
  };

  const updateTasks = async (newTasks) => {
    setTasks(newTasks);
    
    if (!user) return;
    
    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: newTasks }),
      });
    } catch (error) {
      console.error('Error updating tasks:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-2 h-2 bg-purple-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Welcome back, {user?.email?.split('@')[0] || 'Student'}! 🚀
        </h2>
        <p className="text-white/70 text-lg">
          Ready to conquer your study goals today? Let's make every minute count!
        </p>
        
        {/* Quick Stats */}
        <div className="flex gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Study Time: {Math.floor(studyStats.totalStudyTime / 3600)}h {Math.floor((studyStats.totalStudyTime % 3600) / 60)}m</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Sessions: {studyStats.sessionsCompleted}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Points: {studyStats.points}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors focus-warning">
            <div className={`w-2 h-2 rounded-full ${focusLevel >= 75 ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span>Focus: {Math.round(focusLevel)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="dashboard-card lg:col-span-2">
          <StudyTimer 
            onSessionComplete={handleSessionComplete} 
            focusLevel={focusLevel}
            onFocusThresholdReached={handleFocusThresholdReached}
          />
        </div>
        <div className="dashboard-card">
          <FocusTracker 
            onFocusChange={handleFocusChange} 
            autoStart={autoStartFocusTracker}
            onAutoStartComplete={() => setAutoStartFocusTracker(false)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="dashboard-card">
          <TodoList tasks={tasks} onUpdateTasks={updateTasks} />
        </div>
        <div className="dashboard-card">
          <MusicPlayer />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="dashboard-card">
          <YouTubePlayer />
        </div>
        <div className="dashboard-card">
          <Leaderboard currentUser={user} showFriendsOnly={false} />
        </div>
      </div>

      
      
      {/* Completion celebration element */}

    {/* Footer */}
<footer className="mt-16 pt-10 border-t border-white/10 relative z-10 text-white/70 text-sm">
  <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4 px-4">
    {/* Brand Info */}
    <div>
      <p className="text-white font-semibold text-lg">StudySync © {new Date().getFullYear()}</p>
      <p className="text-white/60">Built to boost your productivity and focus ✨</p>
    </div>

    {/* Social Icons */}
    <div className="flex items-center gap-6 mt-2">
      {/* Instagram */}
      <a
        href="https://instagram.com/your_handle"
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-6 h-6 text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-tr group-hover:from-pink-500 group-hover:via-red-400 group-hover:to-yellow-400"
        >
          <path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5A4.25 4.25 0 0 1 16.25 20.5h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm5.75-.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href="https://linkedin.com/in/your_handle"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-400 transition-colors duration-200"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.7 2.2 5 5 5h14c2.7 0 5-2.3 5-5v-14c0-2.8-2.3-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.3c-1 0-1.8-.8-1.8-1.7s.8-1.7 1.8-1.7 1.7.8 1.7 1.7-.8 1.7-1.7 1.7zm13.5 10.3h-3v-4.7c0-1.1-.4-1.9-1.4-1.9s-1.6.9-1.6 1.9v4.7h-3v-9h2.8v1.2h.1c.4-.8 1.3-1.4 2.5-1.4 2 0 3.6 1.3 3.6 4.1v5.1z"/>
        </svg>
      </a>

      {/* Feedback */}
      <a
        href="mailto:feedback@studysync.app"
        className="hover:text-yellow-400 transition-colors duration-200"
      >
        Feedback
      </a>
    </div>
  </div>
</footer>


    </div>
  );
};

export default Dashboard;
