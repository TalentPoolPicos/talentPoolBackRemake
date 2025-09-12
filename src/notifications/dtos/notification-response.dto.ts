import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({ description: 'ID da notificação' })
  id: number;

  @ApiProperty({ description: 'UUID da notificação' })
  uuid: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;

  @ApiProperty({ enum: NotificationType, description: 'Tipo da notificação' })
  type: NotificationType;

  @ApiProperty({ description: 'Título da notificação' })
  title: string;

  @ApiProperty({ description: 'Mensagem da notificação' })
  message: string;

  @ApiProperty({ description: 'Status de leitura' })
  isRead: boolean;

  @ApiPropertyOptional({ description: 'Data de leitura' })
  readAt?: Date;

  @ApiPropertyOptional({ description: 'Metadados da notificação' })
  metadata?: any;

  @ApiProperty({ description: 'Prioridade da notificação' })
  priority: number;

  @ApiPropertyOptional({ description: 'Data de expiração' })
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'URL de ação' })
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Tipo de ação' })
  actionType?: string;

  @ApiPropertyOptional({ description: 'Dados da ação' })
  actionData?: any;

  @ApiProperty({ description: 'ID do usuário' })
  userId: number;

  @ApiPropertyOptional({ description: 'ID do job relacionado' })
  relatedJobId?: number;

  @ApiPropertyOptional({ description: 'ID da candidatura relacionada' })
  relatedApplicationId?: number;

  @ApiPropertyOptional({ description: 'ID do usuário relacionado' })
  relatedUserId?: number;
}
