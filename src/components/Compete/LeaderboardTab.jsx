// src/components/Compete/LeaderboardTab.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const LeaderboardTab = ({ currentUser }) => {
  const [rankedFriends, setRankedFriends] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!currentUser?.uid) return;

      const myDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const friendIds = myDoc.data()?.friends || [];

      const friendsData = await Promise.all(
        friendIds.map(async (uid) => {
          const userSnap = await getDoc(doc(db, 'users', uid));
          if (!userSnap.exists()) return null;
          return { uid, ...userSnap.data() };
        })
      );

      const sorted = friendsData
        .filter(Boolean)
        .sort((a, b) => (b.totalStudyTime || 0) - (a.totalStudyTime || 0));

      setRankedFriends(sorted);
    };

    fetchLeaderboard();
  }, [currentUser]);

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">🏆 Friend Leaderboard</h3>

      {rankedFriends.length === 0 && (
        <p className="text-white/60">Add some friends to see their rankings.</p>
      )}

      <ul className="divide-y divide-white/10">
        {rankedFriends.map((friend, index) => (
          <li
            key={friend.uid}
            className={`flex items-center gap-4 py-3 ${
              index === 0
                ? 'bg-yellow-500/10 rounded-lg px-3'
                : index === 1
                ? 'bg-gray-300/10 rounded-lg px-3'
                : index === 2
                ? 'bg-orange-300/10 rounded-lg px-3'
                : ''
            }`}
          >
            {friend.avatarUrl ? (
              <img
                src={friend.avatarUrl}
                alt={friend.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <UserCircleIcon className="w-10 h-10 text-purple-400" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{friend.name}</p>
              <p className="text-sm text-white/60">
                {friend.online ? '🟢 Online' : '⚪ Offline'}
              </p>
            </div>
            <div className="text-right text-white font-semibold">
              {formatTime(friend.totalStudyTime)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaderboardTab;
