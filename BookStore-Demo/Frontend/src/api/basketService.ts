import api from './axios';
import type { Basket } from '../types';

export const basketService = {
  getActive: async () => {
    const { data } = await api.get<Basket>('/basket');
    return data;
  },
  addItem: async (bookId: string, quantity: number) => {
    await api.post('/basket/items', { bookId, quantity });
  },
  removeItem: async (bookId: string) => {
    await api.delete(`/basket/items/${bookId}`);
  },
  clear: async () => {
    await api.delete('/basket/clear');
  },
  checkout: async () => {
    await api.post('/basket/checkout');
  }
};
