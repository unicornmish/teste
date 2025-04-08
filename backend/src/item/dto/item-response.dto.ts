// src/items/dto/item-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ItemResponseDto {
  @ApiProperty({ description: 'ID do item' })
  id: string;

  @ApiProperty({ description: 'Nome do item' })
  name: string;

  @ApiProperty({ description: 'Data de criação do item' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização do item' })
  updatedAt: Date;
}