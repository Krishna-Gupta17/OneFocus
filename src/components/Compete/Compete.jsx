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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with title and tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">🎯 Compete Mode</h2>

        <div className="flex flex-wrap gap-2 md:gap-3">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
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

      {/* Tab Content */}
      <div className="bg-white/5 p-4 sm:p-6 rounded-xl text-white shadow-md overflow-x-auto">
        {activeTab === 'Friends' && <FriendsTab currentUser={currentUser} />}
        {activeTab === 'Leaderboard' && <LeaderboardTab currentUser={currentUser} />}
        {activeTab === 'History' && <MatchHistoryTab currentUser={currentUser} />}
        {activeTab === 'Play' && <GameTab currentUser={currentUser} />}
      </div>
    </div>
  );
};

export default Compete;
