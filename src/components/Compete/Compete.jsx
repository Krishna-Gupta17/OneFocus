// src/components/Compete/Compete.jsx
import React, { useState } from 'react';
import FriendsTab from './FriendsTab';
import LeaderboardTab from './LeaderboardTab';
import MatchHistoryTab from './MatchHistoryTab';
import GameTab from './GameTab';

const tabs = ['Play', 'Friends', 'Leaderboard', 'History'];

const Compete = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('Play');

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">🎯 Compete Mode</h2>
        <div className="flex space-x-3">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-xl text-white shadow">
        {activeTab === 'Friends' && <FriendsTab currentUser={currentUser} />}
        {activeTab === 'Leaderboard' && <LeaderboardTab currentUser={currentUser} />}
        {activeTab === 'History' && <MatchHistoryTab currentUser={currentUser} />}
        {activeTab === 'Play' && <GameTab currentUser={currentUser} />}
      </div>
    </div>
  );
};

export default Compete;
