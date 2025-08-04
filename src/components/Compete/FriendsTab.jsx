import React, { useEffect, useState } from 'react';
import { UserIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const FriendsTab = ({ currentUser }) => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [emailInput, setEmailInput] = useState('');

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${currentUser.uid}`);
      const data = await res.json();
      setFriends(data.friends || []);
      setRequests(data.friendRequests || []);
    } catch (err) {
      console.error('Failed to fetch user data', err);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      fetchUserData();
    }
  }, [currentUser]);

  const sendRequest = async () => {
    try {
      if (emailInput === currentUser.email) {
        toast.error("You can't add yourself!");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${currentUser.uid}/send-friend-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: emailInput })
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message || 'Error sending request');
      toast.success(data.message || 'Request sent!');
      setEmailInput('');
    } catch (err) {
      console.error(err);
      toast.error('Error sending request');
    }
  };

  const acceptRequest = async (fromUid) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${currentUser.uid}/accept-friend-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUid })
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message || 'Error');
      toast.success(data.message || 'Friend added!');
      fetchUserData();
    } catch (err) {
      console.error(err);
      toast.error('Error accepting request');
    }
  };

  const rejectRequest = async (fromUid) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/compete/api/users/${currentUser.uid}/reject-friend-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUid })
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message || 'Error');
      toast.success(data.message || 'Request rejected!');
      fetchUserData();
    } catch (err) {
      console.error(err);
      toast.error('Error rejecting request');
    }
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
          <div key={req.from} className="flex items-center justify-between bg-white/10 px-4 py-2 rounded mb-2">
            <span>{req.fromName}</span>
            <div className="flex gap-2">
              <button
                onClick={() => acceptRequest(req.from)}
                className="text-green-500 hover:scale-110 transition"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => rejectRequest(req.from)}
                className="text-red-500 hover:scale-110 transition"
              >
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
                <p className="font-semibold">{friend.displayName || friend.email}</p>
                <p className="text-sm text-white/60">⚪ Status unknown</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FriendsTab;
