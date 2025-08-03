// src/components/Compete/GameTab.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  arrayUnion,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { PlayIcon, StopIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const GameTab = ({ currentUser }) => {
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [allFriends, setAllFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = async () => {
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    const friendIds = userSnap.data().friends || [];

    const friends = await Promise.all(
      friendIds.map(async (uid) => {
        const fSnap = await getDoc(doc(db, 'users', uid));
        return fSnap.exists() ? { uid, ...fSnap.data() } : null;
      })
    );

    setAllFriends(friends.filter(Boolean));
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const createRoom = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'games'), {
        host: currentUser.uid,
        participants: [currentUser.uid],
        status: 'waiting',
        createdAt: new Date()
      });
      setRoomId(docRef.id);
      toast.success('Room created');
    } catch (err) {
      toast.error('Failed to create room');
      console.error(err);
    }
    setLoading(false);
  };

  const inviteFriend = async (friendId) => {
    const ref = doc(db, 'games', roomId);
    await updateDoc(ref, {
      participants: arrayUnion(friendId)
    });
    toast.success('Friend invited!');
  };

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, 'games', roomId), (snap) => {
      if (snap.exists()) setRoomData(snap.data());
    });
    return () => unsub();
  }, [roomId]);

  const startMatch = async () => {
    if (!roomData) return;

    const roomRef = doc(db, 'games', roomId);
    await updateDoc(roomRef, {
      status: 'in-progress',
      startTime: Date.now()
    });

    toast.success('Match started!');
  };

  const endMatch = async () => {
    const now = Date.now();
    const durations = {};

    roomData.participants.forEach((uid) => {
      const start = roomData.startTime || now;
      const timeSpent = Math.floor((now - start) / 1000);
      durations[uid] = timeSpent;
    });

    const winner = Object.entries(durations).sort((a, b) => b[1] - a[1])[0][0];

    await addDoc(collection(db, 'matches'), {
      participants: roomData.participants,
      durations,
      winner,
      createdAt: new Date()
    });

    await deleteDoc(doc(db, 'games', roomId));
    toast.success('Match ended and saved!');
    setRoomId(null);
    setRoomData(null);
  };

  const getName = (uid) => {
    const friend = allFriends.find(f => f.uid === uid);
    return friend?.name || (uid === currentUser.uid ? 'You' : 'Anonymous');
  };

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
              {roomData?.status.toUpperCase()}
            </span>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Participants:</h4>
            <ul className="text-white/80 text-sm space-y-1">
              {roomData?.participants?.map((uid) => (
                <li key={uid}>• {getName(uid)}</li>
              ))}
            </ul>
          </div>

          {roomData?.status === 'waiting' && (
            <>
              <div>
                <h4 className="font-semibold mb-2">Invite Friends:</h4>
                <div className="flex flex-wrap gap-2">
                  {allFriends.map(friend => (
                    !roomData.participants.includes(friend.uid) && (
                      <button
                        key={friend.uid}
                        onClick={() => inviteFriend(friend.uid)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                      >
                        {friend.name}
                      </button>
                    )
                  ))}
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

          {roomData?.status === 'in-progress' && (
            <button
              onClick={endMatch}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <StopIcon className="w-5 h-5" />
              End Match
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameTab;
