import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsDateString,
  IsArray,
  ValidateNested,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialMediaType } from '@prisma/client';

/**
 * DTO para atualizar perfil básico do usuário
 */
export class UpdateProfileDto {
  @ApiProperty({
    type: String,
    example: 'João Silva',
    description: 'Nome completo do usuário',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name?: string;

  @ApiProperty({
    type: String,
    example: 'Desenvolvedor de software apaixonado por tecnologia',
    description: 'Descrição do usuário',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  description?: string;

  @ApiProperty({
    type: String,
    example: '1999-03-15',
    description: 'Data de nascimento do usuário (formato ISO)',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Data de nascimento deve estar em formato válido' },
  )
  birthDate?: string;
}

/**
 * DTO para atualizar dados específicos do estudante
 */
export class UpdateStudentProfileDto {
  @ApiProperty({
    type: String,
    example: 'Ciência da Computação',
    description: 'Curso do estudante',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Curso deve ser uma string' })
  @MaxLength(100, { message: 'Curso deve ter no máximo 100 caracteres' })
  course?: string;

  @ApiProperty({
    type: String,
    example: '20201234567',
    description: 'Número de matrícula do estudante',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Número de matrícula deve ser uma string' })
  @MaxLength(11, {
    message: 'Número de matrícula deve ter no máximo 11 caracteres',
  })
  registrationNumber?: string;

  @ApiProperty({
    type: String,
    example: 'http://lattes.cnpq.br/1234567890123456',
    description: 'Link do currículo Lattes',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Lattes deve ser uma string' })
  @MaxLength(255, { message: 'Lattes deve ter no máximo 255 caracteres' })
  lattes?: string;
}

/**
 * DTO para atualizar dados específicos da empresa
 */
export class UpdateEnterpriseProfileDto {
  @ApiProperty({
    type: String,
    example: 'TechPicos',
    description: 'Nome fantasia da empresa',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome fantasia deve ser uma string' })
  @MaxLength(100, {
    message: 'Nome fantasia deve ter no máximo 100 caracteres',
  })
  fantasyName?: string;

  @ApiProperty({
    type: String,
    example: '12.345.678/0001-90',
    description: 'CNPJ da empresa',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'CNPJ deve ser uma string' })
  @MaxLength(18, { message: 'CNPJ deve ter no máximo 18 caracteres' })
  cnpj?: string;

  @ApiProperty({
    type: String,
    example: 'TechPicos Tecnologia e Inovação Ltda.',
    description: 'Razão social da empresa',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Razão social deve ser uma string' })
  @MaxLength(100, { message: 'Razão social deve ter no máximo 100 caracteres' })
  socialReason?: string;
}

/**
 * DTO para rede social
 */
export class SocialMediaDto {
  @ApiProperty({
    enum: SocialMediaType,
    example: 'linkedin',
    description: 'Tipo da rede social',
  })
  @IsEnum(SocialMediaType, { message: 'Tipo de rede social inválido' })
  type: SocialMediaType;

  @ApiProperty({
    type: String,
    example: 'https://linkedin.com/in/joao-silva',
    description: 'URL da rede social',
  })
  @IsString({ message: 'URL deve ser uma string' })
  @IsUrl({}, { message: 'URL deve ser válida' })
  @MaxLength(255, { message: 'URL deve ter no máximo 255 caracteres' })
  url: string;
}

/**
 * DTO para atualizar redes sociais
 */
export class UpdateSocialMediaDto {
  @ApiProperty({
    type: [SocialMediaDto],
    description: 'Lista de redes sociais do usuário',
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Redes sociais devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto[];
}

/**
 * DTO para tag
 */
export class TagDto {
  @ApiProperty({
    type: String,
    example: 'React',
    description: 'Label da tag',
  })
  @IsString({ message: 'Label da tag deve ser uma string' })
  @MinLength(1, { message: 'Label da tag deve ter pelo menos 1 caractere' })
  @MaxLength(40, { message: 'Label da tag deve ter no máximo 40 caracteres' })
  label: string;
}

/**
 * DTO para atualizar tags
 */
export class UpdateTagsDto {
  @ApiProperty({
    type: [TagDto],
    description: 'Lista de tags do usuário',
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Tags devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags?: TagDto[];
}

/**
 * DTO para endereço
 */
export class AddressDto {
  @ApiProperty({
    type: String,
    example: '64000-000',
    description: 'CEP do endereço',
  })
  @IsString({ message: 'CEP deve ser uma string' })
  @MaxLength(10, { message: 'CEP deve ter no máximo 10 caracteres' })
  zipCode: string;

  @ApiProperty({
    type: String,
    example: 'Rua das Flores, 123',
    description: 'Rua do endereço',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Rua deve ser uma string' })
  @MaxLength(100, { message: 'Rua deve ter no máximo 100 caracteres' })
  street?: string;

  @ApiProperty({
    type: String,
    example: 'Centro',
    description: 'Bairro do endereço',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Bairro deve ser uma string' })
  @MaxLength(100, { message: 'Bairro deve ter no máximo 100 caracteres' })
  neighborhood?: string;

  @ApiProperty({
    type: String,
    example: 'Teresina',
    description: 'Cidade do endereço',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Cidade deve ser uma string' })
  @MaxLength(100, { message: 'Cidade deve ter no máximo 100 caracteres' })
  city?: string;

  @ApiProperty({
    type: String,
    example: 'Piauí',
    description: 'Estado do endereço',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Estado deve ser uma string' })
  @MaxLength(100, { message: 'Estado deve ter no máximo 100 caracteres' })
  state?: string;
}

/**
 * DTO para atualizar endereço
 */
export class UpdateAddressDto {
  @ApiProperty({
    type: AddressDto,
    description: 'Endereço do usuário',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
