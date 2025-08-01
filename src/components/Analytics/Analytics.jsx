import React, { useEffect, useRef, useState } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  FireIcon, 
  TrophyIcon,
  EyeIcon,
  CheckCircleIcon,
  UsersIcon
} from '@heroicons/react/24/solid';
import { gsap } from 'gsap';
import { useAuth } from '../../hooks/useAuth';

const Analytics = () => {
  const analyticsRef = useRef(null);
  const [globalStats, setGlobalStats] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    gsap.fromTo('.analytics-card',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
    
    loadAnalyticsData();
  }, [user]);

  const loadAnalyticsData = async () => {
    if (!user) return;
    
    try {
      // Load global leaderboard for analytics
      const globalResponse = await fetch('http://localhost:5000/api/leaderboard');
      if (globalResponse.ok) {
        const globalData = await globalResponse.json();
        setGlobalStats(globalData);
      }
      
      // Load user's personal stats
      const userResponse = await fetch(`http://localhost:5000/api/users/${user.uid}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserStats(userData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to demo data
      setGlobalStats([
        { displayName: 'Alex Chen', studyStats: { totalStudyTime: 15600, points: 2450, sessionsCompleted: 45 }},
        { displayName: 'Sarah Johnson', studyStats: { totalStudyTime: 14800, points: 2380, sessionsCompleted: 42 }},
        { displayName: 'You', studyStats: { totalStudyTime: 11400, points: 1950, sessionsCompleted: 38 }}
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getUserRank = () => {
    if (!userStats || !globalStats.length) return 'N/A';
    const userIndex = globalStats.findIndex(u => u.uid === user.uid);
    return userIndex >= 0 ? userIndex + 1 : globalStats.length + 1;
  };

  const getPersonalStats = () => {
    if (!userStats) return {
      totalStudyTime: 0,
      sessionsCompleted: 0,
      points: 0,
      focusAverage: 85
    };
    
    const focusAverage = userStats.focusSessions?.length > 0 
      ? userStats.focusSessions.reduce((acc, session) => acc + (session.focusPercentage || 85), 0) / userStats.focusSessions.length
      : 85;
    
    return {
      totalStudyTime: userStats.studyStats?.totalStudyTime || 0,
      sessionsCompleted: userStats.studyStats?.sessionsCompleted || 0,
      points: userStats.studyStats?.points || 0,
      focusAverage: Math.round(focusAverage)
    };
  };

  const personalStats = getPersonalStats();
  const userRank = getUserRank();

  const stats = [
    { 
      label: 'Total Study Time', 
      value: formatTime(personalStats.totalStudyTime), 
      icon: ClockIcon, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20' 
    },
    { 
      label: 'Global Rank', 
      value: `#${userRank}`, 
      icon: TrophyIcon, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/20' 
    },
    { 
      label: 'Average Focus', 
      value: `${personalStats.focusAverage}%`, 
      icon: EyeIcon, 
      color: 'text-green-400', 
      bg: 'bg-green-500/20' 
    },
    { 
      label: 'Sessions Completed', 
      value: personalStats.sessionsCompleted.toString(), 
      icon: CheckCircleIcon, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/20' 
    },
  ];

  const getRecentSessions = () => {
    if (!userStats?.focusSessions) return [];
    return userStats.focusSessions
      .slice(-7)
      .reverse()
      .map((session, index) => ({
        day: new Date(session.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: session.duration / 3600,
        focus: session.focusPercentage || 85,
        type: session.sessionType || 'focus'
      }));
  };

  const recentSessions = getRecentSessions();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white/10 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={analyticsRef} className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ChartBarIcon className="w-8 h-8 text-purple-400" />
          Study Analytics
        </h2>
        <p className="text-white/70">
          Track your progress and see how you compare with other students worldwide.
        </p>
      </div>

      {/* Personal Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="analytics-card backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <FireIcon className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-white/60 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Study Sessions */}
        <div className="analytics-card backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Recent Study Sessions</h3>
          {recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-white/80 w-8 text-sm">{session.day}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-3 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((session.hours / 4) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-white/60 text-sm w-12 text-right">
                    {session.hours.toFixed(1)}h
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">No recent sessions found. Start studying to see your progress!</p>
          )}
        </div>

        {/* Focus Performance */}
        <div className="analytics-card backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Focus Performance</h3>
          {recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-white/80 w-8 text-sm">{session.day}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-3 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${session.focus}%` }}
                    ></div>
                  </div>
                  <span className="text-white/60 text-sm w-12 text-right">{session.focus}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">No focus data available yet.</p>
          )}
        </div>
      </div>

      {/* Global Study Time Leaderboard */}
      <div className="analytics-card backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
        <div className="flex items-center gap-2 mb-6">
          <UsersIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Global Study Time Rankings</h3>
        </div>
        <div className="space-y-4">
          {globalStats.slice(0, 10).map((user, index) => (
            <div 
              key={user.uid || index} 
              className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                user.uid === userStats?.uid ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                  index === 1 ? 'bg-gray-400/20 text-gray-300' :
                  index === 2 ? 'bg-amber-600/20 text-amber-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    user.uid === userStats?.uid ? 'text-purple-300' : 'text-white'
                  }`}>
                    {user.displayName || user.email?.split('@')[0] || 'Anonymous'}
                    {user.uid === userStats?.uid && <span className="text-xs text-purple-400 ml-1">(You)</span>}
                  </h4>
                  <p className="text-white/60 text-sm">
                    {user.studyStats?.sessionsCompleted || 0} sessions completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">
                  {formatTime(user.studyStats?.totalStudyTime || 0)}
                </p>
                <p className="text-white/60 text-sm">
                  {user.studyStats?.points || 0} points
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;