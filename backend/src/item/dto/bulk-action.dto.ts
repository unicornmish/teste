// src/items/dto/bulk-action.dto.ts
import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkActionDto {
  @ApiProperty({
    description: 'IDs dos itens para ação em massa',
    type: [String],
    example: ['id1', 'id2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}