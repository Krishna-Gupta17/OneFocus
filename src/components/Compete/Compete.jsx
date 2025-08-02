import React, { useEffect, useState } from 'react';
import {
  createRoom,
  joinRoom,
  startSession,
  endSession,
  getHistory
} from '../../services/gameService';
import {
  UserGroupIcon,
  TrophyIcon
} from '@heroicons/react/24/solid';

const Compete = ({ currentUser }) => {
  const [roomId, setRoomId] = useState('');
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState('waiting');
  const [history, setHistory] = useState([]);
  const [winner, setWinner] = useState(null);

  // 🛡 Validate user
  const getSafeUserName = () => {
    if (!currentUser || !currentUser.uid) {
      alert('User not logged in properly!');
      return null;
    }
    return currentUser.name || currentUser.displayName || 'Anonymous';
  };

  useEffect(() => {
    if (!roomId) return;
    const interval = setInterval(async () => {
      try {
        const { players, status, winner } = await getHistory(roomId);
        setPlayers(players);
        setStatus(status);
        setWinner(winner);
      } catch (err) {
        console.error('Error getting history:', err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleCreate = async () => {
    const safeName = getSafeUserName();
    if (!safeName) return;

    try {
      const id = await createRoom(currentUser.uid, safeName);
      setRoomId(id);
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  const handleJoin = async () => {
    const code = prompt('Enter Room Code');
    const safeName = getSafeUserName();
    if (!code || !safeName) return;

    try {
      await joinRoom(code, currentUser.uid, safeName);
      setRoomId(code);
    } catch (err) {
      console.error('Error joining room:', err);
    }
  };

  const handleStart = () => startSession(roomId);
  const handleEnd = () => endSession(roomId);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <UserGroupIcon className="w-8 h-8 text-purple-400" />
          Study Game
        </h2>
        <p className="text-white/70">
          Compete to study the longest. Join or create a room.
        </p>
      </div>

      {!roomId && (
        <div className="flex gap-4">
          <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white rounded">
            Create Room
          </button>
          <button onClick={handleJoin} className="px-4 py-2 bg-blue-600 text-white rounded">
            Join Room
          </button>
        </div>
      )}

      {roomId && (
        <div className="bg-white/10 p-4 rounded-xl text-white">
          <p className="mb-2">Room Code: <strong>{roomId}</strong></p>
          <p className="mb-2">Status: <strong>{status}</strong></p>
          <ul className="mb-4">
            {players.map((p) => (
              <li key={p.id}>{p.name || 'Unnamed'} — {p.totalDuration || 0}s</li>
            ))}
          </ul>

          {status === 'waiting' && (
            <button onClick={handleStart} className="px-4 py-2 bg-green-600 rounded text-white">
              Start Match
            </button>
          )}
          {status === 'in-progress' && (
            <button onClick={handleEnd} className="px-4 py-2 bg-red-600 rounded text-white">
              End Match
            </button>
          )}

          {winner && (
            <div className="mt-4 bg-white/5 p-4 rounded">
              <TrophyIcon className="w-6 h-6 inline-block text-yellow-400 mr-2" />
              Winner: <strong>{winner.name || 'Unnamed'}</strong> — {winner.totalDuration}s
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Compete;
