import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parseISO, getDay } from 'date-fns';
import { notifySuccess, notifyError } from '../utils/notify';
import axios from '../api/axiosInstance';

const WEEK_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function ScheduleAppointment() {
  const nav = useNavigate();
  const { firebaseUser } = useAuth();

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors]         = useState([]);
  const [times, setTimes]             = useState([]);
  const [backendUser, setBackendUser] = useState(null);

  const [form, setForm] = useState({
    specialty: '',
    doctorId: '',
    date: '',
    time: ''
  });

  // Obtener especialidades
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await axios.get('/specialties', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSpecialties(res.data);
      } catch {
        notifyError('Error al cargar especialidades.');
      }
    };
    fetchSpecialties();
  }, [firebaseUser]);

  // Obtener usuario logueado del backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await axios.get(`/users/by-email?email=${firebaseUser.email}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBackendUser(res.data);
      } catch {
        notifyError('Error al obtener el usuario.');
      }
    };
    fetchUser();
  }, [firebaseUser]);

  // Obtener doctores
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await axios.get('/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctors(res.data);
      } catch {
        notifyError('Error al cargar los doctores.');
      }
    };
    fetchDoctors();
  }, [firebaseUser]);

  const filteredDoctors = doctors.filter(d => d.specialty === form.specialty);

  useEffect(() => {
    const calcSlots = () => {
      if (!form.doctorId || !form.date) {
        setTimes([]);
        return;
      }
      const doc = doctors.find(d => d.id.toString() === form.doctorId);
      if (!doc) return;

      const dayIndex = getDay(parseISO(form.date));
      const dayKey = WEEK_DAYS[dayIndex];
      if (!doc.days.includes(dayKey) || doc.slots.length < 2) {
        setTimes([]);
        return;
      }

      const generateSlots = (start, end) => {
        const res = [];
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);

        let cur = new Date();
        cur.setHours(sh, sm, 0);
        const endTime = new Date();
        endTime.setHours(eh, em, 0);

        while (cur <= endTime) {
          const h = String(cur.getHours()).padStart(2, '0');
          const m = String(cur.getMinutes()).padStart(2, '0');
          res.push(`${h}:${m}`);
          cur.setMinutes(cur.getMinutes() + 30);
        }
        return res;
      };

      const generated = generateSlots(doc.slots[0], doc.slots[1]);
      setTimes(generated);
    };
    calcSlots();
  }, [form.doctorId, form.date, doctors]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.specialty || !form.doctorId || !form.date || !form.time) {
      notifyError('Faltan campos por completar');
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      await axios.post('/appointments', {
        patientId: backendUser.id,
        doctorId: parseInt(form.doctorId),
        dateTime: `${form.date}T${form.time}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      notifySuccess('Cita agendada exitosamente!');
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
            setForm({ specialty: e.target.value, doctorId: '', date: '', time: '' })
          }
        >
          <option value="">Especialidad</option>
          {specialties.map(sp => (
            <option key={sp.id || sp.name} value={sp.name}>{sp.name}</option>
          ))}
        </select>

        {/* Médico */}
        <select
          className="border p-2 w-full"
          required
          disabled={!filteredDoctors.length}
          value={form.doctorId}
          onChange={e =>
            setForm({ ...form, doctorId: e.target.value, date: '', time: '' })
          }
        >
          <option value="">Médico</option>
          {filteredDoctors.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {/* Fecha específica */}
        <DatePicker
          selected={form.date ? parseISO(form.date) : null}
          onChange={date => {
            const formatted = date.toISOString().split('T')[0];
            setForm({ ...form, date: formatted, time: '' });
          }}
          filterDate={date => {
            const selectedDoc = doctors.find(d => d.id.toString() === form.doctorId);
            if (!selectedDoc) return false;
            const jsDay = getDay(date);
            const weekCode = WEEK_DAYS[jsDay];
            return selectedDoc.days.includes(weekCode);
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