import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAmwQ0cAe20QtBAb6_Hd9SOX6waNJ2ZX8U",
  authDomain: "clinic-app-tfm.firebaseapp.com",
  projectId: "clinic-app-tfm",
  storageBucket: "clinic-app-tfm.firebasestorage.app",
  messagingSenderId: "489433348111",
  appId: "1:489433348111:web:aa4077a85d00314b9f0b7a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
