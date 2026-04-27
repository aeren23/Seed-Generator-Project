import api from './axios';
import type { Category } from '../types';

export const categoryService = {
  getAll: async () => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },
  create: async (categoryData: { name: string, description: string }) => {
    const { data } = await api.post<Category>('/categories', categoryData);
    return data;
  },
  update: async (id: string, categoryData: { name: string, description: string }) => {
    const { data } = await api.put(`/categories/${id}`, categoryData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  }
};
