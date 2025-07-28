// src/api/doctors.js
import axios from './axiosInstance';

export const getDoctors = async () => {
  const res = await axios.get('/doctors');
  return res.data;
};
