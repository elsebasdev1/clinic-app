import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError } from '../utils/notify';
import { useAuth } from '../contexts/AuthContext';

export default function SpecialtyManagement() {
  const nav = useNavigate();
  const { firebaseUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      await axios.post('/specialties', {
        name: name.trim(),
        description: description.trim() || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setName('');
      setDescription('');
      loadSpecialties();
      notifySuccess('Especialidad agregada correctamente!');
    } catch (error) {
      notifyError('Error al agregar especialidad');
    }
  };

  const removeSpecialty = async (id, specialtyName) => {
    try {
      const token = await firebaseUser.getIdToken();
      if (!window.confirm(`¿Está seguro de eliminar esta especialidad?`)) return;

      await axios.delete(`/specialties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSpecialties();
      notifySuccess('Especialidad eliminada correctamente!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        notifyError('No se puede eliminar. Esta especialidad tiene citas agendadas.');
      } else {
        notifyError('Error al eliminar especialidad');
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Especialidades</h2>
      </header>

      <form onSubmit={addSpecialty} className="mb-6 flex flex-col md:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre de especialidad"
          className="border p-2 rounded flex-1"
        />
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          className="border p-2 rounded flex-1"
        />
        <button className="px-4 py-2 bg-green-600 text-white rounded-md">
          Agregar
        </button>
      </form>

      <ul className="space-y-2">
        {specialties.map(spec => (
          <li key={spec.id} className="p-3 bg-white shadow rounded">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">{spec.name}</span>
                {spec.description && (
                  <p className="text-sm text-gray-600">{spec.description}</p>
                )}
              </div>
              <button
                onClick={() => removeSpecialty(spec.id, spec.name)}
                className="text-red-600"
              >
                Eliminar
              </button>
            </div>
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
