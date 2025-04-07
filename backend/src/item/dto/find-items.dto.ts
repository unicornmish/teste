import { IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FindItemsQueryDto {
  @ApiProperty({
    description: 'Número de itens ignorados',
    required: false,
    default: 0,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number = 0;

  @ApiProperty({
    description: 'Número máximo de itens retornados',
    required: false,
    default: 20,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number = 20;

  @ApiProperty({
    description: 'Incluir itens inativos',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeInactive?: boolean;

  @ApiProperty({
    description: 'Termo de busca para filtrar por nome',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;
}