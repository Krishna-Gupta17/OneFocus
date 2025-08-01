import React, { useState, useEffect, useRef } from 'react';
import { TrophyIcon, FireIcon, ClockIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { gsap } from 'gsap';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Leaderboard = ({ currentUser, showFriendsOnly = false }) => {
  const [users, setUsers] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const leaderboardRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    loadLeaderboard();
    if (user) {
      loadFriendRequests();
    }
  }, [showFriendsOnly, user]);

  useEffect(() => {
    // Animate leaderboard entries
    gsap.fromTo(
      '.leaderboard-item',
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  }, [users]);

  const loadLeaderboard = async () => {
    if (!user) return;
    
    try {
      const endpoint = showFriendsOnly 
        ? `http://localhost:5000/api/users/${user.uid}/friends-leaderboard`
        : 'http://localhost:5000/api/leaderboard';
        
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      // Fallback to demo data
      setUsers([
        { displayName: 'Alex Chen', points: 2450, totalStudyTime: 15600, uid: '1' },
        { displayName: 'Sarah Johnson', points: 2380, totalStudyTime: 14800, uid: '2' },
        { displayName: 'You', points: 1950, totalStudyTime: 11400, uid: user?.uid }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.uid}`);
      if (response.ok) {
        const userData = await response.json();
        setFriendRequests(userData.friendRequests || []);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!friendEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.uid}/send-friend-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetEmail: friendEmail }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Friend request sent!');
        setFriendEmail('');
      } else {
        toast.error(data.message || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (fromUid) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.uid}/accept-friend-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromUid }),
      });

      if (response.ok) {
        toast.success('Friend request accepted!');
        loadFriendRequests();
        loadLeaderboard();
      } else {
        toast.error('Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <TrophyIcon className="w-6 h-6 text-yellow-400" />;
      case 1: return <TrophyIcon className="w-6 h-6 text-gray-400" />;
      case 2: return <TrophyIcon className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-white font-bold">{index + 1}</span>;
    }
  };

  const getRankGradient = (index) => {
    switch (index) {
      case 0: return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 1: return 'from-gray-400/20 to-gray-600/20 border-gray-400/30';
      case 2: return 'from-amber-600/20 to-yellow-700/20 border-amber-600/30';
      default: return 'from-purple-500/10 to-blue-500/10 border-purple-500/20';
    }
  };

  const isCurrentUser = (userItem) => {
    return userItem.uid === user?.uid || userItem.displayName === 'You';
  };

  if (loading) {
    return (
      <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={leaderboardRef} className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
      <div className="flex items-center gap-2 mb-6">
        <TrophyIcon className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-white">
          {showFriendsOnly ? 'Friends Leaderboard' : 'Global Leaderboard'}
        </h3>
        <FireIcon className="w-5 h-5 text-orange-400 animate-pulse" />
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Friend Requests</h4>
          {friendRequests.map((request, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-white text-sm">{request.fromName}</span>
              <button
                onClick={() => acceptFriendRequest(request.from)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Friend */}
      {showFriendsOnly && (
        <div className="mb-4 flex gap-2">
          <input
            type="email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            placeholder="Friend's email address"
            className="flex-1 p-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && sendFriendRequest()}
          />
          <button
            onClick={sendFriendRequest}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg flex items-center gap-1 transition-colors"
          >
            <UserPlusIcon className="w-4 h-4" />
            Add
          </button>
        </div>
      )}

      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-white/60 text-center py-8">
            {showFriendsOnly ? 'No friends yet. Add some friends to compete!' : 'No users found.'}
          </p>
        ) : (
          users.map((userItem, index) => (
            <div
              key={userItem.uid || index}
              className={`leaderboard-item flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r ${getRankGradient(index)} border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                isCurrentUser(userItem) ? ' ring-2 ring-purple-500/50' : ''
              }`}
            >
              <div className="flex-shrink-0">
                {getRankIcon(index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold truncate ${
                    isCurrentUser(userItem) ? 'text-purple-300' : 'text-white'
                  }`}>
                    {userItem.displayName || userItem.email?.split('@')[0] || 'Anonymous'}
                    {isCurrentUser(userItem) && <span className="text-xs text-purple-400 ml-1">(You)</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <FireIcon className="w-4 h-4 text-orange-400" />
                    <span>{userItem.studyStats?.points || userItem.points || 0} pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4 text-blue-400" />
                    <span>{formatTime(userItem.studyStats?.totalStudyTime || userItem.totalStudyTime || 0)}</span>
                  </div>
                </div>
              </div>
              
              {index < 3 && (
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                    index === 1 ? 'bg-gray-400/20 text-gray-300' :
                    'bg-amber-600/20 text-amber-300'
                  }`}>
                    {index + 1}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-white/60 text-sm">
          {showFriendsOnly 
            ? 'Compete with friends and climb the leaderboard!'
            : 'Complete study sessions to earn points and climb the global leaderboard!'
          }
        </p>
        <div className="mt-2 flex justify-center gap-4 text-xs text-white/40">
          <span>• 10 pts per minute studied</span>
          <span>• Bonus for high focus score</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;