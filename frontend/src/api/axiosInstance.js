// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://52.250.80.229:8081/backend/rest',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
