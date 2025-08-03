// src/components/Compete/FriendsTab.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/config'; // your firebase config
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { UserIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const FriendsTab = ({ currentUser }) => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (!currentUser?.uid) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsub = onSnapshot(userRef, async (snap) => {
      const userData = snap.data();
      if (!userData?.friends) return;

      const friendDocs = await Promise.all(
        userData.friends.map(id => getDoc(doc(db, 'users', id)))
      );

      const list = friendDocs
        .filter(d => d.exists())
        .map(d => ({ uid: d.id, ...d.data() }));

      setFriends(list);
    });

    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('to', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, async (snap) => {
      const reqs = await Promise.all(
        snap.docs.map(async docSnap => {
          const fromUser = await getDoc(doc(db, 'users', docSnap.data().from));
          return {
            id: docSnap.id,
            fromId: docSnap.data().from,
            fromName: fromUser.data()?.name || 'Anonymous'
          };
        })
      );
      setRequests(reqs);
    });

    return () => unsub();
  }, [currentUser]);

  const sendRequest = async () => {
    try {
      if (emailInput === currentUser.email) {
        toast.error("You can't add yourself!");
        return;
      }

      const q = query(collection(db, 'users'), where('email', '==', emailInput));
      const snap = await getDocs(q);

      if (snap.empty) return toast.error('User not found');

      const friendDoc = snap.docs[0];
      const friendId = friendDoc.id;

      await addDoc(collection(db, 'friend_requests'), {
        from: currentUser.uid,
        to: friendId,
        status: 'pending'
      });

      toast.success('Request sent!');
      setEmailInput('');
    } catch (err) {
      console.error(err);
      toast.error('Error sending request');
    }
  };

  const acceptRequest = async (id, fromId) => {
    try {
      // Add each other as friends
      const myRef = doc(db, 'users', currentUser.uid);
      const friendRef = doc(db, 'users', fromId);

      await updateDoc(myRef, {
        friends: [...friends.map(f => f.uid), fromId]
      });

      const friendSnap = await getDoc(friendRef);
      const friendFriends = friendSnap.data().friends || [];
      await updateDoc(friendRef, {
        friends: [...friendFriends, currentUser.uid]
      });

      // Remove request
      await deleteDoc(doc(db, 'friend_requests', id));
      toast.success('Friend added!');
    } catch (err) {
      toast.error('Error accepting request');
      console.error(err);
    }
  };

  const rejectRequest = async (id) => {
    await deleteDoc(doc(db, 'friend_requests', id));
    toast('Request rejected');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Add Friend</h3>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter friend’s email"
            className="bg-white/10 px-3 py-2 rounded text-white w-full"
          />
          <button
            onClick={sendRequest}
            className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-2">Incoming Requests</h3>
        {requests.length === 0 && <p className="text-white/60">No requests</p>}
        {requests.map(req => (
          <div key={req.id} className="flex items-center justify-between bg-white/10 px-4 py-2 rounded mb-2">
            <span>{req.fromName}</span>
            <div className="flex gap-2">
              <button onClick={() => acceptRequest(req.id, req.fromId)} className="text-green-500 hover:scale-110 transition">
                <CheckIcon className="w-5 h-5" />
              </button>
              <button onClick={() => rejectRequest(req.id)} className="text-red-500 hover:scale-110 transition">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-2">Your Friends</h3>
        {friends.length === 0 && <p className="text-white/60">No friends yet</p>}
        <ul className="grid md:grid-cols-2 gap-3">
          {friends.map(friend => (
            <li key={friend.uid} className="bg-white/10 p-3 rounded flex items-center gap-3">
              <UserIcon className="w-6 h-6 text-purple-400" />
              <div>
                <p className="font-semibold">{friend.name}</p>
                <p className="text-sm text-white/60">{friend.online ? '🟢 Online' : '⚪ Offline'}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FriendsTab;
