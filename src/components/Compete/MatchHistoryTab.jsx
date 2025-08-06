import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClockIcon, TrophyIcon } from '@heroicons/react/24/solid';

const MatchHistoryTab = ({ currentUser }) => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser?.uid) return;

      try {
        const baseUrl = import.meta.env.VITE_SERVER_URL;
        const endpoint = `${baseUrl}/api/users/${currentUser.uid}/match-history`;
        const response = await axios.get(endpoint);

        const matchList = response.data.map(match => ({
          ...match,
          timestamp: new Date(match.timestamp || match.createdAt),
        }));

        setMatches(matchList);
      } catch (error) {
        console.error("Failed to fetch match history:", error);
      }
    };

    fetchMatches();
  }, [currentUser]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const userWins = matches.filter(m => m.winnerUid === currentUser.uid);
  const userLosses = matches.filter(m => m.winnerUid !== currentUser.uid);

  return (
    <div>
      

      {matches.length === 0 ? (
        <p className="text-white/60">No match history found.</p>
      ) : (
        <>
          <h3 className="text-xl text-green-400 mb-2">🥇 Your Wins</h3>
          <ul className="space-y-4 mb-6">
            {userWins.map((match, index) => (
              <li key={`win-${index}`} className="bg-green-500/10 rounded p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    {match.timestamp.toLocaleString()}
                  </span>
                  <span className="text-yellow-300 font-semibold flex items-center gap-1">
                    <TrophyIcon className="w-5 h-5" />
                    {match.winnerName || match.winnerUid}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {match.players.map(p => (
                    <div key={p.uid} className="flex justify-between text-sm">
                      <span>{p.name}</span>
                      <span>{formatTime(p.time)}</span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <h4 className="text-xl text-red-400 mb-2">🥈 Other Matches</h4>
          <ul className="space-y-4">
            {userLosses.map((match, index) => (
              <li key={`loss-${index}`} className="bg-white/10 rounded p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    {match.timestamp.toLocaleString()}
                  </span>
                  <span className="text-yellow-300 font-semibold flex items-center gap-1">
                    <TrophyIcon className="w-5 h-5" />
                    {match.winnerName || match.winnerUid}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {match.players.map(p => (
                    <div key={p.uid} className="flex justify-between text-sm">
                      <span>{p.name}</span>
                      <span>{formatTime(p.time)}</span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default MatchHistoryTab;