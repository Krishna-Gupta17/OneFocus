import React from 'react';
import { UserGroupIcon, PlayIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/solid';

const Compete = ({ currentUser }) => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <UserGroupIcon className="w-8 h-8 text-purple-400" />
          Study Game with Friends
        </h2>
        <p className="text-white/70">
          Join a lobby, compete to study the longest, and climb the victory leaderboard!
        </p>
      </div>

      {/* Game Lobby */}
      <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <PlayIcon className="w-6 h-6 text-green-400" />
          Game Lobby
        </h3>
        <p className="text-white/70 mb-2">Invite friends and get ready to compete.</p>
        
        <div className="bg-white/5 p-4 rounded-lg text-white space-y-2">
          <p><strong>Room Code:</strong> <span className="text-purple-300">STUDY123</span></p>
          <p><strong>Players Joined:</strong></p>
          <ul className="list-disc list-inside pl-4 text-white/80">
            <li>{currentUser?.name || 'You'}</li>
            <li>Friend A</li>
            <li>Friend B</li>
          </ul>
          <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Start Study Match
          </button>
        </div>
      </div>

      {/* Last Match Result */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrophyIcon className="w-6 h-6 text-yellow-400" />
          Last Game Result
        </h3>
        <ul className="text-white/80 space-y-1">
          <li>🥇 <strong>Friend A</strong> — 1h 45m</li>
          <li>🥈 You — 1h 30m</li>
          <li>🥉 Friend B — 55m</li>
        </ul>
      </div>

      {/* Match History */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ClockIcon className="w-6 h-6 text-sky-400" />
          Match History
        </h3>
        <ul className="text-white/70 text-sm space-y-1">
          <li>🗓️ July 31 — You: 1h 30m | Winner: Friend A</li>
          <li>🗓️ July 29 — You: 2h | Winner: You 🏆</li>
          <li>🗓️ July 27 — You: 1h 10m | Winner: Friend C</li>
        </ul>
      </div>
    </div>
  );
};

export default Compete;
