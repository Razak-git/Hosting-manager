import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.23:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const verifyAccessCode = (accessCode) => api.post('/auth/verify-access-code', { accessCode });
export const sendCode = (email, accessCode) => api.post('/auth/send-code', { email, accessCode });
export const verifyCode = (email, code) => api.post('/auth/verify-code', { email, code });
export const register = (data) => api.post('/auth/register', data);
export const login = (email, password) => api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');

// Sites
export const getSites = () => api.get('/sites');
export const addSite = (data) => api.post('/sites', data);
export const updateSite = (id, data) => api.put(`/sites/${id}`, data);
export const deleteSite = (id) => api.delete(`/sites/${id}`);
export const getStats = () => api.get('/sites/stats');

// Files
export const getFiles = () => api.get('/files');
export const uploadFile = (formData) =>
  api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const downloadFile = (id) =>
  api.get(`/files/${id}/download`, { responseType: 'blob' });
export const deleteFile = (id) => api.delete(`/files/${id}`);

export default api;
