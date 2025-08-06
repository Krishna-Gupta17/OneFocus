              import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PlayIcon,
  StopIcon,
  UserGroupIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import { useParams } from 'react-router-dom';
import FocusTracker from './FocusTracker';

const socket = io(import.meta.env.VITE_SERVER_URL);

const GameTab = ({ currentUser }) => {
  const [roomId, setRoomId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [focusLevel, setFocusLevel] = useState(1);
  const [targetTime, setTargetTime] = useState(1500);
  const [winner, setWinner] = useState(null);

  const timerRef = useRef(null);
  const alreadyDeclaredRef = useRef(false);
  const { roomId: urlRoomId } = useParams();

  useEffect(() => {
    if (urlRoomId && !roomId) setRoomId(urlRoomId);
  }, [urlRoomId]);

  useEffect(() => {
    if (roomId && currentUser?.uid) {
      socket.emit('joinRoom', { roomId, uid: currentUser.uid });
      axios
        .get(`${import.meta.env.VITE_SERVER_URL}/api/games/${roomId}`)
        .then((res) => setParticipants(res.data.participants || []))
        .catch(() => toast.error('Failed to load room'));
    }
  }, [roomId, currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const inviteEvent = `invite-${currentUser.uid}`;

    socket.on('roomUpdate', setParticipants);
    socket.on('onlineUsersUpdate', setOnlineUsers);
    socket.on(inviteEvent, ({ roomId }) => {
      setIncomingInvite(roomId);
      axios.put(`${import.meta.env.VITE_SERVER_URL}/api/users/${currentUser.uid}/clear-invite`);
    });
    socket.on('gameStarted', ({ targetTime }) => {
      setTargetTime(targetTime);
      setIsRunning(true);
      setTimer(0);
      setWinner(null);
      alreadyDeclaredRef.current = false;
    });
    socket.on('winnerAnnounced', ({ winnerUid, winnerName }) => {
      if (winnerUid && winnerName) {
        setWinner({ uid: winnerUid, name: winnerName });
        toast.success(`${winnerUid === currentUser.uid ? 'You' : winnerName} won the game!`);
      } else {
        toast.error('Winner info missing');
      }
      setIsRunning(false);
    });
    socket.on('matchHistory', (history) => {
      console.log('📜 Match History:', history);
    });
    socket.emit('getMatchHistory', { roomId });

    return () => {
      socket.off('roomUpdate');
      socket.off('onlineUsersUpdate');
      socket.off(inviteEvent);
      socket.off('gameStarted');
      socket.off('winnerAnnounced');
      socket.off('matchHistory');
    };
  }, [currentUser?.uid, roomId]);

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/users/${currentUser.uid}`);
      const friendList = res.data.friends || [];
      setFriends(friendList);
      setFilteredFriends(friendList);
    } catch {
      toast.error('Failed to fetch friends');
    }
  };

  useEffect(() => {
    if (currentUser?.uid) fetchFriends();
  }, [currentUser?.uid]);

  useEffect(() => {
    setFilteredFriends(
      friends.filter((f) =>
        f.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, friends]);

  const inviteFriend = (friendId) => {
    socket.emit('inviteFriend', { roomId, friendId });
    toast.success('Friend invited');
  };

  useEffect(() => {
    if (isRunning && focusLevel >= 0.8 && !winner && currentUser?.uid) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          const next = prev + 1;

          socket.emit('progressUpdate', {
            roomId,
            uid: currentUser.uid,
            time: next,
          });

          if (next >= targetTime && !alreadyDeclaredRef.current) {
            alreadyDeclaredRef.current = true;
            socket.emit('declareWinner', {
              roomId,
              winnerUid: currentUser.uid,
              winnerName: currentUser.displayName || currentUser.email,
            });
            setWinner({
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email,
            });
            setIsRunning(false);
            clearInterval(timerRef.current);
          }

          return next;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, focusLevel, winner, targetTime, currentUser?.uid]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">🎮 Study Game</h2>
      <FocusTracker onFocusChange={setFocusLevel} />

      {roomId ? (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <p className="text-gray-600 text-sm">Room ID:</p>
            <p className="text-lg font-semibold text-gray-800">{roomId}</p>
          </div>

          <div>
            <h3 className="text-gray-700 font-semibold mb-2">Participants:</h3>
            <ul className="list-disc list-inside text-sm text-gray-800">
              {participants.map((uid) => (
                <li key={uid}>{uid}</li>
              ))}
            </ul>
          </div>

          {participants.length > 0 && currentUser?.uid === participants[0] && !isRunning && (
            <div className="mb-4">
              <label className="text-sm text-gray-600">Set Target Time (minutes):</label>
              <input
                type="number"
                value={targetTime / 60}
                onChange={(e) => setTargetTime(Number(e.target.value) * 60)}
                className="w-20 p-1 border border-gray-300 rounded ml-2"
              />
              <button
                onClick={() => socket.emit('startGame', { roomId, targetTime })}
                className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Start Game
              </button>
            </div>
          )}

          <div>
            <h3 className="text-gray-700 font-semibold mb-2">Timer:</h3>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-mono text-blue-600">{formatTime(timer)}</span>
              <button
                onClick={() => setIsRunning((prev) => !prev)}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isRunning ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Focus Level: <strong>{focusLevel.toFixed(2)}</strong>
            </p>
            {winner && (
              <div className="mt-2 text-green-600 font-bold">
                🎉 Winner: {winner.uid === currentUser.uid ? 'You!' : winner.name}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-gray-700 font-semibold mb-2">Invite Online Friends:</h3>
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredFriends
                .filter((f) => onlineUsers.includes(f.uid))
                .map((f) => (
                  <button
                    key={f.uid}
                    onClick={() => inviteFriend(f.uid)}
                    className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded-lg transition"
                  >
                    <UserGroupIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-800 text-sm">
                      {f.displayName || f.email}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow hover:bg-blue-700 transition"
          onClick={async () => {
            try {
              const res = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/games/create`,
                { hostUid: currentUser.uid }
              );
              setRoomId(res.data.roomId);
              toast.success('Room created');
            } catch {
              toast.error('Failed to create room');
            }
          }}
        >
          <PlusIcon className="w-5 h-5" /> Create Room
        </button>
      )}

      {/* Invite Modal */}
      {incomingInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center space-y-4 max-w-sm">
            <h3 className="text-lg font-bold">You've been invited!</h3>
            <p className="text-gray-700">
              Join room <strong>{incomingInvite}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setRoomId(incomingInvite);
                  setIncomingInvite(null);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Accept
              </button>
              <button
                onClick={() => setIncomingInvite(null)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTab;