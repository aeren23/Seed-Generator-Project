import api from './axios';

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  role: string;
}

export interface CreateUserPayload {
  userName: string;
  email: string;
  fullName: string;
  password: string;
  role: string;
}

export const userService = {
  getAll: async (): Promise<UserDto[]> => {
    const { data } = await api.get('/admin/users');
    return data;
  },

  createUser: async (payload: CreateUserPayload): Promise<UserDto> => {
    const { data } = await api.post('/admin/users', payload);
    return data;
  },

  changeRole: async (userId: string, newRole: string): Promise<void> => {
    await api.put(`/admin/users/${userId}/role`, { newRole });
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  }
};
