// Importa dependências do NestJS e Prisma
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ItemService {
  // Cria um logger para registrar informações no console
  private readonly logger = new Logger(ItemService.name);

  constructor(private prisma: PrismaService) {}

  // Método para criar um novo item
  async create(name: string) {
    try {
      // Verifica se o nome foi informado
      if (!name?.trim()) {
        throw new Error('Nome não pode estar vazio');
      }

      // Cria o item no banco de dados com o nome e marca como ativo
      const item = await this.prisma.item.create({
        data: { name, isActive: true },
      });

      
      this.logger.log(`Item criado: ID ${item.id}`);
      return item;
    } catch (error) {

      this.logger.error(`Falha ao criar item: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Método para buscar vários itens com filtros opcionais
  async findMany(options: {
    skip?: number; // pular n itens
    take?: number; // pegar n itens
    includeInactive?: boolean; // incluir ou não os inativos
    search?: string; // busca por nome
  }) {
    try {
      const { skip = 0, take = 10, includeInactive = false, search } = options;

      // Busca os itens no banco com base nos filtros
      const items = await this.prisma.item.findMany({
        skip,
        take,
        where: {
          ...(includeInactive ? {} : { isActive: true }), // se não incluir inativos, só busca os ativos
          ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}), // busca por nome (se informado)
        },
        orderBy: { createdAt: 'desc' }, // ordena por data de criação
      });

      this.logger.debug(`Encontrados ${items.length} itens`);
      return items;
    } catch (error) {
      this.logger.error(`Falha na busca de itens: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Método para atualizar o nome de um item
  async updateName(id: string, name: string) {
    try {
      // Verifica se o item existe antes de atualizar
      await this.verifyItemExists(id);
      
      // Atualiza o nome do item
      const updated = await this.prisma.item.update({
        where: { id },
        data: { name },
      });

      this.logger.log(`Item atualizado: ID ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Falha ao atualizar item ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Método para desativar vários itens de uma vez
  async bulkDeactivate(ids: string[]) {
    try {
      // Atualiza todos os itens com os IDs informados, marcando como inativo
      const result = await this.prisma.item.updateMany({
        where: { id: { in: ids }, isActive: true },
        data: { isActive: false },
      });

      this.logger.log(`${result.count} itens desativados`);
      return result;
    } catch (error) {
      this.logger.error(`Falha na desativação em massa: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Método para reativar vários itens de uma vez
  async bulkActivate(ids: string[]) {
    try {
      // Atualiza todos os itens com os IDs informados, marcando como ativo
      const result = await this.prisma.item.updateMany({
        where: { id: { in: ids }, isActive: false },
        data: { isActive: true },
      });

      this.logger.log(`${result.count} itens reativados`);
      return result;
    } catch (error) {
      this.logger.error(`Falha na ativação em massa: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Método para deletar um item
  async delete(id: string) {
    try {
      // Verifica se o item existe antes de tentar deletar
      await this.verifyItemExists(id);
      
      await this.prisma.item.delete({ where: { id } });
      this.logger.warn(`Item deletado: ID ${id}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Falha ao deletar item ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Método privado para verificar se um item existe no banco
  private async verifyItemExists(id: string): Promise<void> {
    const exists = await this.prisma.item.count({ where: { id } });
    if (!exists) {
      this.logger.warn(`Item não encontrado: ID ${id}`);
      throw new NotFoundException('Item não encontrado');
    }
  }
}
