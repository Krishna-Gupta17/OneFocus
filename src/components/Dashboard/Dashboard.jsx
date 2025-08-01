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
    gsap.to('.dashboard-card', {
      y: -5,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: 0.5
    });
    
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
      const response = await fetch(`http://localhost:5000/api/users/${user.uid}`);
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
      await fetch(`http://localhost:5000/api/users/${user.uid}`, {
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

      <div className="dashboard-card">
        <AIChat />
      </div>
      
      {/* Completion celebration element */}
      <div className="completion-celebration fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl pointer-events-none opacity-0">
        🎉
      </div>
    </div>
  );
};

export default Dashboard;