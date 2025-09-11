import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchUsersDto {
  @ApiProperty({
    description: 'Termo de pesquisa',
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
    description: 'Filtrar apenas usuários verificados',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isVerified?: boolean;

  @ApiProperty({
    description: 'Filtro por localização',
    example: 'Fortaleza, CE',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Filtro por tags (separadas por vírgula)',
    example: 'React,Node.js,TypeScript',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    description: 'Ordenação dos resultados',
    example: ['username:asc'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sort?: string[];

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

export class SearchUserResultDto {
  @ApiProperty({
    description: 'UUID único do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uuid: string;

  @ApiProperty({
    description: 'Nome de usuário',
    example: 'joao_silva',
  })
  username: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Descrição do usuário',
    example: 'Desenvolvedor full-stack especializado em React e Node.js',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Papel do usuário no sistema',
    example: 'student',
    enum: ['student', 'enterprise'],
  })
  role: string;

  @ApiProperty({
    description: 'Se o usuário está verificado',
    example: true,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Se o usuário está ativo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Localização do usuário',
    example: 'Fortaleza, CE',
    required: false,
  })
  location?: string;

  @ApiProperty({
    description: 'Tags do usuário',
    example: ['React', 'Node.js', 'TypeScript'],
    required: false,
  })
  tags?: string[];

  @ApiProperty({
    description: 'URL temporária do avatar',
    example: 'https://minio.example.com/bucket/avatar_123.jpg?expires=3600',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'URL temporária do banner',
    example: 'https://minio.example.com/bucket/banner_123.jpg?expires=3600',
    required: false,
  })
  bannerUrl?: string;
}

export class SearchUsersResponseDto {
  @ApiProperty({
    description: 'Lista de usuários encontrados',
    type: [SearchUserResultDto],
  })
  hits: SearchUserResultDto[];

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

export class SearchStatsResponseDto {
  @ApiProperty({
    description: 'Número total de documentos no índice',
    example: 1250,
  })
  numberOfDocuments: number;

  @ApiProperty({
    description: 'Se o índice está indexando documentos',
    example: false,
  })
  isIndexing: boolean;

  @ApiProperty({
    description: 'Estatísticas dos campos',
    example: {
      username: { count: 1250 },
      name: { count: 1100 },
      description: { count: 950 },
    },
  })
  fieldDistribution: Record<string, any>;
}
