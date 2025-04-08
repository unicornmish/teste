// itemService.ts

import axios, { AxiosResponse } from 'axios';
import { FindManyOptions, Item } from '../types/types';

// Base da URL da API. 
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3333/api/teceo/items';
//  responsável por chamadas relacionadas a itens
export const itemService = {
  /**
   * Cria um novo item com o nome fornecido.
   */
  async create(name: string): Promise<AxiosResponse<Item>> {
    return axios.post<Item>(API_BASE_URL, { name });
  },

  /**
   * Busca múltiplos itens com suporte a paginação e busca textual.
   */
  async findMany(options: FindManyOptions = {}): Promise<AxiosResponse<Item[]>> {
    const { skip = 0, take = 10, search = '' } = options;
    const params = { skip, take, search };

    return axios.get<Item[]>(API_BASE_URL, { params });
  },

  /**
   * Atualiza apenas o nome de um item específico.
   */
  async updateName(id: string, name: string): Promise<AxiosResponse<Item>> {
    return axios.patch<Item>(`${API_BASE_URL}/${id}/name`, { name });
  },

  /**
   * Desativa em massa os itens com os IDs fornecidos.
   */
  async bulkDeactivate(ids: string[]): Promise<AxiosResponse<{ count: number }>> {
    return axios.patch<{ count: number }>(`${API_BASE_URL}/bulk/deactivate`, { ids });
  },

  /**
   * Ativa em massa os itens com os IDs fornecidos.
   */
  async bulkActivate(ids: string[]): Promise<AxiosResponse<{ count: number }>> {
    return axios.patch<{ count: number }>(`${API_BASE_URL}/bulk/activate`, { ids });
  },

  /**
   * Exclui um item específico pelo ID.
   */
  async delete(id: string): Promise<AxiosResponse<{ success: boolean }>> {
    return axios.delete<{ success: boolean }>(`${API_BASE_URL}/${id}`);
  }
};
