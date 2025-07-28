// src/api/appointments.js
import axios from './axiosInstance';

export const getPatientAppointments = async (patientId) => {
  const res = await axios.get(`/appointments?patientId=${patientId}`);
  return res.data;
};

export const deleteAppointment = async (id) => {
  await axios.delete(`/appointments/${id}`);
};

export const updateAppointment = async (id, data) => {
  await axios.put(`/appointments/${id}`, data);
};
