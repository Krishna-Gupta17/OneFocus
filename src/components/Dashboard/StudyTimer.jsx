import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon, ClockIcon, CogIcon } from '@heroicons/react/24/solid';
import { gsap } from 'gsap';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const StudyTimer = ({ onSessionComplete, focusLevel, onFocusThresholdReached, onTimerStart, onTimerPause }) => {
  const [customTime, setCustomTime] = useState(25);
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('focus');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [userSettings, setUserSettings] = useState({
    focusThreshold: 75,
    timerDuration: 25,
    breakDuration: 5
  });
  const timerRef = useRef(null);
  const floatAnimation = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // Load user settings
    loadUserSettings();
    
    // Sci-fi animation for timer container
    gsap.fromTo(timerRef.current, 
      { scale: 0, opacity: 0, rotationY: 180 },
      { 
        scale: 1, 
        opacity: 1, 
        rotationY: 0,
        duration: 1.2, 
        ease: "back.out(1.7)",
        onComplete: () => {
          // Add controlled floating animation
          floatAnimation.current = gsap.to(timerRef.current, {
            y: -3,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
      }
    );

    return () => {
      if (floatAnimation.current) floatAnimation.current.kill();
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  useEffect(() => {
    // Auto-pause when focus drops below threshold
    if (isActive && focusLevel < userSettings.focusThreshold && sessionType === 'focus') {
      setIsActive(false);
      toast.error(`Timer paused - Focus level below ${userSettings.focusThreshold}%!`);
      onFocusThresholdReached?.();
      onTimerPause?.();
      
      // Sci-fi alert animation
      gsap.to(timerRef.current, {
        boxShadow: '0 0 30px #ef4444, 0 0 60px #ef4444',
        duration: 0.5,
        yoyo: true,
        repeat: 3
      });
    }
  }, [focusLevel, isActive, sessionType, userSettings.focusThreshold]);

  useEffect(() => {
    // Resume when focus comes back above threshold
    if (!isActive && focusLevel >= userSettings.focusThreshold && sessionStartTime && sessionType === 'focus') {
      setTimeout(() => {
        setIsActive(true);
        onTimerStart?.();
        
        // Success animation
        gsap.to(timerRef.current, {
          boxShadow: '0 0 30px #10b981, 0 0 60px #10b981',
          duration: 0.5,
          yoyo: true,
          repeat: 1
        });
      }, 1000);
    }
  }, [focusLevel, isActive, sessionStartTime, sessionType, userSettings.focusThreshold]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${user.uid}`);
      if (response.ok) {
        const userData = await response.json();
        const settings = userData.settings || {};
        setUserSettings({
          focusThreshold: settings.focusThreshold || 75,
          timerDuration: settings.timerDuration || 25,
          breakDuration: settings.breakDuration || 5
        });
        setCustomTime(settings.timerDuration || 25);
        setTime((settings.timerDuration || 25) * 60);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const saveSessionToDatabase = async (sessionData) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${user.uid}/focus-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      
      if (response.ok) {
        toast.success('Session saved successfully!');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
    }
  };

  const handleSessionComplete = () => {
    const duration = sessionType === 'focus' 
      ? userSettings.timerDuration * 60 - time 
      : userSettings.breakDuration * 60 - time;
    
    const sessionData = {
      duration,
      focusPercentage: focusLevel || 85,
      tasksCompleted: 0,
      sessionType,
      timerDuration: sessionType === 'focus' ? userSettings.timerDuration : userSettings.breakDuration,
      pauseCount: pausedTime,
      focusBreaks: Math.floor(pausedTime / 2),
      date: new Date()
    };

    saveSessionToDatabase(sessionData);
    
    if (onSessionComplete) {
      onSessionComplete(sessionData);
    }

    setIsActive(false);
    
    // Completion animation
    gsap.timeline()
      .to(timerRef.current, {
        scale: 1.2,
        boxShadow: '0 0 50px #10b981, 0 0 100px #10b981',
        duration: 0.5
      })
      .to(timerRef.current, {
        scale: 1,
        boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
        duration: 0.5
      });
    
    // Switch session type
    if (sessionType === 'focus') {
      setSessionType('break');
      setTime(userSettings.breakDuration * 60);
      toast.success('Focus session completed! Time for a break.');
    } else {
      setSessionType('focus');
      setTime(userSettings.timerDuration * 60);
      toast.success('Break over! Ready for another focus session.');
    }
  };

  const toggleTimer = () => {
    if (!isActive) {
      // Starting timer
      if (!sessionStartTime) {
        setSessionStartTime(new Date());
      }
      setIsActive(true);
      onTimerStart?.();
      toast.success(`${sessionType === 'focus' ? 'Focus' : 'Break'} session started!`);
      
      // Start animation
      gsap.to(timerRef.current, {
        boxShadow: '0 0 30px #8b5cf6, 0 0 60px #8b5cf6',
        duration: 0.3
      });
    } else {
      // Pausing timer
      setIsActive(false);
      setPausedTime(prev => prev + 1);
      onTimerPause?.();
      toast('Timer paused');
      
      // Pause animation
      gsap.to(timerRef.current, {
        boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
        duration: 0.3
      });
    }
  };

  const resetTimer = () => {
    // Save partial session if there was progress
    if (sessionStartTime && (sessionType === 'focus' ? time < userSettings.timerDuration * 60 : time < userSettings.breakDuration * 60)) {
      const duration = sessionType === 'focus' 
        ? userSettings.timerDuration * 60 - time 
        : userSettings.breakDuration * 60 - time;
      if (duration > 60) {
        const sessionData = {
          duration,
          focusPercentage: focusLevel || 85,
          tasksCompleted: 0,
          sessionType: sessionType + '_partial',
          timerDuration: sessionType === 'focus' ? userSettings.timerDuration : userSettings.breakDuration,
          pauseCount: pausedTime,
          focusBreaks: Math.floor(pausedTime / 2),
          date: new Date()
        };
        saveSessionToDatabase(sessionData);
      }
    }

    setIsActive(false);
    setTime(sessionType === 'focus' ? userSettings.timerDuration * 60 : userSettings.breakDuration * 60);
    setSessionStartTime(null);
    setPausedTime(0);
    onTimerPause?.();
    toast('Timer reset');
    
    // Reset animation
    gsap.timeline()
      .to(timerRef.current, { rotationY: 360, duration: 0.8 })
      .to(timerRef.current, { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)', duration: 0.3 });
  };

  const updateTimerDuration = () => {
    if (!isActive) {
      setTime(customTime * 60);
      setUserSettings(prev => ({ ...prev, timerDuration: customTime }));
      setShowSettings(false); // Close settings after applying
      toast.success(`Timer set to ${customTime} minutes`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = sessionType === 'focus' 
    ? ((userSettings.timerDuration * 60 - time) / (userSettings.timerDuration * 60)) * 100
    : ((userSettings.breakDuration * 60 - time) / (userSettings.breakDuration * 60)) * 100;

  return (
    <div 
      ref={timerRef} 
      className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20 relative overflow-hidden"
      onMouseEnter={() => {
        if (floatAnimation.current) floatAnimation.current.pause();
        gsap.to(timerRef.current, { y: 0, duration: 0.3 });
      }}
      onMouseLeave={() => {
        if (floatAnimation.current) floatAnimation.current.play();
      }}
    >
      {/* Sci-fi background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">
              {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            {focusLevel && (
              <div className={`px-2 py-1 rounded-full text-xs ${
                focusLevel >= userSettings.focusThreshold ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
                Focus: {Math.round(focusLevel)}%
              </div>
            )}
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timer Settings */}
        {showSettings && (
          <div className="mb-4 p-4 bg-black/20 rounded-lg border border-white/10">
            <h4 className="text-white font-semibold mb-3">Timer Settings</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-white/80 text-sm">Duration:</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customTime}
                  onChange={(e) => setCustomTime(parseInt(e.target.value))}
                  className="w-16 p-1 text-center rounded bg-white/10 border border-white/20 text-white"
                  disabled={isActive}
                />
                <span className="text-white/60 text-sm">min</span>
              </div>
              <button
                onClick={updateTimerDuration}
                disabled={isActive}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        <div className="relative w-48 h-48 mx-auto mb-6">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 animate-spin-slow"></div>
          
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={sessionType === 'focus' ? 'url(#focusGradient)' : 'url(#breakGradient)'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-in-out"
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white font-mono">
              {formatTime(time)}
            </span>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={toggleTimer}
            className={`p-4 rounded-full ${
              sessionType === 'focus' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            } text-white transform hover:scale-110 transition-all duration-200 shadow-lg`}
          >
            {isActive ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-4 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white transform hover:scale-110 transition-all duration-200 shadow-lg"
          >
            <StopIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                sessionType === 'focus' 
                  ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {pausedTime > 0 && (
            <div className="text-center">
              <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                Paused {pausedTime} time{pausedTime > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
