import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parseISO, getDay } from 'date-fns';
import { notifySuccess, notifyError } from '../utils/notify';

const WEEK_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function ScheduleAppointment() {
  const nav = useNavigate();
  const { firebaseUser } = useAuth();

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [times, setTimes] = useState([]);

  const [form, setForm] = useState({
    specialty: '',
    doctorId: '',
    date: '',
    time: ''
  });

  const [backendUser, setBackendUser] = useState(null);

  useEffect(() => {
    const fetchBackendUser = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await axios.get(`/users/by-email?email=${firebaseUser.email}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBackendUser(res.data);
      } catch (err) {
        notifyError('No se pudo obtener el usuario del backend');
      }
    };
    if (firebaseUser?.email) {
      fetchBackendUser();
    }
  }, [firebaseUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const [spRes, docRes] = await Promise.all([
          axios.get('/specialties', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/doctors', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setSpecialties(spRes.data.map(sp => sp.name));
        setDoctors(docRes.data);
      } catch (err) {
        notifyError('Error al cargar datos del servidor');
      }
    };
    fetchData();
  }, [firebaseUser]);

  const filteredDoctors = doctors.filter(d => d.specialty === form.specialty);

  useEffect(() => {
    if (!form.doctorId || !form.date) {
      setTimes([]);
      return;
    }

    const selectedDoc = doctors.find(d => d.id === parseInt(form.doctorId));
    if (!selectedDoc) return;

    const dayIndex = getDay(parseISO(form.date));
    const dayCode = WEEK_DAYS[dayIndex];

    if (!selectedDoc.days.includes(dayCode)) {
      setTimes([]);
      return;
    }

    const doctorSlots = selectedDoc.slots || [];
    setTimes(doctorSlots);
  }, [form.doctorId, form.date]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!backendUser?.id || !form.specialty || !form.doctorId || !form.date || !form.time) {
      notifyError('Faltan campos por completar');
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      const dateTime = `${form.date}T${form.time}`;

      await axios.post('/appointments', {
        patientId: backendUser.id,
        doctorId: form.doctorId,
        specialty: form.specialty,
        dateTime,
        status: 'Pendiente'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      notifySuccess('Cita agendada exitosamente');
      nav('/');
    } catch (err) {
      notifyError('Error al agendar la cita');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Agendar cita</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Especialidad */}
        <select
          className="border p-2 w-full"
          required
          value={form.specialty}
          onChange={e =>
            setForm({
              specialty: e.target.value,
              doctorId: '',
              date: '',
              time: ''
            })
          }
        >
          <option value="">Especialidad</option>
          {specialties.map(sp => (
            <option key={sp} value={sp}>{sp}</option>
          ))}
        </select>

        {/* Doctor */}
        <select
          className="border p-2 w-full"
          required
          disabled={!filteredDoctors.length}
          value={form.doctorId}
          onChange={e =>
            setForm({
              ...form,
              doctorId: e.target.value,
              date: '',
              time: ''
            })
          }
        >
          <option value="">Médico</option>
          {filteredDoctors.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {/* Fecha */}
        <DatePicker
          selected={form.date ? parseISO(form.date) : null}
          onChange={date => {
            const formatted = date.toISOString().split('T')[0];
            setForm({ ...form, date: formatted, time: '' });
          }}
          filterDate={date => {
            const selectedDoc = doctors.find(d => d.id === parseInt(form.doctorId));
            if (!selectedDoc) return false;
            const jsDay = getDay(date);
            const dayKey = WEEK_DAYS[jsDay];
            return selectedDoc.days.includes(dayKey);
          }}
          placeholderText="Fecha"
          className="border p-2 w-full"
        />

        {/* Hora */}
        <select
          className="border p-2 w-full"
          required
          disabled={!form.date}
          value={form.time}
          onChange={e => setForm({ ...form, time: e.target.value })}
        >
          <option value="">Hora</option>
          {times.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => nav('/')}
            className="flex-1 py-2 bg-gray-400 text-white rounded"
          >
            Volver
          </button>
          <button
            type="submit"
            className="flex-1 py-2 bg-indigo-600 text-white rounded"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
