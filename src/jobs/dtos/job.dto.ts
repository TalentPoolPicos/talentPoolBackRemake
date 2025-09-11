import { ApiProperty } from '@nestjs/swagger';
import { JobStatus, ApplicationStatus } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO para criar uma nova vaga
 */
export class CreateJobDto {
  @ApiProperty({
    type: String,
    example: 'Desenvolvedor Frontend React',
    description: 'Título da vaga',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'Título deve ser uma string' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;

  @ApiProperty({
    type: String,
    example: '<p>Estamos procurando um desenvolvedor Frontend...</p>',
    description: 'Conteúdo HTML da descrição da vaga (TinyMCE)',
  })
  @IsString({ message: 'Conteúdo deve ser uma string' })
  body: string;

  @ApiProperty({
    enum: JobStatus,
    example: 'draft',
    description: 'Status da vaga',
    required: false,
    default: 'draft',
  })
  @IsOptional()
  @IsEnum(JobStatus, { message: 'Status deve ser um valor válido' })
  status?: JobStatus;

  @ApiProperty({
    type: String,
    example: '2025-12-31T23:59:59.999Z',
    description: 'Data de expiração da vaga',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de expiração deve ser uma data válida' })
  expiresAt?: string;
}

/**
 * DTO para atualizar uma vaga
 */
export class UpdateJobDto {
  @ApiProperty({
    type: String,
    example: 'Desenvolvedor Frontend React',
    description: 'Título da vaga',
    minLength: 3,
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title?: string;

  @ApiProperty({
    type: String,
    example: '<p>Estamos procurando um desenvolvedor Frontend...</p>',
    description: 'Conteúdo HTML da descrição da vaga (TinyMCE)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Conteúdo deve ser uma string' })
  body?: string;

  @ApiProperty({
    enum: JobStatus,
    example: 'published',
    description: 'Status da vaga',
    required: false,
  })
  @IsOptional()
  @IsEnum(JobStatus, { message: 'Status deve ser um valor válido' })
  status?: JobStatus;

  @ApiProperty({
    type: String,
    example: '2025-12-31T23:59:59.999Z',
    description: 'Data de expiração da vaga',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de expiração deve ser uma data válida' })
  expiresAt?: string;
}

/**
 * DTO para aplicar a uma vaga
 */
export class ApplyToJobDto {
  @ApiProperty({
    type: String,
    example: 'Tenho grande interesse nesta posição porque...',
    description: 'Carta de apresentação/motivação',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Carta de apresentação deve ser uma string' })
  @MaxLength(2000, {
    message: 'Carta de apresentação deve ter no máximo 2000 caracteres',
  })
  coverLetter?: string;
}

/**
 * DTO para atualizar apenas o conteúdo da vaga (título e body)
 */
export class UpdateJobContentDto {
  @ApiProperty({
    type: String,
    example: 'Desenvolvedor Frontend React',
    description: 'Título da vaga',
    minLength: 3,
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title?: string;

  @ApiProperty({
    type: String,
    example: '<p>Estamos procurando um desenvolvedor Frontend...</p>',
    description: 'Conteúdo HTML da descrição da vaga (TinyMCE)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Conteúdo deve ser uma string' })
  body?: string;

  @ApiProperty({
    type: String,
    example: '2025-12-31T23:59:59.999Z',
    description: 'Data de expiração da vaga',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de expiração deve ser uma data válida' })
  expiresAt?: string;
}

/**
 * DTO para atualizar status de aplicação (empresa)
 */
export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    example: 'approved',
    description: 'Novo status da aplicação',
  })
  @IsEnum(ApplicationStatus, { message: 'Status deve ser um valor válido' })
  status: ApplicationStatus;

  @ApiProperty({
    type: String,
    example: 'Candidato selecionado para próxima fase...',
    description: 'Notas/comentários do recrutador',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notas do recrutador devem ser uma string' })
  @MaxLength(1000, {
    message: 'Notas do recrutador devem ter no máximo 1000 caracteres',
  })
  reviewerNotes?: string;
}
