import api from './axios';

export const authService = {
  login: async (credentials: any) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  }
};
