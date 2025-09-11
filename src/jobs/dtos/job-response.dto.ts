import { ApiProperty } from '@nestjs/swagger';
import { JobStatus, ApplicationStatus } from '@prisma/client';

/**
 * DTO para resposta de vaga
 */
export class JobResponseDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID único da vaga',
  })
  uuid: string;

  @ApiProperty({
    type: String,
    example: 'Desenvolvedor Frontend React',
    description: 'Título da vaga',
  })
  title: string;

  @ApiProperty({
    type: String,
    example: '<p>Estamos procurando um desenvolvedor Frontend...</p>',
    description: 'Conteúdo HTML da descrição da vaga',
  })
  body: string;

  @ApiProperty({
    enum: JobStatus,
    example: 'published',
    description: 'Status da vaga',
  })
  status: JobStatus;

  @ApiProperty({
    type: String,
    example: '2025-09-11T18:30:00.000Z',
    description: 'Data de criação',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2025-09-11T18:30:00.000Z',
    description: 'Data de atualização',
  })
  updatedAt: string;

  @ApiProperty({
    type: String,
    example: '2025-09-11T18:30:00.000Z',
    description: 'Data de publicação',
    required: false,
  })
  publishedAt?: string;

  @ApiProperty({
    type: String,
    example: '2025-12-31T23:59:59.999Z',
    description: 'Data de expiração',
    required: false,
  })
  expiresAt?: string;

  @ApiProperty({
    type: Object,
    description: 'Informações da empresa',
  })
  company: {
    uuid: string;
    username: string;
    name?: string;
    avatarUrl?: string | null;
  };

  @ApiProperty({
    type: Number,
    example: 5,
    description: 'Total de candidaturas',
  })
  totalApplications: number;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Se o usuário atual já se candidatou (apenas para estudantes)',
    required: false,
  })
  hasApplied?: boolean;
}

/**
 * DTO para resposta de aplicação
 */
export class JobApplicationResponseDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID único da aplicação',
  })
  uuid: string;

  @ApiProperty({
    enum: ApplicationStatus,
    example: 'pending',
    description: 'Status da aplicação',
  })
  status: ApplicationStatus;

  @ApiProperty({
    type: String,
    example: 'Tenho grande interesse nesta posição...',
    description: 'Carta de apresentação',
    required: false,
  })
  coverLetter?: string;

  @ApiProperty({
    type: String,
    example: '2025-09-11T18:30:00.000Z',
    description: 'Data da candidatura',
  })
  appliedAt: string;

  @ApiProperty({
    type: String,
    example: '2025-09-12T10:15:00.000Z',
    description: 'Data de revisão',
    required: false,
  })
  reviewedAt?: string;

  @ApiProperty({
    type: String,
    example: 'Candidato selecionado para próxima fase...',
    description: 'Notas do recrutador',
    required: false,
  })
  reviewerNotes?: string;

  @ApiProperty({
    type: Object,
    description: 'Informações da vaga',
  })
  job: {
    uuid: string;
    title: string;
    status: JobStatus;
  };

  @ApiProperty({
    type: Object,
    description: 'Informações do estudante (visível apenas para empresas)',
    required: false,
  })
  student?: {
    uuid: string;
    username: string;
    name?: string;
    avatarUrl?: string | null;
  };

  @ApiProperty({
    type: String,
    example: '2025-09-11T18:30:00.000Z',
    description: 'Data de criação',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2025-09-11T18:30:00.000Z',
    description: 'Data de atualização',
  })
  updatedAt: string;
}

/**
 * DTO para resposta de lista de vagas
 */
export class JobListResponseDto {
  @ApiProperty({
    type: [JobResponseDto],
    description: 'Lista de vagas',
  })
  jobs: JobResponseDto[];

  @ApiProperty({
    type: Number,
    example: 25,
    description: 'Total de vagas',
  })
  total: number;

  @ApiProperty({
    type: Number,
    example: 20,
    description: 'Limite de itens por página',
  })
  limit: number;

  @ApiProperty({
    type: Number,
    example: 0,
    description: 'Offset da paginação',
  })
  offset: number;
}

/**
 * DTO para resposta de lista de aplicações
 */
export class ApplicationListResponseDto {
  @ApiProperty({
    type: [JobApplicationResponseDto],
    description: 'Lista de aplicações',
  })
  applications: JobApplicationResponseDto[];

  @ApiProperty({
    type: Number,
    example: 15,
    description: 'Total de aplicações',
  })
  total: number;

  @ApiProperty({
    type: Number,
    example: 20,
    description: 'Limite de itens por página',
  })
  limit: number;

  @ApiProperty({
    type: Number,
    example: 0,
    description: 'Offset da paginação',
  })
  offset: number;
}
