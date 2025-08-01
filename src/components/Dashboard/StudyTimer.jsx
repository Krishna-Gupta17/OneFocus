import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon, ClockIcon } from '@heroicons/react/24/solid';
import { gsap } from 'gsap';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const StudyTimer = ({ onSessionComplete, focusLevel, onFocusThresholdReached }) => {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [shouldStartFocusTracker, setShouldStartFocusTracker] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // 'focus' or 'break'
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const timerRef = useRef(null);
  const { user } = useAuth();

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
    if (isActive && focusLevel < 75 && sessionType === 'focus') {
      setIsActive(false);
      toast.error('Timer paused - Focus level too low!');
      onFocusThresholdReached?.();
    }
  }, [focusLevel, isActive, sessionType]);

  useEffect(() => {
    gsap.fromTo(timerRef.current, 
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
    );
  }, []);

  const saveSessionToDatabase = async (sessionData) => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.uid}/focus-session`, {
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
    const duration = sessionType === 'focus' ? 25 * 60 - time : 5 * 60 - time;
    
    const sessionData = {
      duration,
      focusPercentage: focusLevel || 85,
      tasksCompleted: 0,
      sessionType,
      date: new Date()
    };

    saveSessionToDatabase(sessionData);
    
    if (onSessionComplete) {
      onSessionComplete(sessionData);
    }

    setIsActive(false);
    
    // Switch session type
    if (sessionType === 'focus') {
      setSessionType('break');
      setTime(5 * 60);
      toast.success('Focus session completed! Time for a break.');
    } else {
      setSessionType('focus');
      setTime(25 * 60);
      toast.success('Break over! Ready for another focus session.');
    }

    gsap.to(timerRef.current, {
      scale: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 3
    });
  };

  const toggleTimer = () => {
    if (!isActive) {
      // Starting timer
      if (!sessionStartTime) {
        setSessionStartTime(new Date());
      }
      setIsActive(true);
      setShouldStartFocusTracker(true);
      toast.success(`${sessionType === 'focus' ? 'Focus' : 'Break'} session started!`);
    } else {
      // Pausing timer
      setIsActive(false);
      setPausedTime(prev => prev + 1);
      toast('Timer paused');
    }
    
    gsap.to(timerRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
  };

  const resetTimer = () => {
    // Save partial session if there was progress
    if (sessionStartTime && (sessionType === 'focus' ? time < 25 * 60 : time < 5 * 60)) {
      const duration = sessionType === 'focus' ? 25 * 60 - time : 5 * 60 - time;
      if (duration > 60) { // Only save if more than 1 minute
        const sessionData = {
          duration,
          focusPercentage: focusLevel || 85,
          tasksCompleted: 0,
          sessionType: sessionType + '_partial',
          date: new Date()
        };
        saveSessionToDatabase(sessionData);
      }
    }

    setIsActive(false);
    setTime(sessionType === 'focus' ? 25 * 60 : 5 * 60);
    setSessionStartTime(null);
    setPausedTime(0);
    setShouldStartFocusTracker(false);
    toast('Timer reset');
    
    gsap.fromTo(timerRef.current,
      { rotationY: 0 },
      { rotationY: 360, duration: 0.6, ease: "power2.out" }
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = sessionType === 'focus' 
    ? ((25 * 60 - time) / (25 * 60)) * 100
    : ((5 * 60 - time) / (5 * 60)) * 100;

  return (
    <div ref={timerRef} className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <ClockIcon className="w-6 h-6 text-purple-400 mr-2" />
          <h3 className="text-xl font-bold text-white">
            {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
          </h3>
          {focusLevel && (
            <div className={`ml-4 px-2 py-1 rounded-full text-xs ${
              focusLevel >= 75 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              Focus: {Math.round(focusLevel)}%
            </div>
          )}
        </div>

        <div className="relative w-48 h-48 mx-auto mb-6">
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
              stroke={sessionType === 'focus' ? '#8b5cf6' : '#10b981'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {formatTime(time)}
            </span>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleTimer}
            className={`p-3 rounded-full ${
              sessionType === 'focus' 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white transform hover:scale-110 transition-all duration-200`}
          >
            {isActive ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transform hover:scale-110 transition-all duration-200"
          >
            <StopIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                sessionType === 'focus' ? 'bg-purple-500' : 'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {pausedTime > 0 && (
          <div className="mt-2 text-xs text-white/60">
            Paused {pausedTime} time{pausedTime > 1 ? 's' : ''}
          </div>
        )}
        
        {/* Pass auto-start signal to parent */}
        {shouldStartFocusTracker && (
          <div className="hidden" data-focus-auto-start="true"></div>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;