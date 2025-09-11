import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para resposta de verificação de like
 */
export class HasLikedResponseDto {
  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Se o usuário logado deu like no usuário especificado',
  })
  hasLiked: boolean;

  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID do usuário alvo',
  })
  targetUserUuid: string;
}

/**
 * DTO para dar like em um usuário
 */
export class GiveLikeDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID do usuário para dar like',
  })
  targetUserUuid: string;
}

/**
 * DTO para resposta de sucesso ao dar like
 */
export class GiveLikeResponseDto {
  @ApiProperty({
    type: String,
    example: 'Like dado com sucesso',
    description: 'Mensagem de sucesso',
  })
  message: string;

  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID do usuário que recebeu o like',
  })
  targetUserUuid: string;
}

/**
 * DTO para resposta de sucesso ao remover like
 */
export class RemoveLikeResponseDto {
  @ApiProperty({
    type: String,
    example: 'Like removido com sucesso',
    description: 'Mensagem de sucesso',
  })
  message: string;

  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID do usuário do qual o like foi removido',
  })
  targetUserUuid: string;
}

/**
 * DTO para usuário que deu ou recebeu like
 */
export class LikeUserDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID único do usuário',
  })
  uuid: string;

  @ApiProperty({
    type: String,
    example: 'joao_silva',
    description: 'Nome de usuário',
  })
  username: string;

  @ApiProperty({
    type: String,
    example: 'João Silva',
    description: 'Nome completo do usuário',
    required: false,
  })
  name?: string | null;

  @ApiProperty({
    type: String,
    example: 'student',
    description: 'Papel do usuário no sistema',
  })
  role: string;

  @ApiProperty({
    type: String,
    example: 'Desenvolvedor de software apaixonado por tecnologia',
    description: 'Descrição resumida do usuário (máximo 200 caracteres)',
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Se o usuário está verificado',
  })
  isVerified: boolean;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Se o usuário está ativo',
  })
  isActive: boolean;

  @ApiProperty({
    type: String,
    example:
      'https://minio.example.com/bucket/profile_picture/avatar_123.jpg?expires=3600',
    description: 'URL temporária do avatar do usuário',
    required: false,
  })
  avatarUrl?: string | null;

  @ApiProperty({
    type: String,
    example:
      'https://minio.example.com/bucket/banner_picture/banner_123.jpg?expires=3600',
    description: 'URL temporária do banner do usuário',
    required: false,
  })
  bannerUrl?: string | null;

  @ApiProperty({
    type: [String],
    description: 'Lista de tags principais do usuário (máximo 5)',
    example: ['React', 'Node.js', 'TypeScript'],
    required: false,
  })
  mainTags?: string[];

  @ApiProperty({
    type: String,
    example: 'Fortaleza, CE',
    description: 'Localização do usuário (cidade, estado)',
    required: false,
  })
  location?: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data e hora do like',
  })
  likedAt: Date;
}

/**
 * DTO para resposta da lista de quem deu like (initiators)
 */
export class LikeInitiatorsResponseDto {
  @ApiProperty({
    type: [LikeUserDto],
    description: 'Lista de usuários que deram like',
  })
  initiators: LikeUserDto[];

  @ApiProperty({
    type: Number,
    example: 5,
    description: 'Total de likes recebidos',
  })
  total: number;
}

/**
 * DTO para resposta da lista de quem recebeu like (receivers)
 */
export class LikeReceiversResponseDto {
  @ApiProperty({
    type: [LikeUserDto],
    description: 'Lista de usuários que receberam like',
  })
  receivers: LikeUserDto[];

  @ApiProperty({
    type: Number,
    example: 3,
    description: 'Total de likes dados',
  })
  total: number;
}
