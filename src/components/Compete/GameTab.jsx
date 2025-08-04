import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PlayIcon,
  StopIcon,
  UserGroupIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import { Howl } from 'howler';

const GameTab = ({ currentUser, onlineUsers = [] }) => {
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [allFriends, setAllFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [matchEnded, setMatchEnded] = useState(false);
  const [winnerUid, setWinnerUid] = useState(null);

  const pollingIntervalRef = useRef(null);
  const friendRefreshRef = useRef(null);

  const joinSound = new Howl({
    src: ['/sounds/join.mp3'],
    volume: 0.5,
  });

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/compete/api/friends/${currentUser.uid}`);
      const friendsProfiles = res.data || [];
      setAllFriends(friendsProfiles);
      setFilteredFriends(friendsProfiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())));
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const fetchRoomData = async (id) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/compete/api/games/${id}`);
      if (res.data) {
        const prevCount = roomData?.participants?.length || 0;
        const newCount = res.data.participants.length;
        if (newCount > prevCount) joinSound.play();
        setRoomData(res.data);
      }
    } catch (err) {
      console.error('Error fetching room data:', err);
    }
  };

  const createRoom = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/compete/api/rooms`, {
        host: currentUser.uid,
        participants: [currentUser.uid],
        status: 'waiting',
      });
      setRoomId(res.data._id);
      toast.success('Room created');
    } catch (err) {
      toast.error('Failed to create room');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inviteFriend = async (friendId) => {
    try {
      await axios.put(`${import.meta.env.VITE_SERVER_URL}/compete/api/games/${roomId}/invite`, { friendId });
      toast.success('Friend invited!');
      fetchRoomData(roomId);
    } catch (err) {
      toast.error('Invite failed');
      console.error(err);
    }
  };

  const startMatch = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/compete/api/games/${roomId}/start`);
      toast.success('Match started!');
      fetchRoomData(roomId);
    } catch (err) {
      toast.error('Failed to start match');
      console.error(err);
    }
  };

  const endMatch = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/compete/api/games/${roomId}/end`, {
        uid: currentUser.uid,
      });
      toast.success('You ended the match');
      setMatchEnded(true);
      setRoomId(null);
      setRoomData(null);
      clearInterval(pollingIntervalRef.current);
      clearInterval(friendRefreshRef.current);
    } catch (err) {
      toast.error('Failed to end match');
      console.error(err);
    }
  };

  const joinRoom = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_SERVER_URL}/compete/api/games/${roomId}/join`, {
        uid: currentUser.uid,
      });
      toast.success('Joined the room');
      fetchRoomData(roomId);
      setHasJoined(true);
    } catch (err) {
      toast.error('Failed to join');
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearchQuery(val);
    setFilteredFriends(allFriends.filter(f => f.name.toLowerCase().includes(val)));
  };

  const getName = (uid) => {
    if (uid === currentUser.uid) return 'You';
    const user = allFriends.find(f => f.uid === uid);
    return user?.name || 'Anonymous';
  };

  const isOnline = (uid) => onlineUsers.includes(uid);

  const getWinner = () => {
    if (!roomData?.endTimes) return null;
    const latest = Object.entries(roomData.endTimes).sort((a, b) => b[1] - a[1])[0];
    return latest?.[0] || null;
  };

  useEffect(() => {
    if (currentUser?.uid) {
      fetchFriends();
      friendRefreshRef.current = setInterval(fetchFriends, 30000);
    }
    return () => clearInterval(friendRefreshRef.current);
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!roomId) return;
    fetchRoomData(roomId);
    pollingIntervalRef.current = setInterval(() => fetchRoomData(roomId), 2000);
    return () => clearInterval(pollingIntervalRef.current);
  }, [roomId]);

  useEffect(() => {
    if (roomData?.status === 'ended') {
      const winner = getWinner();
      setWinnerUid(winner);
    }
  }, [roomData]);

  const hasJoinedRoom = roomData?.participants?.includes(currentUser.uid);
  const shareLink = `${window.location.origin}/room/${roomId}`;

  return (
    <div className="space-y-6">
      {!roomId ? (
        <button
          onClick={createRoom}
          disabled={loading}
          className="px-5 py-3 bg-purple-600 rounded text-white flex items-center gap-2"
        >
          <UserGroupIcon className="w-5 h-5" />
          {loading ? 'Creating...' : 'Create Study Room'}
        </button>
      ) : (
        <div className="space-y-4 bg-white/10 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white/60">Room ID:</p>
              <p className="text-lg font-semibold text-yellow-300">{roomId}</p>
            </div>
            <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
              {roomData?.status?.toUpperCase()}
            </span>
          </div>

          <div>
            <p className="text-sm text-white/60">Invite via link:</p>
            <input
              value={shareLink}
              readOnly
              className="w-full p-2 bg-black/20 text-white rounded text-sm"
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success('Link copied!');
              }}
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">Participants:</h4>
            <ul className="text-white/80 text-sm space-y-1">
              {roomData?.participants?.map((uid) => (
                <li key={uid}>
                  • {getName(uid)} {isOnline(uid) && <span className="text-green-400">(online)</span>}
                </li>
              ))}
            </ul>
          </div>

          {!hasJoinedRoom && roomData?.status === 'waiting' && (
            <button
              onClick={joinRoom}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4"
            >
              Join Room
            </button>
          )}

          {roomData?.status === 'waiting' && hasJoinedRoom && (
            <>
              <div>
                <h4 className="font-semibold mb-2">Invite Friends:</h4>
                <input
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search by name"
                  className="w-full p-2 mb-3 rounded bg-white/10 text-white placeholder:text-white/60"
                />
                <div className="flex flex-wrap gap-2">
                  {filteredFriends
                    .filter(friend => !roomData.participants.includes(friend.uid))
                    .map(friend => (
                      <div
                        key={friend.uid}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded shadow"
                      >
                        <div className="relative">
                          <img
                            src={friend.avatarUrl || '/default-avatar.png'}
                            alt={friend.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                              isOnline(friend.uid) ? 'bg-green-400' : 'bg-gray-400'
                            }`}
                          />
                        </div>
                        <span>{friend.name}</span>
                        <button
                          onClick={() => inviteFriend(friend.uid)}
                          className="hover:text-green-300 transition"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  {filteredFriends.length === 0 && (
                    <p className="text-white/50 text-sm italic">No friends found.</p>
                  )}
                </div>
              </div>
              <button
                onClick={startMatch}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <PlayIcon className="w-5 h-5" />
                Start Match
              </button>
            </>
          )}

          {roomData?.status === 'in-progress' && hasJoinedRoom && (
            <button
              onClick={endMatch}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <StopIcon className="w-5 h-5" />
              End Match
            </button>
          )}

          {roomData?.status === 'ended' && winnerUid && (
            <div className="mt-4 text-yellow-300 text-lg font-semibold">
              🎉 Winner: {getName(winnerUid)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameTab;
