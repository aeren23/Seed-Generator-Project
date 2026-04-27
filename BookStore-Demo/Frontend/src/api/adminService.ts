import api from './axios';

export const adminService = {
  resetDemoState: async () => {
    const { data } = await api.post('/admin/reset');
    return data;
  }
};
