import api from './axios';
import type { Book } from '../types';

export const bookService = {
  getAll: async (pageNumber = 1, pageSize = 20) => {
    const { data } = await api.get(`/books?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return data; // Returns PagedResult<BookDto>
  },
  getById: async (id: string) => {
    const { data } = await api.get<Book>(`/books/${id}`);
    return data;
  },
  create: async (book: any) => {
    const { data } = await api.post<Book>('/books', book);
    return data;
  },
  update: async (id: string, book: any) => {
    await api.put(`/books/${id}`, book);
  },
  delete: async (id: string) => {
    await api.delete(`/books/${id}`);
  }
};
