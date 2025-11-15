import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const escrowAPI = {
  create: async (data: any) => {
    const response = await api.post('/api/escrow/create', data);
    return response.data;
  },
  
  verify: async (data: any) => {
    const response = await api.post('/api/escrow/verify', data);
    return response.data;
  },
  
  release: async (data: any) => {
    const response = await api.post('/api/escrow/release', data);
    return response.data;
  },
};

export const crossChainAPI = {
  create: async (data: any) => {
    const response = await api.post('/api/crosschain/create', data);
    return response.data;
  },
  
  release: async (data: any) => {
    const response = await api.post('/api/crosschain/release', data);
    return response.data;
  },
  
  getStatus: async (id: string) => {
    const response = await api.get(`/api/crosschain/status/${id}`);
    return response.data;
  },
};

export const zkmeAPI = {
  initialize: async (data: any) => {
    const response = await api.post('/api/zkme/initialize', data);
    return response.data;
  },
  
  getStatus: async (id: string) => {
    const response = await api.get(`/api/zkme/status/${id}`);
    return response.data;
  },
};

export default api;
