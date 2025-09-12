import { ApiProperty } from '@nestjs/swagger';
import { NotificationResponseDto } from './notification-response.dto';

export class NotificationListResponseDto {
  @ApiProperty({
    type: [NotificationResponseDto],
    description: 'Lista de notificações',
  })
  data: NotificationResponseDto[];

  @ApiProperty({ description: 'Total de itens' })
  total: number;

  @ApiProperty({ description: 'Página atual' })
  page: number;

  @ApiProperty({ description: 'Limite de itens por página' })
  limit: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;

  @ApiProperty({ description: 'Tem próxima página' })
  hasNext: boolean;

  @ApiProperty({ description: 'Tem página anterior' })
  hasPrev: boolean;
}
