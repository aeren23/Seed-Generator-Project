import api from './axios';
import type { SaleChartData } from '../types';

export const saleService = {
  getChartData: async () => {
    const { data } = await api.get<SaleChartData[]>('/sales/chart-data');
    return data;
  }
};
