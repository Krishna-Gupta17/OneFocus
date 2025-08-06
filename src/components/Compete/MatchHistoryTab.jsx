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
          createdAt: new Date(match.createdAt) // Convert ISO string to Date object
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

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">📚 Past Matches</h3>

      {matches.length === 0 ? (
        <p className="text-white/60">No match history found.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map(match => (
            <li key={match.id} className="bg-white/10 rounded p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  {match.createdAt.toLocaleString()}
                </span>
                <span className="text-yellow-300 font-semibold flex items-center gap-1">
                  <TrophyIcon className="w-5 h-5" />
                  {match.winner}
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
      )}
    </div>
  );
};

export default MatchHistoryTab;