import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError } from '../utils/notify';

const WEEK = [
  { code: 'mon', label: 'Lunes' },
  { code: 'tue', label: 'Martes' },
  { code: 'wed', label: 'Miércoles' },
  { code: 'thu', label: 'Jueves' },
  { code: 'fri', label: 'Viernes' },
  { code: 'sat', label: 'Sábado' },
  { code: 'sun', label: 'Domingo' }
];

export default function DoctorManagement() {
  const { firebaseUser } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    days: [],
  });

  const [slotInicio, setSlotInicio] = useState('');
  const [slotFin, setSlotFin] = useState('');

  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      days: [],
    });
    setSlotInicio('');
    setSlotFin('');
  };

  const fetchDoctors = async () => {
    try {
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      const res = await axios.get('/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(res.data);
    } catch (err) {
      console.error("❌ Error al obtener doctores", err);
    }
  };

  const fetchSpecialties = async () => {
    try {
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      const res = await axios.get('/specialties', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialties(res.data);
    } catch (err) {
      console.error("❌ Error al obtener especialidades", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();

      // Validación
      if (!slotInicio || !slotFin) {
        notifyError("Selecciona el horario de atención");
        return;
      }

      // Asegura orden: de menor a mayor
      const start = slotInicio < slotFin ? slotInicio : slotFin;
      const end = slotInicio < slotFin ? slotFin : slotInicio;

      const slots = [start, end];

      await axios.post('/doctors', {
        ...form,
        slots,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      notifySuccess("Doctor registrado correctamente");
      fetchDoctors();
      resetForm();
    } catch (err) {
      console.error("❌ Error al registrar doctor", err);
      notifyError("No se pudo registrar el doctor");
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, [firebaseUser]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Gestión de Doctores</h2>

      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-md space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <select
            className="border p-2 w-full"
            value={form.specialty}
            onChange={e => setForm({ ...form, specialty: e.target.value })}
            required
          >
            <option value="">Selecciona especialidad</option>
            {specialties.map(spec => (
              <option key={spec.id} value={spec.name}>{spec.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block font-medium mb-1">Días disponibles:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {WEEK.map(day => (
              <label key={day.code} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.days.includes(day.code)}
                  onChange={() => {
                    setForm(prev => ({
                      ...prev,
                      days: prev.days.includes(day.code)
                        ? prev.days.filter(d => d !== day.code)
                        : [...prev.days, day.code]
                    }));
                  }}
                />
                <span>{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <div className="flex flex-col flex-1">
            <label className="mb-1 font-medium">Desde:</label>
            <input
              type="time"
              className="border p-2"
              value={slotInicio}
              onChange={e => setSlotInicio(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="mb-1 font-medium">Hasta:</label>
            <input
              type="time"
              className="border p-2"
              value={slotFin}
              onChange={e => setSlotFin(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Guardar doctor
        </button>
      </form>

      <h3 className="text-lg font-semibold mb-2">Lista de doctores:</h3>
      <ul className="space-y-2">
        {doctors.map((doc, index) => (
          <li key={index} className="bg-white p-4 shadow rounded">
            <p className="font-bold">{doc.name}</p>
            <p className="text-sm text-gray-600">{doc.email} | {doc.phone}</p>
            <p>Especialidad: {doc.specialty}</p>
            <p>
            Días:&nbsp;
            {doc.days?.map(d =>
              WEEK.find(w => w.code === d)?.label || d
            ).join(', ')}
            </p>
            <p>Horario: {doc.slots?.join(' - ')}</p>
          </li>
        ))}
      </ul>

      <button
        onClick={() => nav('/admin')}
        className="mt-6 px-4 py-2 bg-gray-500 text-white rounded"
      >
        Volver
      </button>
    </div>
  );
}
