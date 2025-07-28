// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  getAuth,
} from 'firebase/auth';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [backendUser, setBackendUser]   = useState(null); // viene de PostgreSQL
  const [loadingAuth, setLoadingAuth]   = useState(true);

  const navigate = useNavigate();

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const login = () => signInWithPopup(getAuth(), provider);

  const logout = async () => {
    await signOut(getAuth());
    setFirebaseUser(null);
    setBackendUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoadingAuth(true);

      if (!currentUser) {
        setFirebaseUser(null);
        setBackendUser(null);
        setLoadingAuth(false);
        return;
      }

      setFirebaseUser(currentUser);

      try {
        const token = await currentUser.getIdToken();
        const res = await axios.post('/auth/login', null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setBackendUser(res.data); // { id, name, email, role }

        // 🚀 Redirigir al dashboard
        if (res.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }

      } catch (err) {
        console.error("❌ Error al loguear con backend:", err);
        await logout();
      } finally {
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      backendUser,
      login,
      logout,
      loadingAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}
