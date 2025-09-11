import { ApiProperty } from '@nestjs/swagger';
import { SocialMediaType, AttachmentType } from '@prisma/client';

/**
 * DTO para attachment
 */
export class AttachmentResponseDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID único do attachment',
  })
  uuid: string;

  @ApiProperty({
    type: String,
    example: 'profile-picture.jpg',
    description: 'Nome do arquivo',
  })
  filename: string;

  @ApiProperty({
    type: String,
    example: 'minha-foto.jpg',
    description: 'Nome original do arquivo',
  })
  originalName: string;

  @ApiProperty({
    type: String,
    example: 'image/jpeg',
    description: 'Tipo MIME do arquivo',
  })
  mimeType: string;

  @ApiProperty({
    type: Number,
    example: 1024000,
    description: 'Tamanho do arquivo em bytes',
  })
  size: number;

  @ApiProperty({
    enum: AttachmentType,
    example: 'profile_picture',
    description: 'Tipo do attachment',
  })
  type: AttachmentType;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  updatedAt: string;
}

/**
 * DTO para rede social
 */
export class SocialMediaResponseDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID único da rede social',
  })
  uuid: string;

  @ApiProperty({
    enum: SocialMediaType,
    example: 'linkedin',
    description: 'Tipo da rede social',
  })
  type: SocialMediaType;

  @ApiProperty({
    type: String,
    example: 'https://linkedin.com/in/joao-silva',
    description: 'URL da rede social',
  })
  url: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  updatedAt: string;
}

/**
 * DTO para tag
 */
export class TagResponseDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID único da tag',
  })
  uuid: string;

  @ApiProperty({
    type: String,
    example: 'React',
    description: 'Label da tag',
  })
  label: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  updatedAt: string;
}

/**
 * DTO para endereço
 */
export class AddressResponseDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID único do endereço',
  })
  uuid: string;

  @ApiProperty({
    type: String,
    example: '64000-000',
    description: 'CEP do endereço',
  })
  zipCode: string;

  @ApiProperty({
    type: String,
    example: 'Rua das Flores, 123',
    description: 'Rua do endereço',
    required: false,
  })
  street?: string;

  @ApiProperty({
    type: String,
    example: 'Centro',
    description: 'Bairro do endereço',
    required: false,
  })
  neighborhood?: string;

  @ApiProperty({
    type: String,
    example: 'Teresina',
    description: 'Cidade do endereço',
    required: false,
  })
  city?: string;

  @ApiProperty({
    type: String,
    example: 'Piauí',
    description: 'Estado do endereço',
    required: false,
  })
  state?: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  updatedAt: string;
}

/**
 * DTO para perfil de estudante
 */
export class StudentProfileResponseDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID único do perfil de estudante',
  })
  uuid: string;

  @ApiProperty({
    type: String,
    example: 'Ciência da Computação',
    description: 'Curso do estudante',
    required: false,
  })
  course?: string;

  @ApiProperty({
    type: String,
    example: '20201234567',
    description: 'Número de matrícula do estudante',
    required: false,
  })
  registrationNumber?: string;

  @ApiProperty({
    type: String,
    example: 'http://lattes.cnpq.br/1234567890123456',
    description: 'Link do currículo Lattes',
    required: false,
  })
  lattes?: string;

  @ApiProperty({
    type: String,
    example: 'https://storage.example.com/curriculum.pdf',
    description: 'URL de acesso ao currículo do estudante',
    required: false,
  })
  curriculumUrl?: string;

  @ApiProperty({
    type: String,
    example: 'https://storage.example.com/history.pdf',
    description: 'URL de acesso ao histórico escolar do estudante',
    required: false,
  })
  historyUrl?: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  updatedAt: string;
}

/**
 * DTO para perfil de empresa
 */
export class EnterpriseProfileResponseDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID único do perfil de empresa',
  })
  uuid: string;

  @ApiProperty({
    type: String,
    example: 'TechPicos',
    description: 'Nome fantasia da empresa',
    required: false,
  })
  fantasyName?: string;

  @ApiProperty({
    type: String,
    example: '12.345.678/0001-90',
    description: 'CNPJ da empresa',
    required: false,
  })
  cnpj?: string;

  @ApiProperty({
    type: String,
    example: 'TechPicos Tecnologia e Inovação Ltda.',
    description: 'Razão social da empresa',
    required: false,
  })
  socialReason?: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  updatedAt: string;
}

/**
 * DTO para estatísticas do usuário
 */
export class UserStatsResponseDto {
  @ApiProperty({
    type: Number,
    example: 25,
    description: 'Total de likes recebidos',
  })
  totalLikesReceived: number;

  @ApiProperty({
    type: Number,
    example: 10,
    description: 'Total de likes dados',
  })
  totalLikesGiven: number;

  @ApiProperty({
    type: Number,
    example: 85,
    description: 'Porcentagem de completude do perfil',
  })
  profileCompleteness: number;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de cadastro',
  })
  joinedDate: string;

  @ApiProperty({
    type: String,
    example: '2023-12-01T00:00:00.000Z',
    description: 'Data da última atividade',
  })
  lastActiveDate: string;
}

/**
 * DTO para perfil completo do usuário (privado - /me)
 */
export class UserProfileResponseDto {
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
    example: 'joao.silva@ufpi.edu.br',
    description: 'Email do usuário',
  })
  email: string;

  @ApiProperty({
    type: String,
    example: 'student',
    description: 'Papel do usuário no sistema',
  })
  role: string;

  @ApiProperty({
    type: String,
    example: 'João Silva',
    description: 'Nome completo do usuário',
    required: false,
  })
  name?: string;

  @ApiProperty({
    type: String,
    example: 'Desenvolvedor de software apaixonado por tecnologia',
    description: 'Descrição do usuário',
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: String,
    example: '1999-03-15T00:00:00.000Z',
    description: 'Data de nascimento do usuário',
    required: false,
  })
  birthDate?: string;

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
    type: Boolean,
    example: false,
    description: 'Se o perfil está completo',
  })
  isComplete: boolean;

  @ApiProperty({
    type: String,
    example:
      'https://minio.example.com/bucket/profile_picture/avatar_123.jpg?expires=3600',
    description: 'URL temporária do avatar do usuário',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    type: String,
    example:
      'https://minio.example.com/bucket/banner_picture/banner_123.jpg?expires=3600',
    description: 'URL temporária do banner do usuário',
    required: false,
  })
  bannerUrl?: string;

  @ApiProperty({
    type: StudentProfileResponseDto,
    description: 'Perfil de estudante (se aplicável)',
    required: false,
  })
  student?: StudentProfileResponseDto;

  @ApiProperty({
    type: EnterpriseProfileResponseDto,
    description: 'Perfil de empresa (se aplicável)',
    required: false,
  })
  enterprise?: EnterpriseProfileResponseDto;

  @ApiProperty({
    type: [SocialMediaResponseDto],
    description: 'Redes sociais do usuário',
    required: false,
  })
  socialMedia?: SocialMediaResponseDto[];

  @ApiProperty({
    type: [TagResponseDto],
    description: 'Tags do usuário',
    required: false,
  })
  tags?: TagResponseDto[];

  @ApiProperty({
    type: AddressResponseDto,
    description: 'Endereço do usuário',
    required: false,
  })
  address?: AddressResponseDto;

  @ApiProperty({
    type: UserStatsResponseDto,
    description: 'Estatísticas do usuário',
  })
  stats: UserStatsResponseDto;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  updatedAt: string;
}

/**
 * DTO para perfil público do usuário
 */
export class PublicUserProfileResponseDto {
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
    example: 'student',
    description: 'Papel do usuário no sistema',
  })
  role: string;

  @ApiProperty({
    type: String,
    example: 'João Silva',
    description: 'Nome completo do usuário',
    required: false,
  })
  name?: string;

  @ApiProperty({
    type: String,
    example: 'Desenvolvedor de software apaixonado por tecnologia',
    description: 'Descrição do usuário',
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: String,
    example: '1999-03-15T00:00:00.000Z',
    description: 'Data de nascimento do usuário',
    required: false,
  })
  birthDate?: string;

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
  avatarUrl?: string;

  @ApiProperty({
    type: String,
    example:
      'https://minio.example.com/bucket/banner_picture/banner_123.jpg?expires=3600',
    description: 'URL temporária do banner do usuário',
    required: false,
  })
  bannerUrl?: string;

  @ApiProperty({
    type: StudentProfileResponseDto,
    description: 'Perfil de estudante (se aplicável)',
    required: false,
  })
  student?: StudentProfileResponseDto;

  @ApiProperty({
    type: EnterpriseProfileResponseDto,
    description: 'Perfil de empresa (se aplicável)',
    required: false,
  })
  enterprise?: EnterpriseProfileResponseDto;

  @ApiProperty({
    type: [SocialMediaResponseDto],
    description: 'Redes sociais do usuário',
    required: false,
  })
  socialMedia?: SocialMediaResponseDto[];

  @ApiProperty({
    type: [TagResponseDto],
    description: 'Tags do usuário',
    required: false,
  })
  tags?: TagResponseDto[];

  @ApiProperty({
    type: AddressResponseDto,
    description: 'Endereço do usuário',
    required: false,
  })
  address?: AddressResponseDto;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de criação',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'Data de atualização',
  })
  updatedAt: string;
}

/**
 * DTO para preview/resumo público do usuário
 */
export class UserPreviewResponseDto {
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
    example: 'student',
    description: 'Papel do usuário no sistema',
  })
  role: string;

  @ApiProperty({
    type: String,
    example: 'João Silva',
    description: 'Nome completo do usuário',
    required: false,
  })
  name?: string;

  @ApiProperty({
    type: String,
    example: 'Desenvolvedor de software apaixonado por tecnologia',
    description: 'Descrição resumida do usuário (máximo 200 caracteres)',
    required: false,
  })
  description?: string;

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
}

/**
 * DTO para resposta de deleção de perfil
 */
export class DeleteProfileResponseDto {
  @ApiProperty({
    type: String,
    example: 'Perfil deletado com sucesso',
    description: 'Mensagem de confirmação da deleção',
  })
  message: string;
}
