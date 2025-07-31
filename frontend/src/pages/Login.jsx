import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';
import axios from '../api/axiosInstance';
import { getAuth } from 'firebase/auth';

export default function Login() {
  const { login } = useAuth();

const handleLogin = async () => {
  try {
    await login(); // login con Google
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      console.log("✅ Token de ID:", token);

      // 👉 Axios POST al backend
      const response = await axios.post('/auth/login', null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Usuario desde backend:", response.data);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Error en Axios:", error.response?.data || error.message);
    } else {
      console.error("❌ Error en login:", error);
    }
  }
};

  return (
    <div className="min-h-screen flex flex-col sm:flex-row items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-700 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 sm:mr-8"
      >
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Bienvenido de nuevo</h1>
          <p className="text-gray-500 text-sm mt-1">
            Accede a tu cuenta para gestionar tus citas
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-3 px-4 flex items-center justify-center gap-3 rounded-lg border border-gray-300 hover:shadow-md transition bg-white"
        >
          <FcGoogle className="text-2xl" />
          <span className="text-sm font-medium text-gray-700">Iniciar sesión con Google</span>
        </button>

        <p className="text-xs text-center text-gray-400 mt-6">
          ¿Problemas al ingresar?{' '}
          <a
            href="https://www.ups.edu.ec"
            className="underline hover:text-indigo-600 transition"
          >
            Contáctanos
          </a>
        </p>
      </motion.div>
    </div>
  );
}
