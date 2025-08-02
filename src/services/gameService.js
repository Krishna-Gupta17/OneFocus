import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Create a new room and add the host as the first player
export async function createRoom(userId, name) {
  if (!userId || !name) throw new Error('User ID and name are required');

  const code = generateCode();

  await setDoc(doc(db, 'rooms', code), {
    hostId: userId,
    status: 'waiting',
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, `rooms/${code}/players/${userId}`), {
    name,
    joinTime: serverTimestamp(),
  });

  return code;
}

// Join an existing room
export async function joinRoom(code, userId, name) {
  if (!userId || !name || !code) throw new Error('All fields are required');

  const room = await getDoc(doc(db, 'rooms', code));
  if (!room.exists()) throw new Error('Room does not exist');
  if (room.data().status !== 'waiting') throw new Error('Room is already in progress or ended');

  await setDoc(doc(db, `rooms/${code}/players/${userId}`), {
    name,
    joinTime: serverTimestamp(),
  });
}

// Start the focus session
export async function startSession(code) {
  await updateDoc(doc(db, 'rooms', code), {
    status: 'in-progress',
    startedAt: serverTimestamp(),
  });

  const players = await getDocs(collection(db, `rooms/${code}/players`));
  const updates = players.docs.map(p =>
    updateDoc(p.ref, { focusStart: serverTimestamp() })
  );
  await Promise.all(updates);
}

// End the session and compute winner
export async function endSession(code) {
  await updateDoc(doc(db, 'rooms', code), {
    status: 'finished',
    endedAt: serverTimestamp(),
  });

  const players = await getDocs(collection(db, `rooms/${code}/players`));
  let max = 0;
  let winnerId = null;

  for (const p of players.docs) {
    const data = p.data();
    const startTime = data.focusStart?.toDate?.();
    let duration = 0;

    if (startTime) {
      duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
    }

    await updateDoc(p.ref, {
      focusEnd: serverTimestamp(),
      totalDuration: duration,
    });

    if (duration > max) {
      max = duration;
      winnerId = p.id;
    }
  }

  if (winnerId) {
    await updateDoc(doc(db, `rooms/${code}/players/${winnerId}`), {
      isWinner: true,
    });
  }
}

// Get the latest status of the room and players
export async function getHistory(code) {
  const playersSnap = await getDocs(collection(db, `rooms/${code}/players`));
  const roomSnap = await getDoc(doc(db, 'rooms', code));

  const players = playersSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  const winner = players.find(p => p.isWinner);

  return {
    players,
    status: roomSnap.data()?.status || 'waiting',
    winner,
  };
}

// Generates a random 6-character room code
function generateCode() {
  return Array.from({ length: 6 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36))
  ).join('');
}
