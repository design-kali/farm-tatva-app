import api from './apiBaseService';

export const getUser = (id) => api.get(`/users/${id}`);
export const login = (credentials) => api.post("/auth/login", credentials);
