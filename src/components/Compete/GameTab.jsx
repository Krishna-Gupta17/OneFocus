import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlayIcon, StopIcon, UserGroupIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useParams } from 'react-router-dom';
import FocusTracker from './FocusTracker';
import { gsap } from 'gsap';
import RealTimeChart from './RealTimeChart';

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
  const containerRef = useRef(null);

  // GSAP animation for UI
  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
    );
  }, []);

  // Get roomId from URL params
  useEffect(() => {
    if (urlRoomId && !roomId) setRoomId(urlRoomId);
  }, [urlRoomId]);

  // Join room & fetch participants
  useEffect(() => {
    if (roomId && currentUser?.uid) {
      socket.emit('joinRoom', { roomId, uid: currentUser.uid });
      axios
        .get(`${import.meta.env.VITE_SERVER_URL}/api/games/${roomId}`)
        .then((res) => setParticipants(res.data.participants || []))
        .catch(() => toast.error('Failed to load room'));
    }
  }, [roomId, currentUser?.uid]);

  // Socket event handling with cleanup
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

  // Fetch friends list
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

  // Filter friends on search
  useEffect(() => {
    setFilteredFriends(
      friends.filter((f) =>
        f.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, friends]);

  // Invite friend (use correct backend event)
  const inviteFriend = (friendId) => {
    socket.emit('inviteFriend', { roomId, friendId });
    toast.success('Friend invited');
  };

  // Timer and progress update
  useEffect(() => {
    if (isRunning && focusLevel >= 0.8 && !winner && currentUser?.uid) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          const next = prev + 1;
          socket.emit('progressUpdate', { roomId, uid: currentUser.uid, time: next });
          if (next >= targetTime && !alreadyDeclaredRef.current) {
            alreadyDeclaredRef.current = true;
            socket.emit('declareWinner', {
              roomId,
              winnerUid: currentUser.uid,
              winnerName: currentUser.displayName || currentUser.email,
            });
            setWinner({ uid: currentUser.uid, name: currentUser.displayName || currentUser.email });
            setIsRunning(false);
            clearInterval(timerRef.current);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, focusLevel, winner, targetTime, currentUser?.uid]);

  // Time formatting
  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div ref={containerRef} className="min-h-screen text-gray-200 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">⚔️ Compete With Friends</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="bg-indigo-950 rounded-xl p-4 sm:p-6 space-y-6">
            <div className="space-y-4 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-cyan-300 mb-4">🎯 Study Game Room</h2>
              <p className="text-indigo-300 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
                Step into a focus-powered challenge with your friends! 🎮 
                <br /><br />
                ⏱️ The goal: Stay concentrated for the full session duration.
                <br />
                🧠 Our AI Focus Tracker ensures fair play by monitoring your presence.
                <br /><br />
                💡 Outlast your peers, maintain your focus, and claim victory!
              </p>
            </div>

            {roomId ? (
              <>
                <div>
                  <div className="text-sm text-indigo-300">Room ID:</div>
                  <div className="text-xl sm:text-2xl font-semibold text-yellow-300 break-all">{roomId}</div>
                </div>

                <div>
                  <div className="text-lg text-cyan-300 font-semibold mb-2">Participants</div>
                  <ul className="list-disc list-inside text-gray-100 space-y-1">
                    {participants.map((uid) => <li key={uid}>{uid}</li>)}
                  </ul>
                </div>

                {participants[0] === currentUser?.uid && !isRunning && (
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-indigo-200">Target time (min):</label>
                    <input
                      type="number"
                      value={targetTime / 60}
                      onChange={(e) => setTargetTime(Number(e.target.value) * 60)}
                      className="w-20 p-1 rounded border border-indigo-400 text-black"
                    />
                    <button
                      onClick={() => socket.emit('startGame', { roomId, targetTime })}
                      className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-medium"
                    >
                      Start Game
                    </button>
                  </div>
                )}

                <div>
                  <div className="text-lg text-cyan-300 font-semibold mb-1">Timer</div>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-2xl sm:text-3xl font-mono text-yellow-400">{formatTime(timer)}</span>
                    <button
                      onClick={() => setIsRunning((prev) => !prev)}
                      className={`p-3 rounded-full transition ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {isRunning ? <StopIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                    </button>
                  </div>
                  <div className="text-sm text-indigo-200 mt-1">Focus Level: <strong>{focusLevel.toFixed(2)}</strong></div>
                  {winner && (
                    <div className="mt-3 text-green-300 font-bold text-lg">
                      🎉 Winner: {winner.uid === currentUser.uid ? 'You!' : winner.name}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-lg text-cyan-300 font-semibold mb-2">Invite Online Friends</div>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 rounded border border-indigo-400 bg-indigo-900 text-gray-200 mb-3"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredFriends.filter(f => onlineUsers.includes(f.uid)).map(f => (
                      <button
                        key={f.uid}
                        onClick={() => inviteFriend(f.uid)}
                        className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition"
                      >
                        <UserGroupIcon className="w-5 h-5" />
                        <span>{f.displayName || f.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={async () => {
                  try {
                    const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/games/create`, { hostUid: currentUser.uid });
                    setRoomId(res.data.roomId);
                    toast.success('Room created');
                  } catch {
                    toast.error('Failed to create room');
                  }
                }}
                className="mx-auto flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-lg px-6 py-3 rounded-full shadow-lg"
              >
                <PlusIcon className="w-6 h-6" /> Create Room
              </button>
            )}
          </div>

          {/* Right Panel */}
          <div className="bg-indigo-950 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-cyan-300 mb-4">🧠 AI Focus Tracker</h3>
            <FocusTracker onFocusChange={setFocusLevel} />
          </div>

          <div className="bg-indigo-950 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-cyan-300 mb-4">🧠 AI Focus Tracker</h3>
            <RealTimeChart/>
          </div>

        </div>

        {/* Invitation Modal */}
        {incomingInvite && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-indigo-900 text-gray-200 p-6 rounded-xl shadow-2xl w-80 text-center space-y-4">
              <h3 className="text-2xl font-bold">Invitation Received</h3>
              <p className="text-lg">Join room <span className="font-semibold text-yellow-300">{incomingInvite}</span>?</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => { setRoomId(incomingInvite); setIncomingInvite(null); }}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white"
                >
                  Accept
                </button>
                <button
                  onClick={() => setIncomingInvite(null)}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameTab;
