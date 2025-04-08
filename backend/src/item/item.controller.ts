import {
  Controller,
  Get,
  Query,
  Patch,
  Body,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { ItemService } from './item.service';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ItemResponseDto } from './dto/item-response.dto';
import { FindItemsQueryDto } from './dto/find-items.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemNameDto } from './dto/update-item.dto';
import { BulkActionDto } from './dto/bulk-action.dto';

// Agrupa as rotas sob a tag "items" na documentação Swagger
@ApiTags('items') 
@Controller('items') // Define a rota base como /items
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  // Rota GET /items
  // Lista os itens com paginação e filtros 
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar itens paginados' }) // Descrição no Swagger
  @ApiResponse({ status: 200, description: 'Itens listados com sucesso',  type: [ItemResponseDto], })
  async findMany(@Query() query: FindItemsQueryDto) {
    return this.itemService.findMany({
      skip: query.skip,
      take: query.take,
      search: query.search,
    });
  }

  // Rota POST /items
  // Cria um novo item
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo item' })
  @ApiResponse({ status: 201, description: 'Item criado com sucesso',  type: ItemResponseDto, })
  @ApiResponse({ status: 400, description: 'Dados inválidos',})
  async create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto.name);
  }

  // Rota DELETE /items/:id
  // Deleta um item pelo ID
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover item' })
  @ApiResponse({ status: 204, description: 'Item removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  async delete(@Param('id') id: string) {
    await this.itemService.delete(id);
  }

  // Rota PATCH /items/:id/name
  // Atualiza apenas o nome de um item
  @Patch(':id/name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar nome do item' })
  @ApiResponse({ status: 200, description: 'Nome atualizado com sucesso', type: ItemResponseDto, })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  async updateName(
    @Param('id') id: string,
    @Body() updateItemNameDto: UpdateItemNameDto,
  ) {
    return this.itemService.updateName(id, updateItemNameDto.name);
  }

  // Rota PATCH /items/bulk/deactivate
  // Desativa vários itens de uma vez
  @Patch('bulk/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativar múltiplos itens' })
  @ApiResponse({ status: 200, description: 'Itens desativados com sucesso' })
  async bulkDeactivate(@Body() bulkActionDto: BulkActionDto) {
    return this.itemService.bulkDeactivate(bulkActionDto.ids);
  }

  // Rota PATCH /items/bulk/activate
  // Ativa vários itens de uma vez
  @Patch('bulk/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ativar múltiplos itens' })
  @ApiResponse({ status: 200, description: 'Itens ativados com sucesso' })
  async bulkActivate(@Body() bulkActionDto: BulkActionDto) {
    return this.itemService.bulkActivate(bulkActionDto.ids);
  }
}
