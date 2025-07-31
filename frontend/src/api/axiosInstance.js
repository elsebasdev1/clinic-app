// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://azuclinic.duckdns.org/backend/rest',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
