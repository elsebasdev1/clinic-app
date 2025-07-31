import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { notifySuccess, notifyError } from '../utils/notify';

const formatDate = (isoDateStr) => {
  try {
    const date = parseISO(isoDateStr);
    return format(date, "EEEE, dd 'de' MMMM 'del' yyyy", { locale: es });
  } catch {
    return isoDateStr;
  }
};

export default function AdminDashboard() {
  const { firebaseUser, logout } = useAuth();
  const nav = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [doctorsMap, setDoctorsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchUsers();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.get('/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Appointments data:", res.data);
      setAppointments(res.data);

    } catch (err) {
      notifyError('Error al cargar citas');
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.get('/doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const map = {};
      res.data.forEach(d => {
        map[d.id] = d.name;
      });
      setDoctorsMap(map);
    } catch (err) {
      notifyError('Error al cargar doctores');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const map = {};
      res.data.forEach(d => {
        map[d.id] = {
          name: d.displayName || d.email || d.id,
          address: d.address || 'N/A',
          phone: d.phone || 'N/A'
        };
      });
      setUsersMap(map);
    } catch (err) {
      notifyError('Error al cargar usuarios');
    }
  };

  const confirmAppointment = async (id) => {
    try {
      const token = await firebaseUser.getIdToken();
      await axios.put(`/appointments/${id}`, { status: 'Confirmada' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      notifySuccess('Cita confirmada!');
      fetchAppointments();
    } catch {
      notifyError('No se pudo confirmar la cita.');
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('¿Deseas descartar esta cita?')) return;
    try {
      const token = await firebaseUser.getIdToken();
      await axios.delete(`/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      notifySuccess('Cita descartada correctamente!');
      fetchAppointments();
    } catch {
      notifyError('No se pudo eliminar la cita.');
    }
  };

  const downloadDoctorReportPdf = async () => {
  try {
    const token = await firebaseUser.getIdToken();
    const response = await axios.get('/appointments/reporte-doctores/pdf', {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_citas_por_doctor.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    notifyError('Error al descargar el reporte completo de doctores');
    console.error(err);
  }
};

  const downloadSpecialtyReportPdf = async () => {
  try {
    const token = await firebaseUser.getIdToken();
    const response = await axios.get('/appointments/reporte-especialidades/pdf', {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_citas_por_especialidad.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    notifyError('Error al descargar el reporte por especialidades');
    console.error(err);
  }
};


  const downloadOccupationReportPdf = async () => {
  try {
    const token = await firebaseUser.getIdToken();
    const response = await axios.get('/appointments/reporte-ocupacion/pdf', {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_ocupacion_doctores.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error(err);
    alert("Error al descargar el reporte");
  }
};


  const filteredAppointments = appointments.filter(appt => {
    if (statusFilter !== 'all' && appt.status !== statusFilter) return false;
    const doctorName = doctorsMap[appt.doctorId] || 'N/A';
    const userData = usersMap[appt.patientId];
    const patientName = userData?.name || appt.patientId;
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return doctorName.toLowerCase().includes(term) || patientName.toLowerCase().includes(term);
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Panel de Administrador</h2>
        <div className="flex gap-2">
          <button onClick={() => nav('/admin/specialties')} className="px-4 py-2 bg-purple-600 text-white rounded-md">Especialidades</button>
          <button onClick={() => nav('/admin/doctors')} className="px-4 py-2 bg-green-600 text-white rounded-md">Médicos</button>
          <button onClick={() => nav('/admin/users')} className="px-4 py-2 bg-blue-600 text-white rounded-md">Usuarios</button>
          <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-md">Salir</button>
          <button onClick={downloadDoctorReportPdf} className="px-4 py-2 bg-orange-600 text-white rounded-md">Reporte Doctores</button>
          <button onClick={downloadSpecialtyReportPdf} className="px-4 py-2 bg-pink-600 text-white rounded-md">Reporte Especialidad</button>
          <button onClick={downloadOccupationReportPdf} className="px-4 py-2 bg-purple-600 text-white rounded-md">Reporte Ocupación</button>


        </div>
      </header>

      <div className="max-w-2xl w-full mx-auto flex flex-wrap gap-4 items-center mb-6">
        <div>
          <label className="mr-2 font-medium">Estado:</label>
          <select className="border p-1 rounded" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Confirmada">Confirmadas</option>
          </select>
        </div>
        <div className="flex-1">
          <input type="text" placeholder="Buscar por paciente o médico..." className="w-full border p-2 rounded" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <p className="text-center text-gray-600">No hay citas que coincidan.</p>
      ) : (
        <ul className="space-y-4">
          {filteredAppointments.map(appt => {
          const doctorName = appt.doctor?.name || '—';
          const specialtyName = appt.doctor?.specialty?.name || 'N/A';
          const patientName = appt.patient?.name || 'N/A';
          const patientAddress = appt.patient?.address || 'N/A';
          const patientPhone = appt.patient?.phone || 'N/A';

          const dateObj = Array.isArray(appt.dateTime) && appt.dateTime.length >= 5
            ? new Date(...appt.dateTime)
            : null;


            return (
              <li key={appt.id} className="relative p-4 bg-white rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-stretch max-w-4xl mx-auto">
                <span className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-semibold shadow ${appt.status === 'CONFIRMADA' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {appt.status}
                </span>
                <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                  <div className="flex-1 space-y-1">
                    <p><strong>Médico:</strong> {doctorName}</p>
                    <p><strong>Especialidad:</strong> {specialtyName}</p>
                    <p><strong>Fecha:</strong> {dateObj ? format(dateObj, "EEEE, dd 'de' MMMM 'del' yyyy", { locale: es }) : 'N/A'}</p>
                    <p><strong>Hora:</strong> {dateObj ? `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}` : 'N/A'}</p>

                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-gray-700 mb-1">Información del Paciente</h3>
                    <p><strong>Nombre:</strong> {patientName}</p>
                    <p><strong>Dirección:</strong> {patientAddress}</p>
                    <p><strong>Teléfono:</strong> {patientPhone}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end gap-2 sm:w-[200px] ml-auto self-center">
                  {appt.status?.toUpperCase() === 'PENDIENTE' && (
                    <>
                      <button onClick={() => confirmAppointment(appt.id)} className="px-4 py-2 bg-green-600 text-white rounded-md">Confirmar</button>
                      <button onClick={() => deleteAppointment(appt.id)} className="px-4 py-2 bg-red-500 text-white rounded-md">Descartar</button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
