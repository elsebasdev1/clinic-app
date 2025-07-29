import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth, provider } from '../firebase';
import axios from '../api/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para consumir el contexto
export const useAuth = () => useContext(AuthContext);

// Componente proveedor
export default function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Configuración del proveedor de Google
  provider.setCustomParameters({ prompt: 'select_account' });

  // Función de login con popup
  const login = () => signInWithPopup(auth, provider);

  // Función de logout
  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setBackendUser(null);
    navigate('/login');
  };

  // Efecto para escuchar cambios en el estado de autenticación
  useEffect(() => {
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
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;
        setBackendUser(user);

        // Solo redirigir si no está ya en la ruta correcta
        if (user.role === 'admin') {
          if (!location.pathname.startsWith('/admin')) {
            navigate('/admin', { replace: true });
          }
        } else {
          if (location.pathname.startsWith('/admin')) {
            navigate('/', { replace: true });
          }
        }

      } catch (err) {
        console.error('❌ Error al loguear con backend:', err);
        await logout();
      } finally {
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        backendUser,
        role: backendUser?.role ?? null,
        login,
        logout,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
