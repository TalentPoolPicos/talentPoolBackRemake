import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { UserPreviewResponseDto } from '../../users/dtos/user-response.dto';

// Interfaces para o service
export interface SearchOptions {
  filter?: string;
  limit: number;
  offset: number;
}

export interface MeilisearchResponse {
  hits: UserPreviewResponseDto[];
  total: number;
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
}

export interface SearchableUser {
  uuid: string;
  username: string;
  name?: string;
  email: string;
  role: string;
  description?: string;
  tags?: string[];
  location?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  isVerified: boolean;
  isActive: boolean;
}

export class SearchUsersDto {
  @ApiProperty({
    description:
      'Termo de pesquisa (busca em username, email, descrição, localização e tags)',
    example: 'João developer React',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'Filtro por papel do usuário',
    example: 'student',
    enum: ['student', 'enterprise'],
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({
    description: 'Número de resultados por página',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Offset para paginação',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class SearchUsersResponseDto {
  @ApiProperty({
    description: 'Lista de usuários encontrados',
    type: [UserPreviewResponseDto],
  })
  hits: UserPreviewResponseDto[];

  @ApiProperty({
    description: 'Total estimado de resultados',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Termo de pesquisa usado',
    example: 'João developer React',
  })
  query: string;

  @ApiProperty({
    description: 'Tempo de processamento em milissegundos',
    example: 15,
  })
  processingTimeMs: number;

  @ApiProperty({
    description: 'Limite de resultados por página',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Offset usado na pesquisa',
    example: 0,
  })
  offset: number;
}
