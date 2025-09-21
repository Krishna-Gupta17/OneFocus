import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore, collection,   doc,addDoc, getDocs, query, orderBy ,where, serverTimestamp,  deleteDoc,} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesCollection = collection(db, 'chatMessages');
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
// Facebook provider
const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  display: 'popup'
});
facebookProvider.addScope('email');
// LinkedIn via generic OIDC provider (configure in Firebase Auth as an OpenID Connect provider)
// Ensure you create an OIDC provider in Firebase Console with ID 'oidc.linkedin'
const linkedinProvider = new OAuthProvider('oidc.linkedin');
linkedinProvider.addScope('openid');
linkedinProvider.addScope('profile');
linkedinProvider.addScope('email');
// Optional: set custom parameters like prompt/login_hint if needed

export default app;
export { db, messagesCollection, googleProvider, facebookProvider, linkedinProvider, addDoc,  doc, getDocs, query, orderBy, where ,  deleteDoc,serverTimestamp};
