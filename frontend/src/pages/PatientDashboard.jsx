import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { notifySuccess, notifyError } from '../utils/notify';


const WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function PatientDashboard() {
  const nav = useNavigate();
  const { firebaseUser, logout } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [doctorsMap, setDoctorsMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    doctorId: '',
    date: '',
    time: ''
  });
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);
  const [profile, setProfile] = useState({ name: '' });

  const fetchAppointments = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.get('/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const all = res.data;
      const mine = res.data.filter(a => a.patient?.email === firebaseUser.email);
      setAppointments(mine);
    } catch (err) {
      console.error("Error al cargar citas", err);
      notifyError("No se pudieron cargar las citas");
    }
  };



  const downloadPDF = async (appointmentId) => {
  try {
    const token = await firebaseUser.getIdToken();
    const response = await axios.get(`/appointments/${appointmentId}/pdf`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `cita_${appointmentId}.pdf`;
    link.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar el PDF:', error);
    alert('No se pudo descargar el PDF. ¿Estás autenticado?');
  }
};




  const fetchDoctors = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.get('/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const docs = res.data;
      const map = {};
      docs.forEach(d => {
        map[d.id] = d.name;
      });
      setDoctorsList(docs);
      setDoctorsMap(map);
    } catch (err) {
      notifyError("Error al cargar los doctores");
    }
  };

  const fetchProfile = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.get(`/users/by-email?email=${firebaseUser.email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      notifyError("No se pudo cargar el perfil");
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchProfile();
  }, []);

  const deleteAppointment = async (id) => {
    if (!window.confirm("¿Estás seguro de cancelar esta cita?")) return;
    try {
      const token = await firebaseUser.getIdToken();
      await axios.delete(`/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAppointments();
      if (editingId === id) {
        cancelEditing();
      }
    } catch {
      notifyError("Error al eliminar la cita");
    }
  };

  const startEditing = (appt) => {
    setEditingId(appt.id);
    setEditForm({
      doctorId: appt.doctorId,
      date: appt.date,
      time: appt.time
    });
    setSlotsDisponibles([]);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ doctorId: '', date: '', time: '' });
    setSlotsDisponibles([]);
  };

  useEffect(() => {
    async function calcSlots() {
      if (!editForm.doctorId || !editForm.date) {
        setSlotsDisponibles([]);
        return;
      }
      try {
        const selected = doctorsList.find(d => d.id === editForm.doctorId);
        const dayCode = WEEK[getDay(parseISO(editForm.date))];
        if (!selected.days.includes(dayCode)) {
          setSlotsDisponibles([]);
          return;
        }

        const token = await firebaseUser.getIdToken();
        const res = await axios.get('/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const clashes = res.data.filter(a =>
          a.doctorId === editForm.doctorId &&
          a.date === editForm.date &&
          a.id !== editingId
        );

        const taken = clashes.map(a => a.time);
        const libres = selected.slots.filter(s => !taken.includes(s));
        setSlotsDisponibles(libres);
      } catch (err) {
        notifyError("Error al calcular los horarios");
        setSlotsDisponibles([]);
      }
    }
    calcSlots();
  }, [editForm.doctorId, editForm.date, editingId]);

  const saveEdit = async (id) => {
    if (!editForm.doctorId || !editForm.date || !editForm.time) {
      return notifyError("Faltan campos");
    }
    try {
      const token = await firebaseUser.getIdToken();
      await axios.put(`/appointments/${id}`, {
        doctorId: editForm.doctorId,
        date: editForm.date,
        time: editForm.time
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notifySuccess("Cita actualizada");
      cancelEditing();
      fetchAppointments();
    } catch (err) {
      notifyError("Error al actualizar la cita");
    }
  };

  const formatDate = (iso) => {
    try {
      return format(parseISO(iso), "EEEE, dd 'de' MMMM 'del' yyyy", { locale: es });
    } catch {
      return iso;
    }
  };



  const visibleAppointments = appointments.filter(appt => {
    if (statusFilter !== 'all' && appt.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const docName = (doctorsMap[appt.doctorId] || '').toLowerCase();
      return docName.includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Bienvenido, {profile.name || 'Paciente'}</h2>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button onClick={() => nav('/schedule')} className="px-4 py-2 bg-green-600 text-white rounded-md">Agendar Cita</button>
          <button onClick={() => nav('/profile')} className="px-4 py-2 bg-blue-600 text-white rounded-md">Perfil</button>
          <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-md">Salir</button>
        </div>
      </header>

      <div className="max-w-2xl w-full mx-auto flex flex-wrap gap-4 items-center mb-6">
        <div>
          <label className="mr-2 font-medium">Estado:</label>
          <select className="border p-2 rounded" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Confirmada">Confirmadas</option>
          </select>
        </div>
        <div className="flex-1">
          <input type="text" placeholder="Buscar por médico..." className="w-full border p-2 rounded"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {visibleAppointments.length === 0 ? (
        <p className="text-center text-gray-600">
          {appointments.length === 0 ? 'No tienes citas agendadas.' : 'No se encontraron citas que coincidan con los filtros.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {visibleAppointments.map(appt => {
            const doctorName = appt.doctor?.name || doctorsMap[appt.doctorId] || 'Desconocido';
            const specialtyName = appt.specialty || appt.doctor?.specialty?.name || 'N/A';
            const isEditing = editingId === appt.id;
            const isPending = appt.status?.toUpperCase() === 'PENDIENTE';

            const dateObj = Array.isArray(appt.dateTime) && appt.dateTime.length >= 5
              ? new Date(...appt.dateTime)
              : null;
            return (
              <li key={appt.id} className="relative bg-white rounded-lg shadow">
                <span className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-semibold shadow
                  ${appt.status === 'CONFIRMADA' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {appt.status}
                </span>
                <div className="p-4 flex flex-col sm:flex-row justify-between items-start text-base space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="space-y-1">
                  <p><strong>Médico:</strong> {doctorName}</p>
                  <p><strong>Especialidad:</strong> {specialtyName}</p>
                  <p><strong>Fecha:</strong> {dateObj ? format(dateObj, "EEEE, dd 'de' MMMM 'del' yyyy", { locale: es }) : 'N/A'}</p>
                  <p><strong>Hora:</strong> {dateObj ? `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}` : 'N/A'}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end self-center sm:w-[200px] ml-auto">
                    {!isEditing && (
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => startEditing(appt)} className="px-3 py-1 bg-blue-500 text-white rounded">Editar</button>
                        <button onClick={() => deleteAppointment(appt.id)} className="px-3 py-1 bg-red-500 text-white rounded">Cancelar Cita</button>
                        <button
                          onClick={() => downloadPDF(appt.id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                          Descargar PDF
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="border-t px-4 py-4 bg-gray-50">
                    <h3 className="font-medium mb-2">Editar Cita</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block mb-1 font-medium">Médico:</label>
                        <select className="border p-2 w-full rounded" value={editForm.doctorId}
                          onChange={e => setEditForm({ ...editForm, doctorId: e.target.value, date: '', time: '' })}>
                          <option value="">Selecciona médico</option>
                          {doctorsList.filter(d => d.specialty === appt.specialty)
                            .map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Fecha:</label>
                        <DatePicker
                          selected={editForm.date ? parseISO(editForm.date) : null}
                          onChange={date => {
                            const formatted = date.toISOString().split('T')[0];
                            setEditForm({ ...editForm, date: formatted, time: '' });
                          }}
                          filterDate={date => {
                            const doc = doctorsList.find(d => d.id === editForm.doctorId);
                            if (!doc) return false;
                            const jsDay = getDay(date);
                            const code = WEEK[jsDay];
                            return doc.days.includes(code);
                          }}
                          placeholderText="Fecha"
                          className="border p-2 w-full rounded"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Hora:</label>
                        <select className="border p-2 w-full rounded" value={editForm.time}
                          onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                          disabled={!editForm.date}>
                          <option value="">Selecciona hora</option>
                          {slotsDisponibles.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={cancelEditing} className="flex-1 py-2 bg-gray-400 text-white rounded">Cancelar</button>
                        <button onClick={() => saveEdit(appt.id)} className="flex-1 py-2 bg-indigo-600 text-white rounded">Guardar cambios</button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
