import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType, description: 'Tipo da notificação' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Título da notificação', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Mensagem da notificação' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'ID do usuário que receberá a notificação' })
  @IsInt()
  userId: number;

  @ApiPropertyOptional({
    description: 'Metadados adicionais em formato JSON',
  })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Prioridade da notificação',
    minimum: 1,
    maximum: 4,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  priority?: number;

  @ApiPropertyOptional({ description: 'Data de expiração da notificação' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'URL de ação da notificação',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Tipo de ação da notificação',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  actionType?: string;

  @ApiPropertyOptional({ description: 'Dados da ação em formato JSON' })
  @IsOptional()
  actionData?: any;

  @ApiPropertyOptional({ description: 'ID do job relacionado' })
  @IsOptional()
  @IsInt()
  relatedJobId?: number;

  @ApiPropertyOptional({ description: 'ID da candidatura relacionada' })
  @IsOptional()
  @IsInt()
  relatedApplicationId?: number;

  @ApiPropertyOptional({ description: 'ID do usuário relacionado' })
  @IsOptional()
  @IsInt()
  relatedUserId?: number;
}
