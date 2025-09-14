import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { UserPreviewResponseDto } from './user-response.dto';

/**
 * DTO para parâmetros de busca de usuários recomendados
 */
export class GetRecommendedUsersDto {
  @ApiProperty({
    description: 'Número de resultados por página (1-50)',
    minimum: 1,
    maximum: 50,
    default: 20,
    required: false,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiProperty({
    description: 'Offset para paginação (início em 0)',
    minimum: 0,
    default: 0,
    required: false,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

/**
 * DTO para resposta de usuários recomendados
 */
export class RecommendedUsersResponseDto {
  @ApiProperty({
    description: 'Lista de usuários recomendados',
    type: [UserPreviewResponseDto],
  })
  users: UserPreviewResponseDto[];

  @ApiProperty({
    description: 'Número total de usuários disponíveis para recomendação',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Se existe próxima página',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Se existe página anterior',
    example: false,
  })
  hasPrev: boolean;

  @ApiProperty({
    description: 'Número de resultados na página atual',
    example: 20,
  })
  count: number;

  @ApiProperty({
    description: 'Offset atual da paginação',
    example: 0,
  })
  offset: number;

  @ApiProperty({
    description: 'Limite de resultados por página',
    example: 20,
  })
  limit: number;
}
