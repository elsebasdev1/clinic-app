import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError } from '../utils/notify';
import { useAuth } from '../contexts/AuthContext';

export default function SpecialtyManagement() {
  const nav = useNavigate();
  const { firebaseUser } = useAuth();
  const [name, setName] = useState('');
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.get('/specialties', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialties(res.data);
    } catch (error) {
      notifyError('Error al cargar especialidades');
    }
  };

  const addSpecialty = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const token = await firebaseUser.getIdToken();
      await axios.post('/specialties', { name: name.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setName('');
      loadSpecialties();
      notifySuccess('Especialidad agregada correctamente!');
    } catch (error) {
      notifyError('Error al agregar especialidad');
    }
  };

  const removeSpecialty = async (id, specialtyName) => {
    try {
      const token = await firebaseUser.getIdToken();

      const res = await axios.get(`/appointments/by-specialty?name=${specialtyName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.length > 0) {
        notifyError('No se puede eliminar. Esta especialidad tiene citas agendadas.');
        return;
      }

      if (!window.confirm(`¿Está seguro de eliminar esta especialidad?`)) return;

      await axios.delete(`/specialties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSpecialties();
    } catch (error) {
      notifyError('Error al eliminar especialidad');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Especialidades</h2>
      </header>

      <form onSubmit={addSpecialty} className="mb-6 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre de especialidad"
          className="border p-2 flex-1 rounded"
        />
        <button className="px-4 py-2 bg-green-600 text-white rounded-md">
          Agregar
        </button>
      </form>

      <ul className="space-y-2">
        {specialties.map(spec => (
          <li key={spec.id} className="flex justify-between items-center p-3 bg-white shadow rounded">
            <span>{spec.name}</span>
            <button
              onClick={() => removeSpecialty(spec.id, spec.name)}
              className="text-red-600"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => nav('/admin')}
        className="mt-6 px-4 py-2 bg-gray-400 text-white rounded"
      >
        Volver
      </button>
    </div>
  );
}
