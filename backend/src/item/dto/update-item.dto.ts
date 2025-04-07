import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemNameDto {
  @ApiProperty({
    description: 'Novo nome para o item',
    example: 'Novo nome do item',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}