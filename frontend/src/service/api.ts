import axios, { AxiosResponse } from 'axios';
import { FindManyOptions, Item } from '../types/types';

const API_BASE_URL = 'http://localhost:3333/api/teceo/items'; // Ajuste conforme sua API

export const itemService = {
  async create(name: string): Promise<AxiosResponse<Item>> {
    return axios.post<Item>(API_BASE_URL, { name });
  },

  async findMany(options: FindManyOptions = {}): Promise<AxiosResponse> {
    const params = {
      skip: options.skip || 0,
      take: options.take || 10,
      search: options.search || ''
    };
    return axios.get(API_BASE_URL, { params });
  },

  async updateName(id: string, name: string): Promise<AxiosResponse<Item>> {
    return axios.patch<Item>(`${API_BASE_URL}/${id}/name`, { name });
  },

  async bulkDeactivate(ids: string[]): Promise<AxiosResponse<{ count: number }>> {
    return axios.patch<{ count: number }>(`${API_BASE_URL}/bulk/deactivate`, { ids });
  },

  async bulkActivate(ids: string[]): Promise<AxiosResponse<{ count: number }>> {
    return axios.patch<{ count: number }>(`${API_BASE_URL}/bulk/activate`, { ids });
  },

  async delete(id: string): Promise<AxiosResponse<{ success: boolean }>> {
    return axios.delete<{ success: boolean }>(`${API_BASE_URL}/${id}`);
  }
};